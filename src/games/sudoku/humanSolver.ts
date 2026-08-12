export type HumanTechnique =
  | 'hidden-pair'
  | 'hidden-single'
  | 'locked-candidate'
  | 'naked-pair'
  | 'naked-single'
  | 'simple-chain'
  | 'x-wing'
  | 'xy-wing'

export interface HumanSolveResult {
  board: number[]
  candidateEliminations: number
  hardestTechnique: HumanTechnique | 'none' | 'search'
  placements: number
  techniques: Record<HumanTechnique, number>
  unresolved: number
}

const ALL_DIGITS_MASK = 0b1111111110

function bitCount(mask: number): number {
  let count = 0
  let remaining = mask
  while (remaining !== 0) {
    remaining &= remaining - 1
    count += 1
  }
  return count
}

function maskToDigit(mask: number): number {
  for (let digit = 1; digit <= 9; digit += 1) {
    if ((mask & (1 << digit)) !== 0) return digit
  }
  return 0
}

export function maskFromDigits(...digits: number[]): number {
  return digits.reduce((mask, digit) => mask | (1 << digit), 0)
}

const ROWS = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, column) => row * 9 + column),
)
const COLUMNS = Array.from({ length: 9 }, (_, column) =>
  Array.from({ length: 9 }, (_, row) => row * 9 + column),
)
const BOXES = Array.from({ length: 9 }, (_, box) => {
  const startRow = Math.floor(box / 3) * 3
  const startColumn = (box % 3) * 3
  return Array.from({ length: 9 }, (_, offset) =>
    (startRow + Math.floor(offset / 3)) * 9 + startColumn + (offset % 3),
  )
})
const UNITS = [...ROWS, ...COLUMNS, ...BOXES]
const PEERS = Array.from({ length: 81 }, (_, index) => {
  const row = Math.floor(index / 9)
  const column = index % 9
  const box = Math.floor(row / 3) * 3 + Math.floor(column / 3)
  return new Set([...ROWS[row], ...COLUMNS[column], ...BOXES[box]].filter((peer) => peer !== index))
})

function candidateMask(board: readonly number[], index: number): number {
  if (board[index] !== 0) return 0
  let used = 0
  for (const peer of PEERS[index]) used |= 1 << board[peer]
  return ALL_DIGITS_MASK & ~used
}

function initializeMasks(board: readonly number[]): number[] {
  return board.map((_, index) => candidateMask(board, index))
}

function removeMask(masks: number[], index: number, removal: number): number {
  const previous = masks[index]
  if (previous === 0) return 0
  const next = previous & ~removal
  if (next === previous) return 0
  masks[index] = next
  return bitCount(previous) - bitCount(next)
}

function place(board: number[], masks: number[], index: number, digit: number): void {
  board[index] = digit
  masks[index] = 0
  const bit = 1 << digit
  for (const peer of PEERS[index]) removeMask(masks, peer, bit)
}

function sameIndexes(first: readonly number[], second: readonly number[]): boolean {
  return first.length === second.length && first.every((value, index) => value === second[index])
}

export function applyLockedCandidates(masks: number[]): boolean {
  for (let box = 0; box < 9; box += 1) {
    const boxSet = new Set(BOXES[box])
    for (let digit = 1; digit <= 9; digit += 1) {
      const bit = 1 << digit
      const positions = BOXES[box].filter((index) => (masks[index] & bit) !== 0)
      if (positions.length < 2) continue
      const row = Math.floor(positions[0] / 9)
      if (positions.every((index) => Math.floor(index / 9) === row)) {
        let removed = 0
        for (const index of ROWS[row]) if (!boxSet.has(index)) removed += removeMask(masks, index, bit)
        if (removed > 0) return true
      }
      const column = positions[0] % 9
      if (positions.every((index) => index % 9 === column)) {
        let removed = 0
        for (const index of COLUMNS[column]) if (!boxSet.has(index)) removed += removeMask(masks, index, bit)
        if (removed > 0) return true
      }
    }
  }

  for (const unit of [...ROWS, ...COLUMNS]) {
    const unitSet = new Set(unit)
    for (let digit = 1; digit <= 9; digit += 1) {
      const bit = 1 << digit
      const positions = unit.filter((index) => (masks[index] & bit) !== 0)
      if (positions.length < 2) continue
      const firstRow = Math.floor(positions[0] / 9)
      const firstColumn = positions[0] % 9
      const box = Math.floor(firstRow / 3) * 3 + Math.floor(firstColumn / 3)
      if (positions.every((index) => {
        const row = Math.floor(index / 9)
        const column = index % 9
        return Math.floor(row / 3) * 3 + Math.floor(column / 3) === box
      })) {
        let removed = 0
        for (const index of BOXES[box]) if (!unitSet.has(index)) removed += removeMask(masks, index, bit)
        if (removed > 0) return true
      }
    }
  }
  return false
}

export function applyNakedPairs(masks: number[]): boolean {
  for (const unit of UNITS) {
    const pairs = new Map<number, number[]>()
    for (const index of unit) {
      const mask = masks[index]
      if (bitCount(mask) !== 2) continue
      const positions = pairs.get(mask) ?? []
      positions.push(index)
      pairs.set(mask, positions)
    }
    for (const [pairMask, positions] of pairs) {
      if (positions.length !== 2) continue
      let removed = 0
      for (const index of unit) {
        if (!positions.includes(index)) removed += removeMask(masks, index, pairMask)
      }
      if (removed > 0) return true
    }
  }
  return false
}

export function applyHiddenPairs(masks: number[]): boolean {
  for (const unit of UNITS) {
    const digitPositions = Array.from({ length: 10 }, (_, digit) =>
      digit === 0 ? [] : unit.filter((index) => (masks[index] & (1 << digit)) !== 0),
    )
    for (let first = 1; first <= 8; first += 1) {
      if (digitPositions[first].length !== 2) continue
      for (let second = first + 1; second <= 9; second += 1) {
        if (!sameIndexes(digitPositions[first], digitPositions[second])) continue
        const pairMask = (1 << first) | (1 << second)
        let removed = 0
        for (const index of digitPositions[first]) removed += removeMask(masks, index, ~pairMask)
        if (removed > 0) return true
      }
    }
  }
  return false
}

export function applyXWing(masks: number[]): boolean {
  for (let digit = 1; digit <= 9; digit += 1) {
    const bit = 1 << digit
    const rowPositions = ROWS.map((row) => row.filter((index) => (masks[index] & bit) !== 0).map((index) => index % 9))
    for (let firstRow = 0; firstRow < 8; firstRow += 1) {
      if (rowPositions[firstRow].length !== 2) continue
      for (let secondRow = firstRow + 1; secondRow < 9; secondRow += 1) {
        if (!sameIndexes(rowPositions[firstRow], rowPositions[secondRow])) continue
        let removed = 0
        for (const column of rowPositions[firstRow]) {
          for (let row = 0; row < 9; row += 1) {
            if (row !== firstRow && row !== secondRow) removed += removeMask(masks, row * 9 + column, bit)
          }
        }
        if (removed > 0) return true
      }
    }

    const columnPositions = COLUMNS.map((column) => column.filter((index) => (masks[index] & bit) !== 0).map((index) => Math.floor(index / 9)))
    for (let firstColumn = 0; firstColumn < 8; firstColumn += 1) {
      if (columnPositions[firstColumn].length !== 2) continue
      for (let secondColumn = firstColumn + 1; secondColumn < 9; secondColumn += 1) {
        if (!sameIndexes(columnPositions[firstColumn], columnPositions[secondColumn])) continue
        let removed = 0
        for (const row of columnPositions[firstColumn]) {
          for (let column = 0; column < 9; column += 1) {
            if (column !== firstColumn && column !== secondColumn) removed += removeMask(masks, row * 9 + column, bit)
          }
        }
        if (removed > 0) return true
      }
    }
  }
  return false
}

export function applyXYWing(masks: number[]): boolean {
  const bivalueCells = masks.map((mask, index) => ({ index, mask })).filter(({ mask }) => bitCount(mask) === 2)
  for (const pivot of bivalueCells) {
    const wings = bivalueCells.filter(({ index }) => PEERS[pivot.index].has(index))
    for (let firstIndex = 0; firstIndex < wings.length; firstIndex += 1) {
      const first = wings[firstIndex]
      const sharedFirst = pivot.mask & first.mask
      if (bitCount(sharedFirst) !== 1) continue
      const firstOuter = first.mask & ~sharedFirst
      for (let secondIndex = firstIndex + 1; secondIndex < wings.length; secondIndex += 1) {
        const second = wings[secondIndex]
        const sharedSecond = pivot.mask & second.mask
        if (bitCount(sharedSecond) !== 1 || sharedFirst === sharedSecond) continue
        const secondOuter = second.mask & ~sharedSecond
        if (firstOuter !== secondOuter || bitCount(firstOuter) !== 1) continue
        let removed = 0
        for (let index = 0; index < 81; index += 1) {
          if (index === pivot.index || index === first.index || index === second.index) continue
          if (PEERS[first.index].has(index) && PEERS[second.index].has(index)) {
            removed += removeMask(masks, index, firstOuter)
          }
        }
        if (removed > 0) return true
      }
    }
  }
  return false
}

export function applySimpleChains(masks: number[]): boolean {
  for (let digit = 1; digit <= 9; digit += 1) {
    const bit = 1 << digit
    const graph = new Map<number, Set<number>>()
    for (const unit of UNITS) {
      const positions = unit.filter((index) => (masks[index] & bit) !== 0)
      if (positions.length !== 2) continue
      const [first, second] = positions
      if (!graph.has(first)) graph.set(first, new Set())
      if (!graph.has(second)) graph.set(second, new Set())
      graph.get(first)?.add(second)
      graph.get(second)?.add(first)
    }

    const visited = new Set<number>()
    for (const start of graph.keys()) {
      if (visited.has(start)) continue
      const colors = new Map<number, 0 | 1>([[start, 0]])
      const queue = [start]
      visited.add(start)
      while (queue.length > 0) {
        const current = queue.shift()!
        const nextColor = colors.get(current) === 0 ? 1 : 0
        for (const neighbor of graph.get(current) ?? []) {
          if (!colors.has(neighbor)) {
            colors.set(neighbor, nextColor)
            visited.add(neighbor)
            queue.push(neighbor)
          }
        }
      }

      for (const color of [0, 1] as const) {
        const cells = [...colors].filter(([, value]) => value === color).map(([index]) => index)
        if (cells.some((first, position) => cells.slice(position + 1).some((second) => PEERS[first].has(second)))) {
          let removed = 0
          for (const index of cells) removed += removeMask(masks, index, bit)
          if (removed > 0) return true
        }
      }

      const colorZero = [...colors].filter(([, color]) => color === 0).map(([index]) => index)
      const colorOne = [...colors].filter(([, color]) => color === 1).map(([index]) => index)
      let removed = 0
      for (let index = 0; index < 81; index += 1) {
        if ((masks[index] & bit) === 0 || colors.has(index)) continue
        if (
          colorZero.some((colored) => PEERS[colored].has(index)) &&
          colorOne.some((colored) => PEERS[colored].has(index))
        ) {
          removed += removeMask(masks, index, bit)
        }
      }
      if (removed > 0) return true
    }
  }
  return false
}

const TECHNIQUE_ORDER: HumanTechnique[] = [
  'naked-single',
  'hidden-single',
  'locked-candidate',
  'naked-pair',
  'hidden-pair',
  'x-wing',
  'xy-wing',
  'simple-chain',
]

export function analyzeHumanSolving(input: readonly number[]): HumanSolveResult {
  const board = [...input]
  const masks = initializeMasks(board)
  const techniques = Object.fromEntries(TECHNIQUE_ORDER.map((technique) => [technique, 0])) as Record<HumanTechnique, number>
  let placements = 0
  let candidateEliminations = 0

  while (true) {
    const nakedSingle = masks.findIndex((mask) => bitCount(mask) === 1)
    if (nakedSingle >= 0) {
      place(board, masks, nakedSingle, maskToDigit(masks[nakedSingle]))
      techniques['naked-single'] += 1
      placements += 1
      continue
    }

    let hiddenPlacement: { digit: number; index: number } | null = null
    for (const unit of UNITS) {
      for (let digit = 1; digit <= 9; digit += 1) {
        const bit = 1 << digit
        const positions = unit.filter((index) => (masks[index] & bit) !== 0)
        if (positions.length === 1) {
          hiddenPlacement = { digit, index: positions[0] }
          break
        }
      }
      if (hiddenPlacement) break
    }
    if (hiddenPlacement) {
      place(board, masks, hiddenPlacement.index, hiddenPlacement.digit)
      techniques['hidden-single'] += 1
      placements += 1
      continue
    }

    const before = masks.reduce((total, mask) => total + bitCount(mask), 0)
    const advanced: Array<[HumanTechnique, (candidateMasks: number[]) => boolean]> = [
      ['locked-candidate', applyLockedCandidates],
      ['naked-pair', applyNakedPairs],
      ['hidden-pair', applyHiddenPairs],
      ['x-wing', applyXWing],
      ['xy-wing', applyXYWing],
      ['simple-chain', applySimpleChains],
    ]
    let applied = false
    for (const [technique, apply] of advanced) {
      if (!apply(masks)) continue
      const after = masks.reduce((total, mask) => total + bitCount(mask), 0)
      candidateEliminations += before - after
      techniques[technique] += 1
      applied = true
      break
    }
    if (!applied) break
  }

  const unresolved = board.filter((value) => value === 0).length
  const hardest = [...TECHNIQUE_ORDER].reverse().find((technique) => techniques[technique] > 0)
  return {
    board,
    candidateEliminations,
    hardestTechnique: unresolved > 0 ? 'search' : (hardest ?? 'none'),
    placements,
    techniques,
    unresolved,
  }
}
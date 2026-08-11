export type MineCellState = 'hidden' | 'open' | 'flagged' | 'questioned'
export type MineGameStatus = 'ready' | 'playing' | 'won' | 'lost'
export type MineGenerationMode = 'classic' | 'guess-free'

export interface MineCell {
  adjacent: number
  mine: boolean
  state: MineCellState
}

export interface MineBoard {
  cells: MineCell[]
  detonatedIndex: number | null
  generated: boolean
  generationAttempts: number
  generationMode: MineGenerationMode
  height: number
  mineCount: number
  seed: number
  status: MineGameStatus
  width: number
}

export interface MineConfiguration {
  height: number
  mineCount: number
  width: number
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function createMineBoard(
  configuration: MineConfiguration,
  seed: number,
  generationMode: MineGenerationMode = 'classic',
): MineBoard {
  const cellCount = configuration.width * configuration.height
  if (
    configuration.width < 1 ||
    configuration.height < 1 ||
    configuration.mineCount < 1 ||
    configuration.mineCount >= cellCount
  ) {
    throw new Error('Invalid minefield configuration')
  }

  return {
    ...configuration,
    cells: Array.from({ length: cellCount }, () => ({
      adjacent: 0,
      mine: false,
      state: 'hidden' as const,
    })),
    detonatedIndex: null,
    generated: false,
    generationAttempts: 0,
    generationMode,
    seed,
    status: 'ready',
  }
}

export function getMineNeighbors(board: MineBoard, index: number): number[] {
  const row = Math.floor(index / board.width)
  const column = index % board.width
  const neighbors: number[] = []

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue
      }
      const neighborRow = row + rowOffset
      const neighborColumn = column + columnOffset
      if (
        neighborRow >= 0 &&
        neighborRow < board.height &&
        neighborColumn >= 0 &&
        neighborColumn < board.width
      ) {
        neighbors.push(neighborRow * board.width + neighborColumn)
      }
    }
  }

  return neighbors
}

function generateMineCandidate(
  board: MineBoard,
  safeIndex: number,
  candidateSeed: number,
): MineBoard {
  const cells = board.cells.map((cell) => ({ ...cell }))
  const preferredSafeZone = new Set([
    safeIndex,
    ...getMineNeighbors(board, safeIndex),
  ])
  const usePreferredSafeZone =
    cells.length - preferredSafeZone.size >= board.mineCount
  const available = Array.from({ length: cells.length }, (_, index) => index).filter(
    (index) => index !== safeIndex && (!usePreferredSafeZone || !preferredSafeZone.has(index)),
  )
  const random = createRandom(candidateSeed)

  for (let index = available.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[available[index], available[swapIndex]] = [
      available[swapIndex],
      available[index],
    ]
  }

  for (const mineIndex of available.slice(0, board.mineCount)) {
    cells[mineIndex].mine = true
  }

  for (let index = 0; index < cells.length; index += 1) {
    cells[index].adjacent = getMineNeighbors(board, index).filter(
      (neighborIndex) => cells[neighborIndex].mine,
    ).length
  }

  return { ...board, cells, generated: true, status: 'playing' }
}

function openLogicalRegion(
  board: MineBoard,
  startIndexes: Iterable<number>,
  opened: Set<number>,
): boolean {
  const queue = [...startIndexes]
  const queued = new Set(queue)

  while (queue.length > 0) {
    const index = queue.shift()
    if (index === undefined || opened.has(index)) {
      continue
    }
    const cell = board.cells[index]
    if (cell.mine) {
      return false
    }
    opened.add(index)
    if (cell.adjacent === 0) {
      for (const neighborIndex of getMineNeighbors(board, index)) {
        if (!opened.has(neighborIndex) && !queued.has(neighborIndex)) {
          queue.push(neighborIndex)
          queued.add(neighborIndex)
        }
      }
    }
  }

  return true
}

interface MineConstraint {
  cells: number[]
  mines: number
}

function isSubset(subset: number[], superset: Set<number>): boolean {
  return subset.every((index) => superset.has(index))
}

export function isMineBoardSolvableWithoutGuess(
  board: MineBoard,
  firstMoveIndex: number,
): boolean {
  if (!board.generated || board.cells[firstMoveIndex]?.mine !== false) {
    return false
  }

  const opened = new Set<number>()
  const knownMines = new Set<number>()
  if (!openLogicalRegion(board, [firstMoveIndex], opened)) {
    return false
  }

  const safeCellCount = board.cells.length - board.mineCount
  while (opened.size < safeCellCount) {
    const safeMoves = new Set<number>()
    const mineMoves = new Set<number>()
    const hidden = board.cells
      .map((_, index) => index)
      .filter((index) => !opened.has(index) && !knownMines.has(index))
    const minesRemaining = board.mineCount - knownMines.size

    if (minesRemaining === 0) {
      hidden.forEach((index) => safeMoves.add(index))
    } else if (minesRemaining === hidden.length) {
      hidden.forEach((index) => mineMoves.add(index))
    }

    const constraints: MineConstraint[] = []
    for (const index of opened) {
      const cell = board.cells[index]
      if (cell.adjacent === 0) {
        continue
      }
      const neighbors = getMineNeighbors(board, index)
      const unknown = neighbors.filter(
        (neighborIndex) =>
          !opened.has(neighborIndex) && !knownMines.has(neighborIndex),
      )
      const adjacentKnownMines = neighbors.filter((neighborIndex) =>
        knownMines.has(neighborIndex),
      ).length
      const remaining = cell.adjacent - adjacentKnownMines
      if (remaining < 0 || remaining > unknown.length) {
        return false
      }
      if (unknown.length === 0) {
        continue
      }
      if (remaining === 0) {
        unknown.forEach((neighborIndex) => safeMoves.add(neighborIndex))
      } else if (remaining === unknown.length) {
        unknown.forEach((neighborIndex) => mineMoves.add(neighborIndex))
      } else {
        constraints.push({ cells: unknown.sort((a, b) => a - b), mines: remaining })
      }
    }

    for (let leftIndex = 0; leftIndex < constraints.length; leftIndex += 1) {
      const left = constraints[leftIndex]
      const leftSet = new Set(left.cells)
      for (let rightIndex = leftIndex + 1; rightIndex < constraints.length; rightIndex += 1) {
        const right = constraints[rightIndex]
        const rightSet = new Set(right.cells)
        let smaller = left
        let larger = right
        let largerSet = rightSet
        if (right.cells.length < left.cells.length) {
          smaller = right
          larger = left
          largerSet = leftSet
        }
        if (!isSubset(smaller.cells, largerSet)) {
          continue
        }
        const smallerSet = new Set(smaller.cells)
        const difference = larger.cells.filter(
          (index) => !smallerSet.has(index),
        )
        const mineDifference = larger.mines - smaller.mines
        if (mineDifference === 0) {
          difference.forEach((index) => safeMoves.add(index))
        } else if (mineDifference === difference.length) {
          difference.forEach((index) => mineMoves.add(index))
        }
      }
    }

    for (const index of mineMoves) {
      if (safeMoves.has(index)) {
        return false
      }
      knownMines.add(index)
    }
    if (safeMoves.size === 0 && mineMoves.size === 0) {
      return false
    }
    if (!openLogicalRegion(board, safeMoves, opened)) {
      return false
    }
  }

  return true
}

function generateMines(board: MineBoard, safeIndex: number): MineBoard {
  if (board.generationMode === 'classic') {
    return {
      ...generateMineCandidate(board, safeIndex, board.seed),
      generationAttempts: 1,
    }
  }

  const maxAttempts = 2048
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidateSeed =
      (board.seed + Math.imul(attempt, 0x9e3779b9)) >>> 0
    const candidate = generateMineCandidate(board, safeIndex, candidateSeed)
    if (isMineBoardSolvableWithoutGuess(candidate, safeIndex)) {
      return { ...candidate, generationAttempts: attempt + 1 }
    }
  }

  throw new Error('Could not generate a guess-free minefield')
}

function openFrom(board: MineBoard, startIndexes: number[]): MineBoard {
  const cells = board.cells.map((cell) => ({ ...cell }))
  const queue = [...startIndexes]
  const queued = new Set(queue)
  let detonatedIndex = board.detonatedIndex ?? null
  let status = board.status

  while (queue.length > 0) {
    const index = queue.shift()
    if (index === undefined) {
      break
    }
    const cell = cells[index]
    if (cell.state === 'open' || cell.state === 'flagged') {
      continue
    }
    cell.state = 'open'
    if (cell.mine) {
      if (detonatedIndex === null) {
        detonatedIndex = index
      }
      status = 'lost'
      continue
    }
    if (cell.adjacent === 0) {
      for (const neighborIndex of getMineNeighbors(board, index)) {
        if (
          cells[neighborIndex].state !== 'open' &&
          cells[neighborIndex].state !== 'flagged' &&
          !queued.has(neighborIndex)
        ) {
          queue.push(neighborIndex)
          queued.add(neighborIndex)
        }
      }
    }
  }

  if (status === 'lost') {
    for (const cell of cells) {
      if (cell.mine) {
        cell.state = 'open'
      }
    }
  } else if (cells.every((cell) => cell.mine || cell.state === 'open')) {
    status = 'won'
  }

  return { ...board, cells, detonatedIndex, status }
}

export function revealMineCell(board: MineBoard, index: number): MineBoard {
  if (board.status === 'lost' || board.status === 'won') {
    return board
  }

  const generatedBoard = board.generated ? board : generateMines(board, index)
  const cell = generatedBoard.cells[index]
  if (cell.state === 'flagged') {
    return generatedBoard
  }

  if (cell.state === 'open' && cell.adjacent > 0) {
    const neighbors = getMineNeighbors(generatedBoard, index)
    const flagCount = neighbors.filter(
      (neighborIndex) =>
        generatedBoard.cells[neighborIndex].state === 'flagged',
    ).length
    if (flagCount === cell.adjacent) {
      return openFrom(generatedBoard, neighbors)
    }
    return generatedBoard
  }

  return openFrom(generatedBoard, [index])
}

export function cycleMineMark(board: MineBoard, index: number): MineBoard {
  if (board.status === 'lost' || board.status === 'won') {
    return board
  }
  const selected = board.cells[index]
  if (selected.state === 'open') {
    return board
  }
  const cells = board.cells.map((cell) => ({ ...cell }))
  cells[index].state = selected.state === 'hidden'
    ? 'flagged'
    : selected.state === 'flagged'
      ? 'questioned'
      : 'hidden'
  return { ...board, cells }
}

export function countFlags(board: MineBoard): number {
  return board.cells.filter((cell) => cell.state === 'flagged').length
}

export interface MineCascadeScore {
  intensity: number
  openedCells: number
  points: number
}

export function countOpenedSafeCells(board: MineBoard): number {
  return board.cells.filter((cell) => cell.state === 'open' && !cell.mine).length
}

export function calculateMineCascadeScore(openedCells: number): MineCascadeScore {
  if (openedCells <= 0) {
    return { intensity: 0, openedCells: 0, points: 0 }
  }
  const intensity = Math.min(6, 1 + Math.floor(Math.log2(openedCells)))
  return {
    intensity,
    openedCells,
    points: openedCells * 10 * intensity,
  }
}
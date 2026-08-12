export interface KillerCage {
  cells: number[]
  sum: number
}

type RandomSource = () => number

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

function baseCandidateMask(board: readonly number[], index: number): number {
  if (board[index] !== 0) return 0
  const row = Math.floor(index / 9)
  const column = index % 9
  const boxRow = Math.floor(row / 3) * 3
  const boxColumn = Math.floor(column / 3) * 3
  let used = 0
  for (let offset = 0; offset < 9; offset += 1) {
    used |= 1 << board[row * 9 + offset]
    used |= 1 << board[offset * 9 + column]
  }
  for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < 3; columnOffset += 1) {
      used |= 1 << board[(boxRow + rowOffset) * 9 + boxColumn + columnOffset]
    }
  }
  return ALL_DIGITS_MASK & ~used
}

function cageMap(cages: readonly KillerCage[]): Array<KillerCage | null> {
  const result = Array<KillerCage | null>(81).fill(null)
  for (const cage of cages) for (const cell of cage.cells) result[cell] = cage
  return result
}

function hasDuplicate(values: readonly number[]): boolean {
  const filled = values.filter((value) => value !== 0)
  return new Set(filled).size !== filled.length
}

function isValidPartialBoard(
  board: readonly number[],
  cages: readonly KillerCage[],
): boolean {
  for (let unit = 0; unit < 9; unit += 1) {
    const row = Array.from({ length: 9 }, (_, column) => board[unit * 9 + column])
    const column = Array.from({ length: 9 }, (_, rowIndex) => board[rowIndex * 9 + unit])
    const boxRow = Math.floor(unit / 3) * 3
    const boxColumn = (unit % 3) * 3
    const box = Array.from({ length: 9 }, (_, offset) =>
      board[(boxRow + Math.floor(offset / 3)) * 9 + boxColumn + (offset % 3)],
    )
    if (hasDuplicate(row) || hasDuplicate(column) || hasDuplicate(box)) return false
  }
  for (const cage of cages) {
    const values = cage.cells.map((cell) => board[cell])
    const filled = values.filter((value) => value !== 0)
    const sum = filled.reduce((total, value) => total + value, 0)
    if (
      hasDuplicate(values) ||
      sum > cage.sum ||
      (filled.length === values.length && sum !== cage.sum)
    ) {
      return false
    }
  }
  return true
}

function hasPossibleRemainingSum(
  remainingSum: number,
  remainingCells: number,
  unavailableMask: number,
): boolean {
  if (remainingCells === 0) return remainingSum === 0
  const available = Array.from({ length: 9 }, (_, index) => index + 1)
    .filter((digit) => (unavailableMask & (1 << digit)) === 0)
  if (available.length < remainingCells) return false
  const minimum = available.slice(0, remainingCells).reduce((sum, digit) => sum + digit, 0)
  const maximum = available.slice(-remainingCells).reduce((sum, digit) => sum + digit, 0)
  return remainingSum >= minimum && remainingSum <= maximum
}

export function getKillerCandidateMask(
  board: readonly number[],
  index: number,
  cage: KillerCage,
): number {
  let mask = baseCandidateMask(board, index)
  let usedInCage = 0
  let filledSum = 0
  let remainingCells = 0
  for (const cell of cage.cells) {
    if (cell === index) continue
    const value = board[cell]
    if (value === 0) {
      remainingCells += 1
    } else {
      usedInCage |= 1 << value
      filledSum += value
    }
  }
  mask &= ~usedInCage
  for (let digit = 1; digit <= 9; digit += 1) {
    const bit = 1 << digit
    if ((mask & bit) === 0) continue
    const remainingSum = cage.sum - filledSum - digit
    if (!hasPossibleRemainingSum(remainingSum, remainingCells, usedInCage | bit)) {
      mask &= ~bit
    }
  }
  return mask
}

export function countKillerSolutions(
  board: readonly number[],
  cages: readonly KillerCage[],
  limit = 2,
): number {
  if (board.length !== 81 || limit <= 0) return 0
  const byCell = cageMap(cages)
  if (
    byCell.some((cage, index) => cage === null && board[index] === 0) ||
    !isValidPartialBoard(board, cages)
  ) return 0
  const working = [...board]
  let solutions = 0

  function search(): void {
    if (solutions >= limit) return
    let bestIndex = -1
    let bestMask = 0
    let bestCount = 10
    for (let index = 0; index < 81; index += 1) {
      if (working[index] !== 0) continue
      const mask = getKillerCandidateMask(working, index, byCell[index]!)
      const count = bitCount(mask)
      if (count === 0) return
      if (count < bestCount) {
        bestIndex = index
        bestMask = mask
        bestCount = count
        if (count === 1) break
      }
    }
    if (bestIndex < 0) {
      solutions += 1
      return
    }
    for (let digit = 1; digit <= 9; digit += 1) {
      if ((bestMask & (1 << digit)) === 0) continue
      working[bestIndex] = digit
      search()
      working[bestIndex] = 0
      if (solutions >= limit) return
    }
  }

  search()
  return solutions
}

function neighbors(index: number): number[] {
  const row = Math.floor(index / 9)
  const column = index % 9
  return [
    row > 0 ? index - 9 : -1,
    row < 8 ? index + 9 : -1,
    column > 0 ? index - 1 : -1,
    column < 8 ? index + 1 : -1,
  ].filter((neighbor) => neighbor >= 0)
}

function shuffle<T>(values: readonly T[], random: RandomSource): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function cageSum(cells: readonly number[], solution: readonly number[]): number {
  return cells.reduce((sum, cell) => sum + solution[cell], 0)
}

export function createKillerCages(
  solution: readonly number[],
  random: RandomSource,
  maxCageSize: number,
  fixedCells: ReadonlySet<number> = new Set(),
): KillerCage[] {
  const remaining = new Set(
    Array.from({ length: 81 }, (_, index) => index)
      .filter((index) => !fixedCells.has(index)),
  )
  const cages: KillerCage[] = []
  while (remaining.size > 0) {
    const start = shuffle([...remaining], random)[0]
    const targetSize = 1 + Math.floor(random() * Math.max(1, maxCageSize))
    const cells = [start]
    const usedDigits = new Set([solution[start]])
    remaining.delete(start)
    while (cells.length < targetSize) {
      const frontier = shuffle(
        [...new Set(cells.flatMap(neighbors))]
          .filter((cell) => remaining.has(cell) && !usedDigits.has(solution[cell])),
        random,
      )
      if (frontier.length === 0) break
      const next = frontier[0]
      cells.push(next)
      usedDigits.add(solution[next])
      remaining.delete(next)
    }
    cages.push({ cells: cells.sort((first, second) => first - second), sum: cageSum(cells, solution) })
  }

  return cages.sort((first, second) => first.cells[0] - second.cells[0])
}
export type SudokuDifficulty = 'easy' | 'normal' | 'hard'

export interface SudokuPuzzle {
  difficulty: SudokuDifficulty
  puzzle: number[]
  seed: number
  solution: number[]
}

const ALL_DIGITS_MASK = 0b1111111110
const CLUE_TARGETS: Record<SudokuDifficulty, number> = {
  easy: 42,
  normal: 34,
  hard: 28,
}

type RandomSource = () => number

function createRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(values: T[], random: RandomSource): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function shuffledGroups(random: RandomSource): number[] {
  return shuffle([0, 1, 2], random).flatMap((group) =>
    shuffle([0, 1, 2], random).map((offset) => group * 3 + offset),
  )
}

function createSolvedBoard(random: RandomSource): number[] {
  const rows = shuffledGroups(random)
  const columns = shuffledGroups(random)
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random)

  return rows.flatMap((row) =>
    columns.map((column) => {
      const patternIndex = (row * 3 + Math.floor(row / 3) + column) % 9
      return digits[patternIndex]
    }),
  )
}

function getCandidateMask(board: readonly number[], index: number): number {
  const row = Math.floor(index / 9)
  const column = index % 9
  let usedMask = 0

  for (let offset = 0; offset < 9; offset += 1) {
    usedMask |= 1 << board[row * 9 + offset]
    usedMask |= 1 << board[offset * 9 + column]
  }

  const boxRow = Math.floor(row / 3) * 3
  const boxColumn = Math.floor(column / 3) * 3
  for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < 3; columnOffset += 1) {
      usedMask |=
        1 << board[(boxRow + rowOffset) * 9 + boxColumn + columnOffset]
    }
  }

  return ALL_DIGITS_MASK & ~usedMask
}

function bitCount(mask: number): number {
  let count = 0
  let remaining = mask
  while (remaining !== 0) {
    remaining &= remaining - 1
    count += 1
  }
  return count
}

export function countSolutions(board: readonly number[], limit = 2): number {
  const working = [...board]
  let solutionCount = 0

  function search(): void {
    if (solutionCount >= limit) {
      return
    }

    let bestIndex = -1
    let bestMask = 0
    let bestCount = 10

    for (let index = 0; index < working.length; index += 1) {
      if (working[index] !== 0) {
        continue
      }
      const mask = getCandidateMask(working, index)
      const candidateCount = bitCount(mask)
      if (candidateCount === 0) {
        return
      }
      if (candidateCount < bestCount) {
        bestIndex = index
        bestMask = mask
        bestCount = candidateCount
        if (candidateCount === 1) {
          break
        }
      }
    }

    if (bestIndex === -1) {
      solutionCount += 1
      return
    }

    for (let digit = 1; digit <= 9; digit += 1) {
      if ((bestMask & (1 << digit)) === 0) {
        continue
      }
      working[bestIndex] = digit
      search()
      working[bestIndex] = 0
      if (solutionCount >= limit) {
        return
      }
    }
  }

  search()
  return solutionCount
}

export function generateSudoku(
  difficulty: SudokuDifficulty,
  seed: number,
): SudokuPuzzle {
  const random = createRandom(seed)
  const solution = createSolvedBoard(random)
  const puzzle = [...solution]
  const removalOrder = shuffle(
    Array.from({ length: 81 }, (_, index) => index),
    random,
  )
  let clueCount = 81

  for (const index of removalOrder) {
    if (clueCount <= CLUE_TARGETS[difficulty]) {
      break
    }
    const previousValue = puzzle[index]
    puzzle[index] = 0
    if (countSolutions(puzzle) !== 1) {
      puzzle[index] = previousValue
    } else {
      clueCount -= 1
    }
  }

  return { difficulty, puzzle, seed, solution }
}

export function getCandidates(
  board: readonly number[],
  index: number,
): number[] {
  if (board[index] !== 0) {
    return []
  }
  const mask = getCandidateMask(board, index)
  return Array.from({ length: 9 }, (_, offset) => offset + 1).filter(
    (digit) => (mask & (1 << digit)) !== 0,
  )
}

export function getConflicts(board: readonly number[]): Set<number> {
  const conflicts = new Set<number>()

  for (let index = 0; index < board.length; index += 1) {
    const value = board[index]
    if (value === 0) {
      continue
    }
    const row = Math.floor(index / 9)
    const column = index % 9
    for (let otherIndex = index + 1; otherIndex < board.length; otherIndex += 1) {
      if (board[otherIndex] !== value) {
        continue
      }
      const otherRow = Math.floor(otherIndex / 9)
      const otherColumn = otherIndex % 9
      const sameBox =
        Math.floor(row / 3) === Math.floor(otherRow / 3) &&
        Math.floor(column / 3) === Math.floor(otherColumn / 3)
      if (row === otherRow || column === otherColumn || sameBox) {
        conflicts.add(index)
        conflicts.add(otherIndex)
      }
    }
  }

  return conflicts
}

export function isSudokuSolved(
  values: readonly number[],
  solution: readonly number[],
): boolean {
  return values.every((value, index) => value === solution[index])
}
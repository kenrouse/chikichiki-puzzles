export type SudokuDifficulty = 'easy' | 'normal' | 'hard' | 'expert'

export interface SudokuAnalysis {
  clueCount: number
  guessBranches: number
  logicalPlacements: number
  rating: number
  searchNodes: number
  unresolvedAfterLogic: number
}

export interface SudokuPuzzle {
  analysis: SudokuAnalysis
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
  expert: 24,
}

const GENERATION_ATTEMPTS: Record<SudokuDifficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
  expert: 6,
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

function maskToDigit(mask: number): number {
  for (let digit = 1; digit <= 9; digit += 1) {
    if ((mask & (1 << digit)) !== 0) {
      return digit
    }
  }
  return 0
}

function createUnits(): number[][] {
  const rows = Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, column) => row * 9 + column),
  )
  const columns = Array.from({ length: 9 }, (_, column) =>
    Array.from({ length: 9 }, (_, row) => row * 9 + column),
  )
  const boxes = Array.from({ length: 9 }, (_, box) => {
    const startRow = Math.floor(box / 3) * 3
    const startColumn = (box % 3) * 3
    return Array.from({ length: 9 }, (_, offset) =>
      (startRow + Math.floor(offset / 3)) * 9 + startColumn + (offset % 3),
    )
  })
  return [...rows, ...columns, ...boxes]
}

const SUDOKU_UNITS = createUnits()

function findLogicalPlacement(board: readonly number[]): { index: number; value: number } | null {
  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== 0) {
      continue
    }
    const mask = getCandidateMask(board, index)
    if (bitCount(mask) === 1) {
      return { index, value: maskToDigit(mask) }
    }
  }

  for (const unit of SUDOKU_UNITS) {
    for (let digit = 1; digit <= 9; digit += 1) {
      const positions = unit.filter(
        (index) =>
          board[index] === 0 &&
          (getCandidateMask(board, index) & (1 << digit)) !== 0,
      )
      if (positions.length === 1) {
        return { index: positions[0], value: digit }
      }
    }
  }
  return null
}

function measureSearch(board: readonly number[]): { guessBranches: number; searchNodes: number } {
  const working = [...board]
  let guessBranches = 0
  let searchNodes = 0

  function search(): boolean {
    searchNodes += 1
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
        return false
      }
      if (candidateCount < bestCount) {
        bestIndex = index
        bestMask = mask
        bestCount = candidateCount
      }
    }

    if (bestIndex === -1) {
      return true
    }
    if (bestCount > 1) {
      guessBranches += bestCount - 1
    }
    for (let digit = 1; digit <= 9; digit += 1) {
      if ((bestMask & (1 << digit)) === 0) {
        continue
      }
      working[bestIndex] = digit
      if (search()) {
        return true
      }
      working[bestIndex] = 0
    }
    working[bestIndex] = 0
    return false
  }

  search()
  return { guessBranches, searchNodes }
}

export function analyzeSudoku(board: readonly number[]): SudokuAnalysis {
  const working = [...board]
  const clueCount = working.filter((value) => value !== 0).length
  let logicalPlacements = 0
  while (true) {
    const placement = findLogicalPlacement(working)
    if (!placement) {
      break
    }
    working[placement.index] = placement.value
    logicalPlacements += 1
  }
  const unresolvedAfterLogic = working.filter((value) => value === 0).length
  const { guessBranches, searchNodes } = measureSearch(working)
  const rating = Math.round(
    (81 - clueCount) * 1.6 +
      unresolvedAfterLogic * 3.2 +
      guessBranches * 24 +
      Math.log2(searchNodes + 1) * 9,
  )
  return {
    clueCount,
    guessBranches,
    logicalPlacements,
    rating,
    searchNodes,
    unresolvedAfterLogic,
  }
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

function generateSudokuCandidate(
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

  return {
    analysis: analyzeSudoku(puzzle),
    difficulty,
    puzzle,
    seed,
    solution,
  }
}

export function generateSudoku(
  difficulty: SudokuDifficulty,
  seed: number,
): SudokuPuzzle {
  const candidates = Array.from(
    { length: GENERATION_ATTEMPTS[difficulty] },
    (_, attempt) =>
      generateSudokuCandidate(
        difficulty,
        (seed + Math.imul(attempt, 0x9e3779b1)) >>> 0,
      ),
  )
  const selected = difficulty === 'easy'
    ? candidates.reduce((best, candidate) =>
      candidate.analysis.rating < best.analysis.rating ? candidate : best,
    )
    : candidates.reduce((best, candidate) =>
      candidate.analysis.rating > best.analysis.rating ? candidate : best,
    )
  return { ...selected, seed: seed >>> 0 }
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
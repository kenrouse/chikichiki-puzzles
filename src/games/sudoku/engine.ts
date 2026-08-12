import { countSudokuSolutionsExactCover } from './exactCover'
import {
  analyzeHumanSolving,
  type HumanTechnique,
} from './humanSolver'
import {
  countKillerSolutions,
  createKillerCages,
  getKillerCandidateMask,
  type KillerCage,
} from './killer'

export type SudokuDifficulty = 'beginner' | 'easy' | 'normal' | 'hard' | 'expert'
export type SudokuVariant = 'classic' | 'killer' | 'symmetric'

export interface SudokuAnalysis {
  candidateEliminations: number
  clueCount: number
  guessBranches: number
  hardestTechnique: HumanTechnique | 'none' | 'search'
  logicalPlacements: number
  rating: number
  searchNodes: number
  techniques: Record<HumanTechnique, number>
  unresolvedAfterLogic: number
}

export interface SudokuPuzzle {
  analysis: SudokuAnalysis
  cages?: KillerCage[]
  difficulty: SudokuDifficulty
  puzzle: number[]
  seed: number
  solution: number[]
  variant?: SudokuVariant
}

const ALL_DIGITS_MASK = 0b1111111110
const CLUE_TARGETS: Record<SudokuDifficulty, number> = {
  beginner: 50,
  easy: 42,
  normal: 34,
  hard: 28,
  expert: 24,
}

const GENERATION_ATTEMPTS: Record<SudokuDifficulty, number> = {
  beginner: 1,
  easy: 1,
  normal: 2,
  hard: 3,
  expert: 6,
}

const KILLER_CAGE_SIZES: Record<SudokuDifficulty, number> = {
  beginner: 1,
  easy: 2,
  normal: 3,
  hard: 4,
  expert: 5,
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

function findNakedSinglePlacement(board: readonly number[]): { index: number; value: number } | null {
  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== 0) {
      continue
    }
    const mask = getCandidateMask(board, index)
    if (bitCount(mask) === 1) {
      return { index, value: maskToDigit(mask) }
    }
  }
  return null
}

export function isSolvableWithNakedSingles(board: readonly number[]): boolean {
  const working = [...board]
  while (true) {
    const placement = findNakedSinglePlacement(working)
    if (!placement) {
      break
    }
    working[placement.index] = placement.value
  }
  return working.every((value) => value !== 0)
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
  const clueCount = board.filter((value) => value !== 0).length
  const human = analyzeHumanSolving(board)
  const unresolvedAfterLogic = human.unresolved
  const { guessBranches, searchNodes } = measureSearch(human.board)
  const techniqueWeight =
    human.techniques['hidden-single'] * 2 +
    human.techniques['locked-candidate'] * 12 +
    human.techniques['naked-pair'] * 18 +
    human.techniques['hidden-pair'] * 22 +
    human.techniques['x-wing'] * 38 +
    human.techniques['xy-wing'] * 52 +
    human.techniques['simple-chain'] * 68
  const rating = Math.round(
    (81 - clueCount) * 1.6 +
      techniqueWeight +
      human.candidateEliminations * 0.8 +
      unresolvedAfterLogic * 3.2 +
      guessBranches * 24 +
      Math.log2(searchNodes + 1) * 9,
  )
  return {
    candidateEliminations: human.candidateEliminations,
    clueCount,
    guessBranches,
    hardestTechnique: human.hardestTechnique,
    logicalPlacements: human.placements,
    rating,
    searchNodes,
    techniques: human.techniques,
    unresolvedAfterLogic,
  }
}

export function countSolutions(board: readonly number[], limit = 2): number {
  return countSudokuSolutionsExactCover(board, limit)
}

function createKillerClueBoard(
  solution: readonly number[],
  difficulty: SudokuDifficulty,
  random: RandomSource,
): number[] {
  const clueBoard = [...solution]
  const removalOrder = shuffle(
    Array.from({ length: 81 }, (_, index) => index),
    random,
  )
  let clueCount = 81
  for (const index of removalOrder) {
    if (clueCount <= CLUE_TARGETS[difficulty]) break
    const previous = clueBoard[index]
    clueBoard[index] = 0
    const remainsBeginnerFriendly =
      difficulty !== 'beginner' || isSolvableWithNakedSingles(clueBoard)
    if (countSolutions(clueBoard) !== 1 || !remainsBeginnerFriendly) {
      clueBoard[index] = previous
    } else {
      clueCount -= 1
    }
  }
  return clueBoard
}

function generateSudokuCandidate(
  difficulty: SudokuDifficulty,
  seed: number,
  variant: SudokuVariant,
): SudokuPuzzle {
  const random = createRandom(seed)
  const solution = createSolvedBoard(random)
  if (variant === 'killer') {
    const puzzle = createKillerClueBoard(solution, difficulty, random)
    const fixedCells = new Set(
      puzzle
        .map((value, index) => value === 0 ? -1 : index)
        .filter((index) => index >= 0),
    )
    const cages = createKillerCages(
      solution,
      random,
      KILLER_CAGE_SIZES[difficulty],
      fixedCells,
    )
    const analysis = analyzeSudoku(puzzle)
    const cageComplexity = cages.reduce(
      (total, cage) => total + (cage.cells.length - 1) ** 2,
      0,
    )
    const singletonCages = cages.filter((cage) => cage.cells.length === 1).length
    const rating = Math.max(
      1,
      Math.round(
        (81 - fixedCells.size) * 2 +
        cageComplexity * 12 -
        singletonCages * 2,
      ),
    )
    return {
      analysis: {
        ...analysis,
        clueCount: fixedCells.size,
        rating,
      },
      cages,
      difficulty,
      puzzle,
      seed,
      solution,
      variant,
    }
  }

  const puzzle = [...solution]
  const removalGroups = variant === 'symmetric'
    ? shuffle(
      Array.from({ length: 41 }, (_, index) =>
        index === 40 ? [40] : [index, 80 - index],
      ),
      random,
    )
    : shuffle(
      Array.from({ length: 81 }, (_, index) => [index]),
      random,
    )
  let clueCount = 81

  for (const group of removalGroups) {
    if (variant === 'classic' && clueCount <= CLUE_TARGETS[difficulty]) {
      break
    }
    const minimumClues = variant === 'symmetric' ? 17 : CLUE_TARGETS[difficulty]
    if (clueCount - group.length < minimumClues) continue
    const previousValues = group.map((index) => puzzle[index])
    for (const index of group) puzzle[index] = 0
    const solutionCount = countSolutions(puzzle)
    const remainsBeginnerFriendly =
      difficulty !== 'beginner' || isSolvableWithNakedSingles(puzzle)
    const remainsEasyFriendly =
      difficulty !== 'easy' ||
      variant !== 'symmetric' ||
      analyzeHumanSolving(puzzle).unresolved === 0
    if (solutionCount !== 1 || !remainsBeginnerFriendly || !remainsEasyFriendly) {
      group.forEach((index, groupIndex) => {
        puzzle[index] = previousValues[groupIndex]
      })
    } else {
      clueCount -= group.length
    }
  }

  return {
    analysis: analyzeSudoku(puzzle),
    difficulty,
    puzzle,
    seed,
    solution,
    variant,
  }
}

export function generateSudoku(
  difficulty: SudokuDifficulty,
  seed: number,
  variant: SudokuVariant = 'classic',
): SudokuPuzzle {
  const candidates = Array.from(
    { length: GENERATION_ATTEMPTS[difficulty] },
    (_, attempt) =>
      generateSudokuCandidate(
        difficulty,
        (seed + Math.imul(attempt, 0x9e3779b1)) >>> 0,
        variant,
      ),
  )
  const selected = difficulty === 'beginner' || difficulty === 'easy'
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
  cages: readonly KillerCage[] = [],
): number[] {
  if (board[index] !== 0) {
    return []
  }
  const cage = cages.find((candidate) => candidate.cells.includes(index))
  const mask = cage
    ? getKillerCandidateMask(board, index, cage)
    : getCandidateMask(board, index)
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

export function getCageConflicts(
  board: readonly number[],
  cages: readonly KillerCage[] = [],
): Set<number> {
  const conflicts = new Set<number>()
  for (const cage of cages) {
    const values = cage.cells
      .map((cell) => board[cell])
      .filter((value) => value !== 0)
    const sum = values.reduce((total, value) => total + value, 0)
    const duplicate = new Set(values).size !== values.length
    const complete = values.length === cage.cells.length
    if (duplicate || sum > cage.sum || (complete && sum !== cage.sum)) {
      for (const cell of cage.cells) conflicts.add(cell)
    }
  }
  return conflicts
}

export function countPuzzleSolutions(puzzle: SudokuPuzzle, limit = 2): number {
  return puzzle.variant === 'killer' && puzzle.cages
    ? countKillerSolutions(puzzle.puzzle, puzzle.cages, limit)
    : countSolutions(puzzle.puzzle, limit)
}
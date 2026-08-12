import { describe, expect, test } from 'vitest'
import {
  analyzeSudoku,
  countPuzzleSolutions,
  countSolutions,
  generateSudoku,
  getCageConflicts,
  getCandidates,
  getConflicts,
  isSolvableWithNakedSingles,
  isSudokuSolved,
  type SudokuDifficulty,
  type SudokuVariant,
} from './engine'

const difficulties: SudokuDifficulty[] = [
  'beginner',
  'easy',
  'normal',
  'hard',
  'expert',
]
const variants: SudokuVariant[] = ['classic', 'symmetric', 'killer']

describe('Sudoku engine', () => {
  test.each(difficulties)('generates a unique %s puzzle', (difficulty) => {
    const generated = generateSudoku(difficulty, 20060101)

    expect(generated.puzzle).toHaveLength(81)
    expect(generated.solution).toHaveLength(81)
    expect(countSolutions(generated.puzzle)).toBe(1)
    expect(generated.analysis).toEqual(analyzeSudoku(generated.puzzle))
    expect(generated.analysis.rating).toBeGreaterThan(0)
    expect(getConflicts(generated.solution).size).toBe(0)
    expect(isSudokuSolved(generated.solution, generated.solution)).toBe(true)
  })

  test('is deterministic for a seed', () => {
    const first = generateSudoku('normal', 20110101)
    const second = generateSudoku('normal', 20110101)

    expect(first).toEqual(second)
    expect(first.seed).toBe(20110101)
  })

  test.each(variants)('generates a deterministic unique %s variant', (variant) => {
    const first = generateSudoku('normal', 20260812, variant)
    const second = generateSudoku('normal', 20260812, variant)

    expect(first).toEqual(second)
    expect(first.variant).toBe(variant)
    expect(countPuzzleSolutions(first)).toBe(1)
    expect(first.analysis.rating).toBeGreaterThan(0)
  })

  test('removes clues in 180-degree symmetric pairs', () => {
    const generated = generateSudoku('hard', 20260812, 'symmetric')

    for (let index = 0; index < 81; index += 1) {
      expect(generated.puzzle[index] === 0).toBe(generated.puzzle[80 - index] === 0)
    }
  })

  test('keeps a symmetric puzzle pair-minimal for uniqueness', () => {
    const generated = generateSudoku('hard', 20260812, 'symmetric')
    const tested = new Set<number>()

    for (let index = 0; index < 81; index += 1) {
      const partner = 80 - index
      const first = Math.min(index, partner)
      if (tested.has(first) || generated.puzzle[index] === 0) continue
      tested.add(first)
      const reduced = [...generated.puzzle]
      reduced[index] = 0
      reduced[partner] = 0
      expect(countSolutions(reduced)).not.toBe(1)
    }
  })

  test('creates a cage-covered Killer variant', () => {
    const generated = generateSudoku('normal', 20260812, 'killer')
    const emptyCells = generated.puzzle
      .map((value, index) => value === 0 ? index : -1)
      .filter((index) => index >= 0)

    expect(generated.cages?.flatMap((cage) => cage.cells).sort((first, second) => first - second))
      .toEqual(emptyCells)
    expect(generated.puzzle.some((value) => value !== 0)).toBe(true)
  })

  test('calculates candidates and conflicts', () => {
    const board = Array<number>(81).fill(0)
    board[0] = 1
    board[1] = 1

    expect(getCandidates(board, 2)).not.toContain(1)
    expect(getConflicts(board)).toEqual(new Set([0, 1]))
  })

  test('applies Killer cage sums to candidates and conflicts', () => {
    const board = Array<number>(81).fill(0)
    const cages = [{ cells: [0, 1], sum: 3 }]

    expect(getCandidates(board, 0, cages)).toEqual([1, 2])
    board[1] = 2
    expect(getCandidates(board, 0, cages)).toEqual([1])
    board[0] = 2
    expect(getCageConflicts(board, cages)).toEqual(new Set([0, 1]))
  })

  test('counts exact-cover solutions up to the requested limit', () => {
    const solved = generateSudoku('easy', 42).solution
    const invalid = [...solved]
    invalid[1] = invalid[0]

    expect(countSolutions(solved)).toBe(1)
    expect(countSolutions(invalid)).toBe(0)
    expect(countSolutions(Array<number>(81).fill(0), 2)).toBe(2)
  })

  test('selects a more complex expert candidate than the easy candidate', () => {
    const easy = generateSudoku('easy', 20260811)
    const expert = generateSudoku('expert', 20260811)

    expect(expert.analysis.clueCount).toBeLessThan(easy.analysis.clueCount)
    expect(expert.analysis.rating).toBeGreaterThan(easy.analysis.rating)
  })

  test('makes beginner easier than easy and solvable with basic singles', () => {
    const beginner = generateSudoku('beginner', 20260812)
    const easy = generateSudoku('easy', 20260812)

    expect(beginner.analysis.clueCount).toBeGreaterThan(easy.analysis.clueCount)
    expect(beginner.analysis.rating).toBeLessThan(easy.analysis.rating)
    expect(isSolvableWithNakedSingles(beginner.puzzle)).toBe(true)
    expect(beginner.analysis.unresolvedAfterLogic).toBe(0)
    expect(beginner.analysis.guessBranches).toBe(0)
  })

  test('keeps beginner puzzles below easy across representative seeds', () => {
    for (let seed = 0; seed < 100; seed += 1) {
      const beginner = generateSudoku('beginner', seed)
      const easy = generateSudoku('easy', seed)

      expect(beginner.analysis.clueCount).toBeGreaterThanOrEqual(50)
      expect(beginner.analysis.rating).toBeLessThan(easy.analysis.rating)
      expect(isSolvableWithNakedSingles(beginner.puzzle)).toBe(true)
      expect(beginner.analysis.unresolvedAfterLogic).toBe(0)
      expect(beginner.analysis.guessBranches).toBe(0)
    }
  })

  test('keeps average classic ratings ordered across difficulties', () => {
    const averageRating = (difficulty: SudokuDifficulty) => {
      const ratings = Array.from({ length: 12 }, (_, seed) =>
        generateSudoku(difficulty, seed).analysis.rating,
      )
      return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    }
    const averages = difficulties.map(averageRating)

    for (let index = 1; index < averages.length; index += 1) {
      expect(averages[index]).toBeGreaterThan(averages[index - 1])
    }
  })

  test('keeps average Killer ratings ordered across difficulties', () => {
    const averageRating = (difficulty: SudokuDifficulty) => {
      const ratings = Array.from({ length: 6 }, (_, seed) =>
        generateSudoku(difficulty, seed, 'killer').analysis.rating,
      )
      return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    }
    const averages = difficulties.map(averageRating)

    for (let index = 1; index < averages.length; index += 1) {
      if (averages[index] <= averages[index - 1]) {
        throw new Error(`Killer averages: ${averages.join(', ')}`)
      }
    }
  })
})
import { describe, expect, test } from 'vitest'
import {
  countSolutions,
  generateSudoku,
  getCandidates,
  getConflicts,
  isSudokuSolved,
  type SudokuDifficulty,
} from './engine'

const difficulties: SudokuDifficulty[] = ['easy', 'normal', 'hard']

describe('Sudoku engine', () => {
  test.each(difficulties)('generates a unique %s puzzle', (difficulty) => {
    const generated = generateSudoku(difficulty, 20060101)

    expect(generated.puzzle).toHaveLength(81)
    expect(generated.solution).toHaveLength(81)
    expect(countSolutions(generated.puzzle)).toBe(1)
    expect(getConflicts(generated.solution).size).toBe(0)
    expect(isSudokuSolved(generated.solution, generated.solution)).toBe(true)
  })

  test('is deterministic for a seed', () => {
    const first = generateSudoku('normal', 20110101)
    const second = generateSudoku('normal', 20110101)

    expect(first).toEqual(second)
  })

  test('calculates candidates and conflicts', () => {
    const board = Array<number>(81).fill(0)
    board[0] = 1
    board[1] = 1

    expect(getCandidates(board, 2)).not.toContain(1)
    expect(getConflicts(board)).toEqual(new Set([0, 1]))
  })
})
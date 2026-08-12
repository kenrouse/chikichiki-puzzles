import { describe, expect, test } from 'vitest'
import {
  calculateMinesweeperRank,
  calculateShisenRank,
  calculateSudokuRank,
} from './20260812_ranking'

describe('game performance ranks', () => {
  test('calculates Sudoku time, hint, and mistake penalties', () => {
    expect(calculateSudokuRank(174, 1, 0)).toMatchObject({ grade: 'S', metric: 264 })
    expect(calculateSudokuRank(300, 0, 0)).toMatchObject({
      grade: 'A',
      nextGrade: 'S',
      reductionNeeded: 1,
      targetSecondsWithSameActions: 299,
    })
    expect(calculateSudokuRank(500, 2, 1)).toMatchObject({
      grade: 'B',
      metric: 715,
      targetSecondsWithSameActions: 384,
    })
  })

  test('keeps every Sudoku grade boundary exact', () => {
    expect(calculateSudokuRank(299, 0, 0).grade).toBe('S')
    expect(calculateSudokuRank(300, 0, 0).grade).toBe('A')
    expect(calculateSudokuRank(599, 0, 0).grade).toBe('A')
    expect(calculateSudokuRank(600, 0, 0).grade).toBe('B')
    expect(calculateSudokuRank(999, 0, 0).grade).toBe('B')
    expect(calculateSudokuRank(1000, 0, 0).grade).toBe('C')
  })

  test('calculates Shisen shuffle penalties', () => {
    expect(calculateShisenRank(250, 0).grade).toBe('S')
    expect(calculateShisenRank(500, 1)).toMatchObject({
      grade: 'A',
      metric: 620,
      nextMaximum: 359,
      targetSecondsWithSameActions: 239,
    })
    expect(calculateShisenRank(700, 1)).toMatchObject({
      grade: 'B',
      metric: 820,
      nextMaximum: 719,
      targetSecondsWithSameActions: 599,
    })
  })

  test('keeps every Shisen grade boundary exact', () => {
    expect(calculateShisenRank(359, 0).grade).toBe('S')
    expect(calculateShisenRank(360, 0).grade).toBe('A')
    expect(calculateShisenRank(719, 0).grade).toBe('A')
    expect(calculateShisenRank(720, 0).grade).toBe('B')
    expect(calculateShisenRank(1199, 0).grade).toBe('B')
    expect(calculateShisenRank(1200, 0).grade).toBe('C')
  })

  test('calculates Minesweeper efficiency and next score', () => {
    expect(calculateMinesweeperRank(3420, 90)).toMatchObject({ grade: 'S' })
    expect(calculateMinesweeperRank(2500, 90)).toMatchObject({
      grade: 'A',
      nextGrade: 'S',
      nextMinimum: 3420,
      pointsNeeded: 920,
    })
    expect(calculateMinesweeperRank(0, 90)).toMatchObject({
      grade: 'C',
      nextMinimum: 1530,
    })
  })

  test('keeps every Minesweeper efficiency boundary exact', () => {
    expect(calculateMinesweeperRank(3419, 90).grade).toBe('A')
    expect(calculateMinesweeperRank(3420, 90).grade).toBe('S')
    expect(calculateMinesweeperRank(2429, 90).grade).toBe('B')
    expect(calculateMinesweeperRank(2430, 90).grade).toBe('A')
    expect(calculateMinesweeperRank(1529, 90).grade).toBe('C')
    expect(calculateMinesweeperRank(1530, 90).grade).toBe('B')
  })
})
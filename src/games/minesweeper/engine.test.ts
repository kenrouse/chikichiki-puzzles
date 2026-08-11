import { describe, expect, test } from 'vitest'
import {
  calculateMineCascadeScore,
  countOpenedSafeCells,
  countFlags,
  createMineBoard,
  cycleMineMark,
  getMineNeighbors,
  isMineBoardSolvableWithoutGuess,
  revealMineCell,
} from './engine'

describe('Minesweeper engine', () => {
  test('keeps the first cell and its neighbors safe', () => {
    const initial = createMineBoard(
      { width: 10, height: 10, mineCount: 10 },
      20070101,
    )
    const revealed = revealMineCell(initial, 44)

    expect(revealed.cells[44].mine).toBe(false)
    expect(revealed.cells[44].adjacent).toBe(0)
    expect(
      getMineNeighbors(revealed, 44).every(
        (index) => !revealed.cells[index].mine,
      ),
    ).toBe(true)
    expect(revealed.cells.filter((cell) => cell.mine)).toHaveLength(10)
  })

  test('generates the same minefield from the same seed and first move', () => {
    const configuration = { width: 20, height: 20, mineCount: 60 }
    const first = revealMineCell(createMineBoard(configuration, 77), 0)
    const second = revealMineCell(createMineBoard(configuration, 77), 0)

    expect(first.cells).toEqual(second.cells)
  })

  test.each([
    { configuration: { width: 10, height: 10, mineCount: 10 }, firstMove: 44, seed: 7 },
    { configuration: { width: 20, height: 20, mineCount: 60 }, firstMove: 210, seed: 77 },
    { configuration: { width: 40, height: 40, mineCount: 320 }, firstMove: 820, seed: 777 },
  ])('generates a guess-free $configuration.width x $configuration.height board', ({ configuration, firstMove, seed }) => {
    const board = revealMineCell(
      createMineBoard(configuration, seed, 'guess-free'),
      firstMove,
    )

    expect(board.generationMode).toBe('guess-free')
    expect(board.generationAttempts).toBeGreaterThan(0)
    expect(isMineBoardSolvableWithoutGuess(board, firstMove)).toBe(true)
  })

  test('cycles hidden, flag, question, and hidden without opening the cell', () => {
    const initial = createMineBoard(
      { width: 10, height: 10, mineCount: 10 },
      1,
    )
    const flagged = cycleMineMark(initial, 12)
    const questioned = cycleMineMark(flagged, 12)
    const cleared = cycleMineMark(questioned, 12)

    expect(flagged.cells[12].state).toBe('flagged')
    expect(countFlags(flagged)).toBe(1)
    expect(questioned.cells[12].state).toBe('questioned')
    expect(countFlags(questioned)).toBe(0)
    expect(cleared.cells[12].state).toBe('hidden')
  })

  test('opens a question-marked cell with a normal reveal', () => {
    const initial = createMineBoard(
      { width: 10, height: 10, mineCount: 10 },
      15,
    )
    const questioned = cycleMineMark(cycleMineMark(initial, 44), 44)
    const revealed = revealMineCell(questioned, 44)

    expect(revealed.cells[44].state).toBe('open')
    expect(revealed.cells[44].mine).toBe(false)
  })

  test('detects a win and a mine hit', () => {
    const won = revealMineCell(
      createMineBoard({ width: 2, height: 1, mineCount: 1 }, 4),
      0,
    )
    expect(won.status).toBe('won')

    const playing = revealMineCell(
      createMineBoard({ width: 4, height: 4, mineCount: 3 }, 9),
      0,
    )
    const mineIndex = playing.cells.findIndex((cell) => cell.mine)
    const lost = revealMineCell(playing, mineIndex)
    expect(lost.status).toBe('lost')
    expect(lost.detonatedIndex).toBe(mineIndex)
    expect(lost.cells.filter((cell) => cell.mine && cell.state === 'open')).toHaveLength(3)
  })

  test('rewards larger reveal cascades with stronger multipliers', () => {
    expect(calculateMineCascadeScore(0)).toEqual({
      intensity: 0,
      openedCells: 0,
      points: 0,
    })
    expect(calculateMineCascadeScore(1).points).toBe(10)
    expect(calculateMineCascadeScore(8)).toEqual({
      intensity: 4,
      openedCells: 8,
      points: 320,
    })
    expect(calculateMineCascadeScore(2).intensity).toBe(2)
    expect(calculateMineCascadeScore(16).intensity).toBe(5)
    expect(calculateMineCascadeScore(128).intensity).toBe(6)
    expect(calculateMineCascadeScore(100).intensity).toBe(6)
  })

  test('counts only opened safe cells', () => {
    const board = revealMineCell(
      createMineBoard({ width: 10, height: 10, mineCount: 10 }, 99),
      44,
    )
    expect(countOpenedSafeCells(board)).toBeGreaterThan(0)
    expect(countOpenedSafeCells(board)).toBeLessThanOrEqual(90)
  })
})
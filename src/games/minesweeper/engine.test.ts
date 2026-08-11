import { describe, expect, test } from 'vitest'
import {
  countFlags,
  createMineBoard,
  getMineNeighbors,
  revealMineCell,
  toggleMineFlag,
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

  test('toggles flags without opening the cell', () => {
    const initial = createMineBoard(
      { width: 10, height: 10, mineCount: 10 },
      1,
    )
    const flagged = toggleMineFlag(initial, 12)

    expect(flagged.cells[12].state).toBe('flagged')
    expect(countFlags(flagged)).toBe(1)
    expect(toggleMineFlag(flagged, 12).cells[12].state).toBe('hidden')
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
  })
})
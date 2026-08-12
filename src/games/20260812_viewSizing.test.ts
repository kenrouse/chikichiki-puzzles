import { describe, expect, test } from 'vitest'
import { fitBoardScale, fitGridCellSize } from './20260812_viewSizing'

describe('board fit sizing', () => {
  test('fits a grid by its limiting dimension', () => {
    expect(fitGridCellSize(300, 700, 40, 40, 6, 40)).toBe(7)
    expect(fitGridCellSize(900, 400, 20, 20, 6, 40)).toBe(20)
  })

  test('clamps grid cells to usable limits', () => {
    expect(fitGridCellSize(100, 100, 40, 40, 6, 40)).toBe(6)
    expect(fitGridCellSize(4000, 4000, 10, 10, 6, 40)).toBe(40)
  })

  test('fits a scaled board and clamps the result', () => {
    expect(fitBoardScale(320, 600, 1280, 800, 0.2, 1.4)).toBe(0.25)
    expect(fitBoardScale(3000, 3000, 1000, 500, 0.2, 1.4)).toBe(1.4)
  })
})
import { describe, expect, test } from 'vitest'
import {
  applyHiddenPairs,
  applyLockedCandidates,
  applyNakedPairs,
  applySimpleChains,
  applyXWing,
  applyXYWing,
  maskFromDigits,
} from './humanSolver'

function emptyMasks(): number[] {
  return Array<number>(81).fill(0)
}

describe('Sudoku human techniques', () => {
  test('eliminates a locked candidate outside its box', () => {
    const masks = emptyMasks()
    masks[0] = maskFromDigits(1, 2)
    masks[1] = maskFromDigits(1, 3)
    masks[3] = maskFromDigits(1, 4)

    expect(applyLockedCandidates(masks)).toBe(true)
    expect(masks[3]).toBe(maskFromDigits(4))
  })

  test('eliminates naked-pair digits from another cell', () => {
    const masks = emptyMasks()
    masks[0] = maskFromDigits(1, 2)
    masks[1] = maskFromDigits(1, 2)
    masks[2] = maskFromDigits(1, 2, 3)

    expect(applyNakedPairs(masks)).toBe(true)
    expect(masks[2]).toBe(maskFromDigits(3))
  })

  test('restricts hidden-pair cells to their shared digits', () => {
    const masks = emptyMasks()
    masks[0] = maskFromDigits(1, 2, 3)
    masks[1] = maskFromDigits(1, 2, 4)
    masks[2] = maskFromDigits(3, 4, 5)

    expect(applyHiddenPairs(masks)).toBe(true)
    expect(masks[0]).toBe(maskFromDigits(1, 2))
    expect(masks[1]).toBe(maskFromDigits(1, 2))
  })

  test('eliminates an X-Wing digit from matching columns', () => {
    const masks = emptyMasks()
    masks[0] = maskFromDigits(1, 2)
    masks[1] = maskFromDigits(1, 2)
    masks[9] = maskFromDigits(1, 3)
    masks[10] = maskFromDigits(1, 3)
    masks[18] = maskFromDigits(1, 4)

    expect(applyXWing(masks)).toBe(true)
    expect(masks[18]).toBe(maskFromDigits(4))
  })

  test('eliminates the shared outer digit of an XY-Wing', () => {
    const masks = emptyMasks()
    masks[0] = maskFromDigits(1, 2)
    masks[1] = maskFromDigits(1, 3)
    masks[9] = maskFromDigits(2, 3)
    masks[10] = maskFromDigits(3, 4)

    expect(applyXYWing(masks)).toBe(true)
    expect(masks[10]).toBe(maskFromDigits(4))
  })

  test('uses a same-color chain contradiction to eliminate candidates', () => {
    const masks = emptyMasks()
    masks[0] = maskFromDigits(1, 2)
    masks[1] = maskFromDigits(1, 3)
    masks[9] = maskFromDigits(1, 4)
    masks[10] = maskFromDigits(1, 5)
    masks[18] = maskFromDigits(1, 6)

    expect(applySimpleChains(masks)).toBe(true)
    expect(masks[0]).toBe(maskFromDigits(2))
    expect(masks[10]).toBe(maskFromDigits(5))
  })
})
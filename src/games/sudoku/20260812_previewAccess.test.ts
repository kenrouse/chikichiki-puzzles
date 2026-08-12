import { describe, expect, test } from 'vitest'
import type { SudokuVariant } from './engine'
import { getSudokuPreviewAccess } from './20260812_previewAccess'

describe('Sudoku preview access', () => {
  test('hides preview UI and keeps new puzzles classic by default', () => {
    expect(getSudokuPreviewAccess('classic', false)).toEqual({
      nextPuzzleVariant: 'classic',
      showCompatibilityBanner: false,
      showPreviewDetails: false,
      showVariantSelector: false,
    })
  })

  test.each<SudokuVariant>(['classic', 'killer', 'symmetric'])(
    'allows %s selection and generation when preview is enabled',
    (variant) => {
      expect(getSudokuPreviewAccess(variant, true)).toEqual({
        nextPuzzleVariant: variant,
        showCompatibilityBanner: false,
        showPreviewDetails: true,
        showVariantSelector: true,
      })
    },
  )

  test.each<SudokuVariant>(['killer', 'symmetric'])(
    'keeps an existing %s puzzle visible but makes the next puzzle classic when preview is disabled',
    (variant) => {
      expect(getSudokuPreviewAccess(variant, false)).toEqual({
        nextPuzzleVariant: 'classic',
        showCompatibilityBanner: true,
        showPreviewDetails: true,
        showVariantSelector: false,
      })
    },
  )
})
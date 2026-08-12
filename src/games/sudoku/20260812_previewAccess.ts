import type { SudokuVariant } from './engine'

export interface SudokuPreviewAccess {
  nextPuzzleVariant: SudokuVariant
  showCompatibilityBanner: boolean
  showPreviewDetails: boolean
  showVariantSelector: boolean
}

export function getSudokuPreviewAccess(
  currentVariant: SudokuVariant,
  previewEnabled: boolean,
): SudokuPreviewAccess {
  const isPreviewPuzzle = currentVariant !== 'classic'
  return {
    nextPuzzleVariant: previewEnabled ? currentVariant : 'classic',
    showCompatibilityBanner: !previewEnabled && isPreviewPuzzle,
    showPreviewDetails: previewEnabled || isPreviewPuzzle,
    showVariantSelector: previewEnabled,
  }
}
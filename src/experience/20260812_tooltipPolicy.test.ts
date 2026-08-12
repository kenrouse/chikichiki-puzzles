import { describe, expect, test } from 'vitest'
import { resolveTooltipText } from './20260812_tooltipPolicy'

describe('tooltip text policy', () => {
  test('prefers an explicit explanation over the accessible name', () => {
    expect(resolveTooltipText({
      accessibleName: 'Settings',
      explicitText: 'Open language, sound, and game settings.',
      iconOnly: true,
      title: '',
    })).toBe('Open language, sound, and game settings.')
  })

  test('does not repeat the accessible name for a visibly labeled control', () => {
    expect(resolveTooltipText({
      accessibleName: 'Hard',
      explicitText: '',
      iconOnly: false,
      title: '',
    })).toBe('')
  })

  test('uses the accessible name for an icon-only control', () => {
    expect(resolveTooltipText({
      accessibleName: 'Close',
      explicitText: '',
      iconOnly: true,
      title: '',
    })).toBe('Close')
  })

  test('preserves an explicit native title', () => {
    expect(resolveTooltipText({
      accessibleName: 'Source',
      explicitText: '',
      iconOnly: false,
      title: 'Open source repository',
    })).toBe('Open source repository')
  })
})
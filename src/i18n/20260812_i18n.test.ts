import { describe, expect, test } from 'vitest'
import { getLocalizedCopy } from './20260812_i18n'

describe('localized copy', () => {
  const copy = {
    en: { label: 'How to play' },
    ja: { label: '遊び方' },
  }

  test('returns Japanese copy', () => {
    expect(getLocalizedCopy('ja', copy)).toEqual({ label: '遊び方' })
  })

  test('returns English copy', () => {
    expect(getLocalizedCopy('en', copy)).toEqual({ label: 'How to play' })
  })
})
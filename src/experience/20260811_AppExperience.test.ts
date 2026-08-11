import { describe, expect, test } from 'vitest'
import { getBgmGain } from './20260811_audio'

describe('BGM gain curve', () => {
  test('is silent at zero and reaches an audible maximum at 100 percent', () => {
    expect(getBgmGain(0)).toBe(0)
    expect(getBgmGain(1)).toBeCloseTo(0.1)
  })

  test('stays monotonic and clamps values outside the slider range', () => {
    expect(getBgmGain(0.25)).toBeLessThan(getBgmGain(0.5))
    expect(getBgmGain(0.5)).toBeLessThan(getBgmGain(0.75))
    expect(getBgmGain(-1)).toBe(0)
    expect(getBgmGain(2)).toBeCloseTo(0.1)
  })
})
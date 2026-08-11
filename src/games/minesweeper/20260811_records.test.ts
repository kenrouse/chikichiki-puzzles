import { describe, expect, test } from 'vitest'
import { updateBestTime } from './20260811_records'

describe('Minesweeper best time', () => {
  test('stores the first clear time', () => {
    expect(updateBestTime(null, 95)).toBe(95)
  })

  test('replaces the record with a faster clear', () => {
    expect(updateBestTime(95, 72)).toBe(72)
  })

  test('keeps the record when a later clear is slower or equal', () => {
    expect(updateBestTime(72, 90)).toBe(72)
    expect(updateBestTime(72, 72)).toBe(72)
  })
})

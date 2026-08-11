import { describe, expect, test } from 'vitest'
import { isTouchSwipe, TOUCH_SWIPE_THRESHOLD } from './20260811_touchGesture'

describe('Minesweeper touch gesture', () => {
  test('treats small finger movement as a tap', () => {
    expect(isTouchSwipe(100, 100, 106, 107)).toBe(false)
  })

  test('treats movement at the threshold as a swipe', () => {
    expect(isTouchSwipe(100, 100, 100 + TOUCH_SWIPE_THRESHOLD, 100)).toBe(true)
  })

  test('detects diagonal swipes by total distance', () => {
    expect(isTouchSwipe(100, 100, 108, 108)).toBe(true)
  })
})

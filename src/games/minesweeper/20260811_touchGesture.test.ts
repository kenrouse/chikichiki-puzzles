import { describe, expect, test } from 'vitest'
import {
  isTouchSwipe,
  resolveMineTapAction,
  supportsLongPress,
  TOUCH_SWIPE_THRESHOLD,
} from './20260811_touchGesture'

describe('Minesweeper touch gesture', () => {
  test('supports long press for touch and pen but not mouse', () => {
    expect(supportsLongPress('touch')).toBe(true)
    expect(supportsLongPress('pen')).toBe(true)
    expect(supportsLongPress('mouse')).toBe(false)
  })

  test('applies mark mode only to touch and pen taps', () => {
    expect(resolveMineTapAction('touch', 'mark', false)).toBe('mark')
    expect(resolveMineTapAction('pen', 'mark', false)).toBe('mark')
    expect(resolveMineTapAction('mouse', 'mark', false)).toBe('open')
    expect(resolveMineTapAction('touch', 'open', false)).toBe('open')
    expect(resolveMineTapAction('touch', 'mark', true)).toBe('open')
  })

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

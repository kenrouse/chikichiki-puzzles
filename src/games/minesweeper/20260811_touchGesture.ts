export const TOUCH_SWIPE_THRESHOLD = 10

export function isTouchSwipe(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
): boolean {
  return Math.hypot(currentX - startX, currentY - startY) >= TOUCH_SWIPE_THRESHOLD
}

export const TOUCH_SWIPE_THRESHOLD = 10

export function supportsLongPress(pointerType: string): boolean {
  return pointerType === 'touch' || pointerType === 'pen'
}

export function resolveMineTapAction(
  pointerType: string,
  touchMode: 'mark' | 'open',
  keyboardClick: boolean,
): 'mark' | 'open' {
  return !keyboardClick && supportsLongPress(pointerType) && touchMode === 'mark'
    ? 'mark'
    : 'open'
}

export function isTouchSwipe(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
): boolean {
  return Math.hypot(currentX - startX, currentY - startY) >= TOUCH_SWIPE_THRESHOLD
}

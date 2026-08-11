import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

let openDialogCount = 0

export function useDialogFocus<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
) {
  const dialogRef = useRef<T>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const getFocusable = () => {
    const dialog = dialogRef.current
    return dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((element) => !element.hidden && element.offsetParent !== null)
      : []
  }

  const handleDialogKeyDown = (event: ReactKeyboardEvent<T>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') {
      return
    }

    const candidates = getFocusable()
    const dialog = dialogRef.current
    if (candidates.length === 0) {
      event.preventDefault()
      dialog?.focus()
      return
    }

    const first = candidates[0]
    const last = candidates[candidates.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const appShell = document.querySelector<HTMLElement>('.app-shell')
    openDialogCount += 1
    if (appShell) {
      appShell.inert = true
    }

    const focusable = getFocusable()
    ;(focusable[0] ?? dialog).focus()
    return () => {
      openDialogCount = Math.max(0, openDialogCount - 1)
      if (appShell && openDialogCount === 0) {
        appShell.inert = false
      }
      restoreFocusRef.current?.focus()
      restoreFocusRef.current = null
    }
  }, [open])

  return { dialogRef, handleDialogKeyDown }
}

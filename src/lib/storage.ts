import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export function useStoredState<T>(
  key: string,
  createInitialValue: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : createInitialValue()
    } catch {
      return createInitialValue()
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
  }, [key, value])

  return [value, setValue]
}

export function formatElapsedTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
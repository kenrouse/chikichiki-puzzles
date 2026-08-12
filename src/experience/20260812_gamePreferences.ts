export const MINE_GUESS_FREE_PREFERENCE_KEY =
  'chikichiki:minesweeper:guess-free:v1'

export function resolveMineGuessFreePreference(
  storedPreference: unknown,
  storedGenerationMode: unknown,
): boolean {
  if (typeof storedPreference === 'boolean') {
    return storedPreference
  }
  if (storedGenerationMode === 'classic') {
    return false
  }
  return true
}

export function readMineGuessFreePreference(): boolean {
  let storedPreference: unknown
  let storedGenerationMode: unknown
  try {
    const rawPreference = window.localStorage.getItem(
      MINE_GUESS_FREE_PREFERENCE_KEY,
    )
    storedPreference = rawPreference === null
      ? undefined
      : JSON.parse(rawPreference)
  } catch {
    storedPreference = undefined
  }
  try {
    const rawSession = window.localStorage.getItem('chikichiki:minesweeper:v4')
    storedGenerationMode = rawSession === null
      ? undefined
      : (JSON.parse(rawSession) as {
        board?: { generationMode?: unknown }
      }).board?.generationMode
  } catch {
    storedGenerationMode = undefined
  }
  return resolveMineGuessFreePreference(
    storedPreference,
    storedGenerationMode,
  )
}
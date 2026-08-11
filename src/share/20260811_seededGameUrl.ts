export type ShareableGameId = 'sudoku' | 'minesweeper' | 'shisen'

export interface SharedGameParameters {
  difficulty: string | null
  firstMove: number | null
  game: ShareableGameId
  seed: number
}

function parseOptionalUint32(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null
  }
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= 0xffffffff
    ? parsed
    : null
}

export function parseSharedGameHash(hash: string): SharedGameParameters | null {
  const normalized = hash.replace(/^#\/?/, '')
  const [path, query = ''] = normalized.split('?', 2)
  if (path !== 'sudoku' && path !== 'minesweeper' && path !== 'shisen') {
    return null
  }
  const parameters = new URLSearchParams(query)
  const seedText = parameters.get('seed')
  if (!seedText || !/^\d+$/.test(seedText)) {
    return null
  }
  const seed = Number(seedText)
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) {
    return null
  }
  return {
    difficulty: parameters.get('difficulty'),
    firstMove: parseOptionalUint32(parameters.get('first')),
    game: path,
    seed: seed >>> 0,
  }
}

export function readSharedGameParameters(
  game: ShareableGameId,
): SharedGameParameters | null {
  const parsed = parseSharedGameHash(window.location.hash)
  return parsed?.game === game ? parsed : null
}

export function buildSeededGameUrl(
  baseUrl: string,
  game: ShareableGameId,
  seed: number,
  difficulty: string,
  extras: Record<string, number | string | null> = {},
): string {
  const url = new URL(baseUrl)
  url.search = ''
  const parameters = new URLSearchParams({
    difficulty,
    seed: String(seed >>> 0),
  })
  for (const [key, value] of Object.entries(extras)) {
    if (value !== null) {
      parameters.set(key, String(value))
    }
  }
  url.hash = `/${game}?${parameters.toString()}`
  return url.toString()
}
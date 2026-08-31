import type { SudokuPuzzle } from '../engine'
import {
  CHALLENGES as CHALLENGES_20260829_V1,
  CATALOG_META as CATALOG_META_20260829_V1,
} from './20260829-v1'
import type {
  SudokuChallengeCatalogMeta,
  SudokuChallengeEntry,
} from './types'

export type { SudokuChallengeCatalogMeta, SudokuChallengeEntry } from './types'

export const SUDOKU_CHALLENGE_CATALOGS = [
  {
    entries: CHALLENGES_20260829_V1,
    meta: CATALOG_META_20260829_V1,
  },
] as const

export const SUDOKU_CHALLENGES: readonly SudokuChallengeEntry[] =
  SUDOKU_CHALLENGE_CATALOGS
    .flatMap((catalog) => catalog.entries)
    .sort((first, second) =>
      second.analysis.rating - first.analysis.rating || first.id.localeCompare(second.id),
    )

export const SUDOKU_CHALLENGE_CATALOG_META: SudokuChallengeCatalogMeta = {
  candidateCount: SUDOKU_CHALLENGE_CATALOGS.reduce(
    (total, catalog) => total + catalog.meta.candidateCount,
    0,
  ),
  catalogId: CATALOG_META_20260829_V1.catalogId,
  difficulty: 'expert',
  threshold: Math.min(
    ...SUDOKU_CHALLENGE_CATALOGS.map((catalog) => catalog.meta.threshold),
  ),
  variant: 'classic',
}

const CHALLENGES_BY_ID = new Map(
  SUDOKU_CHALLENGES.map((entry) => [entry.id, entry]),
)
const LEGACY_CHALLENGES_BY_SEED = new Map(
  CHALLENGES_20260829_V1.map((entry) => [entry.seed, entry]),
)

export function getSudokuChallengeById(
  challengeId: string,
): SudokuChallengeEntry | null {
  return CHALLENGES_BY_ID.get(challengeId) ?? null
}

export function getLegacySudokuChallengeBySeed(
  seed: number,
): SudokuChallengeEntry | null {
  return LEGACY_CHALLENGES_BY_SEED.get(seed) ?? null
}

function digitsFromSnapshot(snapshot: string): number[] {
  return [...snapshot].map(Number)
}

export function createSudokuChallengePuzzle(
  entry: SudokuChallengeEntry,
): SudokuPuzzle {
  return {
    analysis: {
      ...entry.analysis,
      techniques: { ...entry.analysis.techniques },
    },
    challengeId: entry.id,
    difficulty: 'expert',
    puzzle: digitsFromSnapshot(entry.puzzle),
    seed: entry.seed,
    solution: digitsFromSnapshot(entry.solution),
    variant: 'classic',
  }
}

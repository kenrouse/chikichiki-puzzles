import type { SudokuAnalysis } from '../engine'

export interface SudokuChallengeEntry {
  analysis: SudokuAnalysis
  id: string
  puzzle: string
  seed: number
  solution: string
}

export interface SudokuChallengeCatalogMeta {
  candidateCount: number
  catalogId: string
  difficulty: 'expert'
  threshold: number
  variant: 'classic'
}

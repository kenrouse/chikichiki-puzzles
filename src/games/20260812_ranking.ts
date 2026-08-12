export type PerformanceGrade = 'A' | 'B' | 'C' | 'S'

export interface PenaltyRankResult {
  grade: PerformanceGrade
  metric: number
  nextGrade: PerformanceGrade | null
  nextMaximum: number | null
  reductionNeeded: number
}

export interface ScoreRankResult {
  efficiency: number
  grade: PerformanceGrade
  nextGrade: PerformanceGrade | null
  nextMinimum: number | null
  pointsNeeded: number
}

function penaltyRank(
  metric: number,
  thresholds: { a: number; b: number; s: number },
): PenaltyRankResult {
  const normalized = Math.max(0, Math.floor(metric))
  if (normalized < thresholds.s) {
    return { grade: 'S', metric: normalized, nextGrade: null, nextMaximum: null, reductionNeeded: 0 }
  }
  if (normalized < thresholds.a) {
    const nextMaximum = thresholds.s - 1
    return { grade: 'A', metric: normalized, nextGrade: 'S', nextMaximum, reductionNeeded: normalized - nextMaximum }
  }
  if (normalized < thresholds.b) {
    const nextMaximum = thresholds.a - 1
    return { grade: 'B', metric: normalized, nextGrade: 'A', nextMaximum, reductionNeeded: normalized - nextMaximum }
  }
  const nextMaximum = thresholds.b - 1
  return { grade: 'C', metric: normalized, nextGrade: 'B', nextMaximum, reductionNeeded: normalized - nextMaximum }
}

export function calculateSudokuRank(
  elapsedSeconds: number,
  hintsUsed: number,
  mistakes: number,
): PenaltyRankResult & { nonTimePenalty: number; targetSecondsWithSameActions: number | null } {
  const nonTimePenalty = Math.max(0, hintsUsed) * 90 + Math.max(0, mistakes) * 35
  const result = penaltyRank(
    Math.max(0, elapsedSeconds) + nonTimePenalty,
    { a: 600, b: 1000, s: 300 },
  )
  return {
    ...result,
    nonTimePenalty,
    targetSecondsWithSameActions: result.nextMaximum === null
      ? null
      : result.nextMaximum - nonTimePenalty,
  }
}

export function calculateShisenRank(
  elapsedSeconds: number,
  shuffleCount: number,
): PenaltyRankResult & { nonTimePenalty: number; targetSecondsWithSameActions: number | null } {
  const nonTimePenalty = Math.max(0, shuffleCount) * 120
  const result = penaltyRank(
    Math.max(0, elapsedSeconds) + nonTimePenalty,
    { a: 720, b: 1200, s: 360 },
  )
  return {
    ...result,
    nonTimePenalty,
    targetSecondsWithSameActions: result.nextMaximum === null
      ? null
      : result.nextMaximum - nonTimePenalty,
  }
}

export function calculateMinesweeperRank(
  score: number,
  safeCells: number,
): ScoreRankResult {
  const denominator = Math.max(1, safeCells * 10)
  const normalizedScore = Math.max(0, score)
  const efficiency = normalizedScore / denominator
  let grade: PerformanceGrade
  let nextGrade: PerformanceGrade | null
  let nextEfficiency: number | null
  if (efficiency >= 3.8) {
    grade = 'S'
    nextGrade = null
    nextEfficiency = null
  } else if (efficiency >= 2.7) {
    grade = 'A'
    nextGrade = 'S'
    nextEfficiency = 3.8
  } else if (efficiency >= 1.7) {
    grade = 'B'
    nextGrade = 'A'
    nextEfficiency = 2.7
  } else {
    grade = 'C'
    nextGrade = 'B'
    nextEfficiency = 1.7
  }
  const nextMinimum = nextEfficiency === null
    ? null
    : Math.ceil(nextEfficiency * denominator)
  return {
    efficiency,
    grade,
    nextGrade,
    nextMinimum,
    pointsNeeded: nextMinimum === null ? 0 : Math.max(0, nextMinimum - normalizedScore),
  }
}
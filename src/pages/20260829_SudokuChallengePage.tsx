import { ArrowLeft, ArrowRight, Flame, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppExperience } from '../experience/20260811_AppExperience'
import {
  SUDOKU_CHALLENGES,
  SUDOKU_CHALLENGE_CATALOG_META,
  type SudokuChallengeEntry,
} from '../games/sudoku/20260829_challenges'
import type { HumanTechnique } from '../games/sudoku/humanSolver'
import { getLocalizedCopy } from '../i18n/20260812_i18n'

const PAGE_SIZE = 24

type RatingFilter = 'all' | '1000' | '1500' | '2000'
const RATING_FILTERS: RatingFilter[] = ['all', '1000', '1500', '2000']

const CHALLENGE_COPY = {
  ja: {
    back: 'ゲーム選択へ戻る',
    candidateCount: '調査候補',
    challengeCount: '挑戦状',
    description: 'エキスパート候補を大量生成し、RATING 1,000以上だけを残した高難度問題集です。最も高い問題から順に並んでいます。',
    filters: {
      '1000': '1,000～1,499',
      '1500': '1,500～1,999',
      '2000': '2,000以上',
      all: 'すべて',
    },
    filterTitle: 'RATINGで絞り込む',
    found: (count: number) => `${count}問`,
    highestRating: '最高RATING',
    loadMore: 'さらに表示',
    play: 'この挑戦を開始',
    puzzleLabel: (rank: number, rating: number) => `挑戦状 ${rank}、RATING ${rating}を開始`,
    note: 'すべてクラシック数独の一意解です。RATINGには論理手筋の後に残った探索量も含まれるため、「探索」は内部評価であり、推測だけを推奨する表示ではありません。',
    seed: 'SEED',
    technique: '最難手筋',
    techniques: {
      'hidden-pair': '隠れペア',
      'hidden-single': '隠れシングル',
      'locked-candidate': 'ロック候補',
      'naked-pair': '裸のペア',
      'naked-single': '裸のシングル',
      'none': 'なし',
      'search': '探索',
      'simple-chain': '単純連鎖',
      'x-wing': 'X-Wing',
      'xy-wing': 'XY-Wing',
    },
    title: '数独からの挑戦状',
  },
  en: {
    back: 'Back to game selection',
    candidateCount: 'Candidates scanned',
    challengeCount: 'Challenges',
    description: 'A collection produced by generating Expert candidates in bulk and keeping only puzzles rated 1,000 or higher, ordered from the highest rating.',
    filters: {
      '1000': '1,000–1,499',
      '1500': '1,500–1,999',
      '2000': '2,000+',
      all: 'All',
    },
    filterTitle: 'Filter by RATING',
    found: (count: number) => `${count} puzzles`,
    highestRating: 'Highest RATING',
    loadMore: 'Show more',
    play: 'Start this challenge',
    puzzleLabel: (rank: number, rating: number) => `Start challenge ${rank}, rated ${rating}`,
    note: 'Every entry is a uniquely solvable Classic Sudoku. RATING includes the search effort left after the supported logical techniques, so “Search” is an internal measurement rather than advice to rely on guessing.',
    seed: 'SEED',
    technique: 'Hardest technique',
    techniques: {
      'hidden-pair': 'Hidden pair',
      'hidden-single': 'Hidden single',
      'locked-candidate': 'Locked candidate',
      'naked-pair': 'Naked pair',
      'naked-single': 'Naked single',
      'none': 'None',
      'search': 'Search',
      'simple-chain': 'Simple chain',
      'x-wing': 'X-Wing',
      'xy-wing': 'XY-Wing',
    },
    title: 'Sudoku Challenge Vault',
  },
} as const

function matchesFilter(entry: SudokuChallengeEntry, filter: RatingFilter): boolean {
  if (filter === '1000') return entry.rating < 1500
  if (filter === '1500') return entry.rating >= 1500 && entry.rating < 2000
  if (filter === '2000') return entry.rating >= 2000
  return true
}

function challengeTier(rating: number): string {
  if (rating >= 2000) return 'extreme'
  if (rating >= 1500) return 'severe'
  return 'high'
}

export function SudokuChallengePage({
  onBack,
  onPlay,
}: {
  onBack: () => void
  onPlay: (seed: number) => void
}) {
  const { playEffect, preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, CHALLENGE_COPY)
  const numberFormat = useMemo(
    () => new Intl.NumberFormat(preferences.language === 'ja' ? 'ja-JP' : 'en-US'),
    [preferences.language],
  )
  const [filter, setFilter] = useState<RatingFilter>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const filtered = SUDOKU_CHALLENGES.filter((entry) => matchesFilter(entry, filter))
  const visible = filtered.slice(0, visibleCount)
  const techniqueLabels = copy.techniques as Record<
    HumanTechnique | 'none' | 'search',
    string
  >

  function selectFilter(nextFilter: RatingFilter): void {
    setFilter(nextFilter)
    setVisibleCount(PAGE_SIZE)
    playEffect('select')
  }

  function startChallenge(entry: SudokuChallengeEntry): void {
    playEffect('select')
    onPlay(entry.seed)
  }

  return (
    <section className="challenge-page" aria-labelledby="challenge-title">
      <button className="challenge-back" onClick={onBack} type="button">
        <ArrowLeft aria-hidden="true" /> {copy.back}
      </button>

      <header className="challenge-hero">
        <div className="challenge-hero-copy">
          <p className="eyebrow">10,000 EXPERT CANDIDATES / RATING 1,000+</p>
          <h1 id="challenge-title">{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <div className="challenge-emblem" aria-hidden="true">
          <Trophy />
          <Flame />
        </div>
      </header>

      <div className="challenge-summary" aria-label={copy.title}>
        <span>
          <strong>{numberFormat.format(SUDOKU_CHALLENGE_CATALOG_META.candidateCount)}</strong>
          {copy.candidateCount}
        </span>
        <span>
          <strong>{numberFormat.format(SUDOKU_CHALLENGES.length)}</strong>
          {copy.challengeCount}
        </span>
        <span>
          <strong>{numberFormat.format(SUDOKU_CHALLENGES[0]?.rating ?? 0)}</strong>
          {copy.highestRating}
        </span>
      </div>

      <aside className="challenge-note">
        <Flame aria-hidden="true" />
        <p>{copy.note}</p>
      </aside>

      <div className="challenge-toolbar">
        <div>
          <strong>{copy.filterTitle}</strong>
          <span>{copy.found(filtered.length)}</span>
        </div>
        <div className="challenge-filters">
          {RATING_FILTERS.map((value) => (
            <button
              aria-pressed={filter === value}
              className={filter === value ? 'active' : ''}
              key={value}
              onClick={() => selectFilter(value)}
              type="button"
            >
              {copy.filters[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="challenge-grid">
        {visible.map((entry) => {
          const rank = SUDOKU_CHALLENGES.indexOf(entry) + 1
          return (
            <button
              aria-label={copy.puzzleLabel(rank, entry.rating)}
              className={`challenge-card ${challengeTier(entry.rating)}`}
              key={entry.seed}
              onClick={() => startChallenge(entry)}
              type="button"
            >
              <span className="challenge-card-heading">
                <small>CHALLENGE #{String(rank).padStart(3, '0')}</small>
                <strong>{numberFormat.format(entry.rating)} <em>RATING</em></strong>
              </span>

              <span className="challenge-preview" aria-hidden="true">
                {[...entry.puzzle].map((value, index) => (
                  <i
                    className={`${index % 9 === 2 || index % 9 === 5 ? 'box-right' : ''} ${Math.floor(index / 9) === 2 || Math.floor(index / 9) === 5 ? 'box-bottom' : ''}`}
                    key={index}
                  >
                    {value === '0' ? '' : value}
                  </i>
                ))}
              </span>

              <span className="challenge-card-details">
                <span>
                  <small>{copy.technique}</small>
                  <strong>{techniqueLabels[entry.hardestTechnique]} ×{entry.techniqueCount}</strong>
                </span>
                <span>
                  <small>CLUE / BRANCH</small>
                  <strong>{entry.clueCount} / {entry.guessBranches}</strong>
                </span>
                <span>
                  <small>{copy.seed}</small>
                  <strong>{entry.seed}</strong>
                </span>
              </span>

              <span className="challenge-card-action">
                {copy.play} <ArrowRight aria-hidden="true" />
              </span>
            </button>
          )
        })}
      </div>

      {visible.length < filtered.length ? (
        <div className="challenge-more">
          <button
            className="command-button"
            onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            type="button"
          >
            {copy.loadMore} ({visible.length}/{filtered.length})
          </button>
        </div>
      ) : null}
    </section>
  )
}

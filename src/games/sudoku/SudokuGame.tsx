import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  Eraser,
  Eye,
  EyeOff,
  Highlighter,
  Lightbulb,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'
import { GameHowTo } from '../../components/20260812_GameHowTo'
import { getLocalizedCopy, type AppLanguage } from '../../i18n/20260812_i18n'
import {
  ConfirmationModal,
  CountdownOverlay,
  ResultReopenButton,
  ResultModal,
  useAppExperience,
  useGameCountdown,
} from '../../experience/20260811_AppExperience'
import { formatElapsedTime, useStoredState } from '../../lib/storage'
import { calculateSudokuRank } from '../20260812_ranking'
import { GameShareButton } from '../../share/20260811_GameShare'
import { readSharedGameParameters } from '../../share/20260811_seededGameUrl'
import {
  generateSudoku,
  getCageConflicts,
  getCandidates,
  getConflicts,
  isSudokuSolved,
  type SudokuDifficulty,
  type SudokuPuzzle,
  type SudokuVariant,
} from './engine'
import type { HumanTechnique } from './humanSolver'
import type { KillerCage } from './killer'
import { getSudokuPreviewAccess } from './20260812_previewAccess'
import {
  createSudokuChallengePuzzle,
  getLegacySudokuChallengeBySeed,
  getSudokuChallengeById,
} from './challenges'

interface SudokuHistoryEntry {
  notes: number[]
  values: number[]
}

interface SudokuSession {
  elapsedSeconds: number
  hintsUsed: number
  mistakes: number
  notes: number[]
  puzzle: SudokuPuzzle
  status: 'playing' | 'won'
  values: number[]
}

interface PendingSudokuSetup {
  difficulty: SudokuDifficulty
  variant: SudokuVariant
}

interface KillerCellInfo {
  bottom: boolean
  left: boolean
  right: boolean
  sum: number | null
  top: boolean
}

const SUDOKU_COPY = {
  ja: {
    generateAndStart: (difficulty: string, variant: string) => `${difficulty}・${variant}を生成して開始`,
    board: '数独盤面',
    checkMessage: '赤い数字が重複しています。',
    cageTechnique: 'ケージ合計',
    clearMessage: '正解です。やったね！',
    confirmMessage: '選択した設定で新しい問題を生成し、3秒カウントダウン後に開始します。現在の進行状況は終了し、この操作は元に戻せません。',
    confirmTitle: '問題設定を変更しますか？',
    correctTitle: '正解です',
    difficulties: { beginner: '入門', easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい', expert: 'エキスパート' },
    difficulty: '難易度',
    entryConfirmed: '確定',
    entryLarge: '大きい数字',
    entryMethod: '左クリックの入力方法',
    entryNote: 'メモ',
    entryPrompt: '左クリックの入力',
    entrySmall: '小さい数字',
    erase: '数字を消す',
    eraseTooltip: '選択中のマスから数字を消す',
    gameInfo: 'ゲーム情報',
    guideLabel: (enabled: boolean) => `置ける数字のガイド ${enabled ? 'オン' : 'オフ'}`,
    guideMessage: '選択中の空欄へ置ける数字を表示しています。',
    guideTooltip: '選択中の空欄へ置ける数字を表示する',
    highlightLabel: (enabled: boolean) => `同じ数字のハイライト ${enabled ? 'オン' : 'オフ'}`,
    highlightTooltip: '選択中と同じ数字を盤面上で強調表示する',
    hint: 'ヒント',
    hintTooltip: '選択中の空欄に正解を1つ入力する',
    input: '数字入力',
    inputDigit: (digit: number, noteMode: boolean) => `${digit}を${noteMode ? '小さいメモ' : '大きい確定値'}として入力。右クリックでは常にメモ入力`,
    keyboardMessage: '数字キーと矢印キーにも対応しています。',
    metricCage: 'CAGE',
    metricClue: 'CLUE',
    eliminations: '候補削除',
    newPuzzle: '新しい問題',
    nextPuzzle: '次の問題',
    note: 'メモ',
    noteMessage: '候補の数字を複数記録できます。',
    preview: 'プレビュー',
    previewActive: (variant: string) => `${variant}のプレビュー問題をプレイ中`,
    previewDisabledMessage: 'この問題は継続できます。次の問題はクラシックになります。',
    rankActionsMessage: (grade: string, maximum: number, reduction: number, excess: number) => `${grade}ランクは合計ペナルティ${maximum}秒以下です。次回は${reduction}秒分改善してください。現在と同じヒント・ミス数では、それだけで上限を${excess}秒超えるため、回数も減らす必要があります。`,
    rankHighestHeading: '最高ランク S',
    rankHighestMessage: 'Sランク達成です。合計ペナルティを299秒以下に抑えました。',
    rankNextHeading: (grade: string) => `次は${grade}ランク`,
    rankNextMessage: (grade: string, maximum: number, reduction: number, time: string) => `${grade}ランクは合計ペナルティ${maximum}秒以下です。次回は${reduction}秒分改善し、同じヒント・ミス数なら${time}以内のクリアが目安です。`,
    returnToClassic: 'クラシックに戻る',
    sharePuzzle: '同じ問題を共有',
    subtitle: '一意解の盤面を完成しました。',
    title: 'おーとまちっく数独',
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
    undo: '元に戻す',
    undoTooltip: '直前の数字またはメモを元に戻す',
    variant: '問題タイプ',
    variantDescriptions: {
      classic: '標準ルール',
      killer: '標準ルール＋ケージ合計',
      symmetric: '標準ルール・180度対称配置',
    },
    variants: { classic: 'クラシック', killer: 'キラー', symmetric: '対称' },
  },
  en: {
    generateAndStart: (difficulty: string, variant: string) => `Generate and start ${difficulty} · ${variant}`,
    board: 'Sudoku board',
    checkMessage: 'The red numbers are duplicated.',
    cageTechnique: 'Cage sums',
    clearMessage: 'Correct. Well done!',
    confirmMessage: 'Generate a new puzzle with these settings and start it after a three-second countdown. Your current progress will end and this cannot be undone.',
    confirmTitle: 'Change puzzle settings?',
    correctTitle: 'Puzzle solved',
    difficulties: { beginner: 'Beginner', easy: 'Easy', normal: 'Normal', hard: 'Hard', expert: 'Expert' },
    difficulty: 'Difficulty',
    entryConfirmed: 'Answer',
    entryLarge: 'Large number',
    entryMethod: 'Left-click input mode',
    entryNote: 'Notes',
    entryPrompt: 'Left-click input',
    entrySmall: 'Small candidates',
    erase: 'Erase number',
    eraseTooltip: 'Clear the selected cell',
    gameInfo: 'Game information',
    guideLabel: (enabled: boolean) => `Candidate guide ${enabled ? 'on' : 'off'}`,
    guideMessage: 'Possible numbers for the selected empty cell are shown.',
    guideTooltip: 'Show possible numbers for the selected empty cell',
    highlightLabel: (enabled: boolean) => `Matching-number highlight ${enabled ? 'on' : 'off'}`,
    highlightTooltip: 'Highlight matching numbers on the board',
    hint: 'Hint',
    hintTooltip: 'Enter one correct answer in the selected empty cell',
    input: 'Number input',
    inputDigit: (digit: number, noteMode: boolean) => `Enter ${digit} as ${noteMode ? 'a small note' : 'a large answer'}. Right-click always enters a note.`,
    keyboardMessage: 'Number keys and arrow keys are also supported.',
    metricCage: 'CAGE',
    metricClue: 'CLUE',
    eliminations: 'Candidate eliminations',
    newPuzzle: 'New puzzle',
    nextPuzzle: 'Next puzzle',
    note: 'Notes',
    noteMessage: 'You can record multiple candidate numbers.',
    preview: 'Preview',
    previewActive: (variant: string) => `Playing a ${variant} preview puzzle`,
    previewDisabledMessage: 'You can finish this puzzle. The next puzzle will use Classic.',
    rankActionsMessage: (grade: string, maximum: number, reduction: number, excess: number) => `Grade ${grade} requires a total penalty of ${maximum} seconds or less. Improve by ${reduction} seconds next time. The same hint and mistake penalties alone exceed the target by ${excess} seconds, so reduce those actions too.`,
    rankHighestHeading: 'Top grade S',
    rankHighestMessage: 'You earned grade S by keeping the total penalty at 299 seconds or less.',
    rankNextHeading: (grade: string) => `Next: grade ${grade}`,
    rankNextMessage: (grade: string, maximum: number, reduction: number, time: string) => `Grade ${grade} requires a total penalty of ${maximum} seconds or less. Improve by ${reduction} seconds next time; with the same hints and mistakes, aim to finish within ${time}.`,
    returnToClassic: 'Return to Classic',
    sharePuzzle: 'Share this puzzle',
    subtitle: 'You completed a uniquely solvable puzzle.',
    title: 'Automatic Sudoku',
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
    undo: 'Undo',
    undoTooltip: 'Undo the previous answer or note',
    variant: 'Puzzle type',
    variantDescriptions: {
      classic: 'Standard rules',
      killer: 'Standard rules + cage sums',
      symmetric: 'Standard rules, 180° clue symmetry',
    },
    variants: { classic: 'Classic', killer: 'Killer', symmetric: 'Symmetric' },
  },
} as const

function nextSeed(): number {
  return Date.now() >>> 0
}

function isSudokuDifficulty(value: string | null): value is SudokuDifficulty {
  return value === 'beginner' || value === 'easy' || value === 'normal' || value === 'hard' || value === 'expert'
}

function isSudokuVariant(value: string | null): value is SudokuVariant {
  return value === 'classic' || value === 'killer' || value === 'symmetric'
}

function createSession(
  difficulty: SudokuDifficulty,
  seed = nextSeed(),
  variant: SudokuVariant = 'classic',
): SudokuSession {
  const puzzle = generateSudoku(difficulty, seed, variant)
  return createSessionFromPuzzle(puzzle)
}

function createSessionFromPuzzle(puzzle: SudokuPuzzle): SudokuSession {
  return {
    elapsedSeconds: 0,
    hintsUsed: 0,
    mistakes: 0,
    notes: Array<number>(81).fill(0),
    puzzle,
    status: 'playing',
    values: [...puzzle.puzzle],
  }
}

function createInitialSession(): SudokuSession {
  const shared = readSharedGameParameters('sudoku')
  const requestedDifficulty = shared?.difficulty ?? null
  const difficulty: SudokuDifficulty = isSudokuDifficulty(requestedDifficulty)
    ? requestedDifficulty
    : 'normal'
  const requestedVariant = shared?.variant ?? null
  const variant: SudokuVariant = isSudokuVariant(requestedVariant)
    ? requestedVariant
    : 'classic'
  const challenge = shared?.challengeId
    ? getSudokuChallengeById(shared.challengeId)
    : difficulty === 'expert' && variant === 'classic' && shared
      ? getLegacySudokuChallengeBySeed(shared.seed)
      : null
  if (challenge) {
    return createSessionFromPuzzle(createSudokuChallengePuzzle(challenge))
  }
  return createSession(difficulty, shared?.seed, variant)
}

function createKillerCellInfo(cages: readonly KillerCage[]): Map<number, KillerCellInfo> {
  const result = new Map<number, KillerCellInfo>()
  for (const cage of cages) {
    const cells = new Set(cage.cells)
    const anchor = Math.min(...cage.cells)
    for (const cell of cage.cells) {
      const row = Math.floor(cell / 9)
      const column = cell % 9
      result.set(cell, {
        bottom: row === 8 || !cells.has(cell + 9),
        left: column === 0 || !cells.has(cell - 1),
        right: column === 8 || !cells.has(cell + 1),
        sum: cell === anchor ? cage.sum : null,
        top: row === 0 || !cells.has(cell - 9),
      })
    }
  }
  return result
}

function isPeer(first: number, second: number): boolean {
  const firstRow = Math.floor(first / 9)
  const firstColumn = first % 9
  const secondRow = Math.floor(second / 9)
  const secondColumn = second % 9
  return (
    firstRow === secondRow ||
    firstColumn === secondColumn ||
    (Math.floor(firstRow / 3) === Math.floor(secondRow / 3) &&
      Math.floor(firstColumn / 3) === Math.floor(secondColumn / 3))
  )
}

function describeSudokuCell(
  index: number,
  value: number,
  notes: number,
  language: AppLanguage,
): string {
  const row = Math.floor(index / 9) + 1
  const column = (index % 9) + 1
  const location = language === 'ja' ? `行${row} 列${column}` : `Row ${row}, column ${column}`
  if (value !== 0) {
    return language === 'ja' ? `${location} 数字${value}` : `${location}, number ${value}`
  }
  const noteDigits = Array.from({ length: 9 }, (_, offset) => offset + 1)
    .filter((digit) => (notes & (1 << digit)) !== 0)
  return noteDigits.length > 0
    ? language === 'ja' ? `${location} メモ ${noteDigits.join('、')}` : `${location}, notes ${noteDigits.join(', ')}`
    : language === 'ja' ? `${location} 空欄` : `${location}, empty`
}

export function SudokuGame() {
  const isSharedGame = readSharedGameParameters('sudoku') !== null
  const [session, setSession] = useStoredState<SudokuSession>(
    'chikichiki:sudoku:v2',
    createInitialSession,
    isSharedGame,
  )
  const [selected, setSelected] = useState(() => {
    const firstEmpty = session.puzzle.puzzle.findIndex((value) => value === 0)
    return firstEmpty >= 0 ? firstEmpty : 0
  })
  const selectedRef = useRef(selected)
  const boardFocusRef = useRef<HTMLDivElement>(null)
  const [noteMode, setNoteMode] = useState(false)
  const [placementGuide, setPlacementGuide] = useState(false)
  const [sameNumberHighlight, setSameNumberHighlight] = useState(false)
  const [pendingSetup, setPendingSetup] = useState<PendingSudokuSetup | null>(null)
  const [history, setHistory] = useState<SudokuHistoryEntry[]>([])
  const [pulseCell, setPulseCell] = useState<number | null>(null)
  const [resultOpen, setResultOpen] = useState(session.status === 'won')
  const { playEffect, preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, SUDOKU_COPY)
  const {
    beginCountdown,
    countdown,
    isCountingDown,
  } = useGameCountdown(
    session.elapsedSeconds === 0 && session.status === 'playing',
  )
  const currentVariant = session.puzzle.variant ?? 'classic'
  const cages = session.puzzle.cages ?? []
  const cageCellInfo = createKillerCellInfo(cages)
  const conflicts = new Set([
    ...getConflicts(session.values),
    ...getCageConflicts(session.values, cages),
  ])
  const hardestTechnique = (session.puzzle.analysis.hardestTechnique ?? 'none') as
    HumanTechnique | 'none' | 'search'
  const hardestTechniqueCount = currentVariant === 'killer'
    ? cages.length
    : hardestTechnique === 'search'
      ? session.puzzle.analysis.guessBranches
      : hardestTechnique === 'none'
        ? 0
        : session.puzzle.analysis.techniques?.[hardestTechnique] ?? 0
  const techniqueLabel = currentVariant === 'killer'
    ? copy.cageTechnique
    : copy.techniques[hardestTechnique]
  const previewAccess = getSudokuPreviewAccess(
    currentVariant,
    preferences.sudokuPreviewVariantsEnabled,
  )
  const rank = calculateSudokuRank(
    session.elapsedSeconds,
    session.hintsUsed,
    session.mistakes,
  )
  const rankProgress = rank.nextGrade === null || rank.nextMaximum === null
    ? { heading: copy.rankHighestHeading, message: copy.rankHighestMessage }
    : rank.targetSecondsWithSameActions !== null && rank.targetSecondsWithSameActions >= 0
      ? {
        heading: copy.rankNextHeading(rank.nextGrade),
        message: copy.rankNextMessage(
          rank.nextGrade,
          rank.nextMaximum,
          rank.reductionNeeded,
          formatElapsedTime(rank.targetSecondsWithSameActions),
        ),
      }
      : {
        heading: copy.rankNextHeading(rank.nextGrade),
        message: copy.rankActionsMessage(
          rank.nextGrade,
          rank.nextMaximum,
          rank.reductionNeeded,
          Math.abs(rank.targetSecondsWithSameActions ?? 0),
        ),
      }
  const selectedValue = session.values[selected]

  function beginGame(): void {
    boardFocusRef.current?.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    })
    beginCountdown()
  }

  function selectCell(index: number): void {
    selectedRef.current = index
    setSelected(index)
  }

  useEffect(() => {
    if (session.status !== 'playing' || isCountingDown) {
      return
    }
    const timer = window.setInterval(() => {
      setSession((current) => ({
        ...current,
        elapsedSeconds: current.elapsedSeconds + 1,
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isCountingDown, session.status, setSession])

  function startNewGame(
    difficulty: SudokuDifficulty,
    variant: SudokuVariant = currentVariant,
  ): void {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#/sudoku`,
    )
    const next = createSession(difficulty, undefined, variant)
    setSession(next)
    setHistory([])
    setNoteMode(false)
    setPlacementGuide(false)
    setSameNumberHighlight(false)
    setResultOpen(false)
    const firstEmpty = next.puzzle.puzzle.findIndex((value) => value === 0)
    selectCell(firstEmpty >= 0 ? firstEmpty : 0)
    beginGame()
  }

  function requestDifficultyChange(difficulty: SudokuDifficulty): void {
    if (difficulty !== session.puzzle.difficulty) {
      setPendingSetup({ difficulty, variant: previewAccess.nextPuzzleVariant })
    }
  }

  function requestVariantChange(variant: SudokuVariant): void {
    if (variant !== currentVariant) {
      setPendingSetup({ difficulty: session.puzzle.difficulty, variant })
    }
  }

  function rememberCurrentState(): void {
    setHistory((current) => [
      ...current.slice(-79),
      { notes: [...session.notes], values: [...session.values] },
    ])
  }

  function enterDigit(digit: number, forceNote = false): void {
    const targetIndex = selectedRef.current
    if (
      session.status !== 'playing' ||
      session.puzzle.puzzle[targetIndex] !== 0 ||
      isCountingDown
    ) {
      return
    }
    rememberCurrentState()
    const isNoteEntry = forceNote || noteMode
    const incorrect =
      !isNoteEntry && digit !== 0 && digit !== session.puzzle.solution[targetIndex]
    const previewValues = [...session.values]
    if (!isNoteEntry) {
      previewValues[targetIndex] = digit
    }
    const willClear = !isNoteEntry && isSudokuSolved(previewValues, session.puzzle.solution)
    if (willClear) {
      setResultOpen(true)
      playEffect('clear')
    } else {
      playEffect(
        isNoteEntry
          ? 'select'
          : digit === 0
            ? 'undo'
            : incorrect
              ? 'error'
              : 'place',
      )
    }
    setPulseCell(targetIndex)
    window.setTimeout(() => setPulseCell(null), 340)
    setSession((current) => {
      const values = [...current.values]
      const notes = [...current.notes]
      if (isNoteEntry && digit !== 0) {
        values[targetIndex] = 0
        notes[targetIndex] ^= 1 << digit
      } else {
        values[targetIndex] = digit
        notes[targetIndex] = 0
      }
      return {
        ...current,
        mistakes: current.mistakes + (incorrect ? 1 : 0),
        notes,
        status: isSudokuSolved(values, current.puzzle.solution)
          ? 'won'
          : 'playing',
        values,
      }
    })
  }

  function undo(): void {
    const previous = history.at(-1)
    if (!previous) {
      return
    }
    setSession((current) => ({
      ...current,
      notes: previous.notes,
      status: 'playing',
      values: previous.values,
    }))
    setHistory((current) => current.slice(0, -1))
    playEffect('undo')
  }

  function revealHint(): void {
    if (session.status !== 'playing') {
      return
    }
    const selectedIndex = selectedRef.current
    const target =
      session.puzzle.puzzle[selectedIndex] === 0 &&
      session.values[selectedIndex] !== session.puzzle.solution[selectedIndex]
        ? selectedIndex
        : session.values.findIndex(
            (value, index) =>
              session.puzzle.puzzle[index] === 0 &&
              value !== session.puzzle.solution[index],
          )
    if (target < 0) {
      return
    }
    rememberCurrentState()
    const previewValues = [...session.values]
    previewValues[target] = session.puzzle.solution[target]
    const willClear = isSudokuSolved(previewValues, session.puzzle.solution)
    if (willClear) {
      setResultOpen(true)
      playEffect('clear')
    } else {
      playEffect('hint')
    }
    selectCell(target)
    setSession((current) => {
      const values = [...current.values]
      const notes = [...current.notes]
      values[target] = current.puzzle.solution[target]
      notes[target] = 0
      return {
        ...current,
        hintsUsed: current.hintsUsed + 1,
        notes,
        status: isSudokuSolved(values, current.puzzle.solution)
          ? 'won'
          : 'playing',
        values,
      }
    })
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (isCountingDown) {
      return
    }
    const selectedIndex = selectedRef.current
    const row = Math.floor(selectedIndex / 9)
    const column = selectedIndex % 9
    let next = selectedIndex
    if (event.key === 'ArrowUp') next = Math.max(0, row - 1) * 9 + column
    if (event.key === 'ArrowDown') next = Math.min(8, row + 1) * 9 + column
    if (event.key === 'ArrowLeft') next = row * 9 + Math.max(0, column - 1)
    if (event.key === 'ArrowRight') next = row * 9 + Math.min(8, column + 1)
    if (next !== selectedIndex) {
      event.preventDefault()
      selectCell(next)
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLButtonElement>(`[data-sudoku-cell="${next}"]`)?.focus()
      })
      return
    }
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault()
      enterDigit(Number(event.key))
    } else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()
      enterDigit(0)
    } else if (event.key.toLowerCase() === 'n') {
      event.preventDefault()
      setNoteMode((current) => !current)
    }
  }

  return (
    <section className={`game-workspace sudoku-workspace ${isCountingDown ? 'game-paused' : ''}`} aria-labelledby="sudoku-title">
      <CountdownOverlay
        value={countdown}
      />
      <header className="game-heading">
        <div>
          <p className="eyebrow">2006 / 2011 REBUILD</p>
          <h1 id="sudoku-title">{copy.title}</h1>
        </div>
        <div className="game-metrics" aria-label={copy.gameInfo}>
          <span><strong>{formatElapsedTime(session.elapsedSeconds)}</strong> TIME</span>
          <span><strong>{session.hintsUsed}</strong> HINT</span>
          <span>
            <strong>{currentVariant === 'killer' ? cages.length : session.puzzle.puzzle.filter(Boolean).length}</strong>
            {currentVariant === 'killer' ? copy.metricCage : copy.metricClue}
          </span>
        </div>
      </header>

      <div className="difficulty-row" aria-label={copy.difficulty}>
        <div className="segmented-control">
          {(Object.keys(copy.difficulties) as SudokuDifficulty[]).map(
            (difficulty) => (
              <button
                aria-pressed={session.puzzle.difficulty === difficulty}
                className={session.puzzle.difficulty === difficulty ? 'active' : ''}
                key={difficulty}
                onClick={() => requestDifficultyChange(difficulty)}
                type="button"
              >
                {copy.difficulties[difficulty]}
              </button>
            ),
          )}
        </div>
        <div className="toolbar-inline">
          <GameShareButton
            difficulty={session.puzzle.difficulty}
            extraParameters={{
              challenge: session.puzzle.challengeId ?? null,
              variant: currentVariant,
            }}
            game="sudoku"
            seed={session.puzzle.seed}
            title={copy.title}
          />
          <button
            className="command-button"
            onClick={() => startNewGame(
              session.puzzle.difficulty,
              previewAccess.nextPuzzleVariant,
            )}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={17} /> {copy.newPuzzle}
          </button>
        </div>
      </div>

      {previewAccess.showVariantSelector ? (
        <div className="sudoku-variant-row">
          <span>{copy.variant}<em>{copy.preview}</em></span>
          <div className="segmented-control" aria-label={`${copy.variant} ${copy.preview}`}>
            {(Object.keys(copy.variants) as SudokuVariant[]).map((variant) => (
              <button
                aria-pressed={currentVariant === variant}
                className={currentVariant === variant ? 'active' : ''}
                key={variant}
                onClick={() => requestVariantChange(variant)}
                type="button"
              >
                {copy.variants[variant]}
                <small>{copy.variantDescriptions[variant]}</small>
              </button>
            ))}
          </div>
        </div>
      ) : previewAccess.showCompatibilityBanner ? (
        <div className="sudoku-preview-active" role="status">
          <span>
            <strong>{copy.previewActive(copy.variants[currentVariant])}</strong>
            {copy.previewDisabledMessage}
          </span>
          <button
            className="command-button"
            onClick={() => setPendingSetup({
              difficulty: session.puzzle.difficulty,
              variant: 'classic',
            })}
            type="button"
          >
            {copy.returnToClassic}
          </button>
        </div>
      ) : null}

      <div className="sudoku-analysis-row" aria-label={copy.technique}>
        <span><strong>{session.puzzle.analysis.rating}</strong> RATING</span>
        <span>
          <strong>
            {techniqueLabel} ×{hardestTechniqueCount}
          </strong>
          {copy.technique}
        </span>
        <span>
          <strong>{session.puzzle.analysis.candidateEliminations ?? 0}</strong>
          {copy.eliminations}
        </span>
      </div>

      <GameHowTo
        game="sudoku"
        showSudokuPreviewDetails={previewAccess.showPreviewDetails}
      />

      <div className="sudoku-layout" ref={boardFocusRef}>
        <div className="sudoku-board" role="grid" aria-label={copy.board}>
          {session.values.map((value, index) => {
            const given = session.puzzle.puzzle[index] !== 0
            const cageInfo = cageCellInfo.get(index)
            const peer = index !== selected && isPeer(index, selected)
            const sameValue = sameNumberHighlight &&
              selectedValue !== 0 && value === selectedValue && index !== selected
            const candidates = placementGuide
              ? getCandidates(session.values, index, cages)
              : []
            const classes = [
              'sudoku-cell',
              given ? 'given' : 'editable',
              index === selected ? 'selected' : '',
              peer ? 'peer' : '',
              sameValue ? 'same-value' : '',
              conflicts.has(index) ? 'conflict' : '',
              cageInfo ? 'killer-cage' : '',
              cageInfo?.top ? 'cage-top' : '',
              cageInfo?.right ? 'cage-right' : '',
              cageInfo?.bottom ? 'cage-bottom' : '',
              cageInfo?.left ? 'cage-left' : '',
              pulseCell === index ? 'action-pulse' : '',
              (index + 1) % 3 === 0 && index % 9 !== 8 ? 'box-right' : '',
              Math.floor(index / 9) % 3 === 2 && index < 72 ? 'box-bottom' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                aria-label={describeSudokuCell(index, value, session.notes[index], preferences.language)}
                className={classes}
                data-sudoku-cell={index}
                data-tooltip-disabled="true"
                key={index}
                onClick={() => {
                  selectCell(index)
                  playEffect('select')
                }}
                onContextMenu={(event) => {
                  event.preventDefault()
                  if (!given) {
                    selectCell(index)
                    setNoteMode(true)
                    playEffect('select')
                  }
                }}
                onPointerDown={(event) => {
                  if (event.button === 0 && event.isPrimary) {
                    selectCell(index)
                  }
                }}
                onKeyDown={handleCellKeyDown}
                role="gridcell"
                tabIndex={index === selected ? 0 : -1}
                type="button"
              >
                {cageInfo?.sum !== null && cageInfo?.sum !== undefined ? (
                  <span aria-hidden="true" className="cage-sum">{cageInfo.sum}</span>
                ) : null}
                {value !== 0 ? (
                  <span className="cell-value">{value}</span>
                ) : session.notes[index] !== 0 ? (
                  <span className="cell-notes" aria-label={copy.note}>
                    {Array.from({ length: 9 }, (_, offset) => offset + 1).map(
                      (digit) => (
                        <span key={digit}>
                          {(session.notes[index] & (1 << digit)) !== 0 ? digit : ''}
                        </span>
                      ),
                    )}
                  </span>
                ) : (
                  <span className="candidate-count" aria-hidden="true">
                    {index === selected && candidates.length > 0
                      ? candidates.join('')
                      : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <aside className="number-console" aria-label={copy.input}>
          <div className="entry-mode-picker">
            <span>{copy.entryPrompt}</span>
            <div className="entry-mode-control" aria-label={copy.entryMethod}>
              <button
                aria-pressed={!noteMode}
                className={!noteMode ? 'active' : ''}
                onClick={() => {
                  setNoteMode(false)
                  playEffect('select')
                }}
                type="button"
              >
                <b className="entry-mode-value" aria-hidden="true">5</b>
                <span><strong>{copy.entryConfirmed}</strong><small>{copy.entryLarge}</small></span>
              </button>
              <button
                aria-pressed={noteMode}
                className={noteMode ? 'active' : ''}
                onClick={() => {
                  setNoteMode(true)
                  playEffect('select')
                }}
                type="button"
              >
                <b className="entry-mode-note" aria-hidden="true">5</b>
                <span><strong>{copy.entryNote}</strong><small>{copy.entrySmall}</small></span>
              </button>
            </div>
          </div>
          <div className="number-pad">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
              <button
                aria-label={copy.inputDigit(digit, noteMode)}
                data-tooltip-disabled="true"
                key={digit}
                onClick={() => enterDigit(digit)}
                onContextMenu={(event) => {
                  event.preventDefault()
                  enterDigit(digit, true)
                }}
                type="button"
              >
                {digit}
              </button>
            ))}
          </div>
          <div className="tool-row">
            <button
              aria-label={copy.undo}
              data-tooltip={copy.undoTooltip}
              disabled={history.length === 0}
              onClick={undo}
              type="button"
            >
              <RotateCcw aria-hidden="true" />
            </button>
            <button
              aria-label={copy.erase}
              data-tooltip={copy.eraseTooltip}
              onClick={() => enterDigit(0)}
              type="button"
            >
              <Eraser aria-hidden="true" />
            </button>
            <button
              aria-label={copy.guideLabel(placementGuide)}
              aria-pressed={placementGuide}
              className={placementGuide ? 'active' : ''}
              data-tooltip={copy.guideTooltip}
              onClick={() => {
                setPlacementGuide((current) => !current)
                playEffect('select')
              }}
              type="button"
            >
              {placementGuide ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
            </button>
            <button
              aria-label={copy.highlightLabel(sameNumberHighlight)}
              aria-pressed={sameNumberHighlight}
              className={sameNumberHighlight ? 'active' : ''}
              data-tooltip={copy.highlightTooltip}
              onClick={() => {
                setSameNumberHighlight((current) => !current)
                playEffect('select')
              }}
              type="button"
            >
              <Highlighter aria-hidden="true" />
            </button>
            <button
              aria-label={copy.hint}
              data-tooltip={copy.hintTooltip}
              onClick={revealHint}
              type="button"
            >
              <Lightbulb aria-hidden="true" />
            </button>
          </div>
          <div className={`game-message ${session.status === 'won' ? 'success' : ''}`} aria-live="polite">
            {session.status === 'won' ? (
              <><strong>CORRECT!</strong><span>{copy.clearMessage}</span></>
            ) : conflicts.size > 0 ? (
              <><strong>CHECK</strong><span>{copy.checkMessage}</span></>
            ) : noteMode ? (
              <><strong>NOTE MODE</strong><span>{copy.noteMessage}</span></>
            ) : placementGuide ? (
              <><strong>PLACEMENT GUIDE</strong><span>{copy.guideMessage}</span></>
            ) : (
              <><strong>PLAYING</strong><span>{copy.keyboardMessage}</span></>
            )}
          </div>
          {session.status === 'won' && !resultOpen ? (
            <ResultReopenButton onClick={() => setResultOpen(true)} />
          ) : null}
        </aside>
      </div>
      <ResultModal
        grade={rank.grade}
        onClose={() => setResultOpen(false)}
        onPrimary={() => startNewGame(
          session.puzzle.difficulty,
          previewAccess.nextPuzzleVariant,
        )}
        open={resultOpen}
        primaryLabel={copy.nextPuzzle}
        rankProgress={rankProgress}
        shareAction={(
          <GameShareButton
            buttonLabel={copy.sharePuzzle}
            className="result-share-button"
            difficulty={session.puzzle.difficulty}
            extraParameters={{
              challenge: session.puzzle.challengeId ?? null,
              variant: currentVariant,
            }}
            game="sudoku"
            seed={session.puzzle.seed}
            title={copy.title}
          />
        )}
        stats={[
          { label: 'TIME', value: formatElapsedTime(session.elapsedSeconds) },
          { label: 'DIFFICULTY', value: copy.difficulties[session.puzzle.difficulty] },
          { label: 'TYPE', value: copy.variants[currentVariant] },
          {
            label: 'TECHNIQUE',
            value: `${techniqueLabel} ×${hardestTechniqueCount}`,
          },
          { label: 'RATING', value: String(session.puzzle.analysis.rating) },
          { label: 'HINT / MISS', value: `${session.hintsUsed} / ${session.mistakes}` },
        ]}
        subtitle={copy.subtitle}
        title={copy.correctTitle}
      />
      <ConfirmationModal
        confirmLabel={copy.generateAndStart(
          pendingSetup ? copy.difficulties[pendingSetup.difficulty] : '',
          pendingSetup ? copy.variants[pendingSetup.variant] : '',
        )}
        message={copy.confirmMessage}
        onCancel={() => setPendingSetup(null)}
        onConfirm={() => {
          if (pendingSetup) {
            startNewGame(pendingSetup.difficulty, pendingSetup.variant)
          }
          setPendingSetup(null)
        }}
        open={pendingSetup !== null}
        title={copy.confirmTitle}
      />
    </section>
  )
}
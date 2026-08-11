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
import {
  ConfirmationModal,
  CountdownOverlay,
  ResultReopenButton,
  ResultModal,
  useAppExperience,
  useGameCountdown,
} from '../../experience/20260811_AppExperience'
import { formatElapsedTime, useStoredState } from '../../lib/storage'
import { GameShareButton } from '../../share/20260811_GameShare'
import { readSharedGameParameters } from '../../share/20260811_seededGameUrl'
import {
  generateSudoku,
  getCandidates,
  getConflicts,
  isSudokuSolved,
  type SudokuDifficulty,
  type SudokuPuzzle,
} from './engine'

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

const DIFFICULTY_LABELS: Record<SudokuDifficulty, string> = {
  beginner: '入門',
  easy: 'やさしい',
  normal: 'ふつう',
  hard: 'むずかしい',
  expert: 'エキスパート',
}

function nextSeed(): number {
  return Date.now() >>> 0
}

function isSudokuDifficulty(value: string | null): value is SudokuDifficulty {
  return value === 'beginner' || value === 'easy' || value === 'normal' || value === 'hard' || value === 'expert'
}

function createSession(
  difficulty: SudokuDifficulty,
  seed = nextSeed(),
): SudokuSession {
  const puzzle = generateSudoku(difficulty, seed)
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
  return createSession(difficulty, shared?.seed)
}

function getSudokuGrade(session: SudokuSession): string {
  const penalty = session.elapsedSeconds + session.hintsUsed * 90 + session.mistakes * 35
  if (penalty < 300) return 'S'
  if (penalty < 600) return 'A'
  if (penalty < 1000) return 'B'
  return 'C'
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
): string {
  const location = `行${Math.floor(index / 9) + 1} 列${(index % 9) + 1}`
  if (value !== 0) {
    return `${location} 数字${value}`
  }
  const noteDigits = Array.from({ length: 9 }, (_, offset) => offset + 1)
    .filter((digit) => (notes & (1 << digit)) !== 0)
  return noteDigits.length > 0
    ? `${location} メモ ${noteDigits.join('、')}`
    : `${location} 空欄`
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
  const [noteMode, setNoteMode] = useState(false)
  const [placementGuide, setPlacementGuide] = useState(false)
  const [sameNumberHighlight, setSameNumberHighlight] = useState(false)
  const [pendingDifficulty, setPendingDifficulty] = useState<SudokuDifficulty | null>(null)
  const [history, setHistory] = useState<SudokuHistoryEntry[]>([])
  const [pulseCell, setPulseCell] = useState<number | null>(null)
  const [resultOpen, setResultOpen] = useState(session.status === 'won')
  const { playEffect } = useAppExperience()
  const { countdown, isCountingDown, restartCountdown } = useGameCountdown(
    session.elapsedSeconds === 0 && session.status === 'playing',
  )
  const conflicts = getConflicts(session.values)
  const selectedValue = session.values[selected]

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

  function startNewGame(difficulty: SudokuDifficulty): void {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#/sudoku`,
    )
    const next = createSession(difficulty)
    setSession(next)
    setHistory([])
    setNoteMode(false)
    setPlacementGuide(false)
    setSameNumberHighlight(false)
    setResultOpen(false)
    restartCountdown()
    const firstEmpty = next.puzzle.puzzle.findIndex((value) => value === 0)
    selectCell(firstEmpty >= 0 ? firstEmpty : 0)
  }

  function requestDifficultyChange(difficulty: SudokuDifficulty): void {
    if (difficulty !== session.puzzle.difficulty) {
      setPendingDifficulty(difficulty)
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
      <CountdownOverlay value={countdown} />
      <header className="game-heading">
        <div>
          <p className="eyebrow">2006 / 2011 REBUILD</p>
          <h1 id="sudoku-title">おーとまちっく数独</h1>
        </div>
        <div className="game-metrics" aria-label="ゲーム情報">
          <span><strong>{formatElapsedTime(session.elapsedSeconds)}</strong> TIME</span>
          <span><strong>{session.hintsUsed}</strong> HINT</span>
          <span><strong>{session.puzzle.puzzle.filter(Boolean).length}</strong> CLUE</span>
        </div>
      </header>

      <div className="difficulty-row" aria-label="難易度">
        <div className="segmented-control">
          {(Object.keys(DIFFICULTY_LABELS) as SudokuDifficulty[]).map(
            (difficulty) => (
              <button
                aria-pressed={session.puzzle.difficulty === difficulty}
                className={session.puzzle.difficulty === difficulty ? 'active' : ''}
                key={difficulty}
                onClick={() => requestDifficultyChange(difficulty)}
                type="button"
              >
                {DIFFICULTY_LABELS[difficulty]}
              </button>
            ),
          )}
        </div>
        <div className="toolbar-inline">
          <GameShareButton
            difficulty={session.puzzle.difficulty}
            game="sudoku"
            seed={session.puzzle.seed}
            title="おーとまちっく数独"
          />
          <button
            className="command-button"
            onClick={() => startNewGame(session.puzzle.difficulty)}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={17} /> 新しい問題
          </button>
        </div>
      </div>

      <div className="sudoku-layout">
        <div className="sudoku-board" role="grid" aria-label="数独盤面">
          {session.values.map((value, index) => {
            const given = session.puzzle.puzzle[index] !== 0
            const peer = index !== selected && isPeer(index, selected)
            const sameValue = sameNumberHighlight &&
              selectedValue !== 0 && value === selectedValue && index !== selected
            const candidates = placementGuide
              ? getCandidates(session.values, index)
              : []
            const classes = [
              'sudoku-cell',
              given ? 'given' : 'editable',
              index === selected ? 'selected' : '',
              peer ? 'peer' : '',
              sameValue ? 'same-value' : '',
              conflicts.has(index) ? 'conflict' : '',
              pulseCell === index ? 'action-pulse' : '',
              (index + 1) % 3 === 0 && index % 9 !== 8 ? 'box-right' : '',
              Math.floor(index / 9) % 3 === 2 && index < 72 ? 'box-bottom' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                aria-label={describeSudokuCell(index, value, session.notes[index])}
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
                {value !== 0 ? (
                  <span className="cell-value">{value}</span>
                ) : session.notes[index] !== 0 ? (
                  <span className="cell-notes" aria-label="メモ">
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

        <aside className="number-console" aria-label="数字入力">
          <div className="entry-mode-picker">
            <span>左クリックの入力</span>
            <div className="entry-mode-control" aria-label="左クリックの入力方法">
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
                <span><strong>確定</strong><small>大きい数字</small></span>
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
                <span><strong>メモ</strong><small>小さい数字</small></span>
              </button>
            </div>
          </div>
          <div className="number-pad">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
              <button
                aria-label={`${digit}を${noteMode ? '小さいメモ' : '大きい確定値'}として入力。右クリックでは常にメモ入力`}
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
              aria-label="元に戻す"
              data-tooltip="直前の数字またはメモを元に戻す"
              disabled={history.length === 0}
              onClick={undo}
              type="button"
            >
              <RotateCcw aria-hidden="true" />
            </button>
            <button
              aria-label="数字を消す"
              data-tooltip="選択中のマスから数字を消す"
              onClick={() => enterDigit(0)}
              type="button"
            >
              <Eraser aria-hidden="true" />
            </button>
            <button
              aria-label={`置ける数字のガイド ${placementGuide ? 'オン' : 'オフ'}`}
              aria-pressed={placementGuide}
              className={placementGuide ? 'active' : ''}
              data-tooltip="選択中の空欄へ置ける数字を表示する"
              onClick={() => {
                setPlacementGuide((current) => !current)
                playEffect('select')
              }}
              type="button"
            >
              {placementGuide ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
            </button>
            <button
              aria-label={`同じ数字のハイライト ${sameNumberHighlight ? 'オン' : 'オフ'}`}
              aria-pressed={sameNumberHighlight}
              className={sameNumberHighlight ? 'active' : ''}
              data-tooltip="選択中と同じ数字を盤面上で強調表示する"
              onClick={() => {
                setSameNumberHighlight((current) => !current)
                playEffect('select')
              }}
              type="button"
            >
              <Highlighter aria-hidden="true" />
            </button>
            <button
              aria-label="ヒント"
              data-tooltip="選択中の空欄に正解を1つ入力する"
              onClick={revealHint}
              type="button"
            >
              <Lightbulb aria-hidden="true" />
            </button>
          </div>
          <div className={`game-message ${session.status === 'won' ? 'success' : ''}`} aria-live="polite">
            {session.status === 'won' ? (
              <><strong>CORRECT!</strong><span>正解です。やったね！</span></>
            ) : conflicts.size > 0 ? (
              <><strong>CHECK</strong><span>赤い数字が重複しています。</span></>
            ) : noteMode ? (
              <><strong>NOTE MODE</strong><span>候補の数字を複数記録できます。</span></>
            ) : placementGuide ? (
              <><strong>PLACEMENT GUIDE</strong><span>選択中の空欄へ置ける数字を表示しています。</span></>
            ) : (
              <><strong>PLAYING</strong><span>数字キーと矢印キーにも対応しています。</span></>
            )}
          </div>
          {session.status === 'won' && !resultOpen ? (
            <ResultReopenButton onClick={() => setResultOpen(true)} />
          ) : null}
        </aside>
      </div>
      <ResultModal
        grade={getSudokuGrade(session)}
        onClose={() => setResultOpen(false)}
        onPrimary={() => startNewGame(session.puzzle.difficulty)}
        open={resultOpen}
        primaryLabel="次の問題"
        shareAction={(
          <GameShareButton
            buttonLabel="同じ問題を共有"
            className="result-share-button"
            difficulty={session.puzzle.difficulty}
            game="sudoku"
            seed={session.puzzle.seed}
            title="おーとまちっく数独"
          />
        )}
        stats={[
          { label: 'TIME', value: formatElapsedTime(session.elapsedSeconds) },
          { label: 'DIFFICULTY', value: DIFFICULTY_LABELS[session.puzzle.difficulty] },
          { label: 'RATING', value: String(session.puzzle.analysis.rating) },
          { label: 'HINT / MISS', value: `${session.hintsUsed} / ${session.mistakes}` },
        ]}
        subtitle="一意解の盤面を完成しました。"
        title="正解です"
      />
      <ConfirmationModal
        confirmLabel={`${pendingDifficulty ? DIFFICULTY_LABELS[pendingDifficulty] : ''}で開始`}
        message="現在の進行状況は終了し、新しい問題を生成します。この操作は元に戻せません。"
        onCancel={() => setPendingDifficulty(null)}
        onConfirm={() => {
          if (pendingDifficulty) {
            startNewGame(pendingDifficulty)
          }
          setPendingDifficulty(null)
        }}
        open={pendingDifficulty !== null}
        title="難易度を変更しますか？"
      />
    </section>
  )
}
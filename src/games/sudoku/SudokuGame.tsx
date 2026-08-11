import { useEffect, useState, type KeyboardEvent } from 'react'
import {
  Eraser,
  Lightbulb,
  NotebookPen,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'
import { formatElapsedTime, useStoredState } from '../../lib/storage'
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
  notes: number[]
  puzzle: SudokuPuzzle
  status: 'playing' | 'won'
  values: number[]
}

const DIFFICULTY_LABELS: Record<SudokuDifficulty, string> = {
  easy: 'やさしい',
  normal: 'ふつう',
  hard: 'むずかしい',
}

function nextSeed(): number {
  return Date.now() >>> 0
}

function createSession(difficulty: SudokuDifficulty): SudokuSession {
  const puzzle = generateSudoku(difficulty, nextSeed())
  return {
    elapsedSeconds: 0,
    hintsUsed: 0,
    notes: Array<number>(81).fill(0),
    puzzle,
    status: 'playing',
    values: [...puzzle.puzzle],
  }
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

export function SudokuGame() {
  const [session, setSession] = useStoredState<SudokuSession>(
    'chikichiki:sudoku:v1',
    () => createSession('normal'),
  )
  const [selected, setSelected] = useState(() => {
    const firstEmpty = session.puzzle.puzzle.findIndex((value) => value === 0)
    return firstEmpty >= 0 ? firstEmpty : 0
  })
  const [noteMode, setNoteMode] = useState(false)
  const [history, setHistory] = useState<SudokuHistoryEntry[]>([])
  const conflicts = getConflicts(session.values)
  const selectedValue = session.values[selected]

  useEffect(() => {
    if (session.status !== 'playing') {
      return
    }
    const timer = window.setInterval(() => {
      setSession((current) => ({
        ...current,
        elapsedSeconds: current.elapsedSeconds + 1,
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [session.status, setSession])

  function startNewGame(difficulty: SudokuDifficulty): void {
    const next = createSession(difficulty)
    setSession(next)
    setHistory([])
    setNoteMode(false)
    const firstEmpty = next.puzzle.puzzle.findIndex((value) => value === 0)
    setSelected(firstEmpty >= 0 ? firstEmpty : 0)
  }

  function rememberCurrentState(): void {
    setHistory((current) => [
      ...current.slice(-79),
      { notes: [...session.notes], values: [...session.values] },
    ])
  }

  function enterDigit(digit: number): void {
    if (
      session.status !== 'playing' ||
      session.puzzle.puzzle[selected] !== 0
    ) {
      return
    }
    rememberCurrentState()
    setSession((current) => {
      const values = [...current.values]
      const notes = [...current.notes]
      if (noteMode && digit !== 0) {
        notes[selected] ^= 1 << digit
      } else {
        values[selected] = digit
        notes[selected] = 0
      }
      return {
        ...current,
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
  }

  function revealHint(): void {
    if (session.status !== 'playing') {
      return
    }
    const target =
      session.puzzle.puzzle[selected] === 0 &&
      session.values[selected] !== session.puzzle.solution[selected]
        ? selected
        : session.values.findIndex(
            (value, index) =>
              session.puzzle.puzzle[index] === 0 &&
              value !== session.puzzle.solution[index],
          )
    if (target < 0) {
      return
    }
    rememberCurrentState()
    setSelected(target)
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
    const row = Math.floor(selected / 9)
    const column = selected % 9
    let next = selected
    if (event.key === 'ArrowUp') next = Math.max(0, row - 1) * 9 + column
    if (event.key === 'ArrowDown') next = Math.min(8, row + 1) * 9 + column
    if (event.key === 'ArrowLeft') next = row * 9 + Math.max(0, column - 1)
    if (event.key === 'ArrowRight') next = row * 9 + Math.min(8, column + 1)
    if (next !== selected) {
      event.preventDefault()
      setSelected(next)
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
    <section className="game-workspace sudoku-workspace" aria-labelledby="sudoku-title">
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
                onClick={() => startNewGame(difficulty)}
                type="button"
              >
                {DIFFICULTY_LABELS[difficulty]}
              </button>
            ),
          )}
        </div>
        <button
          className="command-button"
          onClick={() => startNewGame(session.puzzle.difficulty)}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={17} /> 新しい問題
        </button>
      </div>

      <div className="sudoku-layout">
        <div className="sudoku-board" role="grid" aria-label="数独盤面">
          {session.values.map((value, index) => {
            const given = session.puzzle.puzzle[index] !== 0
            const peer = index !== selected && isPeer(index, selected)
            const sameValue =
              selectedValue !== 0 && value === selectedValue && index !== selected
            const candidates = getCandidates(session.values, index)
            const classes = [
              'sudoku-cell',
              given ? 'given' : 'editable',
              index === selected ? 'selected' : '',
              peer ? 'peer' : '',
              sameValue ? 'same-value' : '',
              conflicts.has(index) ? 'conflict' : '',
              (index + 1) % 3 === 0 && index % 9 !== 8 ? 'box-right' : '',
              Math.floor(index / 9) % 3 === 2 && index < 72 ? 'box-bottom' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                aria-label={`行${Math.floor(index / 9) + 1} 列${(index % 9) + 1}${value ? ` 数字${value}` : ' 空欄'}`}
                className={classes}
                data-sudoku-cell={index}
                key={index}
                onClick={() => setSelected(index)}
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
          <div className="number-pad">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
              <button key={digit} onClick={() => enterDigit(digit)} type="button">
                {digit}
              </button>
            ))}
          </div>
          <div className="tool-row">
            <button
              aria-label="元に戻す"
              disabled={history.length === 0}
              onClick={undo}
              title="元に戻す"
              type="button"
            >
              <RotateCcw aria-hidden="true" />
            </button>
            <button
              aria-label="数字を消す"
              onClick={() => enterDigit(0)}
              title="数字を消す"
              type="button"
            >
              <Eraser aria-hidden="true" />
            </button>
            <button
              aria-label={`メモ入力 ${noteMode ? 'オン' : 'オフ'}`}
              aria-pressed={noteMode}
              className={noteMode ? 'active' : ''}
              onClick={() => setNoteMode((current) => !current)}
              title="メモ入力 (N)"
              type="button"
            >
              <NotebookPen aria-hidden="true" />
            </button>
            <button
              aria-label="ヒント"
              onClick={revealHint}
              title="ヒント"
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
            ) : (
              <><strong>PLAYING</strong><span>数字キーと矢印キーにも対応しています。</span></>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
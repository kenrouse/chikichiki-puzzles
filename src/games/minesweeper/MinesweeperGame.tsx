import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { Bomb, Flag, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import { formatElapsedTime, useStoredState } from '../../lib/storage'
import {
  countFlags,
  createMineBoard,
  revealMineCell,
  toggleMineFlag,
  type MineBoard,
  type MineConfiguration,
} from './engine'

type MineDifficulty = 'beginner' | 'intermediate' | 'expert'

interface MineSession {
  board: MineBoard
  difficulty: MineDifficulty
  elapsedSeconds: number
}

type BestTimes = Record<MineDifficulty, number | null>

const CONFIGURATIONS: Record<
  MineDifficulty,
  MineConfiguration & { label: string }
> = {
  beginner: { width: 10, height: 10, mineCount: 10, label: '初級' },
  intermediate: { width: 20, height: 20, mineCount: 60, label: '中級' },
  expert: { width: 40, height: 40, mineCount: 320, label: '上級' },
}

function createSession(difficulty: MineDifficulty): MineSession {
  const { width, height, mineCount } = CONFIGURATIONS[difficulty]
  return {
    board: createMineBoard({ width, height, mineCount }, Date.now() >>> 0),
    difficulty,
    elapsedSeconds: 0,
  }
}

function describeCell(board: MineBoard, index: number): string {
  const row = Math.floor(index / board.width) + 1
  const column = (index % board.width) + 1
  const cell = board.cells[index]
  if (cell.state === 'flagged') return `行${row} 列${column} 旗`
  if (cell.state === 'hidden') return `行${row} 列${column} 未開封`
  if (cell.mine) return `行${row} 列${column} 地雷`
  return `行${row} 列${column} 周囲の地雷${cell.adjacent}`
}

export function MinesweeperGame() {
  const [session, setSession] = useStoredState<MineSession>(
    'chikichiki:minesweeper:v1',
    () => createSession('beginner'),
  )
  const [bestTimes, setBestTimes] = useStoredState<BestTimes>(
    'chikichiki:minesweeper:best:v1',
    () => ({ beginner: null, intermediate: null, expert: null }),
  )
  const [cellSize, setCellSize] = useState(28)
  const longPressTimer = useRef<number | null>(null)
  const longPressedIndex = useRef<number | null>(null)
  const board = session.board
  const flags = countFlags(board)

  useEffect(() => {
    if (board.status !== 'playing') {
      return
    }
    const timer = window.setInterval(() => {
      setSession((current) => ({
        ...current,
        elapsedSeconds: current.elapsedSeconds + 1,
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [board.status, setSession])

  useEffect(() => {
    if (board.status !== 'won') {
      return
    }
    setBestTimes((current) => {
      const previous = current[session.difficulty]
      if (previous !== null && previous <= session.elapsedSeconds) {
        return current
      }
      return { ...current, [session.difficulty]: session.elapsedSeconds }
    })
  }, [board.status, session.difficulty, session.elapsedSeconds, setBestTimes])

  function startNewGame(difficulty: MineDifficulty): void {
    setSession(createSession(difficulty))
  }

  function reveal(index: number): void {
    if (longPressedIndex.current === index) {
      longPressedIndex.current = null
      return
    }
    setSession((current) => ({
      ...current,
      board: revealMineCell(current.board, index),
    }))
  }

  function toggleFlag(index: number): void {
    setSession((current) => ({
      ...current,
      board: toggleMineFlag(current.board, index),
    }))
  }

  function beginLongPress(
    event: PointerEvent<HTMLButtonElement>,
    index: number,
  ): void {
    if (event.pointerType !== 'touch') {
      return
    }
    longPressTimer.current = window.setTimeout(() => {
      longPressedIndex.current = index
      toggleFlag(index)
      navigator.vibrate?.(30)
    }, 450)
  }

  function cancelLongPress(): void {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const boardStyle = {
    '--mine-cell-size': `${cellSize}px`,
    '--mine-columns': board.width,
  } as CSSProperties

  return (
    <section className="game-workspace mines-workspace" aria-labelledby="mines-title">
      <header className="game-heading">
        <div>
          <p className="eyebrow">2007 / COMPLETED EDITION</p>
          <h1 id="mines-title">ちきちきまいんすいーぱ。</h1>
        </div>
        <div className="game-metrics" aria-label="ゲーム情報">
          <span><strong>{formatElapsedTime(session.elapsedSeconds)}</strong> TIME</span>
          <span><strong>{board.mineCount - flags}</strong> MINE</span>
          <span>
            <strong>
              {bestTimes[session.difficulty] === null
                ? '--:--'
                : formatElapsedTime(bestTimes[session.difficulty] ?? 0)}
            </strong>{' '}
            BEST
          </span>
        </div>
      </header>

      <div className="difficulty-row">
        <div className="segmented-control" aria-label="難易度">
          {(Object.keys(CONFIGURATIONS) as MineDifficulty[]).map((difficulty) => {
            const configuration = CONFIGURATIONS[difficulty]
            return (
              <button
                aria-pressed={session.difficulty === difficulty}
                className={session.difficulty === difficulty ? 'active' : ''}
                key={difficulty}
                onClick={() => startNewGame(difficulty)}
                type="button"
              >
                {configuration.label}
                <small>{configuration.width}×{configuration.height}</small>
              </button>
            )
          })}
        </div>
        <div className="toolbar-inline">
          <button
            aria-label="縮小"
            disabled={cellSize <= 20}
            onClick={() => setCellSize((current) => Math.max(20, current - 4))}
            title="盤面を縮小"
            type="button"
          >
            <ZoomOut aria-hidden="true" />
          </button>
          <button
            aria-label="拡大"
            disabled={cellSize >= 40}
            onClick={() => setCellSize((current) => Math.min(40, current + 4))}
            title="盤面を拡大"
            type="button"
          >
            <ZoomIn aria-hidden="true" />
          </button>
          <button
            className="command-button"
            onClick={() => startNewGame(session.difficulty)}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={17} /> 新しい盤面
          </button>
        </div>
      </div>

      <div className="minefield-scroll" tabIndex={0} aria-label="スクロール可能な地雷原">
        <div
          className={`minefield status-${board.status}`}
          role="grid"
          style={boardStyle}
        >
          {board.cells.map((cell, index) => (
            <button
              aria-label={describeCell(board, index)}
              className={`mine-cell ${cell.state} adjacent-${cell.adjacent}`}
              key={index}
              onClick={() => reveal(index)}
              onContextMenu={(event) => {
                event.preventDefault()
                toggleFlag(index)
              }}
              onPointerCancel={cancelLongPress}
              onPointerDown={(event) => beginLongPress(event, index)}
              onPointerLeave={cancelLongPress}
              onPointerUp={cancelLongPress}
              role="gridcell"
              type="button"
            >
              {cell.state === 'flagged' ? (
                <Flag aria-hidden="true" fill="currentColor" />
              ) : cell.state === 'open' && cell.mine ? (
                <Bomb aria-hidden="true" />
              ) : cell.state === 'open' && cell.adjacent > 0 ? (
                cell.adjacent
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className={`game-message mine-message ${board.status === 'won' ? 'success' : board.status === 'lost' ? 'danger' : ''}`} aria-live="polite">
        {board.status === 'won' ? (
          <><strong>CLEARED!</strong><span>すべての安全なマスを開きました。</span></>
        ) : board.status === 'lost' ? (
          <><strong>GAME OVER</strong><span>地雷を開きました。新しい盤面でもう一度。</span></>
        ) : board.status === 'ready' ? (
          <><strong>READY</strong><span>最初に開くマスと、その周囲には地雷がありません。</span></>
        ) : (
          <><strong>PLAYING</strong><span>右クリックまたは長押しで旗。数字を再度押すと周囲を開きます。</span></>
        )}
      </div>
    </section>
  )
}
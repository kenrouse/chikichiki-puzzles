import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { Bomb, Flag, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import {
  CountdownOverlay,
  ResultModal,
  useAppExperience,
  useGameCountdown,
} from '../../experience/20260811_AppExperience'
import { formatElapsedTime, useStoredState } from '../../lib/storage'
import { GameShareButton } from '../../share/20260811_GameShare'
import { readSharedGameParameters } from '../../share/20260811_seededGameUrl'
import {
  calculateMineCascadeScore,
  countOpenedSafeCells,
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
  firstMoveIndex: number | null
  largestCascade: number
  score: number
}

type BestTimes = Record<MineDifficulty, number | null>
type BestScores = Record<MineDifficulty, number>

interface CascadeReaction {
  id: number
  intensity: number
  openedCells: number
  points: number
}

const CONFIGURATIONS: Record<
  MineDifficulty,
  MineConfiguration & { label: string }
> = {
  beginner: { width: 10, height: 10, mineCount: 10, label: '初級' },
  intermediate: { width: 20, height: 20, mineCount: 60, label: '中級' },
  expert: { width: 40, height: 40, mineCount: 320, label: '上級' },
}

function isMineDifficulty(value: string | null): value is MineDifficulty {
  return value === 'beginner' || value === 'intermediate' || value === 'expert'
}

function createSession(
  difficulty: MineDifficulty,
  seed = Date.now() >>> 0,
  firstMoveIndex: number | null = null,
): MineSession {
  const { width, height, mineCount } = CONFIGURATIONS[difficulty]
  const initialBoard = createMineBoard({ width, height, mineCount }, seed)
  const validFirstMove =
    firstMoveIndex !== null &&
    firstMoveIndex >= 0 &&
    firstMoveIndex < initialBoard.cells.length
      ? firstMoveIndex
      : null
  const board = validFirstMove === null
    ? initialBoard
    : revealMineCell(initialBoard, validFirstMove)
  const initialCascade = calculateMineCascadeScore(countOpenedSafeCells(board))
  return {
    board,
    difficulty,
    elapsedSeconds: 0,
    firstMoveIndex: validFirstMove,
    largestCascade: initialCascade.openedCells,
    score: initialCascade.points,
  }
}

function createInitialSession(): MineSession {
  const shared = readSharedGameParameters('minesweeper')
  const requestedDifficulty = shared?.difficulty ?? null
  const difficulty: MineDifficulty = isMineDifficulty(requestedDifficulty)
    ? requestedDifficulty
    : 'beginner'
  return createSession(difficulty, shared?.seed, shared?.firstMove ?? null)
}

function getMineGrade(session: MineSession): string {
  const safeCells = session.board.width * session.board.height - session.board.mineCount
  const efficiency = session.score / Math.max(1, safeCells * 10)
  if (efficiency >= 3.8) return 'S'
  if (efficiency >= 2.7) return 'A'
  if (efficiency >= 1.7) return 'B'
  return 'C'
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
    'chikichiki:minesweeper:v3',
    createInitialSession,
  )
  const [bestTimes, setBestTimes] = useStoredState<BestTimes>(
    'chikichiki:minesweeper:best:v1',
    () => ({ beginner: null, intermediate: null, expert: null }),
  )
  const [bestScores, setBestScores] = useStoredState<BestScores>(
    'chikichiki:minesweeper:scores:v2',
    () => ({ beginner: 0, intermediate: 0, expert: 0 }),
  )
  const [cellSize, setCellSize] = useState(28)
  const [cascade, setCascade] = useState<CascadeReaction | null>(null)
  const [resultOpen, setResultOpen] = useState(
    session.board.status === 'won' || session.board.status === 'lost',
  )
  const longPressTimer = useRef<number | null>(null)
  const longPressedIndex = useRef<number | null>(null)
  const cascadeTimer = useRef<number | null>(null)
  const cascadeId = useRef(0)
  const loadedShare = useRef<string | null>(null)
  const { playEffect } = useAppExperience()
  const { countdown, isCountingDown, restartCountdown } = useGameCountdown(
    session.elapsedSeconds === 0 &&
      (session.board.status === 'ready' || session.firstMoveIndex !== null),
  )
  const shared = readSharedGameParameters('minesweeper')
  const requestedDifficulty = shared?.difficulty ?? null
  const sharedDifficulty: MineDifficulty = isMineDifficulty(requestedDifficulty)
    ? requestedDifficulty
    : 'beginner'
  const sharedSeed = shared?.seed ?? null
  const sharedFirstMove = shared?.firstMove ?? null
  const sharedKey = sharedSeed === null
    ? null
    : `${sharedSeed}:${sharedDifficulty}:${sharedFirstMove}`
  const board = session.board
  const flags = countFlags(board)

  useEffect(() => {
    if (board.status !== 'playing' || isCountingDown) {
      return
    }
    const timer = window.setInterval(() => {
      setSession((current) => ({
        ...current,
        elapsedSeconds: current.elapsedSeconds + 1,
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [board.status, isCountingDown, setSession])

  useEffect(() => {
    if (sharedSeed === null || !sharedKey || loadedShare.current === sharedKey) {
      return
    }
    loadedShare.current = sharedKey
    setSession(createSession(sharedDifficulty, sharedSeed, sharedFirstMove))
    setCascade(null)
    setResultOpen(false)
    restartCountdown()
  }, [restartCountdown, setSession, sharedDifficulty, sharedFirstMove, sharedKey, sharedSeed])

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

  useEffect(() => {
    if (board.status !== 'won') {
      return
    }
    setBestScores((current) => ({
      ...current,
      [session.difficulty]: Math.max(current[session.difficulty], session.score),
    }))
  }, [board.status, session.difficulty, session.score, setBestScores])

  useEffect(
    () => () => {
      if (cascadeTimer.current !== null) {
        window.clearTimeout(cascadeTimer.current)
      }
    },
    [],
  )

  function startNewGame(difficulty: MineDifficulty): void {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#/minesweeper`,
    )
    setSession(createSession(difficulty))
    setCascade(null)
    setResultOpen(false)
    restartCountdown()
  }

  function reveal(index: number): void {
    if (longPressedIndex.current === index) {
      longPressedIndex.current = null
      return
    }
    if (isCountingDown) {
      return
    }
    const openedBefore = countOpenedSafeCells(board)
    const nextBoard = revealMineCell(board, index)
    const openedAfter = countOpenedSafeCells(nextBoard)
    const cascadeScore = calculateMineCascadeScore(openedAfter - openedBefore)
    const nextScore = session.score + cascadeScore.points
    setSession({
      ...session,
      board: nextBoard,
      firstMoveIndex:
        session.firstMoveIndex ?? (!board.generated ? index : null),
      largestCascade: Math.max(session.largestCascade, cascadeScore.openedCells),
      score: nextScore,
    })

    if (nextBoard.status === 'lost') {
      playEffect('error')
      setResultOpen(true)
      return
    }
    if (cascadeScore.openedCells > 0) {
      cascadeId.current += 1
      const reaction = { ...cascadeScore, id: cascadeId.current }
      setCascade(reaction)
      playEffect(cascadeScore.intensity >= 4 ? 'match' : 'reveal')
      if (cascadeTimer.current !== null) {
        window.clearTimeout(cascadeTimer.current)
      }
      cascadeTimer.current = window.setTimeout(() => setCascade(null), 900)
    }
    if (nextBoard.status === 'won') {
      playEffect('clear')
      setResultOpen(true)
    }
  }

  function toggleFlag(index: number): void {
    if (isCountingDown) {
      return
    }
    const nextBoard = toggleMineFlag(board, index)
    if (nextBoard !== board) {
      playEffect('flag')
      setSession({ ...session, board: nextBoard })
    }
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
    '--cascade-intensity': cascade?.intensity ?? 0,
    '--mine-cell-size': `${cellSize}px`,
    '--mine-columns': board.width,
  } as CSSProperties

  return (
    <section className={`game-workspace mines-workspace ${isCountingDown ? 'game-paused' : ''}`} aria-labelledby="mines-title">
      <CountdownOverlay value={countdown} />
      <header className="game-heading">
        <div>
          <p className="eyebrow">2007 / COMPLETED EDITION</p>
          <h1 id="mines-title">ちきちきまいんすいーぱ。</h1>
        </div>
        <div className="game-metrics" aria-label="ゲーム情報">
          <span><strong>{formatElapsedTime(session.elapsedSeconds)}</strong> TIME</span>
          <span><strong>{session.score.toLocaleString()}</strong> SCORE</span>
          <span><strong>{board.mineCount - flags}</strong> MINE</span>
          <span>
            <strong>{bestScores[session.difficulty].toLocaleString()}</strong>{' '}
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
          <GameShareButton
            difficulty={session.difficulty}
            disabled={session.firstMoveIndex === null}
            disabledReason="最初のマスを開くと、同じ地雷配置を共有できます"
            extraParameters={{ first: session.firstMoveIndex }}
            game="minesweeper"
            seed={board.seed}
            title="ちきちきまいんすいーぱ。"
          />
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
        <div aria-live="polite" className="sr-only">
          {cascade
            ? `${cascade.openedCells}マスを開いて${cascade.points}点獲得しました。倍率は${cascade.intensity}です。`
            : ''}
        </div>
        <div
          className={`minefield status-${board.status} ${cascade ? `cascade-active cascade-${cascade.intensity}` : ''}`}
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
        {cascade ? (
          <div
            aria-hidden="true"
            className={`cascade-reaction intensity-${cascade.intensity}`}
            data-intensity={cascade.intensity}
            data-opened-cells={cascade.openedCells}
            data-points={cascade.points}
            key={cascade.id}
          >
            <strong>+{cascade.points.toLocaleString()}</strong>
            <span>{cascade.openedCells} CELLS / ×{cascade.intensity}</span>
            <div aria-hidden="true">
              {Array.from({ length: cascade.intensity * 6 }, (_, index) => (
                <i key={index} style={{ '--particle-index': index } as CSSProperties} />
              ))}
            </div>
          </div>
        ) : null}
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
      <ResultModal
        grade={board.status === 'lost' ? 'X' : getMineGrade(session)}
        onClose={() => setResultOpen(false)}
        onPrimary={() => startNewGame(session.difficulty)}
        open={resultOpen}
        primaryLabel={board.status === 'lost' ? 'もう一度' : '次の盤面'}
        stats={[
          { label: 'SCORE', value: session.score.toLocaleString() },
          { label: 'TIME', value: formatElapsedTime(session.elapsedSeconds) },
          { label: 'MAX CASCADE', value: String(session.largestCascade) },
          {
            label: 'BEST TIME',
            value:
              bestTimes[session.difficulty] === null
                ? '--:--'
                : formatElapsedTime(bestTimes[session.difficulty] ?? 0),
          },
        ]}
        subtitle={
          board.status === 'lost'
            ? '地雷を開きました。スコアは次の挑戦へ持ち越されません。'
            : 'すべての安全なマスを開きました。'
        }
        title={board.status === 'lost' ? 'GAME OVER' : '地雷原を制覇'}
      />
    </section>
  )
}
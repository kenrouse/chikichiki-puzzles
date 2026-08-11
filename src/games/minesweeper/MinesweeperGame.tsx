import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import {
  Bomb,
  CircleQuestionMark,
  Flag,
  RefreshCw,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
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
import { isTouchSwipe, supportsLongPress } from './20260811_touchGesture'
import {
  calculateMineCascadeScore,
  countOpenedSafeCells,
  countFlags,
  createMineBoard,
  cycleMineMark,
  revealMineCell,
  type MineBoard,
  type MineConfiguration,
  type MineGenerationMode,
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

interface TouchGesture {
  index: number
  pointerId: number
  startX: number
  startY: number
  swiping: boolean
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
  generationMode: MineGenerationMode = 'guess-free',
): MineSession {
  const { width, height, mineCount } = CONFIGURATIONS[difficulty]
  const initialBoard = createMineBoard(
    { width, height, mineCount },
    seed,
    generationMode,
  )
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
  const generationMode: MineGenerationMode = shared
    ? shared.guessFree === true
      ? 'guess-free'
      : 'classic'
    : 'guess-free'
  return createSession(
    difficulty,
    shared?.seed,
    shared?.firstMove ?? null,
    generationMode,
  )
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
  if (board.detonatedIndex === index) return `行${row} 列${column} 踏んだ地雷`
  if (cell.state === 'flagged') return `行${row} 列${column} 旗`
  if (cell.state === 'questioned') return `行${row} 列${column} はてなマーク`
  if (cell.state === 'hidden') return `行${row} 列${column} 未開封`
  if (cell.mine) return `行${row} 列${column} 地雷`
  return `行${row} 列${column} 周囲の地雷${cell.adjacent}`
}

export function MinesweeperGame() {
  const isSharedGame = readSharedGameParameters('minesweeper') !== null
  const [session, setSession] = useStoredState<MineSession>(
    'chikichiki:minesweeper:v4',
    createInitialSession,
    isSharedGame,
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
  const [pendingDifficulty, setPendingDifficulty] = useState<MineDifficulty | null>(null)
  const [cascade, setCascade] = useState<CascadeReaction | null>(null)
  const [resultOpen, setResultOpen] = useState(
    session.board.status === 'won' || session.board.status === 'lost',
  )
  const longPressTimer = useRef<number | null>(null)
  const longPressedIndex = useRef<number | null>(null)
  const touchGesture = useRef<TouchGesture | null>(null)
  const suppressTouchClickIndex = useRef<number | null>(null)
  const suppressTouchClickTimer = useRef<number | null>(null)
  const suppressContextMenuIndex = useRef<number | null>(null)
  const suppressContextMenuTimer = useRef<number | null>(null)
  const cascadeTimer = useRef<number | null>(null)
  const cascadeId = useRef(0)
  const { playEffect } = useAppExperience()
  const { countdown, isCountingDown, restartCountdown } = useGameCountdown(
    session.elapsedSeconds === 0 &&
      (session.board.status === 'ready' || session.firstMoveIndex !== null),
  )
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
      if (suppressTouchClickTimer.current !== null) {
        window.clearTimeout(suppressTouchClickTimer.current)
      }
      if (suppressContextMenuTimer.current !== null) {
        window.clearTimeout(suppressContextMenuTimer.current)
      }
    },
    [],
  )

  function startNewGame(
    difficulty: MineDifficulty,
    generationMode: MineGenerationMode = board.generationMode,
  ): void {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#/minesweeper`,
    )
    setSession(createSession(difficulty, undefined, null, generationMode))
    setCascade(null)
    setResultOpen(false)
    restartCountdown()
  }

  function requestDifficultyChange(difficulty: MineDifficulty): void {
    if (difficulty !== session.difficulty) {
      setPendingDifficulty(difficulty)
    }
  }

  function reveal(index: number): void {
    if (suppressTouchClickIndex.current === index) {
      suppressTouchClickIndex.current = null
      return
    }
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

  function cycleMark(index: number): void {
    if (isCountingDown) {
      return
    }
    const nextBoard = cycleMineMark(board, index)
    if (nextBoard !== board) {
      const nextState = nextBoard.cells[index].state
      playEffect(
        nextState === 'flagged'
          ? 'flag'
          : nextState === 'questioned'
            ? 'select'
            : 'undo',
      )
      setSession({ ...session, board: nextBoard })
    }
  }

  function beginLongPress(
    event: PointerEvent<HTMLButtonElement>,
    index: number,
  ): void {
    if (!supportsLongPress(event.pointerType)) {
      return
    }
    touchGesture.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      swiping: false,
    }
    longPressTimer.current = window.setTimeout(() => {
      if (touchGesture.current?.swiping) {
        return
      }
      longPressedIndex.current = index
      suppressContextMenuIndex.current = index
      if (suppressContextMenuTimer.current !== null) {
        window.clearTimeout(suppressContextMenuTimer.current)
      }
      suppressContextMenuTimer.current = window.setTimeout(() => {
        if (suppressContextMenuIndex.current === index) {
          suppressContextMenuIndex.current = null
        }
        suppressContextMenuTimer.current = null
      }, 1200)
      cycleMark(index)
      navigator.vibrate?.(30)
    }, 450)
  }

  function trackTouchSwipe(event: PointerEvent<HTMLButtonElement>): void {
    const gesture = touchGesture.current
    if (
      !supportsLongPress(event.pointerType) ||
      !gesture ||
      gesture.pointerId !== event.pointerId ||
      gesture.swiping
    ) {
      return
    }
    if (!isTouchSwipe(
      gesture.startX,
      gesture.startY,
      event.clientX,
      event.clientY,
    )) {
      return
    }
    gesture.swiping = true
    longPressedIndex.current = null
    suppressTouchClickIndex.current = gesture.index
    cancelLongPress()
  }

  function clearSuppressedClickSoon(index: number): void {
    if (suppressTouchClickTimer.current !== null) {
      window.clearTimeout(suppressTouchClickTimer.current)
    }
    suppressTouchClickTimer.current = window.setTimeout(() => {
      if (suppressTouchClickIndex.current === index) {
        suppressTouchClickIndex.current = null
      }
      suppressTouchClickTimer.current = null
    }, 0)
  }

  function finishTouchGesture(event: PointerEvent<HTMLButtonElement>): void {
    if (supportsLongPress(event.pointerType)) {
      const gesture = touchGesture.current
      if (gesture?.pointerId === event.pointerId && gesture.swiping) {
        suppressTouchClickIndex.current = gesture.index
        clearSuppressedClickSoon(gesture.index)
      }
      touchGesture.current = null
    }
    cancelLongPress()
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
                onClick={() => requestDifficultyChange(difficulty)}
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
            extraParameters={{
              first: session.firstMoveIndex,
              logic: board.generationMode === 'guess-free' ? 1 : 0,
            }}
            game="minesweeper"
            seed={board.seed}
            title="ちきちきまいんすいーぱ。"
          />
          <button
            aria-label="縮小"
            disabled={cellSize <= 20}
            data-tooltip="盤面を縮小"
            onClick={() => setCellSize((current) => Math.max(20, current - 4))}
            type="button"
          >
            <ZoomOut aria-hidden="true" />
          </button>
          <button
            aria-label="拡大"
            disabled={cellSize >= 40}
            data-tooltip="盤面を拡大"
            onClick={() => setCellSize((current) => Math.min(40, current + 4))}
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

      <div className="mine-mode-row">
        <label
          className="sound-toggle mine-mode-toggle"
          data-tooltip="ONでは公開された数字だけで完走できる盤面を生成します。OFFでは初手安全のみのクラシック配置に戻ります"
        >
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>推測不要</strong>
            <small>論理だけで解ける盤面</small>
          </span>
          <input
            aria-label="推測不要モード"
            checked={board.generationMode === 'guess-free'}
            onChange={(event) => startNewGame(
              session.difficulty,
              event.target.checked ? 'guess-free' : 'classic',
            )}
            type="checkbox"
          />
          <i aria-hidden="true" />
        </label>
        <p>
          {board.generationMode === 'guess-free'
            ? '数字から確定できる手だけで最後まで進めます。'
            : 'オリジナル同様、局面によって推測が必要です。'}
        </p>
      </div>

      <div className="mine-legend" aria-label="記号と色の説明">
        <span className="flag-legend" data-tooltip="自分で置いた地雷候補。色は正解または不正解を示しません">
          <Flag aria-hidden="true" fill="currentColor" />
          <strong>旗</strong> 地雷候補・正誤未判定
        </span>
        <span className="question-legend" data-tooltip="地雷か判断できないマスの仮マーク。MINE残数には数えません">
          <CircleQuestionMark aria-hidden="true" />
          <strong>?</strong> 判断保留
        </span>
        <span className="mine-legend-item" data-tooltip="ゲーム終了時に赤く表示される、実際に配置された地雷">
          <Bomb aria-hidden="true" />
          <strong>赤い爆弾</strong> 実際の地雷
        </span>
        <span className="detonated-legend" data-tooltip="ゲームオーバーの原因になった地雷は黄色い二重輪で表示されます">
          <Bomb aria-hidden="true" />
          <strong>黄色い輪</strong> 踏んだ地雷
        </span>
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
              className={`mine-cell ${cell.state} adjacent-${cell.adjacent} ${cell.state === 'open' && cell.mine ? 'actual-mine' : ''} ${board.detonatedIndex === index ? 'detonated' : ''}`}
              data-tooltip-disabled="true"
              key={index}
              onClick={() => reveal(index)}
              onContextMenu={(event) => {
                event.preventDefault()
                if (suppressContextMenuIndex.current === index) {
                  return
                }
                cycleMark(index)
              }}
              onPointerCancel={finishTouchGesture}
              onPointerDown={(event) => beginLongPress(event, index)}
              onPointerMove={trackTouchSwipe}
              onPointerUp={finishTouchGesture}
              role="gridcell"
              type="button"
            >
              {cell.state === 'flagged' ? (
                <Flag aria-hidden="true" fill="currentColor" />
              ) : cell.state === 'questioned' ? (
                <span aria-hidden="true" className="question-mark">?</span>
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
          <><strong>READY</strong><span>{board.generationMode === 'guess-free' ? '最初の一手から、推測せずに完走できる盤面を生成します。' : '最初に開くマスと、その周囲には地雷がありません。'}</span></>
        ) : (
          <><strong>PLAYING</strong><span>右クリックまたは長押しで、旗 → ? → 解除。数字を再度押すと周囲を開きます。</span></>
        )}
      </div>
      {(board.status === 'won' || board.status === 'lost') && !resultOpen ? (
        <ResultReopenButton onClick={() => setResultOpen(true)} />
      ) : null}
      <ResultModal
        grade={board.status === 'lost' ? 'X' : getMineGrade(session)}
        onClose={() => setResultOpen(false)}
        onPrimary={() => startNewGame(session.difficulty)}
        open={resultOpen}
        primaryLabel={board.status === 'lost' ? 'もう一度' : '次の盤面'}
        shareAction={(
          <GameShareButton
            buttonLabel="同じ盤面を共有"
            className="result-share-button"
            difficulty={session.difficulty}
            extraParameters={{
              first: session.firstMoveIndex,
              logic: board.generationMode === 'guess-free' ? 1 : 0,
            }}
            game="minesweeper"
            seed={board.seed}
            title="ちきちきまいんすいーぱ。"
          />
        )}
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
      <ConfirmationModal
        confirmLabel={`${pendingDifficulty ? CONFIGURATIONS[pendingDifficulty].label : ''}で開始`}
        message="現在の盤面とスコアは終了し、新しい地雷原を生成します。この操作は元に戻せません。"
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
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
  MousePointer2,
  RefreshCw,
  Scan,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
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
import { calculateMinesweeperRank } from '../20260812_ranking'
import { fitGridCellSize } from '../20260812_viewSizing'
import { GameShareButton } from '../../share/20260811_GameShare'
import { readSharedGameParameters } from '../../share/20260811_seededGameUrl'
import {
  isTouchSwipe,
  resolveMineTapAction,
  supportsLongPress,
} from './20260811_touchGesture'
import { updateBestTime } from './20260811_records'
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
type MineTouchMode = 'mark' | 'open'

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
  MineConfiguration
> = {
  beginner: { width: 10, height: 10, mineCount: 10 },
  intermediate: { width: 20, height: 20, mineCount: 60 },
  expert: { width: 40, height: 40, mineCount: 320 },
}

const MINE_COPY = {
  ja: {
    actualMine: '赤い爆弾',
    actualMineDescription: '実際の地雷',
    actualMineTooltip: 'ゲーム終了時に赤く表示される、実際に配置された地雷',
    generateAndStart: (difficulty: string) => `${difficulty}を生成して開始`,
    cleared: 'すべての安全なマスを開きました。',
    classic: 'オリジナル同様、局面によって推測が必要です。',
    confirmMessage: '選択した難易度で新しい地雷原を生成し、3秒カウントダウン後に開始します。現在の盤面とスコアは終了し、この操作は元に戻せません。',
    confirmTitle: '難易度を変更しますか？',
    detonated: '黄色い輪',
    detonatedDescription: '踏んだ地雷',
    detonatedTooltip: 'ゲームオーバーの原因になった地雷は黄色い二重輪で表示されます',
    difficulties: { beginner: '初級', intermediate: '中級', expert: '上級' },
    difficulty: '難易度',
    flag: '旗',
    flagDescription: '地雷候補・正誤未判定',
    flagTooltip: '自分で置いた地雷候補。色は正解または不正解を示しません',
    gameInfo: 'ゲーム情報',
    gameOver: '地雷を開きました。新しい盤面でもう一度。',
    fitBoard: '画面に合わせる',
    fitBoardTooltip: '盤面全体が現在の画面に収まるセルサイズへ調整',
    guessFree: '推測不要',
    guessFreeDescription: '論理だけで解ける盤面',
    guessFreeLabel: '推測不要モード',
    guessFreeMessage: '数字から確定できる手だけで最後まで進めます。',
    guessFreeTooltip: 'ONでは公開された数字だけで完走できる盤面を生成します。OFFでは初手安全のみのクラシック配置に戻ります',
    legend: '記号と色の説明',
    lostSubtitle: '地雷を開きました。スコアは次の挑戦へ持ち越されません。',
    markMode: 'マーク',
    markModeDescription: 'タップで旗 → ? → 解除',
    newBoard: '新しい盤面',
    nextBoard: '次の盤面',
    openedCells: (cells: number, points: number, intensity: number) => `${cells}マスを開いて${points}点獲得しました。倍率は${intensity}です。`,
    playing: '右クリックまたは長押しで、旗 → ? → 解除。数字を再度押すと周囲を開きます。',
    questionDescription: '判断保留',
    questionTooltip: '地雷か判断できないマスの仮マーク。MINE残数には数えません',
    rankClearHeading: 'まず盤面をクリア',
    rankClearMessage: 'ランクは安全なマスをすべて開いたときに確定します。地雷を避けてクリアしてください。',
    rankHighestHeading: '最高ランク S',
    rankHighestMessage: 'Sランク達成です。安全マス数に対するスコア効率3.8以上を記録しました。',
    rankNextHeading: (grade: string) => `次は${grade}ランク`,
    rankNextMessage: (grade: string, target: string, needed: string) => `${grade}ランクには${target}点以上が必要です。あと${needed}点です。ランクはスコア効率で決まり、時間はベストタイムとして別に記録されます。`,
    readyClassic: '最初に開くマスと、その周囲には地雷がありません。',
    readyGuessFree: '最初の一手から、推測せずに完走できる盤面を生成します。',
    retry: 'もう一度',
    scrollBoard: 'スクロール可能な地雷原',
    shareBoard: '同じ盤面を共有',
    shareDisabled: '最初のマスを開くと、同じ地雷配置を共有できます',
    shrink: '縮小',
    shrinkTooltip: '盤面を縮小',
    tapAction: 'タッチ／ペンのタップ操作',
    openMode: '開く',
    openModeDescription: 'タップでマスを開く',
    title: 'ちきちきまいんすいーぱ。',
    victorySubtitle: 'すべての安全なマスを開きました。',
    victoryTitle: '地雷原を制覇',
    zoom: '拡大',
    zoomTooltip: '盤面を拡大',
  },
  en: {
    actualMine: 'Red bomb',
    actualMineDescription: 'Actual mine',
    actualMineTooltip: 'A mine that was actually placed, shown in red after the game ends',
    generateAndStart: (difficulty: string) => `Generate and start ${difficulty}`,
    cleared: 'You opened every safe cell.',
    classic: 'Like the original game, some positions may require a guess.',
    confirmMessage: 'Generate a new minefield at the selected difficulty and start it after a three-second countdown. Your current board and score will end and this cannot be undone.',
    confirmTitle: 'Change difficulty?',
    detonated: 'Yellow ring',
    detonatedDescription: 'Mine you hit',
    detonatedTooltip: 'The mine that ended the game is marked with a double yellow ring',
    difficulties: { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' },
    difficulty: 'Difficulty',
    flag: 'Flag',
    flagDescription: 'Suspected mine, not yet verified',
    flagTooltip: 'A suspected mine you marked. Its color does not indicate whether it is correct.',
    gameInfo: 'Game information',
    gameOver: 'You opened a mine. Try another board.',
    fitBoard: 'Fit to screen',
    fitBoardTooltip: 'Adjust cell size so the full board fits the current screen',
    guessFree: 'Guess-free',
    guessFreeDescription: 'Solvable by logic alone',
    guessFreeLabel: 'Guess-free mode',
    guessFreeMessage: 'Every move can be determined from the visible numbers.',
    guessFreeTooltip: 'On generates boards solvable from visible numbers alone. Off returns to a classic layout that only guarantees a safe first move.',
    legend: 'Symbols and colors',
    lostSubtitle: 'You opened a mine. Your score does not carry over to the next attempt.',
    markMode: 'Mark',
    markModeDescription: 'Tap for Flag → ? → Clear',
    newBoard: 'New board',
    nextBoard: 'Next board',
    openedCells: (cells: number, points: number, intensity: number) => `Opened ${cells} cells for ${points} points at a ×${intensity} multiplier.`,
    playing: 'Right-click or hold for Flag → ? → Clear. Press an open number again to open its neighbors.',
    questionDescription: 'Undecided',
    questionTooltip: 'A temporary mark for an uncertain cell. It is not counted in the remaining mines.',
    rankClearHeading: 'Clear the board first',
    rankClearMessage: 'A grade is awarded only after every safe cell is open. Avoid the mines and finish the board.',
    rankHighestHeading: 'Top grade S',
    rankHighestMessage: 'You earned grade S with a score efficiency of at least 3.8 per safe-cell baseline.',
    rankNextHeading: (grade: string) => `Next: grade ${grade}`,
    rankNextMessage: (grade: string, target: string, needed: string) => `Grade ${grade} requires at least ${target} points. You need ${needed} more. Grade uses score efficiency; time is tracked separately as your best time.`,
    readyClassic: 'Your first cell and all eight neighbors are safe.',
    readyGuessFree: 'Your first move creates a board that can be completed without guessing.',
    retry: 'Try again',
    scrollBoard: 'Scrollable minefield',
    shareBoard: 'Share this board',
    shareDisabled: 'Open the first cell before sharing this exact mine layout',
    shrink: 'Zoom out',
    shrinkTooltip: 'Make the board smaller',
    tapAction: 'Touch and pen tap action',
    openMode: 'Open',
    openModeDescription: 'Tap to open a cell',
    title: 'Chikichiki Minesweeper',
    victorySubtitle: 'You opened every safe cell.',
    victoryTitle: 'Minefield cleared',
    zoom: 'Zoom in',
    zoomTooltip: 'Make the board larger',
  },
} as const

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

function describeCell(board: MineBoard, index: number, language: AppLanguage): string {
  const row = Math.floor(index / board.width) + 1
  const column = (index % board.width) + 1
  const cell = board.cells[index]
  const location = language === 'ja' ? `行${row} 列${column}` : `Row ${row}, column ${column}`
  if (board.detonatedIndex === index) return language === 'ja' ? `${location} 踏んだ地雷` : `${location}, detonated mine`
  if (cell.state === 'flagged') return language === 'ja' ? `${location} 旗` : `${location}, flag`
  if (cell.state === 'questioned') return language === 'ja' ? `${location} はてなマーク` : `${location}, question mark`
  if (cell.state === 'hidden') return language === 'ja' ? `${location} 未開封` : `${location}, hidden`
  if (cell.mine) return language === 'ja' ? `${location} 地雷` : `${location}, mine`
  return language === 'ja' ? `${location} 周囲の地雷${cell.adjacent}` : `${location}, ${cell.adjacent} adjacent mines`
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
  const [touchMode, setTouchMode] = useStoredState<MineTouchMode>(
    'chikichiki:minesweeper:touch-mode:v1',
    () => 'open',
  )
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
  const boardFocusRef = useRef<HTMLDivElement>(null)
  const lastPointerType = useRef('mouse')
  const { playEffect, preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, MINE_COPY)
  const locale = preferences.language === 'ja' ? 'ja-JP' : 'en-US'
  const {
    beginCountdown,
    countdown,
    isCountingDown,
  } = useGameCountdown(
    session.elapsedSeconds === 0 &&
      (session.board.status === 'ready' || session.firstMoveIndex !== null),
  )
  const board = session.board
  const flags = countFlags(board)
  const safeCells = board.width * board.height - board.mineCount
  const rank = calculateMinesweeperRank(session.score, safeCells)
  const rankProgress = board.status === 'lost'
    ? { heading: copy.rankClearHeading, message: copy.rankClearMessage }
    : rank.nextGrade === null || rank.nextMinimum === null
      ? { heading: copy.rankHighestHeading, message: copy.rankHighestMessage }
      : {
        heading: copy.rankNextHeading(rank.nextGrade),
        message: copy.rankNextMessage(
          rank.nextGrade,
          rank.nextMinimum.toLocaleString(locale),
          rank.pointsNeeded.toLocaleString(locale),
        ),
      }

  function beginGame(): void {
    boardFocusRef.current?.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    })
    beginCountdown()
  }

  function fitBoardToScreen(): void {
    const viewport = boardFocusRef.current
    if (!viewport) {
      return
    }
    const availableWidth = Math.max(1, viewport.clientWidth - 4)
    const availableHeight = Math.max(180, window.innerHeight - 120)
    setCellSize(fitGridCellSize(
      availableWidth,
      availableHeight,
      board.width,
      board.height,
      6,
      40,
    ))
    window.requestAnimationFrame(() => {
      viewport.scrollTo({ left: 0, top: 0 })
    })
  }

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
      const next = updateBestTime(previous, session.elapsedSeconds)
      if (next === previous) {
        return current
      }
      return { ...current, [session.difficulty]: next }
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
    beginGame()
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

  function handleCellClick(index: number, keyboardClick: boolean): void {
    if (suppressTouchClickIndex.current === index) {
      suppressTouchClickIndex.current = null
      return
    }
    if (longPressedIndex.current === index) {
      longPressedIndex.current = null
      return
    }
    if (resolveMineTapAction(lastPointerType.current, touchMode, keyboardClick) === 'mark') {
      cycleMark(index)
      return
    }
    reveal(index)
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
      <CountdownOverlay
        value={countdown}
      />
      <header className="game-heading">
        <div>
          <p className="eyebrow">2007 / COMPLETED EDITION</p>
          <h1 id="mines-title">{copy.title}</h1>
        </div>
        <div className="game-metrics" aria-label={copy.gameInfo}>
          <span><strong>{formatElapsedTime(session.elapsedSeconds)}</strong> TIME</span>
          <span><strong>{session.score.toLocaleString(locale)}</strong> SCORE</span>
          <span><strong>{board.mineCount - flags}</strong> MINE</span>
          <span>
            <strong>
              {bestTimes[session.difficulty] === null
                ? '--:--'
                : formatElapsedTime(bestTimes[session.difficulty] ?? 0)}
            </strong>{' '}
            BEST TIME
          </span>
          <span>
            <strong>{bestScores[session.difficulty].toLocaleString(locale)}</strong>{' '}
            BEST SCORE
          </span>
        </div>
      </header>

      <div className="difficulty-row">
        <div className="segmented-control" aria-label={copy.difficulty}>
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
                {copy.difficulties[difficulty]}
                <small>{configuration.width}×{configuration.height}</small>
              </button>
            )
          })}
        </div>
        <div className="toolbar-inline">
          <GameShareButton
            difficulty={session.difficulty}
            disabled={session.firstMoveIndex === null}
            disabledReason={copy.shareDisabled}
            extraParameters={{
              first: session.firstMoveIndex,
              logic: board.generationMode === 'guess-free' ? 1 : 0,
            }}
            game="minesweeper"
            seed={board.seed}
            title={copy.title}
          />
          <button
            aria-label={copy.shrink}
            disabled={cellSize <= 6}
            data-tooltip={copy.shrinkTooltip}
            onClick={() => setCellSize((current) => Math.max(6, current - 4))}
            type="button"
          >
            <ZoomOut aria-hidden="true" />
          </button>
          <button
            aria-label={copy.zoom}
            disabled={cellSize >= 40}
            data-tooltip={copy.zoomTooltip}
            onClick={() => setCellSize((current) => Math.min(40, current + 4))}
            type="button"
          >
            <ZoomIn aria-hidden="true" />
          </button>
          <button
            aria-label={copy.fitBoard}
            data-tooltip={copy.fitBoardTooltip}
            onClick={fitBoardToScreen}
            type="button"
          >
            <Scan aria-hidden="true" />
          </button>
          <button
            className="command-button"
            onClick={() => startNewGame(session.difficulty)}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={17} /> {copy.newBoard}
          </button>
        </div>
      </div>

      <GameHowTo game="minesweeper" />

      <div className="mine-touch-mode" aria-label={copy.tapAction} role="group">
        <span>{copy.tapAction}</span>
        <div>
          <button
            aria-pressed={touchMode === 'open'}
            className={touchMode === 'open' ? 'active' : ''}
            onClick={() => setTouchMode('open')}
            type="button"
          >
            <MousePointer2 aria-hidden="true" />
            <span><strong>{copy.openMode}</strong><small>{copy.openModeDescription}</small></span>
          </button>
          <button
            aria-pressed={touchMode === 'mark'}
            className={touchMode === 'mark' ? 'active' : ''}
            onClick={() => setTouchMode('mark')}
            type="button"
          >
            <Flag aria-hidden="true" />
            <span><strong>{copy.markMode}</strong><small>{copy.markModeDescription}</small></span>
          </button>
        </div>
      </div>

      <div className="mine-mode-row">
        <label
          className="sound-toggle mine-mode-toggle"
          data-tooltip={copy.guessFreeTooltip}
        >
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>{copy.guessFree}</strong>
            <small>{copy.guessFreeDescription}</small>
          </span>
          <input
            aria-label={copy.guessFreeLabel}
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
            ? copy.guessFreeMessage
            : copy.classic}
        </p>
      </div>

      <div className="mine-legend" aria-label={copy.legend}>
        <span className="flag-legend" data-tooltip={copy.flagTooltip}>
          <Flag aria-hidden="true" fill="currentColor" />
          <strong>{copy.flag}</strong> {copy.flagDescription}
        </span>
        <span className="question-legend" data-tooltip={copy.questionTooltip}>
          <CircleQuestionMark aria-hidden="true" />
          <strong>?</strong> {copy.questionDescription}
        </span>
        <span className="mine-legend-item" data-tooltip={copy.actualMineTooltip}>
          <Bomb aria-hidden="true" />
          <strong>{copy.actualMine}</strong> {copy.actualMineDescription}
        </span>
        <span className="detonated-legend" data-tooltip={copy.detonatedTooltip}>
          <Bomb aria-hidden="true" />
          <strong>{copy.detonated}</strong> {copy.detonatedDescription}
        </span>
      </div>

      <div className="minefield-scroll" tabIndex={0} aria-label={copy.scrollBoard} ref={boardFocusRef}>
        <div aria-live="polite" className="sr-only">
          {cascade
            ? copy.openedCells(cascade.openedCells, cascade.points, cascade.intensity)
            : ''}
        </div>
        <div
          className={`minefield status-${board.status} ${cascade ? `cascade-active cascade-${cascade.intensity}` : ''}`}
          role="grid"
          style={boardStyle}
        >
          {board.cells.map((cell, index) => (
            <button
              aria-label={describeCell(board, index, preferences.language)}
              className={`mine-cell ${cell.state} adjacent-${cell.adjacent} ${cell.state === 'open' && cell.mine ? 'actual-mine' : ''} ${board.detonatedIndex === index ? 'detonated' : ''}`}
              data-tooltip-disabled="true"
              key={index}
              onClick={(event) => handleCellClick(index, event.detail === 0)}
              onContextMenu={(event) => {
                event.preventDefault()
                if (suppressContextMenuIndex.current === index) {
                  return
                }
                cycleMark(index)
              }}
              onPointerCancel={finishTouchGesture}
              onPointerDown={(event) => {
                lastPointerType.current = event.pointerType
                beginLongPress(event, index)
              }}
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
            <strong>+{cascade.points.toLocaleString(locale)}</strong>
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
          <><strong>CLEARED!</strong><span>{copy.cleared}</span></>
        ) : board.status === 'lost' ? (
          <><strong>GAME OVER</strong><span>{copy.gameOver}</span></>
        ) : board.status === 'ready' ? (
          <><strong>READY</strong><span>{board.generationMode === 'guess-free' ? copy.readyGuessFree : copy.readyClassic}</span></>
        ) : (
          <><strong>PLAYING</strong><span>{copy.playing}</span></>
        )}
      </div>
      {(board.status === 'won' || board.status === 'lost') && !resultOpen ? (
        <ResultReopenButton onClick={() => setResultOpen(true)} />
      ) : null}
      <ResultModal
        grade={board.status === 'lost' ? 'X' : rank.grade}
        onClose={() => setResultOpen(false)}
        onPrimary={() => startNewGame(session.difficulty)}
        open={resultOpen}
        primaryLabel={board.status === 'lost' ? copy.retry : copy.nextBoard}
        rankProgress={rankProgress}
        shareAction={(
          <GameShareButton
            buttonLabel={copy.shareBoard}
            className="result-share-button"
            difficulty={session.difficulty}
            extraParameters={{
              first: session.firstMoveIndex,
              logic: board.generationMode === 'guess-free' ? 1 : 0,
            }}
            game="minesweeper"
            seed={board.seed}
            title={copy.title}
          />
        )}
        stats={[
          { label: 'SCORE', value: session.score.toLocaleString(locale) },
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
            ? copy.lostSubtitle
            : copy.victorySubtitle
        }
        title={board.status === 'lost' ? 'GAME OVER' : copy.victoryTitle}
      />
      <ConfirmationModal
        confirmLabel={copy.generateAndStart(
          pendingDifficulty ? copy.difficulties[pendingDifficulty] : '',
        )}
        message={copy.confirmMessage}
        onCancel={() => setPendingDifficulty(null)}
        onConfirm={() => {
          if (pendingDifficulty) {
            startNewGame(pendingDifficulty)
          }
          setPendingDifficulty(null)
        }}
        open={pendingDifficulty !== null}
        title={copy.confirmTitle}
      />
    </section>
  )
}
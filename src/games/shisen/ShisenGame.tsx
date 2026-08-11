import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  Eye,
  EyeOff,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  Shuffle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { GameHowTo } from '../../components/20260812_GameHowTo'
import { getLocalizedCopy } from '../../i18n/20260812_i18n'
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
  createShisenBoard,
  findShisenHint,
  removeShisenPair,
  reshuffleShisen,
  type ShisenBoard,
  type ShisenDifficulty,
  type ShisenPair,
  type ShisenPoint,
} from './engine'

interface ShisenSession {
  board: ShisenBoard
  elapsedSeconds: number
  initialBoard: ShisenBoard
  initialRating: number
  removedPairs: number
  shuffleCount: number
}
const SHISEN_COPY = {
  ja: {
    begin: (difficulty: string) => `${difficulty}で開始`,
    confirmMessage: '現在の配牌と進行状況は終了し、新しい配牌を生成します。この操作は元に戻せません。',
    confirmTitle: '難易度を変更しますか？',
    difficulties: { relaxed: 'ゆったり', standard: '標準', expert: '達人' },
    difficulty: '難易度',
    hint: 'ヒント',
    hintMessage: '光っている2枚を消せます。',
    hintTooltip: '現在消せる牌を2枚光らせる',
    initialBoard: '初期盤面を閲覧中',
    initialBoardDescription: 'ゲーム開始時の牌配置です。',
    initialBoardTooltip: 'ゲーム開始時の牌配置を閲覧する',
    missMessage: 'その2枚は結べません。次の牌を選びました。',
    newBoard: '新しい配牌',
    nextBoard: '次の配牌',
    playingMessage: '盤外を通る経路も使えます。',
    restoreCleared: 'クリア後の盤面へ戻る',
    restoreClearedLabel: 'クリア後の空盤面を表示',
    restoreClearedTooltip: 'すべて消したクリア後の盤面へ戻る',
    reshuffledMessage: '残りの牌を解ける配置へ並べ替えました。',
    scrollBoard: 'スクロール可能な四川省盤面',
    shareBoard: '同じ配牌を共有',
    showInitialLabel: '最初の盤面を表示',
    shuffle: '残りの牌を並べ替える',
    shuffleTooltip: '残りを必ず解ける配置へ並べ替える',
    shrink: '牌を縮小',
    shrinkTooltip: '盤面と牌の模様を同じ比率で縮小する',
    subtitle: '同じ牌をすべて結び切りました。',
    title: '四川省',
    titleClear: '四川省クリア',
    undo: '元に戻す',
    undoTooltip: '直前に消した牌を戻す',
    victoryMessage: 'すべての牌を取り切りました。',
    zoom: '牌を拡大',
    zoomTooltip: '盤面と牌の模様を同じ比率で拡大する',
  },
  en: {
    begin: (difficulty: string) => `Start ${difficulty}`,
    confirmMessage: 'Your current layout and progress will end and a new layout will be generated. This cannot be undone.',
    confirmTitle: 'Change difficulty?',
    difficulties: { relaxed: 'Relaxed', standard: 'Standard', expert: 'Expert' },
    difficulty: 'Difficulty',
    hint: 'Hint',
    hintMessage: 'The two glowing tiles can be removed.',
    hintTooltip: 'Highlight a pair that can be removed now',
    initialBoard: 'Viewing the initial layout',
    initialBoardDescription: 'This is the tile layout from the start of the game.',
    initialBoardTooltip: 'View the tile layout from the start of the game',
    missMessage: 'Those two tiles cannot be connected. Select another tile.',
    newBoard: 'New layout',
    nextBoard: 'Next layout',
    playingMessage: 'Paths may also travel around the outside of the board.',
    restoreCleared: 'Return to the cleared board',
    restoreClearedLabel: 'Show the cleared board',
    restoreClearedTooltip: 'Return to the empty board after all tiles were removed',
    reshuffledMessage: 'The remaining tiles were rearranged into a solvable layout.',
    scrollBoard: 'Scrollable Shisen-Sho board',
    shareBoard: 'Share this layout',
    showInitialLabel: 'Show the initial layout',
    shuffle: 'Reshuffle remaining tiles',
    shuffleTooltip: 'Rearrange the remaining tiles into a solvable layout',
    shrink: 'Make tiles smaller',
    shrinkTooltip: 'Shrink the board and tile symbols together',
    subtitle: 'You connected and removed every matching tile.',
    title: 'Shisen-Sho',
    titleClear: 'Shisen-Sho cleared',
    undo: 'Undo',
    undoTooltip: 'Restore the last pair of removed tiles',
    victoryMessage: 'You removed every tile.',
    zoom: 'Make tiles larger',
    zoomTooltip: 'Enlarge the board and tile symbols together',
  },
} as const

const BOARD_WIDTHS: Record<ShisenDifficulty, number> = {
  relaxed: 860,
  standard: 1120,
  expert: 1280,
}

const TILE_GLYPHS = [
  '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏',
  '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘',
  '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡',
  '🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆',
]

const TILE_LABELS = {
  ja: [
    '一萬', '二萬', '三萬', '四萬', '五萬', '六萬', '七萬', '八萬', '九萬',
    '一索', '二索', '三索', '四索', '五索', '六索', '七索', '八索', '九索',
    '一筒', '二筒', '三筒', '四筒', '五筒', '六筒', '七筒', '八筒', '九筒',
    '東', '南', '西', '北', '中', '發', '白',
  ],
  en: [
    'one character', 'two characters', 'three characters', 'four characters', 'five characters', 'six characters', 'seven characters', 'eight characters', 'nine characters',
    'one bamboo', 'two bamboo', 'three bamboo', 'four bamboo', 'five bamboo', 'six bamboo', 'seven bamboo', 'eight bamboo', 'nine bamboo',
    'one dot', 'two dots', 'three dots', 'four dots', 'five dots', 'six dots', 'seven dots', 'eight dots', 'nine dots',
    'East wind', 'South wind', 'West wind', 'North wind', 'red dragon', 'green dragon', 'white dragon',
  ],
} as const

function isShisenDifficulty(value: string | null): value is ShisenDifficulty {
  return value === 'relaxed' || value === 'standard' || value === 'expert'
}

function createSession(
  difficulty: ShisenDifficulty = 'standard',
  seed = Date.now() >>> 0,
): ShisenSession {
  const board = createShisenBoard(seed, difficulty)
  return {
    board,
    elapsedSeconds: 0,
    initialBoard: board,
    initialRating: board.analysis.rating,
    removedPairs: 0,
    shuffleCount: 0,
  }
}

function createInitialSession(): ShisenSession {
  const shared = readSharedGameParameters('shisen')
  const requestedDifficulty = shared?.difficulty ?? null
  const difficulty: ShisenDifficulty = isShisenDifficulty(requestedDifficulty)
    ? requestedDifficulty
    : 'standard'
  return createSession(difficulty, shared?.seed)
}

function getShisenGrade(session: ShisenSession): string {
  const penalty = session.elapsedSeconds + session.shuffleCount * 120
  if (penalty < 360) return 'S'
  if (penalty < 720) return 'A'
  if (penalty < 1200) return 'B'
  return 'C'
}

export function ShisenGame() {
  const isSharedGame = readSharedGameParameters('shisen') !== null
  const [session, setSession] = useStoredState<ShisenSession>(
    'chikichiki:shisen:v4',
    createInitialSession,
    isSharedGame,
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [hint, setHint] = useState<ShisenPair | null>(null)
  const [path, setPath] = useState<ShisenPoint[] | null>(null)
  const [history, setHistory] = useState<ShisenBoard[]>([])
  const [notice, setNotice] = useState<'playing' | 'miss' | 'hint'>('playing')
  const [missedTiles, setMissedTiles] = useState<number[]>([])
  const [resultOpen, setResultOpen] = useState(session.board.status === 'won')
  const [showInitialBoard, setShowInitialBoard] = useState(false)
  const [pendingDifficulty, setPendingDifficulty] = useState<ShisenDifficulty | null>(null)
  const [zoom, setZoom] = useState(1)
  const pathTimer = useRef<number | null>(null)
  const missTimer = useRef<number | null>(null)
  const { playEffect, preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, SHISEN_COPY)
  const { countdown, isCountingDown, restartCountdown } = useGameCountdown(
    session.elapsedSeconds === 0 && session.board.status === 'playing',
  )
  const board = session.board
  const displayBoard = showInitialBoard && board.status === 'won'
    ? session.initialBoard
    : board
  const remaining = board.tiles.filter((tile) => tile !== null).length

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

  useEffect(
    () => () => {
      if (pathTimer.current !== null) {
        window.clearTimeout(pathTimer.current)
      }
      if (missTimer.current !== null) {
        window.clearTimeout(missTimer.current)
      }
    },
    [],
  )

  function startNewGame(difficulty: ShisenDifficulty = board.difficulty): void {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#/shisen`,
    )
    setSession(createSession(difficulty))
    setSelected(null)
    setHint(null)
    setPath(null)
    setHistory([])
    setNotice('playing')
    setMissedTiles([])
    setResultOpen(false)
    setShowInitialBoard(false)
    setZoom(1)
    restartCountdown()
  }

  function requestDifficultyChange(difficulty: ShisenDifficulty): void {
    if (difficulty !== board.difficulty) {
      setPendingDifficulty(difficulty)
    }
  }

  function selectTile(index: number): void {
    if (
      board.status === 'won' ||
      board.tiles[index] === null ||
      isCountingDown ||
      showInitialBoard
    ) {
      return
    }
    setHint(null)
    if (selected === null) {
      setSelected(index)
      setNotice('playing')
      playEffect('select')
      return
    }
    if (selected === index) {
      setSelected(null)
      return
    }

    const result = removeShisenPair(board, selected, index)
    if (!result.path) {
      const first = selected
      setSelected(null)
      setNotice('miss')
      setMissedTiles([first, index])
      playEffect('error')
      navigator.vibrate?.([35, 25, 35])
      if (missTimer.current !== null) {
        window.clearTimeout(missTimer.current)
      }
      missTimer.current = window.setTimeout(() => setMissedTiles([]), 620)
      return
    }

    setHistory((current) => [...current.slice(-39), board])
    setSession((current) => ({
      ...current,
      board: result.board,
      removedPairs: current.removedPairs + 1,
    }))
    setSelected(null)
    setNotice('playing')
    setMissedTiles([])
    setPath(result.path)
    navigator.vibrate?.(result.board.status === 'won' ? [35, 35, 70] : 20)
    if (result.board.status === 'won') {
      setResultOpen(true)
      playEffect('clear')
    } else {
      playEffect('match')
    }
    if (pathTimer.current !== null) {
      window.clearTimeout(pathTimer.current)
    }
    pathTimer.current = window.setTimeout(() => setPath(null), 420)
  }

  function showHint(): void {
    const nextHint = findShisenHint(board)
    if (!nextHint) {
      return
    }
    setHint(nextHint)
    setSelected(null)
    setNotice('hint')
    playEffect('hint')
  }

  function shuffleRemaining(): void {
    if (board.status === 'won') {
      return
    }
    setHistory((current) => [...current.slice(-39), board])
    setSession((current) => ({
      ...current,
      board: reshuffleShisen(current.board, Date.now() >>> 0),
      shuffleCount: current.shuffleCount + 1,
    }))
    setSelected(null)
    setHint(null)
    setPath(null)
    setNotice('playing')
    setMissedTiles([])
    playEffect('start')
  }

  function undo(): void {
    const previous = history.at(-1)
    if (!previous) {
      return
    }
    setSession((current) => ({
      ...current,
      board: previous,
      removedPairs: Math.max(0, current.removedPairs - 1),
    }))
    setHistory((current) => current.slice(0, -1))
    setSelected(null)
    setHint(null)
    setPath(null)
    setMissedTiles([])
    playEffect('undo')
  }

  const shellStyle = {
    '--shisen-board-width': `${Math.round(BOARD_WIDTHS[displayBoard.difficulty] * zoom)}px`,
    '--shisen-columns': displayBoard.width + 2,
    '--shisen-rows': displayBoard.height + 2,
    aspectRatio: `${displayBoard.width + 2} / ${(displayBoard.height + 2) * 1.32}`,
  } as CSSProperties

  return (
    <section className={`game-workspace shisen-workspace ${isCountingDown ? 'game-paused' : ''}`} aria-labelledby="shisen-title">
      <CountdownOverlay value={countdown} />
      <header className="game-heading">
        <div>
          <p className="eyebrow">2009 / FOR YUKA</p>
          <h1 id="shisen-title">{copy.title}</h1>
        </div>
        <div className="game-metrics" aria-label={preferences.language === 'ja' ? 'ゲーム情報' : 'Game information'}>
          <span><strong>{formatElapsedTime(session.elapsedSeconds)}</strong> TIME</span>
          <span><strong>{remaining}</strong> LEFT</span>
          <span><strong>{session.removedPairs}</strong> PAIR</span>
          <span><strong>{board.analysis.legalMoves}</strong> MOVES</span>
          <span><strong>{board.analysis.rating}</strong> RATING</span>
        </div>
      </header>

      <div className="difficulty-row shisen-controls">
        <div className="segmented-control" aria-label={copy.difficulty}>
          {(Object.keys(copy.difficulties) as ShisenDifficulty[]).map(
            (difficulty) => (
              <button
                aria-pressed={board.difficulty === difficulty}
                className={board.difficulty === difficulty ? 'active' : ''}
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
            difficulty={board.difficulty}
            game="shisen"
            seed={board.seed}
            title={copy.title}
          />
          <button
            aria-label={copy.shrink}
            data-tooltip={copy.shrinkTooltip}
            disabled={zoom <= 0.7}
            onClick={() => setZoom((current) => Math.max(0.7, current - 0.1))}
            type="button"
          >
            <ZoomOut aria-hidden="true" />
          </button>
          <button
            aria-label={copy.zoom}
            data-tooltip={copy.zoomTooltip}
            disabled={zoom >= 1.4}
            onClick={() => setZoom((current) => Math.min(1.4, current + 0.1))}
            type="button"
          >
            <ZoomIn aria-hidden="true" />
          </button>
          {board.status === 'won' ? (
            <button
              aria-label={showInitialBoard ? copy.restoreClearedLabel : copy.showInitialLabel}
              data-tooltip={
                showInitialBoard
                  ? copy.restoreClearedTooltip
                  : copy.initialBoardTooltip
              }
              onClick={() => setShowInitialBoard((current) => !current)}
              type="button"
            >
              {showInitialBoard ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          ) : null}
          <button
            aria-label={copy.undo}
            data-tooltip={copy.undoTooltip}
            disabled={history.length === 0 || showInitialBoard}
            onClick={undo}
            type="button"
          >
            <RotateCcw aria-hidden="true" />
          </button>
          <button
            aria-label={copy.hint}
            data-tooltip={copy.hintTooltip}
            disabled={showInitialBoard}
            onClick={showHint}
            type="button"
          >
            <Lightbulb aria-hidden="true" />
          </button>
          <button
            aria-label={copy.shuffle}
            data-tooltip={copy.shuffleTooltip}
            disabled={showInitialBoard}
            onClick={shuffleRemaining}
            type="button"
          >
            <Shuffle aria-hidden="true" />
          </button>
          <button className="command-button" onClick={() => startNewGame()} type="button">
            <RefreshCw aria-hidden="true" size={17} /> {copy.newBoard}
          </button>
        </div>
      </div>

      <GameHowTo game="shisen" />

      {showInitialBoard ? (
        <div className="initial-board-banner" role="status">
          <Eye aria-hidden="true" />
          <span><strong>{copy.initialBoard}</strong> {copy.initialBoardDescription}</span>
          <button onClick={() => setShowInitialBoard(false)} type="button">
            {copy.restoreCleared}
          </button>
        </div>
      ) : null}

      <div className="shisen-scroll" tabIndex={0} aria-label={copy.scrollBoard}>
        <div className={`shisen-shell ${missedTiles.length > 0 ? 'miss-reaction' : ''}`} style={shellStyle}>
          <div className="shisen-mat" aria-hidden="true" />
          {displayBoard.tiles.map((tile, index) => {
            if (tile === null) {
              return null
            }
            const column = index % displayBoard.width
            const row = Math.floor(index / displayBoard.width)
            const tileStyle = {
              left: `${((column + 1) / (displayBoard.width + 2)) * 100}%`,
              top: `${((row + 1) / (displayBoard.height + 2)) * 100}%`,
              width: `${100 / (displayBoard.width + 2)}%`,
              height: `${100 / (displayBoard.height + 2)}%`,
            }
            const isHint = hint?.first === index || hint?.second === index
            const isMissed = missedTiles.includes(index)
            return (
              <button
                aria-label={preferences.language === 'ja'
                  ? `${TILE_LABELS.ja[tile]} 行${row + 1} 列${column + 1}`
                  : `${TILE_LABELS.en[tile]}, row ${row + 1}, column ${column + 1}`}
                aria-pressed={selected === index}
                className={`shisen-tile family-${Math.floor(tile / 9)} ${selected === index ? 'selected' : ''} ${isHint ? 'hint' : ''} ${isMissed ? 'missed' : ''}`}
                data-shisen-index={index}
                data-tooltip-disabled="true"
                key={index}
                onClick={() => selectTile(index)}
                style={tileStyle}
                type="button"
              >
                <span aria-hidden="true">{TILE_GLYPHS[tile]}</span>
              </button>
            )
          })}
          {path && !showInitialBoard ? (
            <svg
              aria-hidden="true"
              className="shisen-path"
              preserveAspectRatio="none"
              viewBox={`0 0 ${displayBoard.width + 2} ${displayBoard.height + 2}`}
            >
              <polyline
                pathLength={1}
                points={path.map((point) => `${point.x + 0.5},${point.y + 0.5}`).join(' ')}
              />
            </svg>
          ) : null}
        </div>
      </div>

      <div className={`game-message shisen-message ${board.status === 'won' ? 'success' : notice === 'miss' ? 'warning' : ''}`} aria-live="polite">
        {board.status === 'won' ? (
          <><strong>CLEAR!</strong><span>{copy.victoryMessage}</span></>
        ) : notice === 'miss' ? (
          <><strong>NO LINE</strong><span>{copy.missMessage}</span></>
        ) : notice === 'hint' ? (
          <><strong>HINT</strong><span>{copy.hintMessage}</span></>
        ) : session.shuffleCount > 0 ? (
          <><strong>RESHUFFLED</strong><span>{copy.reshuffledMessage}</span></>
        ) : (
          <><strong>PLAYING</strong><span>{copy.playingMessage}</span></>
        )}
      </div>
      {board.status === 'won' && !resultOpen ? (
        <ResultReopenButton onClick={() => setResultOpen(true)} />
      ) : null}
      <ResultModal
        grade={getShisenGrade(session)}
        onClose={() => {
          setResultOpen(false)
          setShowInitialBoard(true)
        }}
        onPrimary={() => startNewGame(board.difficulty)}
        open={resultOpen}
        primaryLabel={copy.nextBoard}
        shareAction={(
          <GameShareButton
            buttonLabel={copy.shareBoard}
            className="result-share-button"
            difficulty={board.difficulty}
            game="shisen"
            seed={board.seed}
            title={copy.title}
          />
        )}
        stats={[
          { label: 'TIME', value: formatElapsedTime(session.elapsedSeconds) },
          { label: 'DIFFICULTY', value: copy.difficulties[board.difficulty] },
          { label: 'PAIRS', value: String(session.removedPairs) },
          { label: 'RATING', value: String(session.initialRating) },
          { label: 'SHUFFLE', value: String(session.shuffleCount) },
        ]}
        subtitle={copy.subtitle}
        title={copy.titleClear}
      />
      <ConfirmationModal
        confirmLabel={copy.begin(pendingDifficulty ? copy.difficulties[pendingDifficulty] : '')}
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

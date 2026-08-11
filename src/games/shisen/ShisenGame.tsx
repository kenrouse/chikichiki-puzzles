import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Lightbulb, RefreshCw, RotateCcw, Shuffle } from 'lucide-react'
import { formatElapsedTime, useStoredState } from '../../lib/storage'
import {
  createShisenBoard,
  findShisenHint,
  removeShisenPair,
  reshuffleShisen,
  type ShisenBoard,
  type ShisenPair,
  type ShisenPoint,
} from './engine'

interface ShisenSession {
  board: ShisenBoard
  elapsedSeconds: number
  removedPairs: number
  shuffleCount: number
}

const TILE_GLYPHS = [
  '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏',
  '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘',
  '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡',
  '🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆',
]

const TILE_LABELS = [
  '一萬', '二萬', '三萬', '四萬', '五萬', '六萬', '七萬', '八萬', '九萬',
  '一索', '二索', '三索', '四索', '五索', '六索', '七索', '八索', '九索',
  '一筒', '二筒', '三筒', '四筒', '五筒', '六筒', '七筒', '八筒', '九筒',
  '東', '南', '西', '北', '中', '發', '白',
]

function createSession(): ShisenSession {
  return {
    board: createShisenBoard(Date.now() >>> 0),
    elapsedSeconds: 0,
    removedPairs: 0,
    shuffleCount: 0,
  }
}

export function ShisenGame() {
  const [session, setSession] = useStoredState<ShisenSession>(
    'chikichiki:shisen:v1',
    createSession,
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [hint, setHint] = useState<ShisenPair | null>(null)
  const [path, setPath] = useState<ShisenPoint[] | null>(null)
  const [history, setHistory] = useState<ShisenBoard[]>([])
  const [notice, setNotice] = useState<'playing' | 'miss' | 'hint'>('playing')
  const pathTimer = useRef<number | null>(null)
  const board = session.board
  const remaining = board.tiles.filter((tile) => tile !== null).length

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

  useEffect(
    () => () => {
      if (pathTimer.current !== null) {
        window.clearTimeout(pathTimer.current)
      }
    },
    [],
  )

  function startNewGame(): void {
    setSession(createSession())
    setSelected(null)
    setHint(null)
    setPath(null)
    setHistory([])
    setNotice('playing')
  }

  function selectTile(index: number): void {
    if (board.status === 'won' || board.tiles[index] === null) {
      return
    }
    setHint(null)
    if (selected === null) {
      setSelected(index)
      setNotice('playing')
      return
    }
    if (selected === index) {
      setSelected(null)
      return
    }

    const result = removeShisenPair(board, selected, index)
    if (!result.path) {
      setSelected(index)
      setNotice('miss')
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
    setPath(result.path)
    navigator.vibrate?.(20)
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
  }

  const shellStyle = {
    '--shisen-columns': board.width + 2,
    '--shisen-rows': board.height + 2,
  } as CSSProperties

  return (
    <section className="game-workspace shisen-workspace" aria-labelledby="shisen-title">
      <header className="game-heading">
        <div>
          <p className="eyebrow">2009 / FOR YUKA</p>
          <h1 id="shisen-title">四川省</h1>
        </div>
        <div className="game-metrics" aria-label="ゲーム情報">
          <span><strong>{formatElapsedTime(session.elapsedSeconds)}</strong> TIME</span>
          <span><strong>{remaining}</strong> LEFT</span>
          <span><strong>{session.removedPairs}</strong> PAIR</span>
        </div>
      </header>

      <div className="difficulty-row shisen-controls">
        <p>同じ牌を、2回以内に曲がる線で結びます。</p>
        <div className="toolbar-inline">
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
            aria-label="ヒント"
            onClick={showHint}
            title="消せる牌を表示"
            type="button"
          >
            <Lightbulb aria-hidden="true" />
          </button>
          <button
            aria-label="残りの牌を並べ替える"
            onClick={shuffleRemaining}
            title="必ず解ける配置へ並べ替え"
            type="button"
          >
            <Shuffle aria-hidden="true" />
          </button>
          <button className="command-button" onClick={startNewGame} type="button">
            <RefreshCw aria-hidden="true" size={17} /> 新しい配牌
          </button>
        </div>
      </div>

      <div className="shisen-scroll" tabIndex={0} aria-label="スクロール可能な四川省盤面">
        <div className="shisen-shell" style={shellStyle}>
          <div className="shisen-mat" aria-hidden="true" />
          {board.tiles.map((tile, index) => {
            if (tile === null) {
              return null
            }
            const column = index % board.width
            const row = Math.floor(index / board.width)
            const tileStyle = {
              left: `${((column + 1) / (board.width + 2)) * 100}%`,
              top: `${((row + 1) / (board.height + 2)) * 100}%`,
              width: `${100 / (board.width + 2)}%`,
              height: `${100 / (board.height + 2)}%`,
            }
            const isHint = hint?.first === index || hint?.second === index
            return (
              <button
                aria-label={`${TILE_LABELS[tile]} 行${row + 1} 列${column + 1}`}
                aria-pressed={selected === index}
                className={`shisen-tile family-${Math.floor(tile / 9)} ${selected === index ? 'selected' : ''} ${isHint ? 'hint' : ''}`}
                key={index}
                onClick={() => selectTile(index)}
                style={tileStyle}
                type="button"
              >
                <span aria-hidden="true">{TILE_GLYPHS[tile]}</span>
              </button>
            )
          })}
          {path ? (
            <svg
              aria-hidden="true"
              className="shisen-path"
              preserveAspectRatio="none"
              viewBox={`0 0 ${board.width + 2} ${board.height + 2}`}
            >
              <polyline
                points={path.map((point) => `${point.x + 0.5},${point.y + 0.5}`).join(' ')}
              />
            </svg>
          ) : null}
        </div>
      </div>

      <div className={`game-message shisen-message ${board.status === 'won' ? 'success' : notice === 'miss' ? 'warning' : ''}`} aria-live="polite">
        {board.status === 'won' ? (
          <><strong>CLEAR!</strong><span>136枚、すべて取り切りました。</span></>
        ) : notice === 'miss' ? (
          <><strong>NO LINE</strong><span>その2枚は結べません。次の牌を選びました。</span></>
        ) : notice === 'hint' ? (
          <><strong>HINT</strong><span>光っている2枚を消せます。</span></>
        ) : session.shuffleCount > 0 ? (
          <><strong>RESHUFFLED</strong><span>残りの牌を解ける配置へ並べ替えました。</span></>
        ) : (
          <><strong>PLAYING</strong><span>盤外を通る経路も使えます。</span></>
        )}
      </div>
    </section>
  )
}
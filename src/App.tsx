import { useEffect, useState } from 'react'
import {
  Bomb,
  Code2,
  Download,
  Grid3X3,
  LayoutGrid,
  Moon,
  RefreshCw,
  Sun,
  X,
} from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { MinesweeperGame } from './games/minesweeper/MinesweeperGame'
import { ShisenGame } from './games/shisen/ShisenGame'
import { SudokuGame } from './games/sudoku/SudokuGame'
import { useStoredState } from './lib/storage'
import './App.css'

type GameId = 'sudoku' | 'minesweeper' | 'shisen'
type Theme = 'light' | 'dark'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const GAMES = [
  { id: 'sudoku' as const, label: '数独', years: '2006 / 2011', icon: Grid3X3 },
  { id: 'minesweeper' as const, label: 'マインスイーパ', years: '2007', icon: Bomb },
  { id: 'shisen' as const, label: '四川省', years: '2009', icon: LayoutGrid },
]

function readGameFromHash(): GameId {
  const candidate = window.location.hash.replace(/^#\/?/, '')
  return GAMES.some((game) => game.id === candidate)
    ? (candidate as GameId)
    : 'sudoku'
}

function PwaStatus() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh && !offlineReady) {
    return null
  }

  return (
    <div className="pwa-toast" role="status">
      <div>
        <strong>{needRefresh ? '更新があります' : 'オフライン準備完了'}</strong>
        <span>
          {needRefresh
            ? '新しい版へ切り替えられます。'
            : '次回から通信なしでも遊べます。'}
        </span>
      </div>
      {needRefresh ? (
        <button
          aria-label="アプリを更新"
          onClick={() => updateServiceWorker(true)}
          title="更新"
          type="button"
        >
          <RefreshCw aria-hidden="true" />
        </button>
      ) : null}
      <button
        aria-label="通知を閉じる"
        onClick={() => {
          setNeedRefresh(false)
          setOfflineReady(false)
        }}
        title="閉じる"
        type="button"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  )
}

function App() {
  const [activeGame, setActiveGame] = useState<GameId>(readGameFromHash)
  const [theme, setTheme] = useStoredState<Theme>('chikichiki:theme:v1', () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const handleHashChange = () => setActiveGame(readGameFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () =>
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  function selectGame(game: GameId): void {
    window.location.hash = `/${game}`
    setActiveGame(game)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function installApp(): Promise<void> {
    if (!installPrompt) {
      return
    }
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#/sudoku" onClick={() => selectGame('sudoku')}>
          <img alt="" src={`${import.meta.env.BASE_URL}puzzle-mark.svg`} />
          <span>
            <strong>CHIKICHIKI</strong>
            <small>PUZZLES / REBUILT 2026</small>
          </span>
        </a>

        <nav aria-label="ゲーム選択" className="game-tabs" role="tablist">
          {GAMES.map((game) => {
            const Icon = game.icon
            return (
              <button
                aria-selected={activeGame === game.id}
                className={activeGame === game.id ? 'active' : ''}
                key={game.id}
                onClick={() => selectGame(game.id)}
                role="tab"
                type="button"
              >
                <Icon aria-hidden="true" />
                <span>{game.label}<small>{game.years}</small></span>
              </button>
            )
          })}
        </nav>

        <div className="app-utilities">
          {installPrompt ? (
            <button
              aria-label="アプリをインストール"
              onClick={installApp}
              title="この端末にインストール"
              type="button"
            >
              <Download aria-hidden="true" />
            </button>
          ) : null}
          <button
            aria-label={theme === 'dark' ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え'}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            title="テーマ切り替え"
            type="button"
          >
            {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <a
            aria-label="GitHubでソースコードを開く"
            href="https://github.com/kenrouse/chikichiki-puzzles"
            rel="noreferrer"
            target="_blank"
            title="GitHub"
          >
            <Code2 aria-hidden="true" />
          </a>
        </div>
      </header>

      <main>
        {activeGame === 'sudoku' ? <SudokuGame /> : null}
        {activeGame === 'minesweeper' ? <MinesweeperGame /> : null}
        {activeGame === 'shisen' ? <ShisenGame /> : null}
      </main>

      <footer className="app-footer">
        <span>ORIGINAL i-APPLI: 2006–2009</span>
        <span>OFFLINE READY / NO TRACKING / LOCAL SAVE</span>
      </footer>
      <PwaStatus />
    </div>
  )
}

export default App

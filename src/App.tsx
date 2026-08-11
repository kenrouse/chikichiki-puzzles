import { useEffect, useState } from 'react'
import {
  Bomb,
  BookOpen,
  Code2,
  Download,
  Focus,
  Grid3X3,
  LayoutGrid,
  Maximize2,
  Minimize2,
  RefreshCw,
  X,
} from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import {
  InteractionEffects,
  SettingsButton,
  SettingsPanel,
  useAppExperience,
} from './experience/20260811_AppExperience'
import { MinesweeperGame } from './games/minesweeper/MinesweeperGame'
import { ShisenGame } from './games/shisen/ShisenGame'
import { SudokuGame } from './games/sudoku/SudokuGame'
import { GuidePage } from './pages/20260811_GuidePage'
import { TitlePage, type TitleGameId } from './pages/20260811_TitlePage'
import './App.css'

type GameId = 'sudoku' | 'minesweeper' | 'shisen'
type ViewId = GameId | 'guide' | 'home'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const GAMES = [
  { id: 'sudoku' as const, label: '数独', years: '2006 / 2011', icon: Grid3X3 },
  { id: 'minesweeper' as const, label: 'マインスイーパ', years: '2007', icon: Bomb },
  { id: 'shisen' as const, label: '四川省', years: '2009', icon: LayoutGrid },
]

function readViewFromHash(hash: string): ViewId {
  const candidate = hash.replace(/^#\/?/, '').split('?', 1)[0]
  if (!candidate) {
    return 'home'
  }
  if (candidate === 'guide') {
    return 'guide'
  }
  return GAMES.some((game) => game.id === candidate)
    ? (candidate as GameId)
    : 'home'
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
        type="button"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  )
}

function App() {
  const [locationHash, setLocationHash] = useState(window.location.hash)
  const activeView = readViewFromHash(locationHash)
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [fullscreenActive, setFullscreenActive] = useState(
    Boolean(document.fullscreenElement),
  )
  const { playEffect } = useAppExperience()
  const gameActive = GAMES.some((game) => game.id === activeView)
  const focusActive = focusMode && gameActive
  const fullscreenSupported =
    typeof document.documentElement.requestFullscreen === 'function' &&
    typeof document.exitFullscreen === 'function'

  useEffect(() => {
    const handleHashChange = () => {
      setLocationHash(window.location.hash)
      setFocusMode(false)
      if (document.fullscreenElement) {
        void document.exitFullscreen()
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () =>
      setFullscreenActive(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () =>
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  function selectView(view: ViewId): void {
    const nextHash = view === 'home' ? '#/' : `#/${view}`
    if (window.location.hash === nextHash) {
      setLocationHash(nextHash)
    } else {
      window.location.hash = nextHash
    }
    playEffect('select')
    setFocusMode(false)
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function enterFocusMode(): void {
    setFocusMode(true)
    playEffect('select')
    window.requestAnimationFrame(() => window.scrollTo({ top: 0 }))
  }

  async function leaveFocusMode(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
    setFocusMode(false)
    playEffect('select')
  }

  async function toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
      setFullscreenActive(Boolean(document.fullscreenElement))
    } catch {
      playEffect('error')
    }
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
    <div className={`app-shell ${focusActive ? 'focus-mode' : ''}`}>
      <InteractionEffects />
      {focusActive ? (
        <div aria-label="集中モード" className="focus-mode-controls" role="toolbar">
          <button
            aria-label="集中モードを終了"
            data-tooltip="通常の画面表示へ戻る"
            onClick={() => void leaveFocusMode()}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
          {fullscreenSupported ? (
            <button
              aria-label={fullscreenActive ? '全画面表示を終了' : 'ブラウザー全画面で表示'}
              data-tooltip={fullscreenActive ? '全画面表示を終了' : 'ブラウザー全画面で表示'}
              onClick={() => void toggleFullscreen()}
              type="button"
            >
              {fullscreenActive ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
            </button>
          ) : null}
        </div>
      ) : null}
      <header className="app-header">
        <a
          className="brand"
          href="#/"
          onClick={(event) => {
            event.preventDefault()
            selectView('home')
          }}
        >
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
                aria-selected={activeView === game.id}
                className={activeView === game.id ? 'active' : ''}
                key={game.id}
                onClick={() => selectView(game.id)}
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
          {gameActive ? (
            <button
              aria-label="集中モードを開始"
              data-tooltip="周辺UIを隠して盤面を広く表示"
              onClick={enterFocusMode}
              type="button"
            >
              <Focus aria-hidden="true" />
            </button>
          ) : null}
          {installPrompt ? (
            <button
              aria-label="アプリをインストール"
              onClick={installApp}
              type="button"
            >
              <Download aria-hidden="true" />
            </button>
          ) : null}
          <button
            aria-label="ゲーム制作ノート"
            className={activeView === 'guide' ? 'active' : ''}
            data-tooltip="生成アルゴリズムと難易度設計"
            onClick={() => selectView('guide')}
            type="button"
          >
            <BookOpen aria-hidden="true" />
          </button>
          <SettingsButton onClick={() => setSettingsOpen(true)} />
          <a
            aria-label="GitHubでソースコードを開く"
            href="https://github.com/kenrouse/chikichiki-puzzles"
            rel="noreferrer"
            target="_blank"
          >
            <Code2 aria-hidden="true" />
          </a>
        </div>
      </header>

      <main>
        {activeView === 'home' ? (
          <TitlePage onSelect={(game: TitleGameId) => selectView(game)} />
        ) : null}
        {activeView === 'sudoku' ? <SudokuGame key={locationHash} /> : null}
        {activeView === 'minesweeper' ? <MinesweeperGame key={locationHash} /> : null}
        {activeView === 'shisen' ? <ShisenGame key={locationHash} /> : null}
        {activeView === 'guide' ? <GuidePage onBack={() => selectView('home')} /> : null}
      </main>

      <footer className="app-footer">
        <span>ORIGINAL i-APPLI: 2006–2009</span>
        <button onClick={() => selectView('guide')} type="button">ゲーム制作ノート</button>
        <span>OFFLINE READY / NO TRACKING / LOCAL SAVE</span>
      </footer>
      <SettingsPanel onClose={() => setSettingsOpen(false)} open={settingsOpen} />
      <PwaStatus />
    </div>
  )
}

export default App

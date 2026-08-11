import { useEffect, useState } from 'react'
import {
  Bomb,
  BookOpen,
  Code2,
  Download,
  Grid3X3,
  LayoutGrid,
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
import './App.css'

type GameId = 'sudoku' | 'minesweeper' | 'shisen'
type ViewId = GameId | 'guide'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const GAMES = [
  { id: 'sudoku' as const, label: '数独', years: '2006 / 2011', icon: Grid3X3 },
  { id: 'minesweeper' as const, label: 'マインスイーパ', years: '2007', icon: Bomb },
  { id: 'shisen' as const, label: '四川省', years: '2009', icon: LayoutGrid },
]

function readViewFromHash(): ViewId {
  const candidate = window.location.hash.replace(/^#\/?/, '').split('?', 1)[0]
  if (candidate === 'guide') {
    return 'guide'
  }
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
  const [activeView, setActiveView] = useState<ViewId>(readViewFromHash)
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { playEffect } = useAppExperience()

  useEffect(() => {
    const handleHashChange = () => setActiveView(readViewFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
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
    window.location.hash = `/${view}`
    setActiveView(view)
    playEffect('select')
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
      <InteractionEffects />
      <header className="app-header">
        <a className="brand" href="#/sudoku" onClick={() => selectView('sudoku')}>
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
            aria-label="ゲーム制作ノート"
            className={activeView === 'guide' ? 'active' : ''}
            data-tooltip="生成アルゴリズムと難易度設計"
            onClick={() => selectView('guide')}
            title="ゲーム制作ノート"
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
            title="GitHub"
          >
            <Code2 aria-hidden="true" />
          </a>
        </div>
      </header>

      <main>
        {activeView === 'sudoku' ? <SudokuGame /> : null}
        {activeView === 'minesweeper' ? <MinesweeperGame /> : null}
        {activeView === 'shisen' ? <ShisenGame /> : null}
        {activeView === 'guide' ? <GuidePage onBack={() => selectView('sudoku')} /> : null}
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

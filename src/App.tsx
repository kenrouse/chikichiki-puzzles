import { useEffect, useState } from 'react'
import {
  Bomb,
  BookOpen,
  Code2,
  Download,
  Focus,
  Grid3X3,
  Languages,
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
import { getLocalizedCopy } from './i18n/20260812_i18n'
import './App.css'

type GameId = 'sudoku' | 'minesweeper' | 'shisen'
type ViewId = GameId | 'guide' | 'home'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const GAMES = [
  { id: 'sudoku' as const, years: '2006 / 2011', icon: Grid3X3 },
  { id: 'minesweeper' as const, years: '2007', icon: Bomb },
  { id: 'shisen' as const, years: '2009', icon: LayoutGrid },
]

const APP_COPY = {
  ja: {
    closeNotification: '通知を閉じる',
    enterFocus: '集中モードを開始',
    exitFocus: '集中モードを終了',
    exitFocusTooltip: '通常の画面表示へ戻る',
    exitFullscreen: '全画面表示を終了',
    footerGuide: 'ゲーム制作ノート',
    gameLabels: { minesweeper: 'マインスイーパ', shisen: '四川省', sudoku: '数独' },
    gameNavigation: 'ゲーム選択',
    github: 'GitHubでソースコードを開く',
    guide: 'ゲーム制作ノート',
    guideTooltip: '生成アルゴリズムと難易度設計',
    install: 'アプリをインストール',
    offlineReady: 'オフライン準備完了',
    offlineReadyMessage: '次回から通信なしでも遊べます。',
    openFullscreen: 'ブラウザー全画面で表示',
    startFocusTooltip: '周辺UIを隠して盤面を広く表示',
    switchLanguage: 'Switch to English',
    update: 'アプリを更新',
    updateAvailable: '更新があります',
    updateMessage: '新しい版へ切り替えられます。',
  },
  en: {
    closeNotification: 'Close notification',
    enterFocus: 'Enter focus mode',
    exitFocus: 'Exit focus mode',
    exitFocusTooltip: 'Return to the standard layout',
    exitFullscreen: 'Exit fullscreen',
    footerGuide: 'Game design notes',
    gameLabels: { minesweeper: 'Minesweeper', shisen: 'Shisen-Sho', sudoku: 'Sudoku' },
    gameNavigation: 'Choose a game',
    github: 'Open source code on GitHub',
    guide: 'Game design notes',
    guideTooltip: 'Generation algorithms and difficulty design',
    install: 'Install app',
    offlineReady: 'Ready offline',
    offlineReadyMessage: 'You can play without a connection next time.',
    openFullscreen: 'Open browser fullscreen',
    startFocusTooltip: 'Hide surrounding UI and enlarge the board',
    switchLanguage: '日本語に切り替え',
    update: 'Update app',
    updateAvailable: 'Update available',
    updateMessage: 'A new version is ready.',
  },
} as const

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
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, APP_COPY)
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
        <strong>{needRefresh ? copy.updateAvailable : copy.offlineReady}</strong>
        <span>
          {needRefresh
            ? copy.updateMessage
            : copy.offlineReadyMessage}
        </span>
      </div>
      {needRefresh ? (
        <button
          aria-label={copy.update}
          onClick={() => updateServiceWorker(true)}
          type="button"
        >
          <RefreshCw aria-hidden="true" />
        </button>
      ) : null}
      <button
        aria-label={copy.closeNotification}
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
  const { playEffect, preferences, setLanguage } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, APP_COPY)
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
    document.title = preferences.language === 'ja'
      ? 'ちきちきパズルズ'
      : 'Chikichiki Puzzles'
  }, [preferences.language])

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
        <div aria-label={copy.enterFocus} className="focus-mode-controls" role="toolbar">
          <button
            aria-label={copy.exitFocus}
            data-tooltip={copy.exitFocusTooltip}
            onClick={() => void leaveFocusMode()}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
          {fullscreenSupported ? (
            <button
              aria-label={fullscreenActive ? copy.exitFullscreen : copy.openFullscreen}
              data-tooltip={fullscreenActive ? copy.exitFullscreen : copy.openFullscreen}
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

        <nav aria-label={copy.gameNavigation} className="game-tabs" role="tablist">
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
                <span>{copy.gameLabels[game.id]}<small>{game.years}</small></span>
              </button>
            )
          })}
        </nav>

        <div className="app-utilities">
          {gameActive ? (
            <button
              aria-label={copy.enterFocus}
              data-tooltip={copy.startFocusTooltip}
              onClick={enterFocusMode}
              type="button"
            >
              <Focus aria-hidden="true" />
            </button>
          ) : null}
          {installPrompt ? (
            <button
              aria-label={copy.install}
              onClick={installApp}
              type="button"
            >
              <Download aria-hidden="true" />
            </button>
          ) : null}
          <button
            aria-label={copy.switchLanguage}
            className="language-switch-button"
            data-tooltip={copy.switchLanguage}
            onClick={() => setLanguage(preferences.language === 'ja' ? 'en' : 'ja')}
            type="button"
          >
            <Languages aria-hidden="true" />
            <span>{preferences.language.toUpperCase()}</span>
          </button>
          <button
            aria-label={copy.guide}
            className={activeView === 'guide' ? 'active' : ''}
            data-tooltip={copy.guideTooltip}
            onClick={() => selectView('guide')}
            type="button"
          >
            <BookOpen aria-hidden="true" />
          </button>
          <SettingsButton onClick={() => setSettingsOpen(true)} />
          <a
            aria-label={copy.github}
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
        <button onClick={() => selectView('guide')} type="button">{copy.footerGuide}</button>
        <span>OFFLINE READY / NO TRACKING / LOCAL SAVE</span>
      </footer>
      <SettingsPanel onClose={() => setSettingsOpen(false)} open={settingsOpen} />
      <PwaStatus />
    </div>
  )
}

export default App

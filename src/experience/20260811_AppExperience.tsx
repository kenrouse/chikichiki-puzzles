/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import {
  FlaskConical,
  Gamepad2,
  Languages,
  Music2,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from 'lucide-react'
import { useStoredState } from '../lib/storage'
import { useDialogFocus } from '../lib/20260811_dialogFocus'
import { getLocalizedCopy, type AppLanguage } from '../i18n/20260812_i18n'
import { getBgmGain } from './20260811_audio'
import {
  MINE_GUESS_FREE_PREFERENCE_KEY,
  readMineGuessFreePreference,
} from './20260812_gamePreferences'
import { resolveTooltipText } from './20260812_tooltipPolicy'

export type Appearance = 'light' | 'dark'
export type ColorTheme = 'archive' | 'ocean' | 'sakura' | 'arcade'
export type SoundEffect =
  | 'clear'
  | 'countdown'
  | 'error'
  | 'flag'
  | 'hint'
  | 'match'
  | 'place'
  | 'reveal'
  | 'select'
  | 'start'
  | 'undo'

interface AppPreferences {
  appearance: Appearance
  bgmEnabled: boolean
  bgmVolume: number
  colorTheme: ColorTheme
  effectsEnabled: boolean
  language: AppLanguage
  penStabilizationEnabled: boolean
  pointerMarkerEnabled: boolean
  sfxEnabled: boolean
  sfxVolume: number
  sudokuPreviewVariantsEnabled: boolean
  tooltipsEnabled: boolean
}

interface ExperienceContextValue {
  mineGuessFreeEnabled: boolean
  playEffect: (effect: SoundEffect) => void
  preferences: AppPreferences
  setAppearance: (appearance: Appearance) => void
  setBgmEnabled: (enabled: boolean) => void
  setBgmVolume: (volume: number) => void
  setColorTheme: (theme: ColorTheme) => void
  setEffectsEnabled: (enabled: boolean) => void
  setLanguage: (language: AppLanguage) => void
  setMineGuessFreeEnabled: (enabled: boolean) => void
  setPenStabilizationEnabled: (enabled: boolean) => void
  setPointerMarkerEnabled: (enabled: boolean) => void
  setSfxEnabled: (enabled: boolean) => void
  setSfxVolume: (volume: number) => void
  setSudokuPreviewVariantsEnabled: (enabled: boolean) => void
  setTooltipsEnabled: (enabled: boolean) => void
}

interface ResultStat {
  label: string
  value: string
}

interface ResultModalProps {
  grade: string
  onClose: () => void
  onPrimary: () => void
  open: boolean
  primaryLabel: string
  rankProgress?: {
    heading: string
    message: string
  }
  shareAction?: ReactNode
  stats: ResultStat[]
  subtitle: string
  title: string
}

interface ConfirmationModalProps {
  confirmLabel: string
  message: string
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null)

const THEMES: Array<{
  colors: [string, string, string]
  id: ColorTheme
  label: Record<AppLanguage, string>
}> = [
  { id: 'archive', label: { ja: 'アーカイブ', en: 'Archive' }, colors: ['#173f37', '#efb23d', '#d9674d'] },
  { id: 'ocean', label: { ja: 'オーシャン', en: 'Ocean' }, colors: ['#154c79', '#55b7c5', '#f0bd55'] },
  { id: 'sakura', label: { ja: 'サクラ', en: 'Sakura' }, colors: ['#713d51', '#dc8e9f', '#87a88a'] },
  { id: 'arcade', label: { ja: 'アーケード', en: 'Arcade' }, colors: ['#272445', '#46c6a8', '#f15b76'] },
]

const BGM_NOTES = [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66]

const EXPERIENCE_COPY = {
  ja: {
    animations: 'アニメーションと追加リアクション',
    animationsTooltip: 'カウントダウン、結果演出、操作時の動きをまとめて切り替えます。',
    appearance: '明るさ',
    bgmPlaying: 'プレイ中のBGM',
    bgmTooltip: 'ゲーム中のBGMを切り替えます。音量は下のスライダーで調整できます。',
    bgmVolume: 'BGM音量',
    cancel: 'キャンセル',
    closeResults: '成績画面を閉じる',
    closeSettings: '設定を閉じる',
    colorTheme: 'カラーテーマ',
    dark: 'ダーク',
    displayEffects: '画面演出',
    english: 'English',
    grade: '評価',
    gameSettings: 'ゲーム設定',
    japanese: '日本語',
    language: '表示言語',
    light: 'ライト',
    mineGuessFree: 'マインスイーパの推測不要',
    mineGuessFreeDescription: 'ONでは論理だけで解ける盤面、OFFでは推測が必要な場合があるクラシック盤面を生成します。次の盤面から適用されます。',
    mineGuessFreeTooltip: '切り替えても現在の盤面は変わりません。[新しい盤面]または難易度変更後に適用します。',
    penStabilization: 'ペン入力を安定化',
    penTooltip: 'ペンでゲームを操作している間、ゲーム内ボタン上のスクロールを抑止します',
    pointerMarker: 'マウス位置の丸いマーカー',
    pointerMarkerTooltip: 'マウスやペンの操作位置を一時的な丸いマーカーで示します。',
    previewFeatures: 'プレビュー機能',
    resultReopen: '成績を見る',
    settings: '設定',
    settingsLabel: 'アプリ設定',
    settingsTooltip: '言語、テーマ、サウンド、ゲーム設定、プレビュー機能を開きます。',
    sfx: '効果音',
    sfxPlaying: '操作と結果の効果音',
    sfxTooltip: '数字入力、牌の選択、クリアなどの操作音を切り替えます。',
    sfxVolume: '効果音量',
    tooltips: '操作要素のツールチップ',
    tooltipsTooltip: 'マウスを重ねた時とキーボードでフォーカスした時の補足説明を切り替えます。',
    sudokuPreviewDescription: '評価中のキラーと対称を問題タイプに表示します。',
    sudokuPreviewTooltip: '有効にすると数独画面へ問題タイプの選択肢を追加します。現在の盤面は変わりません。',
    sudokuPreviewVariants: '数独のプレビュー問題',
    viewBoard: '盤面を見る',
    volume: '音量',
  },
  en: {
    animations: 'Animations and extra reactions',
    animationsTooltip: 'Toggle countdown, result, and interaction motion together.',
    appearance: 'Brightness',
    bgmPlaying: 'Background music while playing',
    bgmTooltip: 'Toggle music during play. Use the slider below to adjust its volume.',
    bgmVolume: 'BGM volume',
    cancel: 'Cancel',
    closeResults: 'Close results',
    closeSettings: 'Close settings',
    colorTheme: 'Color theme',
    dark: 'Dark',
    displayEffects: 'Visual effects',
    english: 'English',
    grade: 'Grade',
    gameSettings: 'Game settings',
    japanese: '日本語',
    language: 'Language',
    light: 'Light',
    mineGuessFree: 'Guess-free Minesweeper',
    mineGuessFreeDescription: 'On generates boards solvable by logic alone. Off uses classic boards that may require guessing. Applies to the next board.',
    mineGuessFreeTooltip: 'Changing this does not replace the current board. It applies after New board or a difficulty change.',
    penStabilization: 'Stabilize pen input',
    penTooltip: 'Prevents browser scrolling over game controls while you are using a pen',
    pointerMarker: 'Pointer position marker',
    pointerMarkerTooltip: 'Show a temporary circular marker at mouse and pen interaction points.',
    previewFeatures: 'Preview features',
    resultReopen: 'View results',
    settings: 'Settings',
    settingsLabel: 'App settings',
    settingsTooltip: 'Open language, theme, sound, game, and preview settings.',
    sfx: 'Sound effects',
    sfxPlaying: 'Sounds for actions and results',
    sfxTooltip: 'Toggle sounds for number entry, tile selection, clearing a game, and other actions.',
    sfxVolume: 'Sound effect volume',
    tooltips: 'Tooltips for controls',
    tooltipsTooltip: 'Toggle extra explanations shown on pointer hover and keyboard focus.',
    sudokuPreviewDescription: 'Shows the Killer and Symmetric puzzle types currently under evaluation.',
    sudokuPreviewTooltip: 'Adds puzzle type choices to Sudoku without replacing the current puzzle.',
    sudokuPreviewVariants: 'Sudoku preview puzzles',
    viewBoard: 'View board',
    volume: 'Volume',
  },
} as const

function readInitialPreferences(): AppPreferences {
  let appearance: Appearance = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
  try {
    const previousTheme = window.localStorage.getItem('chikichiki:theme:v1')
    if (previousTheme) {
      appearance = JSON.parse(previousTheme) as Appearance
    }
  } catch {
    // Keep the system preference when migration data is unavailable.
  }
  const defaults: AppPreferences = {
    appearance,
    bgmEnabled: false,
    bgmVolume: 0.32,
    colorTheme: 'archive',
    effectsEnabled: true,
    language: navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en',
    penStabilizationEnabled: true,
    pointerMarkerEnabled: false,
    sfxEnabled: true,
    sfxVolume: 0.58,
    sudokuPreviewVariantsEnabled: false,
    tooltipsEnabled: true,
  }
  try {
    const currentPreferences =
      window.localStorage.getItem('chikichiki:preferences:v7') ??
      window.localStorage.getItem('chikichiki:preferences:v6') ??
      window.localStorage.getItem('chikichiki:preferences:v5') ??
      window.localStorage.getItem('chikichiki:preferences:v4')
    if (currentPreferences) {
      return {
        ...defaults,
        ...(JSON.parse(currentPreferences) as Partial<AppPreferences>),
      }
    }
    const previousPreferences =
      window.localStorage.getItem('chikichiki:preferences:v3') ??
      window.localStorage.getItem('chikichiki:preferences:v2')
    if (previousPreferences) {
      return {
        ...defaults,
        ...(JSON.parse(previousPreferences) as Partial<AppPreferences>),
        pointerMarkerEnabled: false,
      }
    }
  } catch {
    // Use defaults when the previous settings cannot be migrated.
  }
  return defaults
}

function createTone(
  context: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  delay = 0,
): void {
  if (context.state !== 'running') {
    return
  }
  const start = context.currentTime + delay
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

function createBgmTone(
  context: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  output: AudioNode,
  type: OscillatorType,
): void {
  if (context.state !== 'running') {
    return
  }
  const start = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.035)
  gain.gain.exponentialRampToValueAtTime(volume * 0.55, start + duration * 0.72)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(output)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export function AppExperienceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useStoredState<AppPreferences>(
    'chikichiki:preferences:v8',
    readInitialPreferences,
  )
  const [audioRevision, setAudioRevision] = useState(0)
  const [mineGuessFreeEnabled, setMineGuessFreeEnabled] =
    useStoredState<boolean>(
      MINE_GUESS_FREE_PREFERENCE_KEY,
      readMineGuessFreePreference,
    )
  const audioContext = useRef<AudioContext | null>(null)
  const bgmMasterGain = useRef<GainNode | null>(null)
  const bgmStep = useRef(0)

  const ensureAudio = useCallback(async (): Promise<AudioContext | null> => {
    if (!audioContext.current || audioContext.current.state === 'closed') {
      const AudioContextClass = window.AudioContext
      if (!AudioContextClass) {
        return null
      }
      const context = new AudioContextClass()
      const masterGain = context.createGain()
      const compressor = context.createDynamicsCompressor()
      masterGain.gain.value = 0
      compressor.threshold.value = -10
      compressor.knee.value = 12
      compressor.ratio.value = 8
      compressor.attack.value = 0.004
      compressor.release.value = 0.18
      masterGain.connect(compressor)
      compressor.connect(context.destination)
      audioContext.current = context
      bgmMasterGain.current = masterGain
      setAudioRevision((current) => current + 1)
    }
    if (audioContext.current.state === 'suspended') {
      try {
        await audioContext.current.resume()
        setAudioRevision((current) => current + 1)
      } catch {
        return null
      }
    }
    return audioContext.current
  }, [])

  function updatePreferences(patch: Partial<AppPreferences>): void {
    setPreferences((current) => ({ ...current, ...patch }))
  }

  function setBgmEnabled(enabled: boolean): void {
    if (enabled) {
      void ensureAudio()
    }
    updatePreferences({ bgmEnabled: enabled })
  }

  const playEffect = useCallback((effect: SoundEffect): void => {
    if (!preferences.sfxEnabled || preferences.sfxVolume <= 0) {
      return
    }
    void ensureAudio().then((context) => {
      if (!context || context.state !== 'running') {
        return
      }
      const volume = preferences.sfxVolume * 0.14
      const tone = (frequency: number, duration: number, delay = 0) =>
        createTone(context, frequency, duration, volume, 'triangle', delay)
      switch (effect) {
        case 'select':
          tone(520, 0.055)
          break
        case 'place':
          tone(660, 0.08)
          tone(880, 0.07, 0.045)
          break
        case 'reveal':
          tone(330, 0.06)
          break
        case 'flag':
          tone(220, 0.07)
          tone(440, 0.08, 0.045)
          break
        case 'match':
          tone(523.25, 0.11)
          tone(783.99, 0.14, 0.07)
          break
        case 'hint':
          tone(740, 0.1)
          tone(988, 0.16, 0.08)
          break
        case 'undo':
          tone(520, 0.07)
          tone(360, 0.1, 0.05)
          break
        case 'error':
          createTone(context, 145, 0.18, volume * 1.2, 'sawtooth')
          break
        case 'countdown':
          tone(440, 0.1)
          break
        case 'start':
          tone(523.25, 0.1)
          tone(659.25, 0.1, 0.07)
          tone(783.99, 0.16, 0.14)
          break
        case 'clear':
          tone(523.25, 0.16)
          tone(659.25, 0.16, 0.1)
          tone(783.99, 0.16, 0.2)
          tone(1046.5, 0.28, 0.3)
          break
      }
    })
  }, [ensureAudio, preferences.sfxEnabled, preferences.sfxVolume])

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.appearance
    document.documentElement.lang = preferences.language
    document.documentElement.dataset.colorTheme = preferences.colorTheme
    document.documentElement.dataset.effects = preferences.effectsEnabled ? 'on' : 'off'
    document.documentElement.dataset.penStabilization =
      preferences.penStabilizationEnabled ? 'on' : 'off'
    document.documentElement.dataset.pointerMarker = preferences.pointerMarkerEnabled
      ? 'on'
      : 'off'
  }, [
    preferences.appearance,
    preferences.colorTheme,
    preferences.effectsEnabled,
    preferences.language,
    preferences.penStabilizationEnabled,
    preferences.pointerMarkerEnabled,
  ])

  useEffect(() => {
    if (!preferences.bgmEnabled) {
      return
    }
    const unlock = () => void ensureAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [ensureAudio, preferences.bgmEnabled])

  useEffect(() => {
    const context = audioContext.current
    const masterGain = bgmMasterGain.current
    if (!context || !masterGain || context.state !== 'running') {
      return
    }
    const target = preferences.bgmEnabled
      ? getBgmGain(preferences.bgmVolume)
      : 0
    masterGain.gain.cancelScheduledValues(context.currentTime)
    masterGain.gain.setTargetAtTime(target, context.currentTime, 0.025)
  }, [audioRevision, preferences.bgmEnabled, preferences.bgmVolume])

  useEffect(() => {
    const context = audioContext.current
    const masterGain = bgmMasterGain.current
    if (
      !preferences.bgmEnabled ||
      !context ||
      !masterGain ||
      context.state !== 'running'
    ) {
      return
    }
    const playStep = () => {
      const frequency = BGM_NOTES[bgmStep.current % BGM_NOTES.length]
      createBgmTone(context, frequency, 0.32, 1, masterGain, 'sine')
      if (bgmStep.current % 4 === 0) {
        createBgmTone(context, frequency / 2, 0.52, 0.62, masterGain, 'triangle')
      }
      bgmStep.current += 1
    }
    playStep()
    const timer = window.setInterval(playStep, 360)
    return () => window.clearInterval(timer)
  }, [audioRevision, preferences.bgmEnabled])

  useEffect(
    () => () => {
      const context = audioContext.current
      audioContext.current = null
      bgmMasterGain.current = null
      void context?.close()
    },
    [],
  )

  return (
    <ExperienceContext.Provider
      value={{
        mineGuessFreeEnabled,
        playEffect,
        preferences,
        setAppearance: (appearance) => updatePreferences({ appearance }),
        setBgmEnabled,
        setBgmVolume: (bgmVolume) => updatePreferences({ bgmVolume }),
        setColorTheme: (colorTheme) => updatePreferences({ colorTheme }),
        setEffectsEnabled: (effectsEnabled) => updatePreferences({ effectsEnabled }),
        setLanguage: (language) => updatePreferences({ language }),
        setMineGuessFreeEnabled,
        setPenStabilizationEnabled: (penStabilizationEnabled) =>
          updatePreferences({ penStabilizationEnabled }),
        setPointerMarkerEnabled: (pointerMarkerEnabled) =>
          updatePreferences({ pointerMarkerEnabled }),
        setSfxEnabled: (sfxEnabled) => updatePreferences({ sfxEnabled }),
        setSfxVolume: (sfxVolume) => updatePreferences({ sfxVolume }),
        setSudokuPreviewVariantsEnabled: (sudokuPreviewVariantsEnabled) =>
          updatePreferences({ sudokuPreviewVariantsEnabled }),
        setTooltipsEnabled: (tooltipsEnabled) =>
          updatePreferences({ tooltipsEnabled }),
      }}
    >
      {children}
    </ExperienceContext.Provider>
  )
}

export function useAppExperience(): ExperienceContextValue {
  const context = useContext(ExperienceContext)
  if (!context) {
    throw new Error('useAppExperience must be used within AppExperienceProvider')
  }
  return context
}

export function SettingsPanel({
  onClose,
  open,
}: {
  onClose: () => void
  open: boolean
}) {
  const experience = useAppExperience()
  const copy = getLocalizedCopy(experience.preferences.language, EXPERIENCE_COPY)
  const { dialogRef, handleDialogKeyDown } =
    useDialogFocus<HTMLElement>(open, onClose)

  if (!open) {
    return null
  }

  return createPortal(
    <div className="settings-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="settings-title"
        aria-modal="true"
        className="settings-panel"
        onKeyDown={handleDialogKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header>
          <div>
            <p>APP PREFERENCES</p>
            <h2 id="settings-title">{copy.settings}</h2>
          </div>
          <button aria-label={copy.closeSettings} onClick={onClose} type="button">
            <X aria-hidden="true" />
          </button>
        </header>

        <fieldset>
          <legend><Languages aria-hidden="true" /> {copy.language}</legend>
          <div className="appearance-control" aria-label={copy.language}>
            <button
              aria-pressed={experience.preferences.language === 'ja'}
              className={experience.preferences.language === 'ja' ? 'active' : ''}
              onClick={() => experience.setLanguage('ja')}
              type="button"
            >
              {copy.japanese}
            </button>
            <button
              aria-pressed={experience.preferences.language === 'en'}
              className={experience.preferences.language === 'en' ? 'active' : ''}
              onClick={() => experience.setLanguage('en')}
              type="button"
            >
              {copy.english}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend><Palette aria-hidden="true" /> {copy.colorTheme}</legend>
          <div className="theme-swatches">
            {THEMES.map((theme) => (
              <button
                aria-pressed={experience.preferences.colorTheme === theme.id}
                className={experience.preferences.colorTheme === theme.id ? 'active' : ''}
                key={theme.id}
                onClick={() => experience.setColorTheme(theme.id)}
                type="button"
              >
                <span aria-hidden="true">
                  {theme.colors.map((color) => (
                    <i key={color} style={{ backgroundColor: color }} />
                  ))}
                </span>
                {theme.label[experience.preferences.language]}
              </button>
            ))}
          </div>
          <div className="appearance-control" aria-label={copy.appearance}>
            <button
              aria-pressed={experience.preferences.appearance === 'light'}
              className={experience.preferences.appearance === 'light' ? 'active' : ''}
              onClick={() => experience.setAppearance('light')}
              type="button"
            >
              {copy.light}
            </button>
            <button
              aria-pressed={experience.preferences.appearance === 'dark'}
              className={experience.preferences.appearance === 'dark' ? 'active' : ''}
              onClick={() => experience.setAppearance('dark')}
              type="button"
            >
              {copy.dark}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend><Music2 aria-hidden="true" /> BGM</legend>
          <label className="sound-toggle" data-tooltip={copy.bgmTooltip}>
            <span>{copy.bgmPlaying}</span>
            <input
              checked={experience.preferences.bgmEnabled}
              onChange={(event) => experience.setBgmEnabled(event.target.checked)}
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
          <label className="volume-control">
            <Volume2 aria-hidden="true" />
            <span>{copy.volume}</span>
            <input
              aria-label={copy.bgmVolume}
              max="1"
              min="0"
              onChange={(event) => experience.setBgmVolume(Number(event.target.value))}
              step="0.01"
              type="range"
              value={experience.preferences.bgmVolume}
            />
            <output>{Math.round(experience.preferences.bgmVolume * 100)}%</output>
          </label>
        </fieldset>

        <fieldset>
          <legend><Sparkles aria-hidden="true" /> {copy.sfx}</legend>
          <label className="sound-toggle" data-tooltip={copy.sfxTooltip}>
            <span>{copy.sfxPlaying}</span>
            <input
              checked={experience.preferences.sfxEnabled}
              onChange={(event) => experience.setSfxEnabled(event.target.checked)}
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
          <label className="volume-control">
            <Volume2 aria-hidden="true" />
            <span>{copy.volume}</span>
            <input
              aria-label={copy.sfxVolume}
              max="1"
              min="0"
              onChange={(event) => experience.setSfxVolume(Number(event.target.value))}
              step="0.01"
              type="range"
              value={experience.preferences.sfxVolume}
            />
            <output>{Math.round(experience.preferences.sfxVolume * 100)}%</output>
          </label>
        </fieldset>
        <fieldset>
          <legend><Gamepad2 aria-hidden="true" /> {copy.gameSettings}</legend>
          <label
            className="sound-toggle settings-description-toggle"
            data-tooltip={copy.mineGuessFreeTooltip}
          >
            <span>
              {copy.mineGuessFree}
              <small>{copy.mineGuessFreeDescription}</small>
            </span>
            <input
              aria-label={copy.mineGuessFree}
              checked={experience.mineGuessFreeEnabled}
              onChange={(event) =>
                experience.setMineGuessFreeEnabled(event.target.checked)
              }
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
        </fieldset>
        <fieldset>
          <legend><FlaskConical aria-hidden="true" /> {copy.previewFeatures}</legend>
          <label
            className="sound-toggle settings-description-toggle"
            data-tooltip={copy.sudokuPreviewTooltip}
          >
            <span>
              {copy.sudokuPreviewVariants}
              <small>{copy.sudokuPreviewDescription}</small>
            </span>
            <input
              checked={experience.preferences.sudokuPreviewVariantsEnabled}
              onChange={(event) =>
                experience.setSudokuPreviewVariantsEnabled(event.target.checked)
              }
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
        </fieldset>
        <fieldset>
          <legend><SlidersHorizontal aria-hidden="true" /> {copy.displayEffects}</legend>
          <label
            className="sound-toggle"
            data-tooltip={copy.pointerMarkerTooltip}
          >
            <span>{copy.pointerMarker}</span>
            <input
              checked={experience.preferences.pointerMarkerEnabled}
              onChange={(event) =>
                experience.setPointerMarkerEnabled(event.target.checked)
              }
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
          <label
            className="sound-toggle"
            data-tooltip={copy.animationsTooltip}
          >
            <span>{copy.animations}</span>
            <input
              checked={experience.preferences.effectsEnabled}
              onChange={(event) =>
                experience.setEffectsEnabled(event.target.checked)
              }
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
          <label
            className="sound-toggle"
            data-tooltip={copy.tooltipsTooltip}
          >
            <span>{copy.tooltips}</span>
            <input
              checked={experience.preferences.tooltipsEnabled}
              onChange={(event) =>
                experience.setTooltipsEnabled(event.target.checked)
              }
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
          <label
            className="sound-toggle"
            data-tooltip={copy.penTooltip}
          >
            <span>{copy.penStabilization}</span>
            <input
              checked={experience.preferences.penStabilizationEnabled}
              onChange={(event) =>
                experience.setPenStabilizationEnabled(event.target.checked)
              }
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
        </fieldset>
      </section>
    </div>,
    document.body,
  )
}

export function InteractionEffects() {
  const { preferences } = useAppExperience()
  const pointer = useRef<HTMLDivElement>(null)
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    const trackPointerType = (event: PointerEvent) => {
      document.documentElement.dataset.activePointer = event.pointerType
    }
    const handleMove = (event: PointerEvent) => {
      trackPointerType(event)
      if (
        !preferences.pointerMarkerEnabled ||
        event.pointerType === 'touch' ||
        !pointer.current
      ) {
        return
      }
      pointer.current.style.setProperty('--pointer-x', `${event.clientX}px`)
      pointer.current.style.setProperty('--pointer-y', `${event.clientY}px`)
      pointer.current.classList.add('visible')
    }
    const handleDown = (event: PointerEvent) => {
      trackPointerType(event)
      if (!preferences.effectsEnabled) {
        return
      }
      const id = Date.now() + Math.random()
      setBursts((current) => [...current.slice(-5), { id, x: event.clientX, y: event.clientY }])
      window.setTimeout(
        () => setBursts((current) => current.filter((burst) => burst.id !== id)),
        650,
      )
    }
    const handleLeave = () => pointer.current?.classList.remove('visible')
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerover', trackPointerType)
    window.addEventListener('pointerdown', handleDown)
    document.documentElement.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerover', trackPointerType)
      window.removeEventListener('pointerdown', handleDown)
      document.documentElement.removeEventListener('mouseleave', handleLeave)
    }
  }, [preferences.effectsEnabled, preferences.pointerMarkerEnabled])

  return (
    <>
      {preferences.pointerMarkerEnabled ? (
        <div aria-hidden="true" className="pointer-reactor" ref={pointer} />
      ) : null}
      {preferences.effectsEnabled ? bursts.map((burst) => (
        <span
          aria-hidden="true"
          className="interaction-burst"
          key={burst.id}
          style={{ left: burst.x, top: burst.y }}
        >
          {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
        </span>
      )) : null}
      {preferences.tooltipsEnabled ? <GlobalTooltip /> : null}
    </>
  )
}

interface TooltipState {
  placement: 'above' | 'below'
  text: string
  x: number
  y: number
}

const CLICKABLE_SELECTOR = [
  '[data-tooltip]',
  'button',
  'a[href]',
  'input:not([type="hidden"])',
  'select',
  '[role="button"]',
  '[role="tab"]',
  '[role="gridcell"]',
].join(',')

function getTooltipText(element: HTMLElement): string {
  const visibleText = element.innerText.replace(/\s+/g, ' ').trim()
  const iconOnly = element.matches(
    'button, a[href], [role="button"], [role="tab"]',
  ) && visibleText.length === 0
  return resolveTooltipText({
    accessibleName: element.getAttribute('aria-label') ?? '',
    explicitText: element.dataset.tooltip ?? '',
    iconOnly,
    title: element.getAttribute('title') ?? '',
  })
}

function GlobalTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    const show = (target: EventTarget | null, pointerType?: string) => {
      if (pointerType === 'touch' || !(target instanceof Element)) {
        return
      }
      const directTarget = target.closest<HTMLElement>(CLICKABLE_SELECTOR)
      if (!directTarget || directTarget.dataset.tooltipDisabled === 'true') {
        return
      }
      const explicitTarget = target.closest<HTMLElement>('[data-tooltip]')
      const clickable = explicitTarget ?? directTarget
      const text = getTooltipText(clickable)
      if (!text) {
        return
      }
      const rect = clickable.getBoundingClientRect()
      const placement = rect.bottom + 90 < window.innerHeight ? 'below' : 'above'
      setTooltip({
        placement,
        text,
        x: Math.min(Math.max(rect.left + rect.width / 2, 130), window.innerWidth - 130),
        y: placement === 'below' ? rect.bottom + 9 : rect.top - 9,
      })
    }
    const handlePointerOver = (event: PointerEvent) =>
      show(event.target, event.pointerType)
    const handleFocusIn = (event: FocusEvent) => show(event.target)
    const hide = () => setTooltip(null)
    document.addEventListener('pointerover', handlePointerOver)
    document.addEventListener('pointerout', hide)
    document.addEventListener('pointerdown', hide)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', hide)
    document.addEventListener('scroll', hide, true)
    return () => {
      document.removeEventListener('pointerover', handlePointerOver)
      document.removeEventListener('pointerout', hide)
      document.removeEventListener('pointerdown', hide)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', hide)
      document.removeEventListener('scroll', hide, true)
    }
  }, [])

  if (!tooltip) {
    return null
  }
  return createPortal(
    <div
      className="global-tooltip"
      data-placement={tooltip.placement}
      role="tooltip"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      {tooltip.text}
    </div>,
    document.body,
  )
}

export function useGameCountdown(initiallyCountingDown: boolean) {
  const { playEffect } = useAppExperience()
  const [countdown, setCountdown] = useState<number | null>(
    initiallyCountingDown ? 3 : null,
  )

  useEffect(() => {
    if (countdown === null) {
      return
    }
    playEffect(countdown === 0 ? 'start' : 'countdown')
    const timer = window.setTimeout(
      () => setCountdown((current) => {
        if (current === null || current === 0) {
          return null
        }
        return current - 1
      }),
      countdown === 0 ? 620 : 720,
    )
    return () => window.clearTimeout(timer)
  }, [countdown, playEffect])

  const beginCountdown = useCallback(() => {
    setCountdown(3)
  }, [])

  return {
    beginCountdown,
    countdown,
    isCountingDown: countdown !== null,
  }
}

export function CountdownOverlay({
  value,
}: {
  value: number | null
}) {
  if (value === null) {
    return null
  }
  return (
    <div aria-live="assertive" className="countdown-overlay">
      <div key={value}>
        <span>{value === 0 ? 'GO!' : value}</span>
        <small>{value === 0 ? 'START' : 'GET READY'}</small>
      </div>
    </div>
  )
}

export function ConfirmationModal({
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmationModalProps) {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, EXPERIENCE_COPY)
  const { dialogRef, handleDialogKeyDown } =
    useDialogFocus<HTMLElement>(open, onCancel)

  if (!open) {
    return null
  }

  return createPortal(
    <div className="confirmation-backdrop" onMouseDown={onCancel}>
      <section
        aria-labelledby="confirmation-title"
        aria-modal="true"
        className="confirmation-dialog"
        onKeyDown={handleDialogKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
        role="alertdialog"
        ref={dialogRef}
        tabIndex={-1}
      >
        <p>RESET GAME</p>
        <h2 id="confirmation-title">{title}</h2>
        <span>{message}</span>
        <div className="confirmation-actions">
          <button onClick={onCancel} type="button">{copy.cancel}</button>
          <button className="command-button" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

export function ResultModal({
  grade,
  onClose,
  onPrimary,
  open,
  primaryLabel,
  rankProgress,
  shareAction,
  stats,
  subtitle,
  title,
}: ResultModalProps) {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, EXPERIENCE_COPY)
  const { dialogRef, handleDialogKeyDown } =
    useDialogFocus<HTMLElement>(open, onClose)

  if (!open) {
    return null
  }
  return createPortal(
    <div className="result-backdrop">
      <section aria-labelledby="result-title" aria-modal="true" className="result-modal" onKeyDown={handleDialogKeyDown} ref={dialogRef} role="dialog" tabIndex={-1}>
        <div aria-hidden="true" className="result-rays-clip">
          <div className="result-rays" />
        </div>
        <button aria-label={copy.closeResults} className="result-close" onClick={onClose} type="button">
          <X aria-hidden="true" />
        </button>
        <p>RESULT</p>
        <div className="result-grade" aria-label={`${copy.grade} ${grade}`}>{grade}</div>
        <h2 id="result-title">{title}</h2>
        <span className="result-subtitle">{subtitle}</span>
        <dl className="result-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
        {rankProgress ? (
          <div className="result-rank-progress">
            <strong>{rankProgress.heading}</strong>
            <span>{rankProgress.message}</span>
          </div>
        ) : null}
        <div className="result-actions">
          <button className="command-button" onClick={onPrimary} type="button">{primaryLabel}</button>
          <button onClick={onClose} type="button">{copy.viewBoard}</button>
          {shareAction}
        </div>
      </section>
    </div>,
    document.body,
  )
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, EXPERIENCE_COPY)
  return (
    <button
      aria-label={copy.settingsLabel}
      data-tooltip={copy.settingsTooltip}
      onClick={onClick}
      type="button"
    >
      <SlidersHorizontal aria-hidden="true" />
    </button>
  )
}

export function ResultReopenButton({ onClick }: { onClick: () => void }) {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, EXPERIENCE_COPY)
  return (
    <button className="result-reopen-button" onClick={onClick} type="button">
      <Trophy aria-hidden="true" /> {copy.resultReopen}
    </button>
  )
}
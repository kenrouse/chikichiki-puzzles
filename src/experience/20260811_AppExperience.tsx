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
import {
  Music2,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import { useStoredState } from '../lib/storage'

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
  sfxEnabled: boolean
  sfxVolume: number
}

interface ExperienceContextValue {
  playEffect: (effect: SoundEffect) => void
  preferences: AppPreferences
  setAppearance: (appearance: Appearance) => void
  setBgmEnabled: (enabled: boolean) => void
  setBgmVolume: (volume: number) => void
  setColorTheme: (theme: ColorTheme) => void
  setSfxEnabled: (enabled: boolean) => void
  setSfxVolume: (volume: number) => void
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
  stats: ResultStat[]
  subtitle: string
  title: string
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null)

const THEMES: Array<{
  colors: [string, string, string]
  id: ColorTheme
  label: string
}> = [
  { id: 'archive', label: 'アーカイブ', colors: ['#173f37', '#efb23d', '#d9674d'] },
  { id: 'ocean', label: 'オーシャン', colors: ['#154c79', '#55b7c5', '#f0bd55'] },
  { id: 'sakura', label: 'サクラ', colors: ['#713d51', '#dc8e9f', '#87a88a'] },
  { id: 'arcade', label: 'アーケード', colors: ['#272445', '#46c6a8', '#f15b76'] },
]

const BGM_NOTES = [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66]

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
  return {
    appearance,
    bgmEnabled: false,
    bgmVolume: 0.32,
    colorTheme: 'archive',
    sfxEnabled: true,
    sfxVolume: 0.58,
  }
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

export function AppExperienceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useStoredState<AppPreferences>(
    'chikichiki:preferences:v2',
    readInitialPreferences,
  )
  const [audioRevision, setAudioRevision] = useState(0)
  const audioContext = useRef<AudioContext | null>(null)
  const bgmStep = useRef(0)

  const ensureAudio = useCallback(async (): Promise<AudioContext | null> => {
    if (!audioContext.current || audioContext.current.state === 'closed') {
      const AudioContextClass = window.AudioContext
      if (!AudioContextClass) {
        return null
      }
      audioContext.current = new AudioContextClass()
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
    document.documentElement.dataset.colorTheme = preferences.colorTheme
  }, [preferences.appearance, preferences.colorTheme])

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
    if (
      !preferences.bgmEnabled ||
      preferences.bgmVolume <= 0 ||
      !context ||
      context.state !== 'running'
    ) {
      return
    }
    const playStep = () => {
      const frequency = BGM_NOTES[bgmStep.current % BGM_NOTES.length]
      const volume = preferences.bgmVolume * 0.035
      createTone(context, frequency, 0.28, volume, 'sine')
      if (bgmStep.current % 4 === 0) {
        createTone(context, frequency / 2, 0.48, volume * 0.75, 'triangle')
      }
      bgmStep.current += 1
    }
    playStep()
    const timer = window.setInterval(playStep, 360)
    return () => window.clearInterval(timer)
  }, [audioRevision, preferences.bgmEnabled, preferences.bgmVolume])

  useEffect(
    () => () => {
      const context = audioContext.current
      audioContext.current = null
      void context?.close()
    },
    [],
  )

  return (
    <ExperienceContext.Provider
      value={{
        playEffect,
        preferences,
        setAppearance: (appearance) => updatePreferences({ appearance }),
        setBgmEnabled,
        setBgmVolume: (bgmVolume) => updatePreferences({ bgmVolume }),
        setColorTheme: (colorTheme) => updatePreferences({ colorTheme }),
        setSfxEnabled: (sfxEnabled) => updatePreferences({ sfxEnabled }),
        setSfxVolume: (sfxVolume) => updatePreferences({ sfxVolume }),
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

  useEffect(() => {
    if (!open) {
      return
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="settings-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="settings-title"
        aria-modal="true"
        className="settings-panel"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <div>
            <p>APP PREFERENCES</p>
            <h2 id="settings-title">表示とサウンド</h2>
          </div>
          <button aria-label="設定を閉じる" onClick={onClose} type="button">
            <X aria-hidden="true" />
          </button>
        </header>

        <fieldset>
          <legend><Palette aria-hidden="true" /> カラーテーマ</legend>
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
                {theme.label}
              </button>
            ))}
          </div>
          <div className="appearance-control" aria-label="明るさ">
            <button
              aria-pressed={experience.preferences.appearance === 'light'}
              className={experience.preferences.appearance === 'light' ? 'active' : ''}
              onClick={() => experience.setAppearance('light')}
              type="button"
            >
              ライト
            </button>
            <button
              aria-pressed={experience.preferences.appearance === 'dark'}
              className={experience.preferences.appearance === 'dark' ? 'active' : ''}
              onClick={() => experience.setAppearance('dark')}
              type="button"
            >
              ダーク
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend><Music2 aria-hidden="true" /> BGM</legend>
          <label className="sound-toggle">
            <span>プレイ中のBGM</span>
            <input
              checked={experience.preferences.bgmEnabled}
              onChange={(event) => experience.setBgmEnabled(event.target.checked)}
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
          <label className="volume-control">
            <Volume2 aria-hidden="true" />
            <span>音量</span>
            <input
              aria-label="BGM音量"
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
          <legend><Sparkles aria-hidden="true" /> 効果音</legend>
          <label className="sound-toggle">
            <span>操作と結果の効果音</span>
            <input
              checked={experience.preferences.sfxEnabled}
              onChange={(event) => experience.setSfxEnabled(event.target.checked)}
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
          <label className="volume-control">
            <Volume2 aria-hidden="true" />
            <span>音量</span>
            <input
              aria-label="効果音量"
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
      </section>
    </div>
  )
}

export function InteractionEffects() {
  const pointer = useRef<HTMLDivElement>(null)
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !pointer.current) {
        return
      }
      pointer.current.style.setProperty('--pointer-x', `${event.clientX}px`)
      pointer.current.style.setProperty('--pointer-y', `${event.clientY}px`)
      pointer.current.classList.add('visible')
    }
    const handleDown = (event: PointerEvent) => {
      const id = Date.now() + Math.random()
      setBursts((current) => [...current.slice(-5), { id, x: event.clientX, y: event.clientY }])
      window.setTimeout(
        () => setBursts((current) => current.filter((burst) => burst.id !== id)),
        650,
      )
    }
    const handleLeave = () => pointer.current?.classList.remove('visible')
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerdown', handleDown)
    document.documentElement.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerdown', handleDown)
      document.documentElement.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <>
      <div aria-hidden="true" className="pointer-reactor" ref={pointer} />
      {bursts.map((burst) => (
        <span
          aria-hidden="true"
          className="interaction-burst"
          key={burst.id}
          style={{ left: burst.x, top: burst.y }}
        >
          {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
        </span>
      ))}
    </>
  )
}

export function useGameCountdown(initiallyActive: boolean) {
  const { playEffect } = useAppExperience()
  const [countdown, setCountdown] = useState<number | null>(initiallyActive ? 3 : null)

  useEffect(() => {
    if (countdown === null) {
      return
    }
    playEffect(countdown === 0 ? 'start' : 'countdown')
    const timer = window.setTimeout(
      () => setCountdown((current) => (current === null || current === 0 ? null : current - 1)),
      countdown === 0 ? 620 : 720,
    )
    return () => window.clearTimeout(timer)
  }, [countdown, playEffect])

  const restartCountdown = useCallback(() => setCountdown(3), [])

  return {
    countdown,
    isCountingDown: countdown !== null,
    restartCountdown,
  }
}

export function CountdownOverlay({ value }: { value: number | null }) {
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

export function ResultModal({
  grade,
  onClose,
  onPrimary,
  open,
  primaryLabel,
  stats,
  subtitle,
  title,
}: ResultModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, open])

  if (!open) {
    return null
  }
  return (
    <div className="result-backdrop">
      <section aria-labelledby="result-title" aria-modal="true" className="result-modal" role="dialog">
        <div aria-hidden="true" className="result-rays" />
        <button aria-label="成績画面を閉じる" className="result-close" onClick={onClose} type="button">
          <X aria-hidden="true" />
        </button>
        <p>RESULT</p>
        <div className="result-grade" aria-label={`評価 ${grade}`}>{grade}</div>
        <h2 id="result-title">{title}</h2>
        <span className="result-subtitle">{subtitle}</span>
        <dl>
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className="result-actions">
          <button className="command-button" onClick={onPrimary} type="button">{primaryLabel}</button>
          <button onClick={onClose} type="button">盤面を見る</button>
        </div>
      </section>
    </div>
  )
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="表示とサウンド設定"
      data-tooltip="テーマ・BGM・効果音を設定"
      onClick={onClick}
      title="表示とサウンド設定"
      type="button"
    >
      <SlidersHorizontal aria-hidden="true" />
    </button>
  )
}
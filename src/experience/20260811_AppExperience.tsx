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
  effectsEnabled: boolean
  pointerMarkerEnabled: boolean
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
  setEffectsEnabled: (enabled: boolean) => void
  setPointerMarkerEnabled: (enabled: boolean) => void
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
  label: string
}> = [
  { id: 'archive', label: 'アーカイブ', colors: ['#173f37', '#efb23d', '#d9674d'] },
  { id: 'ocean', label: 'オーシャン', colors: ['#154c79', '#55b7c5', '#f0bd55'] },
  { id: 'sakura', label: 'サクラ', colors: ['#713d51', '#dc8e9f', '#87a88a'] },
  { id: 'arcade', label: 'アーケード', colors: ['#272445', '#46c6a8', '#f15b76'] },
]

const BGM_NOTES = [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66]
const BGM_MAX_GAIN = 0.1

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
    pointerMarkerEnabled: false,
    sfxEnabled: true,
    sfxVolume: 0.58,
  }
  try {
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

export function getBgmGain(volume: number): number {
  const normalized = Math.min(1, Math.max(0, volume))
  return BGM_MAX_GAIN * normalized ** 1.2
}

export function AppExperienceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useStoredState<AppPreferences>(
    'chikichiki:preferences:v4',
    readInitialPreferences,
  )
  const [audioRevision, setAudioRevision] = useState(0)
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
    document.documentElement.dataset.colorTheme = preferences.colorTheme
    document.documentElement.dataset.effects = preferences.effectsEnabled ? 'on' : 'off'
    document.documentElement.dataset.pointerMarker = preferences.pointerMarkerEnabled
      ? 'on'
      : 'off'
  }, [
    preferences.appearance,
    preferences.colorTheme,
    preferences.effectsEnabled,
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
        playEffect,
        preferences,
        setAppearance: (appearance) => updatePreferences({ appearance }),
        setBgmEnabled,
        setBgmVolume: (bgmVolume) => updatePreferences({ bgmVolume }),
        setColorTheme: (colorTheme) => updatePreferences({ colorTheme }),
        setEffectsEnabled: (effectsEnabled) => updatePreferences({ effectsEnabled }),
        setPointerMarkerEnabled: (pointerMarkerEnabled) =>
          updatePreferences({ pointerMarkerEnabled }),
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

  return createPortal(
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
        <fieldset>
          <legend><SlidersHorizontal aria-hidden="true" /> 画面演出</legend>
          <label className="sound-toggle">
            <span>マウス位置の丸いマーカー</span>
            <input
              checked={experience.preferences.pointerMarkerEnabled}
              onChange={(event) =>
                experience.setPointerMarkerEnabled(event.target.checked)
              }
              type="checkbox"
            />
            <i aria-hidden="true" />
          </label>
          <label className="sound-toggle">
            <span>アニメーションと追加リアクション</span>
            <input
              checked={experience.preferences.effectsEnabled}
              onChange={(event) =>
                experience.setEffectsEnabled(event.target.checked)
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
    const handleMove = (event: PointerEvent) => {
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
    window.addEventListener('pointerdown', handleDown)
    document.documentElement.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handleMove)
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
      <GlobalTooltip />
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
  const explicit = element.dataset.tooltip
  if (explicit) {
    return explicit
  }
  const accessibleName = element.getAttribute('aria-label')
  if (accessibleName) {
    return accessibleName
  }
  const title = element.getAttribute('title')
  if (title) {
    return title
  }
  const label = element.closest('label')?.innerText
  if (label) {
    return label.replace(/\s+/g, ' ').trim()
  }
  return element.innerText.replace(/\s+/g, ' ').trim()
}

function GlobalTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    const show = (target: EventTarget | null, pointerType?: string) => {
      if (pointerType === 'touch' || !(target instanceof Element)) {
        return
      }
      const clickable = target.closest<HTMLElement>(CLICKABLE_SELECTOR)
      if (!clickable) {
        return
      }
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

export function ConfirmationModal({
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel, open])

  if (!open) {
    return null
  }

  return createPortal(
    <div className="confirmation-backdrop" onMouseDown={onCancel}>
      <section
        aria-labelledby="confirmation-title"
        aria-modal="true"
        className="confirmation-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="alertdialog"
      >
        <p>RESET GAME</p>
        <h2 id="confirmation-title">{title}</h2>
        <span>{message}</span>
        <div className="confirmation-actions">
          <button onClick={onCancel} type="button">キャンセル</button>
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
  shareAction,
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
  return createPortal(
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
          {shareAction}
        </div>
      </section>
    </div>,
    document.body,
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
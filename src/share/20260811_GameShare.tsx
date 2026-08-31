import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Share2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAppExperience } from '../experience/20260811_AppExperience'
import { getLocalizedCopy } from '../i18n/20260812_i18n'
import { useDialogFocus } from '../lib/20260811_dialogFocus'
import {
  buildSeededGameUrl,
  buildTopShareUrl,
  type ShareableGameId,
} from './20260811_seededGameUrl'

interface ShareButtonProps {
  accessibleLabel: string
  buttonLabel?: string
  className?: string
  description: string
  details?: Array<{ label: string; value: string }>
  dialogTitle: string
  eyebrow?: string
  shareText: string
  shareUrl: string
  title: string
  tooltip: string
}

interface GameShareButtonProps {
  buttonLabel?: string
  className?: string
  difficulty: string
  disabled?: boolean
  disabledReason?: string
  extraParameters?: Record<string, number | string | null>
  game: ShareableGameId
  seed: number
  title: string
}

const SHARE_COPY = {
  ja: {
    challengeDescription: 'このQRコードまたはURLを開くと、版付きの挑戦状IDから同じ盤面とRATINGが復元されます。',
    challengeTooltip: '同じ挑戦状を固定URLとQRコードで共有',
    close: '共有画面を閉じる',
    copied: 'コピーしました',
    copyFailed: 'コピーできませんでした',
    copyUrl: 'URLをコピー',
    disabled: '現在のゲームはまだ共有できません',
    gameAccessible: 'このゲームを共有',
    gameDescription: 'このQRコードまたはURLを開くと、同じ難易度とseedで盤面が再生成されます。',
    gameDialog: '同じゲームを共有',
    gameShareText: (title: string) => `${title} 同じ問題に挑戦できます。`,
    gameTooltip: '同じseedのゲームをURLとQRコードで共有',
    osShare: 'OSで共有',
    shareUrl: '共有URL',
    topAccessible: 'トップページを共有',
    topButton: 'このページを共有',
    topDescription: 'このQRコードまたはURLから、ちきちきパズルズのトップページを開けます。',
    topDialog: 'トップページを共有',
    topShareText: 'ちきちきパズルズで遊べます。',
    topTitle: 'ちきちきパズルズ',
    topTooltip: 'トップページの固定URLを共有',
  },
  en: {
    challengeDescription: 'Open this QR code or URL to restore the same board and RATING from its versioned challenge ID.',
    challengeTooltip: 'Share this fixed challenge by URL or QR code',
    close: 'Close sharing dialog',
    copied: 'Copied',
    copyFailed: 'Could not copy',
    copyUrl: 'Copy URL',
    disabled: 'This game cannot be shared yet',
    gameAccessible: 'Share this game',
    gameDescription: 'Open this QR code or URL to regenerate the same board from its difficulty and seed.',
    gameDialog: 'Share the same game',
    gameShareText: (title: string) => `Try the same ${title} challenge.`,
    gameTooltip: 'Share the same seeded game by URL or QR code',
    osShare: 'Share with device',
    shareUrl: 'Share URL',
    topAccessible: 'Share the home page',
    topButton: 'Share this page',
    topDescription: 'Open this QR code or URL to visit the Chikichiki Puzzles home page.',
    topDialog: 'Share the home page',
    topShareText: 'Play Chikichiki Puzzles.',
    topTitle: 'Chikichiki Puzzles',
    topTooltip: 'Share the permanent home page URL',
  },
} as const

async function copyText(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // Continue with the local textarea fallback.
    }
  }
  const input = document.createElement('textarea')
  input.value = value
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.append(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()
  return copied
}

export function GameShareButton({
  buttonLabel,
  className,
  difficulty,
  disabled = false,
  disabledReason,
  extraParameters = {},
  game,
  seed,
  title,
}: GameShareButtonProps) {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, SHARE_COPY)
  const shareUrl = buildSeededGameUrl(
    window.location.href,
    game,
    seed,
    difficulty,
    extraParameters,
  )
  const isChallenge = typeof extraParameters.challenge === 'string'

  return (
    <ShareButton
      accessibleLabel={copy.gameAccessible}
      buttonLabel={buttonLabel}
      className={className}
      description={isChallenge ? copy.challengeDescription : copy.gameDescription}
      details={[
        { label: 'SEED', value: String(seed >>> 0) },
        { label: 'MODE', value: difficulty.toUpperCase() },
      ]}
      dialogTitle={copy.gameDialog}
      eyebrow="SEEDED GAME"
      shareText={copy.gameShareText(title)}
      shareUrl={shareUrl}
      title={title}
      tooltip={
        disabled
          ? (disabledReason ?? copy.disabled)
          : isChallenge
            ? copy.challengeTooltip
            : copy.gameTooltip
      }
      disabled={disabled}
    />
  )
}

function ShareButton({
  accessibleLabel,
  buttonLabel,
  className,
  description,
  details = [],
  dialogTitle,
  eyebrow = 'SHARE LINK',
  shareText,
  shareUrl,
  title,
  tooltip,
  disabled = false,
}: ShareButtonProps & { disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const { playEffect, preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, SHARE_COPY)
  const { dialogRef, handleDialogKeyDown } =
    useDialogFocus<HTMLElement>(open, () => setOpen(false))

  async function copyShareUrl(): Promise<void> {
    const succeeded = await copyText(shareUrl)
    setCopied(succeeded)
    setCopyFailed(!succeeded)
    playEffect(succeeded ? 'place' : 'error')
    window.setTimeout(() => {
      setCopied(false)
      setCopyFailed(false)
    }, 1600)
  }

  async function share(): Promise<void> {
    if (!navigator.share) {
      await copyShareUrl()
      return
    }
    try {
      await navigator.share({
        text: shareText,
        title,
        url: shareUrl,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      await copyShareUrl()
    }
  }

  return (
    <>
      <button
        aria-label={accessibleLabel}
        className={className}
        data-tooltip={tooltip}
        disabled={disabled}
        onClick={() => {
          setOpen(true)
          playEffect('select')
        }}
        type="button"
      >
        <Share2 aria-hidden="true" />
        {buttonLabel ? <span>{buttonLabel}</span> : null}
      </button>
      {open ? createPortal(
        <div className="share-backdrop" onMouseDown={() => setOpen(false)}>
          <section
            aria-labelledby="share-title"
            aria-modal="true"
            className="share-dialog"
            onKeyDown={handleDialogKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <header>
              <div>
                <p>{eyebrow}</p>
                <h2 id="share-title">{dialogTitle}</h2>
              </div>
              <button aria-label={copy.close} onClick={() => setOpen(false)} type="button">
                <X aria-hidden="true" />
              </button>
            </header>
            <div className="share-content">
              <div className="share-qr">
                <QRCodeSVG
                  bgColor="#ffffff"
                  fgColor="#111111"
                  level="M"
                  marginSize={4}
                  size={224}
                  value={shareUrl}
                />
              </div>
              <div className="share-details">
                <p>{description}</p>
                {details.length > 0 ? (
                  <dl>
                    {details.map((detail) => (
                      <div key={detail.label}>
                        <dt>{detail.label}</dt><dd>{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <label>
                  <span>{copy.shareUrl}</span>
                  <input readOnly value={shareUrl} />
                </label>
                <div className="share-actions">
                  <button className="command-button" onClick={share} type="button">
                    <Share2 aria-hidden="true" /> {copy.osShare}
                  </button>
                  <button onClick={copyShareUrl} type="button">
                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    {copied
                      ? copy.copied
                      : copyFailed
                        ? copy.copyFailed
                        : copy.copyUrl}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  )
}

export function TopShareButton() {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, SHARE_COPY)
  const shareUrl = buildTopShareUrl(
    window.location.origin,
    import.meta.env.BASE_URL,
  )
  return (
    <ShareButton
      accessibleLabel={copy.topAccessible}
      buttonLabel={copy.topButton}
      className="title-share-button"
      description={copy.topDescription}
      dialogTitle={copy.topDialog}
      eyebrow="SHARE HOME"
      shareText={copy.topShareText}
      shareUrl={shareUrl}
      title={copy.topTitle}
      tooltip={copy.topTooltip}
    />
  )
}
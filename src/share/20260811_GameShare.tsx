import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Share2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAppExperience } from '../experience/20260811_AppExperience'
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
  disabledReason = '現在のゲームはまだ共有できません',
  extraParameters = {},
  game,
  seed,
  title,
}: GameShareButtonProps) {
  const shareUrl = buildSeededGameUrl(
    window.location.href,
    game,
    seed,
    difficulty,
    extraParameters,
  )

  return (
    <ShareButton
      accessibleLabel="このゲームを共有"
      buttonLabel={buttonLabel}
      className={className}
      description="このQRコードまたはURLを開くと、同じ難易度とseedで盤面が再生成されます。"
      details={[
        { label: 'SEED', value: String(seed >>> 0) },
        { label: 'MODE', value: difficulty.toUpperCase() },
      ]}
      dialogTitle="同じゲームを共有"
      eyebrow="SEEDED GAME"
      shareText={`${title} 同じ問題に挑戦できます。`}
      shareUrl={shareUrl}
      title={title}
      tooltip={
        disabled
          ? disabledReason
          : '同じseedのゲームをURLとQRコードで共有'
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
  const { playEffect } = useAppExperience()
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
              <button aria-label="共有画面を閉じる" onClick={() => setOpen(false)} type="button">
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
                  <span>共有URL</span>
                  <input readOnly value={shareUrl} />
                </label>
                <div className="share-actions">
                  <button className="command-button" onClick={share} type="button">
                    <Share2 aria-hidden="true" /> OSで共有
                  </button>
                  <button onClick={copyShareUrl} type="button">
                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    {copied
                      ? 'コピーしました'
                      : copyFailed
                        ? 'コピーできませんでした'
                        : 'URLをコピー'}
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
  const shareUrl = buildTopShareUrl(
    window.location.origin,
    import.meta.env.BASE_URL,
  )
  return (
    <ShareButton
      accessibleLabel="トップページを共有"
      buttonLabel="このページを共有"
      className="title-share-button"
      description="このQRコードまたはURLから、ちきちきパズルズのトップページを開けます。"
      dialogTitle="トップページを共有"
      eyebrow="SHARE HOME"
      shareText="ちきちきパズルズで遊べます。"
      shareUrl={shareUrl}
      title="ちきちきパズルズ"
      tooltip="トップページの固定URLを共有"
    />
  )
}
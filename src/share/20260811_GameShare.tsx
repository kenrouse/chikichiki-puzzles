import { useEffect, useState } from 'react'
import { Check, Copy, Share2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAppExperience } from '../experience/20260811_AppExperience'
import {
  buildSeededGameUrl,
  type ShareableGameId,
} from './20260811_seededGameUrl'

interface GameShareButtonProps {
  difficulty: string
  disabled?: boolean
  disabledReason?: string
  extraParameters?: Record<string, number | string | null>
  game: ShareableGameId
  seed: number
  title: string
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const input = document.createElement('textarea')
  input.value = value
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.append(input)
  input.select()
  document.execCommand('copy')
  input.remove()
}

export function GameShareButton({
  difficulty,
  disabled = false,
  disabledReason = '現在のゲームはまだ共有できません',
  extraParameters = {},
  game,
  seed,
  title,
}: GameShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { playEffect } = useAppExperience()
  const shareUrl = buildSeededGameUrl(
    window.location.href,
    game,
    seed,
    difficulty,
    extraParameters,
  )

  useEffect(() => {
    if (!open) {
      return
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  async function copyShareUrl(): Promise<void> {
    await copyText(shareUrl)
    setCopied(true)
    playEffect('place')
    window.setTimeout(() => setCopied(false), 1600)
  }

  async function share(): Promise<void> {
    if (!navigator.share) {
      await copyShareUrl()
      return
    }
    try {
      await navigator.share({
        text: `${title} 同じ問題に挑戦できます。`,
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
        aria-label="このゲームを共有"
        data-tooltip={
          disabled
            ? disabledReason
            : '同じseedのゲームをURLとQRコードで共有'
        }
        disabled={disabled}
        onClick={() => {
          setOpen(true)
          playEffect('select')
        }}
        title="このゲームを共有"
        type="button"
      >
        <Share2 aria-hidden="true" />
      </button>
      {open ? (
        <div className="share-backdrop" onMouseDown={() => setOpen(false)}>
          <section
            aria-labelledby="share-title"
            aria-modal="true"
            className="share-dialog"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header>
              <div>
                <p>SEEDED GAME</p>
                <h2 id="share-title">同じゲームを共有</h2>
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
                  title={`${title}の共有URL`}
                  value={shareUrl}
                />
              </div>
              <div className="share-details">
                <p>このQRコードまたはURLを開くと、同じ難易度とseedで盤面が再生成されます。</p>
                <dl>
                  <div><dt>SEED</dt><dd>{seed >>> 0}</dd></div>
                  <div><dt>MODE</dt><dd>{difficulty.toUpperCase()}</dd></div>
                </dl>
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
                    {copied ? 'コピーしました' : 'URLをコピー'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
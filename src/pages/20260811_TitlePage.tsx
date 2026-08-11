import { ArrowRight, Bomb, Grid3X3, LayoutGrid } from 'lucide-react'

export type TitleGameId = 'sudoku' | 'minesweeper' | 'shisen'

const TITLE_GAMES = [
  {
    description: '唯一解と複雑度を評価して生成する、4段階の数字パズル。',
    id: 'sudoku' as const,
    icon: Grid3X3,
    label: 'おーとまちっく数独',
    years: '2006 / 2011',
  },
  {
    description: '推測不要とクラシックを選べる、連鎖スコア付き地雷原。',
    id: 'minesweeper' as const,
    icon: Bomb,
    label: 'ちきちきまいんすいーぱ。',
    years: '2007',
  },
  {
    description: '2回まで曲がる線で同じ牌を結ぶ、完走可能な配牌。',
    id: 'shisen' as const,
    icon: LayoutGrid,
    label: '四川省',
    years: '2009',
  },
]

export function TitlePage({ onSelect }: { onSelect: (game: TitleGameId) => void }) {
  return (
    <section className="title-screen" aria-labelledby="title-screen-heading">
      <header className="title-intro">
        <div className="title-emblem">
          <img alt="" src={`${import.meta.env.BASE_URL}puzzle-mark.svg`} />
          <span>ORIGINAL i-APPLI<br />2006–2009</span>
        </div>
        <div>
          <p className="eyebrow">THREE PUZZLES / REBUILT 2026</p>
          <h1 id="title-screen-heading">ちきちきパズルズ</h1>
          <p>かつて携帯電話で作った3つのゲームを、同じ発想からもう一度。遊ぶゲームを選んでください。</p>
        </div>
      </header>

      <div className="title-game-grid" aria-label="ゲームを選択">
        {TITLE_GAMES.map((game, index) => {
          const Icon = game.icon
          return (
            <button
              className={`title-game title-game-${index + 1}`}
              data-tooltip={`${game.label}を開始`}
              key={game.id}
              onClick={() => onSelect(game.id)}
              type="button"
            >
              <span className="title-game-number">0{index + 1}</span>
              <span className="title-game-icon"><Icon aria-hidden="true" /></span>
              <span className="title-game-copy">
                <small>{game.years}</small>
                <strong>{game.label}</strong>
                <em>{game.description}</em>
              </span>
              <ArrowRight aria-hidden="true" className="title-game-arrow" />
            </button>
          )
        })}
      </div>

      <footer className="title-capabilities" aria-label="アプリの特徴">
        <span>INSTALLABLE PWA</span>
        <span>OFFLINE READY</span>
        <span>SEEDED SHARE</span>
        <span>LOCAL SAVE</span>
      </footer>
    </section>
  )
}
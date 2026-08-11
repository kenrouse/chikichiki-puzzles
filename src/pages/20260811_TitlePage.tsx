import { ArrowRight, Bomb, Grid3X3, LayoutGrid } from 'lucide-react'
import { useAppExperience } from '../experience/20260811_AppExperience'
import { getLocalizedCopy } from '../i18n/20260812_i18n'
import { TopShareButton } from '../share/20260811_GameShare'

export type TitleGameId = 'sudoku' | 'minesweeper' | 'shisen'

const TITLE_COPY = {
  ja: {
    capabilities: 'アプリの特徴',
    games: [
      { description: '入門からエキスパートまで、一意解を保証して生成する5段階の数字パズル。', id: 'sudoku' as const, icon: Grid3X3, label: 'おーとまちっく数独', years: '2006 / 2011' },
      { description: '推測不要とクラシックを選べる、連鎖スコア付き地雷原。', id: 'minesweeper' as const, icon: Bomb, label: 'ちきちきまいんすいーぱ。', years: '2007' },
      { description: '2回まで曲がる線で同じ牌を結ぶ、完走可能な配牌。', id: 'shisen' as const, icon: LayoutGrid, label: '四川省', years: '2009' },
    ],
    intro: 'かつて携帯電話で作った3つのゲームを、同じ発想からもう一度。遊ぶゲームを選んでください。',
    selectGame: 'ゲームを選択',
    start: (name: string) => `${name}を開始`,
    title: 'ちきちきパズルズ',
  },
  en: {
    capabilities: 'App features',
    games: [
      { description: 'Five uniquely solvable levels, from Beginner to Expert.', id: 'sudoku' as const, icon: Grid3X3, label: 'Automatic Sudoku', years: '2006 / 2011' },
      { description: 'A cascading-score minefield with guess-free and classic modes.', id: 'minesweeper' as const, icon: Bomb, label: 'Chikichiki Minesweeper', years: '2007' },
      { description: 'Solvable tile layouts connected by paths with at most two turns.', id: 'shisen' as const, icon: LayoutGrid, label: 'Shisen-Sho', years: '2009' },
    ],
    intro: 'Three games first made for mobile phones, rebuilt from the same ideas. Choose a game to begin.',
    selectGame: 'Choose a game',
    start: (name: string) => `Start ${name}`,
    title: 'Chikichiki Puzzles',
  },
} as const

export function TitlePage({ onSelect }: { onSelect: (game: TitleGameId) => void }) {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, TITLE_COPY)
  return (
    <section className="title-screen" aria-labelledby="title-screen-heading">
      <header className="title-intro">
        <div className="title-emblem">
          <img alt="" src={`${import.meta.env.BASE_URL}puzzle-mark.svg`} />
          <span>ORIGINAL i-APPLI<br />2006–2009</span>
        </div>
        <div className="title-copy">
          <p className="eyebrow">THREE PUZZLES / REBUILT 2026</p>
          <h1 id="title-screen-heading">{copy.title}</h1>
          <p>{copy.intro}</p>
          <TopShareButton />
        </div>
      </header>

      <div className="title-game-grid" aria-label={copy.selectGame}>
        {copy.games.map((game, index) => {
          const Icon = game.icon
          return (
            <button
              className={`title-game title-game-${index + 1}`}
              data-tooltip={copy.start(game.label)}
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

      <footer className="title-capabilities" aria-label={copy.capabilities}>
        <span>INSTALLABLE PWA</span>
        <span>OFFLINE READY</span>
        <span>SEEDED SHARE</span>
        <span>LOCAL SAVE</span>
      </footer>
    </section>
  )
}
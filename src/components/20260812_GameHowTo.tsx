import { ChevronDown, ChevronUp, CircleHelp, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useAppExperience } from '../experience/20260811_AppExperience'
import { getLocalizedCopy } from '../i18n/20260812_i18n'
import { useStoredState } from '../lib/storage'

export type HowToGameId = 'minesweeper' | 'shisen' | 'sudoku'

interface HowToVisibility {
  minesweeper: boolean
  shisen: boolean
  sudoku: boolean
}

const HOW_TO_COPY = {
  ja: {
    details: '詳しく見る',
    detailsClose: '詳細を閉じる',
    detailsHeading: '操作とクリア条件',
    hide: '遊び方を隠す',
    minesweeper: {
      steps: [
        '数字は、そのマスの周囲8マスにある地雷の数です。数字を手掛かりに安全なマスを開きます。',
        '地雷だと思うマスは右クリック、またはタッチ／ペンの長押しで「旗」にします。もう一度操作すると「?」、さらに操作すると解除されます。',
        '開いた数字をもう一度押すと、周囲の旗が数字と同じ数のとき、残りの周囲マスをまとめて開きます。地雷以外をすべて開けばクリアです。',
      ],
      summary: '地雷を踏まないように、数字を手掛かりに安全なマスをすべて開くゲームです。最初に開くマスと周囲8マスは必ず安全です。',
      tips: ['数字は周囲8マスの地雷数', '右クリック／長押しで旗', '安全なマスをすべて開けばクリア'],
      title: 'マインスイーパの遊び方',
    },
    restore: '遊び方',
    shisen: {
      steps: [
        '同じ模様の牌を2枚、順番に選びます。牌の間を線で結べれば、その2枚を取り除けます。',
        '線は空いている場所を通り、曲がれるのは2回までです。盤面の外側を回る経路も使えます。',
        '結べる組が見つからないときはヒントを使えます。行き詰まった場合は残りの牌を、必ず解ける配置へ並べ替えられます。すべての牌を取り除けばクリアです。',
      ],
      summary: '同じ模様の牌を、2回以内に曲がる線で結んで消すゲームです。線はほかの牌を通り抜けられません。',
      tips: ['同じ牌を2枚選ぶ', '線が曲がれるのは2回まで', 'すべての牌を消せばクリア'],
      title: '四川省の遊び方',
    },
    sudoku: {
      steps: [
        '空いているマスを選び、数字パッドから1〜9を入力します。最初から表示されている数字は変更できません。',
        '各行、各列、太線で囲まれた3 × 3のブロックに、1〜9を1回ずつ入れます。同じ数字が重なると赤く表示されます。',
        '候補を残したいときは「メモ」へ切り替えます。ガイド、同じ数字の強調、ヒント、元に戻す操作も利用できます。すべて正しく埋めればクリアです。',
      ],
      summary: '9 × 9の盤面を、同じ行・列・3 × 3ブロックで数字が重複しないように1〜9で埋めるゲームです。',
      tips: ['空欄を選んで1〜9を入力', '行・列・3 × 3で重複させない', 'すべて正しく埋めればクリア'],
      title: '数独の遊び方',
    },
  },
  en: {
    details: 'Full instructions',
    detailsClose: 'Close details',
    detailsHeading: 'Controls and win condition',
    hide: 'Hide how to play',
    minesweeper: {
      steps: [
        'Each number tells you how many mines are hidden in the eight surrounding cells. Use the numbers to identify safe cells.',
        'Right-click a suspected mine, or touch and hold with a finger or pen, to place a flag. Repeat to change it to “?”, then clear the mark.',
        'Press an open number again to open its remaining neighbors when the surrounding flag count matches the number. Open every safe cell to win.',
      ],
      summary: 'Open every safe cell without hitting a mine. Your first cell and its eight neighbors are always safe.',
      tips: ['Numbers count adjacent mines', 'Right-click or hold to flag', 'Open every safe cell to win'],
      title: 'How to play Minesweeper',
    },
    restore: 'How to play',
    shisen: {
      steps: [
        'Select two tiles with the same symbol. They are removed when a valid line can connect them.',
        'The line may travel only through empty spaces and turn at most twice. It may also travel around the outside of the board.',
        'Use a hint when you cannot find a pair. If you are stuck, reshuffle the remaining tiles into another solvable layout. Remove every tile to win.',
      ],
      summary: 'Match identical tiles that can be connected by a line with no more than two turns. The line cannot pass through other tiles.',
      tips: ['Select two identical tiles', 'The path may turn at most twice', 'Remove every tile to win'],
      title: 'How to play Shisen-Sho',
    },
    sudoku: {
      steps: [
        'Select an empty cell and enter a number from 1 to 9. The numbers supplied by the puzzle cannot be changed.',
        'Place 1 through 9 exactly once in every row, column, and bold 3 × 3 box. Duplicate numbers are shown in red.',
        'Switch to Notes to record candidates. You can also use the placement guide, matching-number highlight, hint, and undo controls. Fill every cell correctly to win.',
      ],
      summary: 'Fill the 9 × 9 grid with 1 through 9 without repeating a number in any row, column, or 3 × 3 box.',
      tips: ['Select a cell and enter 1–9', 'No repeats in rows, columns, or boxes', 'Fill every cell correctly to win'],
      title: 'How to play Sudoku',
    },
  },
} as const

export function GameHowTo({ game }: { game: HowToGameId }) {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, HOW_TO_COPY)
  const gameCopy = copy[game]
  const [visibility, setVisibility] = useStoredState<HowToVisibility>(
    'chikichiki:how-to:v1',
    () => ({ minesweeper: true, shisen: true, sudoku: true }),
  )
  const [detailsOpen, setDetailsOpen] = useState(false)
  const visible = visibility[game] ?? true
  const detailsId = `${game}-how-to-details`
  const titleId = `${game}-how-to-title`

  if (!visible) {
    return (
      <div className="game-how-to-restore">
        <button
          onClick={() => setVisibility((current) => ({ ...current, [game]: true }))}
          type="button"
        >
          <CircleHelp aria-hidden="true" /> {copy.restore}
        </button>
      </div>
    )
  }

  return (
    <section aria-labelledby={titleId} className="game-how-to">
      <header>
        <div className="game-how-to-title">
          <CircleHelp aria-hidden="true" />
          <h2 id={titleId}>{gameCopy.title}</h2>
        </div>
        <div className="game-how-to-actions">
          <button
            aria-controls={detailsId}
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((current) => !current)}
            type="button"
          >
            {detailsOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            {detailsOpen ? copy.detailsClose : copy.details}
          </button>
          <button
            aria-label={copy.hide}
            data-tooltip={copy.hide}
            onClick={() => {
              setDetailsOpen(false)
              setVisibility((current) => ({ ...current, [game]: false }))
            }}
            type="button"
          >
            <EyeOff aria-hidden="true" />
          </button>
        </div>
      </header>
      <p>{gameCopy.summary}</p>
      <ul className="game-how-to-tips">
        {gameCopy.tips.map((tip) => <li key={tip}>{tip}</li>)}
      </ul>
      {detailsOpen ? (
        <div className="game-how-to-details" id={detailsId}>
          <h3>{copy.detailsHeading}</h3>
          <ol>
            {gameCopy.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
      ) : null}
    </section>
  )
}
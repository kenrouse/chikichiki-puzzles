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
      strategy: {
        generator: '生成器は完成盤から数字を1つずつ抜き、そのたびに解が1つだけかを探索します。「入門」はさらに、候補が1つのマスを埋め続けるだけで完走できることを検査しています。「やさしい」以上は一意解を保証しますが、特定の人間向け手筋だけで解ける保証はありません。ふつう・むずかしい・エキスパートは、それぞれ2・3・6個の候補から、裸のシングルと隠れシングルを適用した後の未解決数や、探索の分岐数・ノード数を含むratingが高い問題を選びます。',
        generatorTitle: '問題生成との関係',
        intro: '当てずっぽうで数字を置く前に、次の順序で候補を狭めます。数字を1つ置くたびに盤面の条件が変わるので、最初から同じ順序を繰り返すのが基本です。',
        steps: [
          '候補を作る: 空欄ごとに、同じ行、同じ列、同じ3 × 3ブロックにすでにある数字を除外します。残った数字をメモに記録します。',
          '裸のシングルを探す: あるマスの候補が1つだけなら、その数字で確定です。「入門」は、この手順を繰り返すだけで必ず最後まで解けます。',
          '隠れシングルを探す: 1つのマスに候補が複数あっても、行・列・ブロックの中で、ある数字を置ける場所がそのマスしかなければ確定です。現行の難易度分析も、裸のシングルの次にこの手筋を使います。',
          '確定した場所の周囲を見直す: 数字を置いた行、列、ブロックからその候補を消し、新しく生まれた裸／隠れシングルを探します。盤面全体を何度も眺めるより、変化した3つの範囲から確認すると効率的です。',
          '基本手筋で止まったら候補同士を見る: 同じ2候補が2マスだけを占めるペアや、ブロック内の候補が1つの行・列に限定されるロック候補を探すと、ほかのマスから候補を消せます。ただし、現行の生成器は特定の高度手筋で解けることまでは分類・保証していません。',
          '矛盾を避けて進める: 一意解は保証されていますが、上位難易度のratingにはバックトラック探索量も含まれます。これは難しさを測るための内部指標で、攻略時に推測を勧めるものではありません。論理的な候補消去で進め、必要な場合だけヒントを使います。',
        ],
        title: '論理的な攻略手順',
      },
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
      strategy: {
        generator: 'The generator starts with a solved board and removes one number at a time, searching after every removal to ensure that exactly one solution remains. Beginner also verifies that repeatedly filling cells with one candidate can complete the whole puzzle. Easy and above guarantee a unique solution, but not completion with a particular set of human techniques. Normal, Hard, and Expert choose the highest-rated puzzle from 2, 3, and 6 candidates. The rating includes cells left after naked and hidden singles plus backtracking branches and search nodes.',
        generatorTitle: 'How generation affects solving',
        intro: 'Before guessing a number, narrow the candidates in this order. Every confirmed number changes the board, so the key habit is to repeat the same sequence after each placement.',
        steps: [
          'Build candidates: for each empty cell, eliminate every number already present in its row, column, and 3 × 3 box. Record the remaining numbers as notes.',
          'Find naked singles: when a cell has only one candidate, that number is forced. Every Beginner puzzle is guaranteed to finish by repeating this technique.',
          'Find hidden singles: a cell may have several candidates, but if one number has no other possible position in its row, column, or box, it is forced there. The current analyzer applies this after naked singles.',
          'Rescan the affected units: after placing a number, remove it from candidates in the same row, column, and box. Check those three areas first for newly created naked or hidden singles.',
          'When basic singles stop, compare candidates: a pair of cells holding the same two candidates can exclude those numbers elsewhere, while candidates confined to one row or column inside a box can form a locked candidate. The current generator does not classify or guarantee any particular advanced technique.',
          'Progress without contradictions: every puzzle has one solution, but higher ratings also include backtracking search effort. That is an internal difficulty measurement, not a recommendation to guess. Continue eliminating candidates logically and use a hint only when needed.',
        ],
        title: 'A logical solving sequence',
      },
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
          {'strategy' in gameCopy ? (
            <section className="sudoku-strategy">
              <h3>{gameCopy.strategy.title}</h3>
              <p>{gameCopy.strategy.intro}</p>
              <ol>
                {gameCopy.strategy.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
              <aside>
                <strong>{gameCopy.strategy.generatorTitle}</strong>
                <p>{gameCopy.strategy.generator}</p>
              </aside>
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
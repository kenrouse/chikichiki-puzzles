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
    detailsCloseTooltip: '展開中の操作方法、ランク条件、攻略情報を閉じて要点だけ表示します。',
    detailsHeading: '操作とクリア条件',
    detailsTooltip: '操作方法、クリア条件、ランクの決まり方、攻略情報を展開します。',
    hide: '遊び方を隠す',
    hideTooltip: 'このゲームの遊び方を非表示にします。右端の[遊び方]から再表示できます。',
    minesweeper: {
      rank: {
        intro: 'クリア時のランクは、スコア ÷（安全マス数 × 10）の効率で決まります。時間はランクに影響せず、ベストタイムとして別に記録されます。連鎖で多くのマスを一度に開くほど上位を狙えます。',
        items: [
          'S: 効率3.8以上。初級3,420点／中級12,920点／上級48,640点以上',
          'A: 効率2.7以上。初級2,430点／中級9,180点／上級34,560点以上',
          'B: 効率1.7以上。初級1,530点／中級5,780点／上級21,760点以上',
          'C: 効率1.7未満。小さく開き続けるより、空白の連鎖を大きく伸ばすと改善できます',
        ],
        title: 'ランクの決まり方',
      },
      steps: [
        '数字は、そのマスの周囲8マスにある地雷の数です。数字を手掛かりに安全なマスを開きます。',
        'タッチ／ペンでは「開く／マーク」を選びます。マークは旗 → ? → 解除の順に切り替わります。右クリックと長押しもマークのショートカットです。',
        '開いた数字をもう一度押すと、周囲の旗が数字と同じ数のとき、残りをまとめて開きます。推測不要はアプリ設定の「ゲーム設定」で切り替え、次の盤面から適用されます。地雷以外をすべて開けばクリアです。',
      ],
      summary: '地雷を踏まないように、数字を手掛かりに安全なマスをすべて開くゲームです。最初に開くマスと周囲8マスは必ず安全です。',
      tips: ['数字は周囲8マスの地雷数', 'タッチは開く／マークを選択', '安全なマスをすべて開けばクリア'],
      title: 'マインスイーパの遊び方',
    },
    restore: '遊び方',
    restoreTooltip: '非表示にした遊び方の要点と詳しい説明を再表示します。',
    shisen: {
      rank: {
        intro: 'ランク用ペナルティは「クリア秒数＋シャッフル回数 × 120秒」です。ヒントはランクに影響しません。シャッフル1回を減らすことは、2分短縮するのと同じ効果です。',
        items: ['S: 359秒以下', 'A: 360〜719秒', 'B: 720〜1,199秒', 'C: 1,200秒以上'],
        title: 'ランクの決まり方',
      },
      steps: [
        '同じ模様の牌を2枚、順番に選びます。牌の間を線で結べれば、その2枚を取り除けます。',
        '線は空いている場所を通り、曲がれるのは2回までです。盤面の外側を回る経路も使えます。',
        '「画面に合わせる」で配牌全体を表示できます。組が見つからないときはヒント、行き詰まった場合は必ず解ける配置への並べ替えを使えます。すべての牌を取り除けばクリアです。',
      ],
      summary: '同じ模様の牌を、2回以内に曲がる線で結んで消すゲームです。線はほかの牌を通り抜けられません。',
      tips: ['同じ牌を2枚選ぶ', '線が曲がれるのは2回まで', 'すべての牌を消せばクリア'],
      title: '四川省の遊び方',
    },
    sudoku: {
      rank: {
        intro: 'ランク用ペナルティは「クリア秒数＋ヒント回数 × 90秒＋ミス回数 × 35秒」です。問題タイプや難易度は式を変えません。時間短縮だけでなく、ヒントとミスを減らすことが上位への近道です。',
        items: ['S: 299秒以下', 'A: 300〜599秒', 'B: 600〜999秒', 'C: 1,000秒以上'],
        title: 'ランクの決まり方',
      },
      steps: [
        '空いているマスを選び、数字パッドから1〜9を入力します。最初から表示されている数字は変更できません。',
        '各行、各列、太線で囲まれた3 × 3のブロックに、1〜9を1回ずつ入れます。同じ数字が重なると赤く表示されます。',
        '候補を残したいときは「メモ」へ切り替えます。ガイド、同じ数字の強調、ヒント、元に戻す操作も利用できます。すべて正しく埋めればクリアです。',
      ],
      strategy: {
        generator: '一意解判定はAlgorithm X / Dancing Linksで行います。「入門」は候補が1つのマスを埋め続けるだけで完走できることも検査します。難易度分析は裸／隠れシングル、ロック候補、裸／隠れペア、X-Wing、XY-Wing、単純連鎖を順に適用し、最難手筋、使用回数、候補削除数、残った探索量をratingへ反映します。ふつう・むずかしい・エキスパートは、それぞれ2・3・6個の候補からratingが高い問題を選びます。',
        generatorTitle: '問題生成との関係',
        intro: '当てずっぽうで数字を置く前に、次の順序で候補を狭めます。数字を1つ置くたびに盤面の条件が変わるので、最初から同じ順序を繰り返すのが基本です。',
        steps: [
          '候補を作る: 空欄ごとに、同じ行、同じ列、同じ3 × 3ブロックにすでにある数字を除外します。残った数字をメモに記録します。',
          '裸のシングルを探す: あるマスの候補が1つだけなら、その数字で確定です。「入門」は、この手順を繰り返すだけで必ず最後まで解けます。',
          '隠れシングルを探す: 1つのマスに候補が複数あっても、行・列・ブロックの中で、ある数字を置ける場所がそのマスしかなければ確定です。現行の難易度分析も、裸のシングルの次にこの手筋を使います。',
          '確定した場所の周囲を見直す: 数字を置いた行、列、ブロックからその候補を消し、新しく生まれた裸／隠れシングルを探します。盤面全体を何度も眺めるより、変化した3つの範囲から確認すると効率的です。',
          '基本手筋で止まったら候補同士を見る: 同じ2候補が2マスだけを占めるペア、ブロック内の候補が1つの行・列に限定されるロック候補、X-Wing、XY-Wing、単純連鎖の順で候補を消します。現行の難易度分析も同じ順序で手筋を分類します。',
          '矛盾を避けて進める: 一意解は保証されていますが、上位難易度のratingにはバックトラック探索量も含まれます。これは難しさを測るための内部指標で、攻略時に推測を勧めるものではありません。論理的な候補消去で進め、必要な場合だけヒントを使います。',
        ],
        title: '論理的な攻略手順',
        variants: [
          'クラシック: 完成盤から手掛かりを1つずつ抜き、一意解を保つ従来型です。行、列、3 × 3 ブロックの標準ルールだけで解きます。難易度が上がると、目標の手掛かり数が50、42、34、28、24と減ります。',
          '対称: 180 度回転で対応する2マスを組として抜き、どの残存ペアもさらに抜けないペア最小問題です。解くルールはクラシックと同じです。入門とやさしいでは論理手筋で解けることを確認し、上位難易度では生成候補を増やして rating の高い盤面を選びます。',
          'キラー: 標準ルールに加え、破線で囲まれた空欄ケージ内で数字を重複させず、左上の合計値へ合わせます。難易度が上がると与え数字が減り、最大ケージサイズが1マスから5マスまで増えるため、合計から候補を絞る場面が増えます。',
          '難易度表示は各タイプ内の相対的な目安です。クラシック／対称とキラーでは rating の計算方法が異なるため、タイプをまたいだ数値の大小は難しさの直接比較には使えません。',
        ],
        variantsTitle: '問題タイプ別の追加ルール',
      },
      summary: '9 × 9の盤面を、同じ行・列・3 × 3ブロックで数字が重複しないように1〜9で埋めるゲームです。',
      tips: ['空欄を選んで1〜9を入力', '行・列・3 × 3で重複させない', 'すべて正しく埋めればクリア'],
      title: '数独の遊び方',
    },
  },
  en: {
    details: 'Full instructions',
    detailsClose: 'Close details',
    detailsCloseTooltip: 'Collapse the expanded controls, grade rules, and strategy details.',
    detailsHeading: 'Controls and win condition',
    detailsTooltip: 'Expand controls, win conditions, grade rules, and strategy details.',
    hide: 'Hide how to play',
    hideTooltip: 'Hide these instructions. Use How to play on the right to restore them.',
    minesweeper: {
      rank: {
        intro: 'Your clear grade uses score ÷ (safe cells × 10). Time does not affect grade and is tracked separately as best time. Larger cascades are the main route to a higher grade.',
        items: [
          'S: efficiency 3.8+. Beginner 3,420 / Intermediate 12,920 / Expert 48,640 points',
          'A: efficiency 2.7+. Beginner 2,430 / Intermediate 9,180 / Expert 34,560 points',
          'B: efficiency 1.7+. Beginner 1,530 / Intermediate 5,780 / Expert 21,760 points',
          'C: below 1.7. Build larger empty-cell cascades instead of opening only small groups',
        ],
        title: 'How grades work',
      },
      steps: [
        'Each number tells you how many mines are hidden in the eight surrounding cells. Use the numbers to identify safe cells.',
        'Touch and pen users choose Open or Mark. Mark cycles Flag → ? → Clear. Right-click and hold remain marking shortcuts.',
        'Press an open number again to open its remaining neighbors when the surrounding flag count matches. Change Guess-free under Game settings; it applies to the next board. Open every safe cell to win.',
      ],
      summary: 'Open every safe cell without hitting a mine. Your first cell and its eight neighbors are always safe.',
      tips: ['Numbers count adjacent mines', 'Choose Open or Mark for touch', 'Open every safe cell to win'],
      title: 'How to play Minesweeper',
    },
    restore: 'How to play',
    restoreTooltip: 'Restore the hidden overview and full instructions.',
    shisen: {
      rank: {
        intro: 'Grade penalty is clear time in seconds + 120 seconds per reshuffle. Hints do not affect grade. Avoiding one reshuffle is equivalent to finishing two minutes faster.',
        items: ['S: 359 seconds or less', 'A: 360–719 seconds', 'B: 720–1,199 seconds', 'C: 1,200 seconds or more'],
        title: 'How grades work',
      },
      steps: [
        'Select two tiles with the same symbol. They are removed when a valid line can connect them.',
        'The line may travel only through empty spaces and turn at most twice. It may also travel around the outside of the board.',
        'Use Fit to screen to show the whole layout. Use a hint when you cannot find a pair, or reshuffle into another solvable layout when stuck. Remove every tile to win.',
      ],
      summary: 'Match identical tiles that can be connected by a line with no more than two turns. The line cannot pass through other tiles.',
      tips: ['Select two identical tiles', 'The path may turn at most twice', 'Remove every tile to win'],
      title: 'How to play Shisen-Sho',
    },
    sudoku: {
      rank: {
        intro: 'Grade penalty is clear time in seconds + 90 seconds per hint + 35 seconds per mistake. Puzzle type and difficulty do not change the formula. Reduce hints and mistakes as well as time to rank up.',
        items: ['S: 299 seconds or less', 'A: 300–599 seconds', 'B: 600–999 seconds', 'C: 1,000 seconds or more'],
        title: 'How grades work',
      },
      steps: [
        'Select an empty cell and enter a number from 1 to 9. The numbers supplied by the puzzle cannot be changed.',
        'Place 1 through 9 exactly once in every row, column, and bold 3 × 3 box. Duplicate numbers are shown in red.',
        'Switch to Notes to record candidates. You can also use the placement guide, matching-number highlight, hint, and undo controls. Fill every cell correctly to win.',
      ],
      strategy: {
        generator: 'Uniqueness is checked with Algorithm X / Dancing Links. Beginner also verifies that repeatedly filling cells with one candidate completes the puzzle. Difficulty analysis applies naked and hidden singles, locked candidates, naked and hidden pairs, X-Wing, XY-Wing, and simple coloring in order. The rating records the hardest technique, its uses, candidate eliminations, and remaining search effort. Normal, Hard, and Expert choose the highest-rated puzzle from 2, 3, and 6 candidates.',
        generatorTitle: 'How generation affects solving',
        intro: 'Before guessing a number, narrow the candidates in this order. Every confirmed number changes the board, so the key habit is to repeat the same sequence after each placement.',
        steps: [
          'Build candidates: for each empty cell, eliminate every number already present in its row, column, and 3 × 3 box. Record the remaining numbers as notes.',
          'Find naked singles: when a cell has only one candidate, that number is forced. Every Beginner puzzle is guaranteed to finish by repeating this technique.',
          'Find hidden singles: a cell may have several candidates, but if one number has no other possible position in its row, column, or box, it is forced there. The current analyzer applies this after naked singles.',
          'Rescan the affected units: after placing a number, remove it from candidates in the same row, column, and box. Check those three areas first for newly created naked or hidden singles.',
          'When basic singles stop, compare candidates: eliminate candidates with pairs, locked candidates, X-Wing, XY-Wing, then simple coloring. The current analyzer classifies techniques in the same order.',
          'Progress without contradictions: every puzzle has one solution, but higher ratings also include backtracking search effort. That is an internal difficulty measurement, not a recommendation to guess. Continue eliminating candidates logically and use a hint only when needed.',
        ],
        title: 'A logical solving sequence',
        variants: [
          'Classic: removes individual clues from a solved board while preserving one solution. You solve it with only the standard row, column, and 3 × 3 box rules. Higher difficulties reduce the target clue counts through 50, 42, 34, 28, and 24.',
          'Symmetric: removes 180° rotational pairs until no remaining pair can be removed without losing uniqueness. Its solving rules are the same as Classic. Beginner and Easy verify logical solvability, while higher difficulties consider more generated candidates and select a higher-rated board.',
          'Killer: adds connected dashed cages to the standard rules. Digits cannot repeat within a cage and must reach its upper-left sum. Higher difficulties supply fewer digits and increase the maximum cage size from one to five cells, requiring more deductions from sums.',
          'Difficulty is relative within each puzzle type. Classic/Symmetric and Killer use different rating formulas, so their rating numbers do not directly compare difficulty across types.',
        ],
        variantsTitle: 'Additional rules by puzzle type',
      },
      summary: 'Fill the 9 × 9 grid with 1 through 9 without repeating a number in any row, column, or 3 × 3 box.',
      tips: ['Select a cell and enter 1–9', 'No repeats in rows, columns, or boxes', 'Fill every cell correctly to win'],
      title: 'How to play Sudoku',
    },
  },
} as const

export function GameHowTo({
  game,
  showSudokuPreviewDetails = false,
}: {
  game: HowToGameId
  showSudokuPreviewDetails?: boolean
}) {
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
          data-tooltip={copy.restoreTooltip}
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
            data-tooltip={detailsOpen ? copy.detailsCloseTooltip : copy.detailsTooltip}
            onClick={() => setDetailsOpen((current) => !current)}
            type="button"
          >
            {detailsOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            {detailsOpen ? copy.detailsClose : copy.details}
          </button>
          <button
            aria-label={copy.hide}
            data-tooltip={copy.hideTooltip}
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
          <section className="game-rank-guide">
            <h3>{gameCopy.rank.title}</h3>
            <p>{gameCopy.rank.intro}</p>
            <ul>
              {gameCopy.rank.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
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
              {showSudokuPreviewDetails ? (
                <div className="sudoku-variant-help">
                  <h3>{gameCopy.strategy.variantsTitle}</h3>
                  <ul>
                    {gameCopy.strategy.variants.map((variant) => <li key={variant}>{variant}</li>)}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
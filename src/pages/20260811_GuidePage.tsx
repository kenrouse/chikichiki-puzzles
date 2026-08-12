import { ArrowLeft, Binary, BrainCircuit, Grid3X3, Route, ShieldCheck } from 'lucide-react'
import { Fragment } from 'react'
import { useAppExperience } from '../experience/20260811_AppExperience'
import { getLocalizedCopy } from '../i18n/20260812_i18n'

const GUIDE_COPY = {
  ja: {
    back: 'ゲームへ戻る',
    hero: ['ゲームは、どのように', '作られているのか。'],
    intro: '当時のアイデアを出発点に、再現可能な乱数、探索アルゴリズム、テストできる難易度指標を加えました。ここでは、画面の裏側で行われる計算を説明します。',
    index: { label: '制作ノートの目次', sudoku: '数独', mines: 'マインスイーパ', shisen: '四川省', practice: '設計原則' },
    sudoku: {
      title: '一意解を保ち、3つの問題タイプを作る',
      intro: '最初に完成した 9 × 9 の盤面を作ります。クラシックは数字を1つずつ、対称は180度回転で対応する2マスずつ抜きます。数字を抜くたびにAlgorithm X / Dancing Linksで解を最大2個まで数え、解が1個のときだけ採用します。Killerは一意解の与え数字を残し、空欄を連結ケージへまとめて合計値を付けます。',
      flowLabel: '数独生成の流れ',
      flow: ['完成盤', '数字を抜く', '解を数える', '一意解を採用'],
      difficultyTitle: '難易度は、手掛かりの数だけでは決まりません',
      difficulty: '空欄数だけでなく、裸／隠れシングル、ロック候補、裸／隠れペア、X-Wing、XY-Wing、単純連鎖を順に適用し、最難手筋、使用回数、候補削除数を記録します。人間手筋で残った部分だけ探索し、その分岐数とノード数もratingへ加えます。',
      input: '数字パッドの左クリックは「確定（大きい数字）」と「メモ（小さい数字）」を常設の切替で選べます。右クリックは選択中のモードに関係なくメモ入力になり、確定値が置かれたマスでも小さい候補へ置き換えられます。',
      legacyTitle: '旧版の3レベルを出発点に、5段階へ作り直す',
      legacy: '2006年のiアプリと2011年のAndroid版は、完成盤から数字をランダムに抜き、LEVEL1は候補列挙、LEVEL2は行・列・3 × 3ブロック内の隠れシングル相当、LEVEL3は確定候補の伝播まで使って、その数字を抜いてよいか判定していました。LEVEL4とLEVEL5はメニューだけで未実装でした。',
      tableLabel: 'クラシック数独の難易度生成方法',
      headers: ['難易度', '目標手掛かり', '生成候補と採用条件'],
      rows: [['入門', '50', '1候補／裸のシングル完走を保証'], ['やさしい', '42', '1候補／一意解を採用'], ['ふつう', '34', '2候補／rating最大'], ['むずかしい', '28', '3候補／rating最大'], ['エキスパート', '24', '6候補／rating最大']],
      rating: '入門は裸のシングルだけで完走できることを保証します。ふつう、むずかしい、エキスパートは2、3、6候補から高度手筋と残存探索量を含むratingが最大の問題を選びます。対称は残ったどの対応ペアもさらに抜けないペア最小、Killerは与え数字とケージ合計で一意解を構成します。',
      futureTitle: '実装済みの生成拡張',
      future: '一意解判定にはAlgorithm X / Dancing Linksを使用します。クラシックに加え、180度回転対称のペア最小問題と、連結した空欄ケージの合計制約を使うKillerを選択できます。問題タイプとseedは共有URLへ保存されます。',
    },
    mines: {
      title: '最初の 1 手が決まってから地雷を置く',
      intro: '盤面を開いた瞬間に、選んだマスと周囲8マスを安全領域として地雷を配置します。タッチ／ペンでは「開く／マーク」を選び、マークは旗、?、解除の順に切り替えます。長押しもマークのショートカットとして残します。指やペンが一定距離動いた場合はドラッグとして扱い、開封とマークをキャンセルします。',
      fairnessTitle: '公平性を先に定義する',
      fairness: '推測不要モードでは、候補盤面を生成するたびに、公開された数字、残りの地雷数、制約同士の包含関係から安全マスと地雷を確定するソルバーを実行します。すべての安全マスを確定できた候補だけを採用するため、運に頼らず最後まで進めます。OFFにすると、初手と周囲だけを安全にするクラシック配置へ戻ります。',
    },
    shisen: {
      title: '位置、向き、曲がった回数を探索する',
      intro: '経路探索の状態は「現在位置」「進行方向」「曲がった回数」です。幅優先探索で空白と盤外を進み、曲がった回数が 2 回を超えた枝を捨てます。同じ牌へ到達した最短経路だけを画面に描きます。',
      solvableTitle: '必ず解ける盤面を逆向きに組み立てる',
      solvable: '空の盤面へ牌を置く手順を直接考える代わりに、満杯の盤面から取り除ける 2 マスを順番に記録します。その順序に同じ牌を割り当てると、記録をたどれば最後まで消せる配牌になります。',
      metricTitle: '難易度の指標',
      metric: '合法手の数が少ないほど選択の幅が狭くなり、2 回曲がる経路や盤外経路の比率が高いほど見つけにくくなります。',
      candidates: '複数の候補盤面を生成し、初期合法手数と解答途中の平均分岐数を測れば、「牌数が多いから難しい」ではなく、探索空間の狭さで難易度を作れます。',
    },
    practice: {
      title: '遊びやすさを、仕組みにする',
      items: [['即時フィードバック', '操作結果を色、動き、音の複数経路で返します。音がなくても状態を理解できます。'], ['再現可能性', 'seed と必要な初期条件を URL と QR コードに保存し、同じゲームを共有できます。'], ['中断と復帰', '進行状況を端末内へ保存し、ページを閉じても続きから遊べるようにします。'], ['入力の選択肢', 'タッチ、ペン、マウス、キーボードを同じゲーム状態へ接続します。ペン入力安定化ではペン先の微小なずれによるブラウザースクロールを抑止できます。'], ['盤面への集中', '集中モードで周辺 UI を隠し、必要ならブラウザー全画面へ切り替えます。盤面内の端ではページスクロールへ引き継ぎます。'], ['動きへの配慮', 'OS の「視差効果を減らす」設定に合わせ、必須でないアニメーションを止めます。'], ['ローカル優先', 'アカウントや通信を必要とせず、記録をブラウザー内だけに保存します。']],
    },
  },
  en: {
    back: 'Back to games',
    hero: ['How are these games', 'built?'],
    intro: 'Starting from the original ideas, the rebuilt games add reproducible randomness, search algorithms, and testable difficulty metrics. This page explains the calculations behind the screen.',
    index: { label: 'Design notes index', sudoku: 'Sudoku', mines: 'Minesweeper', shisen: 'Shisen-Sho', practice: 'Design principles' },
    sudoku: {
      title: 'Preserve one solution across three puzzle types',
      intro: 'The generator first creates a solved 9 × 9 board. Classic removes individual clues, while Symmetric removes 180° rotational pairs. After every removal, Algorithm X / Dancing Links counts up to two solutions and keeps only unique boards. Killer retains uniquely solvable givens and groups the empty cells into connected sum cages.',
      flowLabel: 'Sudoku generation flow',
      flow: ['Solved board', 'Remove a number', 'Count solutions', 'Keep unique puzzle'],
      difficultyTitle: 'Clue count alone does not determine difficulty',
      difficulty: 'The analyzer applies naked and hidden singles, locked candidates, naked and hidden pairs, X-Wing, XY-Wing, then simple coloring. It records the hardest technique, use count, and candidate eliminations. Only the remainder is searched, adding branches and nodes to the rating.',
      input: 'Left-click input has persistent Answer (large number) and Notes (small candidates) modes. Right-click always enters a note, and an entered answer can be replaced with candidate notes.',
      legacyTitle: 'Rebuilding three original levels as five modern levels',
      legacy: 'The 2006 i-appli and 2011 Android versions created a solved board, then removed random numbers. LEVEL1 used candidate enumeration, LEVEL2 added hidden-single-like checks across rows, columns, and boxes, and LEVEL3 propagated confirmed candidates. LEVEL4 and LEVEL5 appeared in the menu but were not implemented.',
      tableLabel: 'Classic Sudoku difficulty generation',
      headers: ['Difficulty', 'Target clues', 'Candidates and selection'],
      rows: [['Beginner', '50', '1 candidate / naked singles guaranteed'], ['Easy', '42', '1 candidate / unique solution'], ['Normal', '34', 'highest rating of 2 candidates'], ['Hard', '28', 'highest rating of 3 candidates'], ['Expert', '24', 'highest rating of 6 candidates']],
      rating: 'Beginner guarantees completion by naked singles. Normal, Hard, and Expert select the highest rating from 2, 3, and 6 candidates, including advanced techniques and remaining search effort. Symmetric is pair-minimal, while Killer combines givens and cage sums to define one solution.',
      futureTitle: 'Implemented generator extensions',
      future: 'Uniqueness uses Algorithm X / Dancing Links. In addition to Classic, you can select a pair-minimal 180° Symmetric puzzle or Killer with connected empty-cell sum cages. The puzzle type and seed are preserved in shared URLs.',
    },
    mines: {
      title: 'Place mines after the first move is known',
      intro: 'When the first cell is opened, the game places mines while reserving it and its eight neighbors as safe. Touch and pen users choose Open or Mark; Mark cycles Flag, ?, and Clear. A hold remains a marking shortcut. Moving beyond the swipe threshold cancels both opening and marking.',
      fairnessTitle: 'Define fairness before generating the board',
      fairness: 'Guess-free mode tests each candidate board with a solver that derives safe cells and mines from visible numbers, remaining mine count, and subset relationships between constraints. Only candidates that can be completed entirely by logic are accepted. Turning it off returns to classic generation, which guarantees only a safe first move and its neighbors.',
    },
    shisen: {
      title: 'Search by position, direction, and turn count',
      intro: 'Each pathfinding state contains the current position, travel direction, and number of turns. A breadth-first search moves through empty cells and outside the board, discarding branches that turn more than twice. The shortest valid path to the matching tile is drawn on screen.',
      solvableTitle: 'Build a guaranteed-solvable layout in reverse',
      solvable: 'Instead of directly deciding where to place pairs on an empty board, the generator starts with a full board and records removable cell pairs. Assigning identical tiles in that recorded order creates a layout that can always be completed by following the sequence.',
      metricTitle: 'Difficulty metric',
      metric: 'Fewer legal moves mean less choice, while a higher proportion of two-turn and outside-board paths makes pairs harder to spot.',
      candidates: 'By generating multiple candidate boards and measuring initial legal moves and average branching during the solution, difficulty can reflect the narrowness of the search space rather than tile count alone.',
    },
    practice: {
      title: 'Make ease of play part of the system',
      items: [['Immediate feedback', 'Return results through color, motion, and sound. Every state remains understandable without audio.'], ['Reproducibility', 'Store the seed and required initial conditions in URLs and QR codes so the same game can be shared.'], ['Pause and resume', 'Save progress locally so play can continue after the page is closed.'], ['Input choices', 'Connect touch, pen, mouse, and keyboard to the same game state. Pen stabilization prevents tiny pen movements from starting browser scrolling.'], ['Board focus', 'Focus mode hides surrounding UI and can enter browser fullscreen. Scrolling transfers back to the page at the edge of a board.'], ['Motion preferences', 'Respect the operating system’s reduced-motion setting and stop nonessential animation.'], ['Local first', 'Require no account or network connection and store records only in the browser.']],
    },
  },
} as const

export function GuidePage({ onBack }: { onBack: () => void }) {
  const { preferences } = useAppExperience()
  const copy = getLocalizedCopy(preferences.language, GUIDE_COPY)

  function scrollToSection(id: string): void {
    const section = document.getElementById(id)
    if (!section) return
    const headerHeight = document.querySelector<HTMLElement>('.app-header')?.offsetHeight ?? 0
    window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - headerHeight - 16 })
  }

  return (
    <article className="guide-page">
      <header className="guide-hero">
        <button className="guide-back" onClick={onBack} type="button"><ArrowLeft aria-hidden="true" /> {copy.back}</button>
        <p className="eyebrow">DESIGN NOTES / REBUILT 2026</p>
        <h1>{copy.hero[0]}<br />{copy.hero[1]}</h1>
        <p>{copy.intro}</p>
      </header>
      <nav aria-label={copy.index.label} className="guide-index">
        <button onClick={() => scrollToSection('sudoku')} type="button"><Grid3X3 aria-hidden="true" /> {copy.index.sudoku}</button>
        <button onClick={() => scrollToSection('mines')} type="button"><Binary aria-hidden="true" /> {copy.index.mines}</button>
        <button onClick={() => scrollToSection('shisen')} type="button"><Route aria-hidden="true" /> {copy.index.shisen}</button>
        <button onClick={() => scrollToSection('practice')} type="button"><ShieldCheck aria-hidden="true" /> {copy.index.practice}</button>
      </nav>
      <section id="sudoku" className="guide-section">
        <div className="guide-number">01</div>
        <div>
          <p className="eyebrow">AUTOMATIC SUDOKU</p><h2>{copy.sudoku.title}</h2><p>{copy.sudoku.intro}</p>
          <div className="algorithm-flow" aria-label={copy.sudoku.flowLabel}>{copy.sudoku.flow.map((step, index) => <Fragment key={step}>{index > 0 ? <i>→</i> : null}<span>{step}</span></Fragment>)}</div>
          <h3>{copy.sudoku.difficultyTitle}</h3><p>{copy.sudoku.difficulty}</p><p>{copy.sudoku.input}</p><h3>{copy.sudoku.legacyTitle}</h3><p>{copy.sudoku.legacy}</p>
          <div className="sudoku-difficulty-table" role="table" aria-label={copy.sudoku.tableLabel}>
            <div role="row">{copy.sudoku.headers.map((header) => <strong role="columnheader" key={header}>{header}</strong>)}</div>
            {copy.sudoku.rows.map((row) => <div role="row" key={row[0]}>{row.map((cell) => <span role="cell" key={cell}>{cell}</span>)}</div>)}
          </div>
          <p>{copy.sudoku.rating}</p><aside><BrainCircuit aria-hidden="true" /><div><strong>{copy.sudoku.futureTitle}</strong><span>{copy.sudoku.future}</span></div></aside>
        </div>
      </section>
      <section id="mines" className="guide-section"><div className="guide-number">02</div><div><p className="eyebrow">MINESWEEPER</p><h2>{copy.mines.title}</h2><p>{copy.mines.intro}</p><h3>{copy.mines.fairnessTitle}</h3><p>{copy.mines.fairness}</p></div></section>
      <section id="shisen" className="guide-section"><div className="guide-number">03</div><div><p className="eyebrow">SHISEN-SHO</p><h2>{copy.shisen.title}</h2><p>{copy.shisen.intro}</p><h3>{copy.shisen.solvableTitle}</h3><p>{copy.shisen.solvable}</p><div className="formula-card"><strong>{copy.shisen.metricTitle}</strong><span>{copy.shisen.metric}</span></div><p>{copy.shisen.candidates}</p></div></section>
      <section id="practice" className="guide-section guide-practices"><div className="guide-number">04</div><div><p className="eyebrow">GAME DESIGN PRACTICES</p><h2>{copy.practice.title}</h2><div className="practice-grid">{copy.practice.items.map(([title, description]) => <section key={title}><strong>{title}</strong><span>{description}</span></section>)}</div></div></section>
    </article>
  )
}
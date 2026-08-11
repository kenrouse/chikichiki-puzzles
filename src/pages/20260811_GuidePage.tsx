import { ArrowLeft, Binary, BrainCircuit, Grid3X3, Route, ShieldCheck } from 'lucide-react'

export function GuidePage({ onBack }: { onBack: () => void }) {
  function scrollToSection(id: string): void {
    const section = document.getElementById(id)
    if (!section) {
      return
    }
    const headerHeight =
      document.querySelector<HTMLElement>('.app-header')?.offsetHeight ?? 0
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().top - headerHeight - 16,
    })
  }

  return (
    <article className="guide-page">
      <header className="guide-hero">
        <button className="guide-back" onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" /> ゲームへ戻る
        </button>
        <p className="eyebrow">DESIGN NOTES / REBUILT 2026</p>
        <h1>ゲームは、どのように<br />作られているのか。</h1>
        <p>
          当時のアイデアを出発点に、再現可能な乱数、探索アルゴリズム、テストできる難易度指標を加えました。ここでは、画面の裏側で行われる計算を説明します。
        </p>
      </header>

      <nav aria-label="制作ノートの目次" className="guide-index">
        <button onClick={() => scrollToSection('sudoku')} type="button"><Grid3X3 aria-hidden="true" /> 数独</button>
        <button onClick={() => scrollToSection('mines')} type="button"><Binary aria-hidden="true" /> マインスイーパ</button>
        <button onClick={() => scrollToSection('shisen')} type="button"><Route aria-hidden="true" /> 四川省</button>
        <button onClick={() => scrollToSection('practice')} type="button"><ShieldCheck aria-hidden="true" /> 設計原則</button>
      </nav>

      <section id="sudoku" className="guide-section">
        <div className="guide-number">01</div>
        <div>
          <p className="eyebrow">AUTOMATIC SUDOKU</p>
          <h2>一意解を保ったまま、数字を抜く</h2>
          <p>
            最初に完成した 9 × 9 の盤面を作り、行、列、3 × 3 ブロックの制約を満たすよう数字を並べ替えます。その後、マスを 1 つずつ空欄にします。数字を抜くたびに解を最大 2 個まで探索し、解が 1 個のときだけ変更を採用します。
          </p>
          <div className="algorithm-flow" aria-label="数独生成の流れ">
            <span>完成盤</span><i>→</i><span>数字を抜く</span><i>→</i><span>解を数える</span><i>→</i><span>一意解を採用</span>
          </div>
          <h3>難易度は、手掛かりの数だけでは決まりません</h3>
          <p>
            空欄が多くても、裸のシングルだけで解ける問題は難しくありません。現代版では、確定できるマスの数、探索で分岐した回数、探索ノード数を組み合わせて難易度を評価します。さらに難しくする場合は、ロック候補、ペア、X-Wing、XY-Wing、連鎖など、人間が使う解法を順番に適用し、最も高度な手筋で等級を決める方法が有効です。
          </p>
          <aside>
            <BrainCircuit aria-hidden="true" />
            <div><strong>発展案</strong><span>Algorithm X / Dancing Links で一意解を高速判定し、回転対称な最小問題や Killer Sudoku の和制約へ拡張できます。</span></div>
          </aside>
        </div>
      </section>

      <section id="mines" className="guide-section">
        <div className="guide-number">02</div>
        <div>
          <p className="eyebrow">MINESWEEPER</p>
          <h2>最初の 1 手が決まってから地雷を置く</h2>
          <p>
            盤面を開いた瞬間に、選んだマスと周囲 8 マスを安全領域として地雷を配置します。空白マスからは幅優先探索で周囲を開きます。共有 URL には seed と最初の 1 手を記録するため、受け取った側でも同じ初期展開とスコアを再現できます。
          </p>
          <h3>公平性を先に定義する</h3>
          <p>
            推測不要モードでは、候補盤面を生成するたびに、公開された数字、残りの地雷数、制約同士の包含関係から安全マスと地雷を確定するソルバーを実行します。すべての安全マスを確定できた候補だけを採用するため、運に頼らず最後まで進めます。OFFにすると、初手と周囲だけを安全にするクラシック配置へ戻ります。
          </p>
        </div>
      </section>

      <section id="shisen" className="guide-section">
        <div className="guide-number">03</div>
        <div>
          <p className="eyebrow">SHISEN-SHO</p>
          <h2>位置、向き、曲がった回数を探索する</h2>
          <p>
            経路探索の状態は「現在位置」「進行方向」「曲がった回数」です。幅優先探索で空白と盤外を進み、曲がった回数が 2 回を超えた枝を捨てます。同じ牌へ到達した最短経路だけを画面に描きます。
          </p>
          <h3>必ず解ける盤面を逆向きに組み立てる</h3>
          <p>
            空の盤面へ牌を置く手順を直接考える代わりに、満杯の盤面から取り除ける 2 マスを順番に記録します。その順序に同じ牌を割り当てると、記録をたどれば最後まで消せる配牌になります。
          </p>
          <div className="formula-card">
            <strong>難易度の指標</strong>
            <span>合法手の数が少ないほど選択の幅が狭くなり、2 回曲がる経路や盤外経路の比率が高いほど見つけにくくなります。</span>
          </div>
          <p>
            複数の候補盤面を生成し、初期合法手数と解答途中の平均分岐数を測れば、「牌数が多いから難しい」ではなく、探索空間の狭さで難易度を作れます。
          </p>
        </div>
      </section>

      <section id="practice" className="guide-section guide-practices">
        <div className="guide-number">04</div>
        <div>
          <p className="eyebrow">GAME DESIGN PRACTICES</p>
          <h2>遊びやすさを、仕組みにする</h2>
          <div className="practice-grid">
            <section><strong>即時フィードバック</strong><span>操作結果を色、動き、音の複数経路で返します。音がなくても状態を理解できます。</span></section>
            <section><strong>再現可能性</strong><span>seed と必要な初期条件を URL と QR コードに保存し、同じゲームを共有できます。</span></section>
            <section><strong>中断と復帰</strong><span>進行状況を端末内へ保存し、ページを閉じても続きから遊べるようにします。</span></section>
            <section><strong>入力の選択肢</strong><span>タッチ、マウス、キーボードを同じゲーム状態へ接続します。</span></section>
            <section><strong>動きへの配慮</strong><span>OS の「視差効果を減らす」設定に合わせ、必須でないアニメーションを止めます。</span></section>
            <section><strong>ローカル優先</strong><span>アカウントや通信を必要とせず、記録をブラウザー内だけに保存します。</span></section>
          </div>
        </div>
      </section>
    </article>
  )
}
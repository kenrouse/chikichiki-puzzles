# ちきちきパズルズ

2006年から2009年にNTTドコモのiアプリとして作った3つのパズルゲームを、2026年のWeb技術で再構築したインストール可能なPWAです。

- **おーとまちっく数独**: 唯一解を保証した問題生成、候補メモ、Undo、ヒント、3段階の難易度
- **ちきちきまいんすいーぱ。**: 初手安全、旗、周囲の一括展開、3段階の盤面、ハイスコア
- **四川省**: 2回以内に曲がる経路探索、必ず解ける配牌、ヒント、Undo、再配置

## 公開サイト

[https://kenrouse.github.io/chikichiki-puzzles/](https://kenrouse.github.io/chikichiki-puzzles/)

初回アクセス後はオフラインでも遊べます。ゲームの進行、設定、記録はブラウザーのローカルストレージにのみ保存し、外部へ送信しません。

## 技術構成

- React 19 / TypeScript 6 / Vite 8
- `vite-plugin-pwa` / Workbox
- Vitest
- GitHub Actions / GitHub Pages

ゲームルールはUIから独立した純TypeScriptとして実装し、同じseedから同じ盤面を再現できるようにしています。

## 開発

Node.js 24以降とnpm 11以降を使用します。

```powershell
npm ci
npm run dev
```

検証コマンド:

```powershell
npm run lint
npm test
npm run build
```

本番ビルドはGitHub Pagesのプロジェクトパス `/chikichiki-puzzles/` を基底URLとして生成されます。
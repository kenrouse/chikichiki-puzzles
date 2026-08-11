import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/chikichiki-puzzles/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      base,
      includeAssets: [
        'apple-touch-icon.png',
        'puzzle-mark.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],
      manifest: {
        background_color: '#f4f1e8',
        categories: ['games', 'entertainment'],
        description:
          '2006年から2009年に作られた数独、マインスイーパ、四川省を現代のWebアプリとして再構築。',
        display: 'standalone',
        id: base,
        lang: 'ja',
        name: 'ちきちきパズルズ',
        orientation: 'any',
        scope: base,
        short_name: 'ちきちき',
        start_url: `${base}#/sudoku`,
        theme_color: '#173f37',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      registerType: 'prompt',
      scope: base,
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{css,html,js,png,svg,webmanifest}'],
      },
    }),
  ],
})

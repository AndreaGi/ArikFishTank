import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Arik Fish Tank',
        short_name: 'Arik Fish',
        description: "Il diario delle analisi dell'acquario di Arik",
        lang: 'it',
        display: 'standalone',
        start_url: './',
        background_color: '#e6f7ff',
        theme_color: '#0ea5c6',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
  test: { environment: 'node' },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'templates/parte-lesiones.pdf'],
      manifest: {
        name: 'Gestión Muro CF',
        short_name: 'Muro CF',
        description: 'Gestión interna y documentación por lesión - Muro Club de Fútbol',
        theme_color: '#C8102E',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The injury-report template and app shell should work offline.
        globPatterns: ['**/*.{js,css,html,svg,png,pdf}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})

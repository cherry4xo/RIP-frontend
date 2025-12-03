import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined || process.env.TAURI_BUILD === 'true'
  const base = isTauri ? './' : (mode === 'production' ? '/RIP-frontend/' : '/')

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        disable: isTauri, // Отключаем PWA для Tauri
        registerType: 'autoUpdate',
        includeAssets: ['logo.svg', 'home.svg'],
        devOptions: {
          enabled: true,
          type: 'module'
        },
        manifest: {
          name: 'Positive Tech - Оценка уязвимостей',
          short_name: 'Positive Tech',
          description: 'Профессиональная оценка уязвимостей IT-инфраструктуры',
          theme_color: '#e4002b',
          background_color: '#0a0a0a',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ]
        },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 минут
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
}
})

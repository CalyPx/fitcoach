import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

/**
 * Serves POST /api/analyze-meal directly from the Vite dev server, mirroring
 * api/analyze-meal.ts (the Vercel function used in production) so the AI
 * meal-analysis path works under plain `npm run dev` too, not only once
 * deployed. Both import the same shared core (api/_lib/analyzeMealCore.mjs).
 */
function analyzeMealDevMiddleware(): Plugin {
  return {
    name: 'analyze-meal-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/analyze-meal', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf-8')) : {}

          const { runAnalyzeMeal } = await import('./api/_lib/analyzeMealCore.mjs')
          const result = await runAnalyzeMeal(body)

          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result.body))
        } catch (err) {
          console.error('analyze-meal dev middleware error', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars to client code via import.meta.env;
  // this loads the rest (ANTHROPIC_API_KEY) into process.env for the dev
  // middleware above to read, without ever shipping it to the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
  plugins: [
    react(),
    tailwindcss(),
    analyzeMealDevMiddleware(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: 'FitCoach',
        short_name: 'FitCoach',
        description: 'AI fitness coach for Nepali households',
        theme_color: '#14181a',
        background_color: '#14181a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache the app shell + the workout screen so it works offline.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  }
})

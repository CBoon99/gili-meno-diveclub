// @ts-check
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import netlify from '@astrojs/netlify'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  site: 'https://menodiveclub.com',

  // Server output with per-page prerender opt-in (Astro 6 equivalent of legacy "hybrid").
  // All marketing pages export `prerender = true` for max SEO + Netlify Forms detection.
  // Only /api/* routes run server-side as Netlify Functions.
  output: 'server',
  adapter: netlify(),

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false, // / for English, /fr/ for French
    },
  },

  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-AU', fr: 'fr-FR' },
      },
      changefreq: 'weekly',
      priority: 0.8,
    }),
    mdx(),
  ],

  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
      // @react-three/drei → detect-gpu: Vite was resolving the UMD `main` and choking on CJS named exports.
      alias: {
        'detect-gpu': path.resolve(__dirname, 'node_modules/detect-gpu/dist/detect-gpu.esm.js'),
      },
    },
    ssr: {
      noExternal: ['three', '@react-three/fiber', '@react-three/drei', 'detect-gpu'],
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei', 'detect-gpu'],
    },
  },

  image: {
    domains: ['images.unsplash.com', 'menodiveclub.com'],
    remotePatterns: [{ protocol: 'https' }],
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  experimental: {
    clientPrerender: true,
  },
})

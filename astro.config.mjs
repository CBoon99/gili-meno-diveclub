// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import netlify from '@astrojs/netlify'

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
      prefixDefaultLocale: false,
    },
  },

  integrations: [
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

  image: {
    domains: ['images.unsplash.com', 'menodiveclub.com'],
    remotePatterns: [{ protocol: 'https' }],
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
})

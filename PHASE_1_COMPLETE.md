# ✅ Phase 1 complete — Scaffolding

This document records what shipped in the Phase 1 commit and what to verify before Phase 2 starts.

---

## What was built

### Tooling
- Astro 6.1.9 + TypeScript strict + path aliases (`@/`, `@components/*`, `@layouts/*`, `@lib/*`, `@i18n/*`)
- React 19.2 + `@astrojs/react` 5.0
- Tailwind v4.2 via the official `@tailwindcss/postcss` plugin (CSS-first config in `src/styles/global.css`)
- Three.js r184 + `@react-three/fiber` 9.6 + `@react-three/drei` 10.7 (installed, not yet wired — Phase 3)
- GSAP 3.15 (installed, scroll triggers in Phase 3)
- `@neondatabase/serverless` 1.1 + `drizzle-orm` 0.45 + `drizzle-kit` (Phase 4)
- Resend 6.12 (Phase 4)
- Leaflet 1.9 + `react-leaflet` 5.0 (Phase 3 interactive map)
- Astro integrations: `@astrojs/sitemap`, `@astrojs/mdx`, `@astrojs/netlify`

### Configuration
- `astro.config.mjs` — i18n EN/FR (default no prefix, FR at `/fr`), Netlify adapter, sitemap with hreflang, MDX, viewport-prefetch, client prerender experiment
- `tsconfig.json` — strict + path aliases
- `netlify.toml` — security headers, immutable caching for `/_astro` and `/assets`, www → apex 301
- `postcss.config.mjs` — Tailwind v4 via PostCSS
- `.env.example` — all required vars listed
- `.gitignore` — covers Astro, Netlify, env, OS junk

### Application code
- `src/consts.ts` — single source of truth (branding, contact, location, colors)
- `src/i18n/{ui.ts, utils.ts}` — typed translations + locale helpers
- `src/lib/seo.ts` — `LocalBusiness` + `BreadcrumbList` JSON-LD helpers
- `src/styles/global.css` — Tailwind import + `@theme` ocean palette + `prefers-reduced-motion` guard + bubble/float/shimmer/fade-up keyframes
- `src/layouts/BaseLayout.astro` — full SEO head: canonical, hreflang en/fr/x-default, OG, Twitter card, JSON-LD, manifest, font preconnect, skip link
- `src/components/Header.astro` — sticky translucent → solid on scroll, accessible mobile drawer, language switcher, primary CTA
- `src/components/Footer.astro` — 4-column grid with contact, courses, social, partners
- `src/components/LanguageSwitcher.astro` — preserves current path when toggling EN ↔ FR
- `src/components/WhatsAppButton.astro` — floating CTA with prefilled message
- `src/pages/index.astro` — EN home placeholder (hero + about + course grid)
- `src/pages/fr/index.astro` — FR home placeholder
- `src/pages/404.astro` — branded "lost at sea" page
- `src/content.config.ts` — content collections schema (courses, blog, dive-sites, testimonials) using new Astro 6 glob loaders

### CMS
- `public/admin/config.yml` — Decap CMS, Git Gateway backend, multi-locale entries, editorial workflow, 5 collections (courses, blog, dive-sites, testimonials, settings)
- `public/admin/index.html` — Decap UI from CDN

### Static
- `public/robots.txt` — explicit allow for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
- `public/manifest.webmanifest` — PWA-ready
- `public/favicon.svg` (from template)
- `public/assets/.gitkeep` — placeholder for Phase 2 imagery

---

## Build verification ✅

```
npm run build
# → 3 routes prerendered: /, /fr/, /404
# → sitemap-index.xml emitted
# → Netlify SSR function bundled
# → 0 errors, 0 lint warnings
```

Empty content collection warnings are expected — content gets populated in Phase 2.

---

## How to verify locally right now

```bash
cd "/Users/carlboon/Documents/Meno Drive Club/menodiveclub-3d"
fnm use 22
npm run dev
# → http://localhost:4321
```

You should see:
- Translucent header that becomes solid on scroll
- Hero with `Your Underwater Adventure Awaits` headline + animated CSS bubbles
- 6-card placeholder grid below
- Working language switcher (top-right) → flips to `/fr`
- Floating WhatsApp button bottom-right
- Footer with full address + contact details

Check view-source: every meta tag, OG tag, Twitter card, hreflang, and JSON-LD `LocalBusiness` block is present.

---

## What's NOT in Phase 1 (intentionally)

| Feature | Phase |
|---|---|
| Real course / dive-site / blog content | 2 |
| Unsplash imagery wired with `<Image>` | 2 |
| 3D hero scene (R3F + Sketchfab CC0 diver + boids fish + caustic shader) | 3 |
| GSAP scroll-driven camera + section reveals | 3 |
| Interactive Leaflet map with 4 toggle categories | 3 |
| Neon Postgres schema + Drizzle migrations | 4 |
| `/api/bookings`, `/api/contact` server routes | 4 |
| Resend email confirmations | 4 |
| Netlify Forms wired up | 5 |
| Decap CMS verified end-to-end with real content | 5 |
| Programmatic generation of all 50 landing pages | 6 |
| Netlify deploy + DNS cutover | 7 |

---

## Known issues / things to address before Phase 7 deploy

1. **Logo file** — currently using a 🤿 emoji as the logo. Need a real SVG before launch.
2. **`/og-default.jpg`** — referenced in BaseLayout but doesn't exist yet. Generate with Astro's built-in OG image generator in Phase 6, or supply a static one.
3. **`netlify.toml` headers** — CSP not yet defined. Will add during Phase 7 once we know all 3rd-party origins (Resend, Neon, Unsplash, Decap, Netlify Identity widget).
4. **Resend sender domain** — falls back to `onboarding@resend.dev` until `menodiveclub.com` SPF/DKIM records are added.

---

## Credentials still required before Phase 4

| Item | Where it goes |
|---|---|
| Neon `DATABASE_URL` | `.env`, then Netlify dashboard env vars |
| Resend API key | `.env`, then Netlify env |
| GitHub Personal Access Token | Push permission, Decap commits |
| Logo SVG | `public/logo.svg` |

---

## Next: Phase 2

Real content (courses, dive sites, blog seeds), Unsplash imagery, internal navigation. Will start as soon as you say go.

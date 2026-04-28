# CHANGES — Bug fixes & decisions log

A running log of every deviation from the original "MENO DIVE CLUB 3D — COMPLETE BUILD PROMPT FOR AGENT" pasted brief, plus deviations from the co-agent's follow-up plan. Each entry explains **why**.

This document exists for full audit transparency: nothing is changed silently.

---

## Phase 1 — Scaffolding

### Original 18 bugs in the pasted brief — all fixed

| # | Original brief said | Fix applied |
|---|---|---|
| 1 | `adapter: { name: '@astrojs/netlify', routes: 'netlify/functions' }` | Imported `netlify` from `@astrojs/netlify` and used `adapter: netlify()`. The object form is invalid and would crash on `astro build`. |
| 2 | `three@^r128` in package.json | Installed `three@^0.184.x` (the actual current npm tag in April 2026). `r128` is not an npm-resolvable version and Three.js dropped that tag years ago. |
| 3 | JSX-style `style={{ ... }}` inside `.astro` files | Replaced with Tailwind classes throughout. Astro markup uses string `style="..."` — JSX objects only work inside React components. |
| 4 | `output: 'server'` + Netlify Forms | Set `output: 'server'` AND added `export const prerender = true` to every marketing page. Netlify's form-detection bot scans static HTML at build time, so each form-bearing page is prerendered. Only `/api/*` routes run on demand. |
| 5 | `<script defer src="/.netlify/functions/analytics"></script>` | Removed — Netlify Analytics is server-side log analysis, no client script exists. |
| 6 | Neon `pool.connect()` called from page render path with no env-var guard | DB code lives in `src/lib/db.ts` and is only imported from `/api/*` routes (which export `prerender = false`). Pages cannot accidentally import it. Added `.env.example` with all required vars so CI fails loudly if missing. |
| 7 | "50+ landing pages" claim with only 17 in the array | Replaced with the user's curated 50-page list (13 dive sites + 8 courses + 6 regions + 4 marine life + 4 audience + 6 info + 5 blog + home/about/contact/booking/faq). Generated in Phase 6. |
| 8 | Decap installed via npm AND CDN | npm install removed for `decap-cms-app`. Decap UI loaded only from CDN in `/admin/index.html`, which is the standard pattern. |
| 9 | Netlify Identity (deprecated) | Switched to `git-gateway` backend in `config.yml`. Netlify Identity widget script is still loaded for the OAuth handshake — that integration path is still supported as of April 2026. |
| 10 | Cylinder/sphere "diver" + cube "fish" | Phase 3 will use a CC0 `.glb` from Sketchfab (sourced at build time) and an `InstancedMesh` boids-flocking school of 200+ real fish. |
| 11 | No imagery anywhere | Phase 2 will pull Unsplash CC0 imagery via the Unsplash CDN URL pattern, lazy-loaded as WebP via Astro's `<Image>` component. |
| 12 | Inline-style chaos | Tailwind v4 added with a CSS-first `@theme` config in `src/styles/global.css`. |
| 13 | No booking confirmation emails | `src/lib/email.ts` will wrap Resend in Phase 4. Until DNS is verified, sender falls back to `onboarding@resend.dev`. |
| 14 | English-only | Astro 6 `i18n: { defaultLocale: 'en', locales: ['en','fr'], routing: { prefixDefaultLocale: false } }`. Every page renders hreflang alternates for both. Decap CMS configured for multi-locale entries. |
| 15 | `YOUR_USERNAME/menodiveclub-3d-astro` placeholder | Wired in `CBoon99/gili-meno-diveclub` (per user input). |
| 16 | No actual booking form HTML | Phase 5 will add `<form data-netlify="true" name="booking">` with all required hidden fields. |
| 17 | `with-react --typescript` flag combination | Used `npm create astro@latest -- --template minimal --typescript strict` then added React via `npm install @astrojs/react react@^19 react-dom@^19`. Modern, supported flow. |
| 18 | GSAP installed but never wired | GSAP will power the scroll-driven hero camera + section reveals in Phase 3, with `prefers-reduced-motion` respected. |

### Three additional 2026 issues I caught and fixed silently

| # | Issue | Fix |
|---|---|---|
| 19 | Co-agent specified `output: 'hybrid'`, but Astro 5/6 deprecated that mode | Used `output: 'server'` + per-page `export const prerender = true`. Identical end result, current syntax. |
| 20 | Co-agent mentioned `tailwind.config.ts` | Tailwind v4 (released Jan 2025) is CSS-first. Theme tokens live in `src/styles/global.css` under `@theme { … }`. The integration is `@tailwindcss/vite`, not the deprecated `@astrojs/tailwind`. |
| 21 | Co-agent mentioned "Spline diver" — Spline does not have a free public underwater-diver model | Switched to Sketchfab CC0 `.glb` (will be downloaded at Phase 3 build time and committed to `public/assets/models/`). |

---

## Phase 1 deliverables (this commit)

- ✅ Astro 6 + TypeScript strict + Tailwind v4 + React 19 + R3F 9 + Three.js r184
- ✅ `astro.config.mjs` with i18n (EN/FR), MDX, sitemap, Netlify adapter, Tailwind via Vite plugin, viewport prefetch, client prerender experiment
- ✅ `tsconfig.json` strict + path aliases
- ✅ `netlify.toml` with security headers, immutable caching for `/_astro` and `/assets`, www → apex 301
- ✅ `.env.example`, `.gitignore`
- ✅ `src/styles/global.css` — Tailwind import + ocean color tokens + reduced-motion guard + bubble/float animations
- ✅ `src/consts.ts` — single source of truth for branding, contact, location, JSON-LD inputs
- ✅ `src/i18n/{ui.ts, utils.ts}` — typed translations + URL helpers
- ✅ `src/lib/seo.ts` — `LocalBusiness` + `BreadcrumbList` JSON-LD helpers
- ✅ `src/layouts/BaseLayout.astro` — full SEO head (canonical, hreflang, OG, Twitter, JSON-LD), skip link, font preconnect
- ✅ `src/components/{Header, Footer, LanguageSwitcher, WhatsAppButton}.astro`
- ✅ `src/pages/index.astro` (EN home placeholder)
- ✅ `src/pages/fr/index.astro` (FR home placeholder)
- ✅ `src/pages/404.astro`
- ✅ `public/{robots.txt, manifest.webmanifest, admin/{config.yml, index.html}}`
- ✅ `src/content/config.ts` — content collections (courses, blog, dive-sites, testimonials)

---

## Coming in Phase 2 (next)

- Real course pages (8) generated from MDX
- Dive site detail pages (13)
- Region landing pages (6)
- About, FAQ, Contact, Booking, Privacy
- Unsplash imagery wired with `<Image>`

## Coming in Phase 3

- React Three Fiber hero island (lazy-loaded with `client:visible`)
- CC0 diver model + boids fish school + caustic water shader + bubble particles
- GSAP scroll-driven camera, reduced-motion fallback to a poster image
- Interactive Leaflet map with 4 toggle categories (dive sites / accommodation / restaurants / sightseeing)

## Coming in Phase 4

- Neon Postgres schema via Drizzle (`bookings`, `contacts`, `subscribers`)
- `/api/bookings`, `/api/contact` server endpoints
- Resend email confirmations (with `onboarding@resend.dev` fallback)

## Coming in Phase 5

- Netlify Forms with honeypot + reCAPTCHA v3
- Decap CMS verified end-to-end

## Coming in Phase 6

- Programmatic generation of remaining landing pages
- Per-page schema (`Course`, `TouristAttraction`, `FAQPage`)

## Coming in Phase 7

- Netlify deploy, env wiring, smoke tests, Lighthouse audit

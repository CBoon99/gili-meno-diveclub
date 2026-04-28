# Meno Dive Club

Immersive 3D website for [Meno Dive Club](https://menodiveclub.com), an SSI dive school on Gili Meno, Indonesia.

## Stack

- **Astro 6** — file-based routing, partial hydration, server output with prerendered marketing pages
- **React 19 + React Three Fiber 9** — interactive 3D hero, lazy-loaded as a `client:visible` island
- **Three.js r184** — fish flocking, caustic water shader, bubble particles
- **GSAP + ScrollTrigger** — scroll-driven camera and section reveals (respects `prefers-reduced-motion`)
- **Tailwind v4** — CSS-first config via `@theme`, no JS config file
- **Decap CMS** at `/admin` — Git Gateway auth, multi-locale entries
- **Neon Postgres + Drizzle ORM** — bookings & contacts
- **Netlify Forms** — primary form handler with honeypot + reCAPTCHA
- **Resend** — transactional confirmation emails
- **Astro i18n** — English + French with proper hreflang

## Quick start

```bash
# Once-off
fnm use 22       # or `nvm use 22` — Node 22 required
cp .env.example .env

# Day-to-day
npm install
npm run dev       # http://localhost:4321
npm run build     # production build to ./dist
npm run preview   # serve the production build
```

## Project layout

```
menodiveclub-3d/
├── astro.config.mjs       # i18n, integrations, Netlify adapter, Vite + Tailwind v4
├── netlify.toml           # build, security headers, redirects
├── tsconfig.json          # strict + path aliases (@/, @components/, @layouts/, @lib/)
├── public/
│   ├── admin/             # Decap CMS (Git Gateway)
│   ├── assets/            # static images, 3D models, textures
│   ├── robots.txt
│   └── manifest.webmanifest
└── src/
    ├── consts.ts          # SITE_CONFIG: branding, contact, location, colors
    ├── i18n/              # ui.ts (translations), utils.ts (locale helpers)
    ├── lib/
    │   ├── seo.ts         # JSON-LD helpers
    │   ├── db.ts          # Neon + Drizzle (Phase 4)
    │   └── email.ts       # Resend wrapper (Phase 4)
    ├── styles/global.css  # Tailwind v4 @theme + animations
    ├── layouts/           # BaseLayout.astro (full SEO head)
    ├── components/        # Header, Footer, LanguageSwitcher, WhatsAppButton, canvas/* (Phase 3)
    ├── content/           # Content Collections (courses, blog, dive-sites, testimonials)
    └── pages/             # index.astro, fr/index.astro, 404.astro, api/* (Phase 4)
```

## Build phases

This repo is being built in 7 staged phases. See [`CHANGES.md`](./CHANGES.md) for what was changed and why on each commit, and [`PHASE_1_COMPLETE.md`](./PHASE_1_COMPLETE.md) for what shipped today.

| Phase | What |
|------|------|
| 1 | Scaffolding, configs, layout, header/footer, EN/FR home placeholders, Decap config, SEO foundations |
| 2 | All page templates with real content, Unsplash imagery, internal linking |
| 3 | 3D hero island (R3F + GSAP), interactive Leaflet map |
| 4 | Neon DB schema, `/api/bookings`, `/api/contact`, Resend confirmations |
| 5 | Netlify Forms wired, Decap CMS verified end-to-end |
| 6 | Programmatic landing-page generation (50 total) |
| 7 | Netlify deploy, env wiring, Lighthouse audit, DNS cutover |

## Environment variables

See `.env.example`. Required for Phase 4 onwards:

- `DATABASE_URL` — Neon connection string
- `RESEND_API_KEY` — Resend API key
- `RESEND_FROM_EMAIL` — sender (use `onboarding@resend.dev` until DNS verified)
- `ADMIN_NOTIFICATION_EMAIL` — internal booking notifications
- `PUBLIC_SITE_URL` — `https://menodiveclub.com`

## Repository

GitHub: [`CBoon99/gili-meno-diveclub`](https://github.com/CBoon99/gili-meno-diveclub) (push happens at end of Phase 7).

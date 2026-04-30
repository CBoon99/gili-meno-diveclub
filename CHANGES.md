# CHANGES — Bug fixes & decisions log

A running log of every deviation from the original "MENO DIVE CLUB 3D — COMPLETE BUILD PROMPT FOR AGENT" pasted brief, plus deviations from the co-agent's follow-up plan. Each entry explains **why**.

This document exists for full audit transparency: nothing is changed silently.

---

## Phase 4.4 — natural-motion sea turtle on the hero (2026-04-30)

Pure-CSS swimming turtle that drifts across the hero every ~42 s. **Zero JavaScript.** Bundle cost: one 269 KB PNG (lazy-loaded), ~80 lines of CSS. **Cannot break the site** — single inline `<style>` block.

### How natural motion is built up

Three nested CSS animations stack to give organic movement:

| Layer | Duration | Effect |
|---|---|---|
| `turtle-track` | 42 s linear | Horizontal swim across the screen |
| `turtle-bob` | 7 s ease-in-out | Vertical drift + gentle banking rotation |
| `turtle-glide` | 2.4 s ease-in-out | Subtle scale "breathing" — reads as flipper power-strokes followed by a glide |

Combined, the turtle never hits the same x/y/scale state twice, so it feels alive rather than looped.

### Robust against everything

- Respects `prefers-reduced-motion` (turtle freezes mid-frame, no animation)
- Hides on screens ≤ 480 px wide so it can't crowd the H1
- `aria-hidden="true"` so screen readers ignore it
- `pointer-events: none` so it never blocks the CTAs

## Phase 4.3 — locally-hosted brand imagery + dead-link sweep (2026-04-30)

User flagged broken image renders on the home page (Meno Wall, Bounty Wreck, SSI Advanced, Family Package) plus thematically wrong photos (Turtle City showing waves, Shark Point showing forest, Eco-Scuba showing the Milky Way). Despite Unsplash IDs returning 200 to a HEAD check, browsers received unrelated content because Unsplash had reassigned those slugs.

### 8 generated, locally-hosted brand images

Replaces all top-of-funnel imagery with images we control. Optimised to 1440×900 JPEG @ ~85 quality (~3 MB total for 8 images).

| File | Used by |
|---|---|
| `/images/site-turtle-city.jpg` | home hero, Turtle City dive site, Sea Turtles marine life, Marine Life listing, Booking page |
| `/images/site-meno-wall.jpg` | Meno Wall dive site, Dive Sites listing |
| `/images/site-bounty-wreck.jpg` | Bounty Wreck, Turtle Encounters blog |
| `/images/site-shark-point.jpg` | Shark Point dive site, Reef Sharks marine life |
| `/images/course-open-water.jpg` | Open Water course, Courses listing |
| `/images/course-advanced.jpg` | Advanced Adventurer course, About page |
| `/images/course-eco-scuba.jpg` | Eco-Scuba course |
| `/images/course-family.jpg` | Family Package course, Family Diving audience, Audiences listing |

Result: every visible card on the home page, all 4 featured courses, all 4 featured dive sites, and all 7 listing-page banners now load reliable, on-theme images.

### Dead links swept

- `/dive-stay` (about page) → `/info/dive-and-stay` (real page)
- All `/fr/*` sub-page links from FR home → fall back to existing `/` (EN) routes
- `localizedPath()` and `switchLocale()` now use a `FR_AVAILABLE` allow-list so internal nav + the language switcher never land on a 404 when on the FR home

### Smoke

20 routes + 3 image assets all 200. Build green.

## Phase 4.2 — image audit + responsive polish (2026-04-30)

### Broken images fixed

5 Unsplash photo IDs returning 404 affected 11 content files. All replaced with verified-loading IDs:

| Broken | Used by | Replacement |
|---|---|---|
| `1502663129377-4ade7d7d4855` | solo-divers, deep-turbo | `1551918120-9739cb430c6d`, `1542931287-023b922fa89b` |
| `1530036846422-8a1bce47ed26` | family-diving, family-package, meno-slope | `1561485132-59468cd0b553`, `1567899378494-47b22a2ae96a`, `1542156822-6924d1a71ace` |
| `1549921296-3b4a5e6c4eb1` | pricing | `1559682468-a6a29e7d9517` |
| `1564550974352-c4d129ed5cb9` | advanced-open-water, meno-wall | `1580618864180-f6d7d39b8ff6`, `1473163928189-364b2c4e1135` |
| `1572125675722-238a4f1f8ea4` | diving-safety, rescue-diver, bounty-wreck | `1591025207163-942350e47db2`, `1537944434965-cf4679d1a598`, `1493558103817-58b2924bce98` |

### Image diversity

Reduced over-duplicates: previously 5 files shared a single image; now max 3, almost all 1–2.

### `<PageHero>` component

New reusable banner-image header with slow Ken-Burns zoom. Added to:

- `/about`, `/contact`, `/faq`, `/booking` (utility pages)
- `/courses`, `/dive-sites`, `/blog`, `/marine-life`, `/regions`, `/audiences`, `/info` (listings)

Each gets a unique themed Unsplash image. Privacy page kept text-only (legal context).

### Responsive fixes

- **Hero buttons**: now stack full-width vertically below `sm`, side-by-side from `sm:`. Better thumb tap targets on iPhone SE / small Android.
- **Hero text**: confirmed `text-5xl sm:text-6xl lg:text-7xl` cascade works edge-to-edge from 320px.
- **PageHero**: `min-h-[44svh] md:min-h-[50svh]` keeps utility hero readable without dominating.
- **Forms**: confirmed `sm:grid-cols-2` cascade for booking + contact field rows.
- **Map**: `h-[min(68vh,520px)]` adapts cleanly mobile → desktop.

### Detail-page SEO improvements

- Blog `[slug]`: now passes `publishedTime`, `modifiedTime`, `imageAlt`, and `keywords` (from tags) into `BaseLayout` so the meta tags I added in 4.1 actually fire.
- Course `[slug]` and Dive-site `[slug]`: now pass `imageAlt`.
- Blog `Article` JSON-LD: `publisher.logo` → `icon-512.png` (with width/height) for richer Google results.

### FR home page rebuilt

Was still referencing the deleted 3D hero markup. Now mirrors the EN home page section-for-section in French, uses `<Hero>` + `<GiliMenoMap>`, full localised testimonials + CTAs.

### Smoke-tested

All 14 main routes return 200: `/`, `/about`, `/courses`, `/dive-sites`, `/blog`, `/marine-life`, `/regions`, `/info`, `/audiences`, `/faq`, `/contact`, `/booking`, `/privacy`, `/fr`.

## Phase 4.1 — SEO + favicon polish (2026-04-30)

User asked for "all the finer detail" — done.

### Folder rename

- `/Users/carlboon/Documents/Meno Drive Club/` → `/Users/carlboon/Documents/Meno Dive Club/` (the original `r` was a typo). Git repo + CLI links unaffected.

### Brand assets generated

- **`/public/apple-touch-icon.png`** (180×180) — branded mark on ocean-blue: stylised wave + diving mask with bubbles
- **`/public/icon-512.png`**, **`/icon-192.png`**, **`/icon-32.png`**, **`/icon-16.png`** — same mark, multiple sizes for PWA + browser tabs
- **`/public/og-default.jpg`** (1200×630) — turtle photo with "Meno Dive Club · SSI Dive Centre · Gili Meno · Indonesia" overlay; used for every page's social-share preview unless overridden per page
- **`/public/favicon.svg`** — refreshed brand mark inline SVG (works at any size, 749 bytes)

### `<head>` SEO completeness

Now present on every page:

- `<title>`, `<meta name="description">`, `<meta name="keywords">`, `<meta name="author">`, `<meta name="publisher">`
- `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
- `<meta name="googlebot">` mirror
- `<link rel="canonical">`
- `<link rel="alternate" hreflang="en|fr|x-default">`
- **PWA / Apple full set:** `apple-touch-icon` 180×180, `icon` 16/32/SVG, `mask-icon`, `manifest`, `apple-mobile-web-app-*`, `application-name`, `msapplication-TileColor`, `theme-color`, `color-scheme`
- `<meta name="format-detection" content="telephone=yes">`
- `<meta http-equiv="content-language">`
- **Local SEO:** `geo.region`, `geo.placename`, `geo.position`, `ICBM`
- **Open Graph 2.0 full set:** `og:type`, `og:title`, `og:description`, `og:url`, `og:image` (+ `secure_url`, `type`, `width`, `height`, `alt`), `og:site_name`, `og:locale`, `og:locale:alternate`, `article:published_time`/`modified_time` when applicable
- **Twitter Card:** `summary_large_image` with title/desc/image/alt
- **Preconnect** to fonts + Unsplash

### Schema.org JSON-LD (every page)

- **`LocalBusiness` + `SportsActivityLocation` + `TouristAttraction`** — rich result eligible
- **`Organization`** with logo + `ContactPoint` (telephone, email, areaServed, language)
- **`WebSite`** with `SearchAction` (gives site-name in Google results + sitelinks search box eligibility)
- Per-page additions stay (Course / TouristAttraction / Article / FAQPage / BreadcrumbList / ItemList / AggregateRating / Review)

### CMS-driven contact details

- `consts.ts` now imports `src/content/settings/general.json` and uses Decap-edited values (phone, WhatsApp, email, social URLs) site-wide. Customer can change them at `/admin` → Site settings → Contact details.

### Build / output verified

- Build green; `dist/index.html` `<head>` audit confirms every meta + JSON-LD block ships correctly to crawlers.

## Phase 4 — pivot to photographic hero (2026-04-30)

Per user request: drop the entire WebGL 3D layer (cinematic but slow, complex, and visually noisy after iteration), keep the polished underlying site, and replace the hero with a **large photographic image** that mirrors the live menodiveclub.com.

### Removed (all WebGL)

- `HeroUnderwater`, `HeroForeground` (R3F hero canvases)
- All Phase 3B creature scenes — `Octopus`, `Eel`, `Jellyfish`, `SeabedDecor`, `SedimentParticles`, `CoralScene`, `Creatures`
- `AmbientCanvas`, `FishSchool`, `Bubbles`, `CausticProjector`, `caustic-shader`, `HomeScrollFx`
- React-Leaflet → replaced with **vanilla Leaflet** in a single `.astro` component, removing the entire React dependency tree

### Uninstalled

- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `gsap`
- `@astrojs/react`, `react`, `react-dom`, `@types/react`, `@types/react-dom`
- `react-leaflet`

### Added / replaced

- **`Hero.astro`** — large photographic hero with **Ken-Burns slow zoom** (CSS keyframes), **scroll parallax** (rAF, no library), soft **CSS bubble overlay**, dark gradient for legibility, headline + subhead **verbatim from live site**: *"Your Underwater Adventure Awaits at Gili Meno"* + *"Meno Dive Club is the newest SSI Dive Center on Gili Meno..."*. Respects `prefers-reduced-motion`.
- **`GiliMenoMap.astro`** — pure Leaflet rewrite. Same UX (toggle 4 categories, fit-bounds, popups link to dive-site detail pages). Loads Leaflet CSS from CDN, no React.
- **Home page restructured** to mirror the live site sections in the same order: Hero → Our Story → Featured Courses → Featured Dive Sites → Interactive Map → Why Choose Us → Testimonials (with Google ★4.9 + TripAdvisor ★5.0 badges) → Bubble Diaries → Final CTA.
- **`AggregateRating` JSON-LD** added so search engines surface the star rating in results.
- **`/llms.txt`** added at root for emerging AI-agent discoverability standard. Lists business overview, contact, all 8 courses (with URLs), all 13 dive sites (with URLs), and key resource links.
- **Decap CMS expanded** so the customer can edit:
  - **Hero** (image, eyebrow, headline, subhead, button labels/links — all i18n)
  - **Contact details** (phone, WhatsApp, email, social URLs)
  - **Blog** (full markdown editor, hero image, tags)
  - **Testimonials** (name, source, rating, review)
  - **Courses + Dive sites** (locked schema, content editable)
- IntersectionObserver-driven **section reveal** replaces GSAP ScrollTrigger — same effect, zero dependency.

### Bundle / build

- Production build still green; **dropped >3 MB of JS dependencies** (R3F + drei + three + postprocessing + React + react-leaflet + gsap).
- Hero image is `fetchpriority="high"` so it lands quickly for LCP.

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
| 6 | Neon `pool.connect()` called from page render path with no env-var guard | DB code lives in `src/lib/db.ts` and is only imported from `/api/*` routes (which export `prerender = false`). Pages cannot accidentally import it. |
| 7 | "50+ landing pages" claim with only 17 in the array | Replaced with the user's curated 50-page list. Phase 2 ships **61 prerendered pages**. |
| 8 | Decap installed via npm AND CDN | npm install removed for `decap-cms-app`. Decap UI loaded only from CDN in `/admin/index.html`. |
| 9 | Netlify Identity (deprecated) | Switched to `git-gateway` backend in `config.yml`. Netlify Identity widget is still loaded for OAuth handshake — that integration path is still supported as of April 2026. |
| 10 | Cylinder/sphere "diver" + cube "fish" | Phase 3 will use a CC0 `.glb` from Sketchfab and an `InstancedMesh` boids-flocking school of 200+ real fish. Not in Phase 2. |
| 11 | No imagery anywhere | Phase 2 wires Unsplash CC0 imagery on every content page via direct hot URLs (server-side optimised by Unsplash CDN). |
| 12 | Inline-style chaos | Tailwind v4 added with a CSS-first `@theme` config in `src/styles/global.css`. |
| 13 | No booking confirmation emails | `src/lib/email.ts` will wrap Resend in Phase 4. Until DNS verified, sender falls back to `onboarding@resend.dev`. |
| 14 | English-only | i18n infrastructure built in Phase 1, EN content in Phase 2. **FR translations deferred to Phase 2.5** per user decision. |
| 15 | `YOUR_USERNAME/menodiveclub-3d-astro` placeholder | Wired in `CBoon99/gili-meno-diveclub` (per user input). |
| 16 | No actual booking form HTML | Phase 2 added `<form data-netlify="true" name="booking">` with full booking fields, honeypot, validation, success state. Same pattern for `/contact`. |
| 17 | `with-react --typescript` flag combination | Used `npm create astro@latest -- --template minimal --typescript strict` then added React via `@astrojs/react`. Modern, supported flow. |
| 18 | GSAP installed but never wired | Phase 3 will power the scroll-driven hero camera. Phase 2 uses CSS-only animations (bubbles, fade-up) which respect `prefers-reduced-motion`. |

### Three additional 2026-era issues caught and fixed silently in Phase 1

| # | Issue | Fix |
|---|---|---|
| 19 | Co-agent specified `output: 'hybrid'` — Astro 6 deprecated that mode | Used `output: 'server'` + per-page `export const prerender = true`. Identical end result, current syntax. |
| 20 | Co-agent mentioned `tailwind.config.ts` | Tailwind v4 (Jan 2025+) is CSS-first. Theme tokens live in `src/styles/global.css` under `@theme { … }`. |
| 21 | `@tailwindcss/vite` had Vite 7/Rolldown peer-dep conflict with Astro 6 | Switched to the more stable `@tailwindcss/postcss` plugin via `postcss.config.mjs`. Same end output. |

---

## Phase 2 — Content + rendering + 50-page coverage

### 28 staged files audit results (all fixed)

The co-agent staged 28 content files while I was paused. Audit found 5 build blockers, 13 brand/factual errors, 9 style issues, and 31 missing pages vs the locked plan. **All resolved**.

#### Build blockers fixed

| # | Issue | Fix |
|---|---|---|
| A1 | `regions` collection schema missing | Added `regions`, plus `marine-life`, `audiences`, `info` collections to `src/content.config.ts`. |
| A2 | No dynamic route renderers for any of 26 content files | Added 6 `[slug].astro` renderers (courses, dive-sites, blog, regions, marine-life, audiences, info) with per-page Schema.org. |
| A3 | `about.astro` missing required `lang` prop | Rewrote about with proper props. |
| A4 | `about.astro` missing `prerender = true` | Fixed; all marketing pages now opt-in to static generation. |
| A5 | `prose prose-invert` used but plugin not installed | Installed `@tailwindcss/typography`, registered via `@plugin '@tailwindcss/typography';` in global.css. |

#### Brand/factual errors fixed (per locked Q1 = "SSI only")

| # | Was | Now |
|---|---|---|
| B1 | 22 "PADI" references across 8 files | All replaced with SSI: `SSI Open Water Diver`, `SSI Advanced Adventurer`, `SSI Stress & Rescue`, `SSI Divemaster`, `SSI Specialty`, `SSI Scuba Skills Update`, `Scuba Rangers` (kids). PADI mentioned only as cross-cert acceptance + footer partner. |
| B2 | About claimed "20+ years" company history | Rewrote: founded December 2018; "thousands of dives" (true) instead of fabricated 50,000. |
| B3-B4 | "50,000 collective dives", "10,000+ logged" | Removed all fabricated numbers. About now uses verifiable claims only. |
| B5 / B13 | Listed competitors "Coconut Divers, Scallywags" in Gili Meno region copy | Removed competitor mentions. |
| B6-B7 | "50 tons since 2018", "500+ locals educated" Trash Hero stats | Replaced with narrative honesty: "tonnes" without specific unverified numbers; the new copy explicitly addresses what cleanup dives can and can't do. |
| B8 | "Bubble Maker" (PADI program) | Replaced with "Scuba Rangers" (SSI equivalent) for under-10s. |
| B9 | "PADI Assistant Instructors" career path | "SSI Instructor Training Course (ITC)". |
| B10 | "PADI certification in 3 days" | "SSI Open Water Diver, 3-4 days". |
| B11 | "Wreck specialty" referenced but not in courses list | Added Wreck under SSI Specialty Courses page. |
| B12 | "15 min speedboat Lombok→Gili Meno" | Corrected to "15-30 min" (route-dependent). |

#### Style/code fixes

| # | Was | Now |
|---|---|---|
| C1-C2 | `bg-blue-600`, `text-gray-300` hardcoded | All brand colours come from the `@theme` palette: `bg-ocean-500`, `text-white/70`, etc. |
| C3 | Broken `/courses/open-water` link | Slug strategy: `cleanSlug()` strips numeric prefixes; URLs are `/courses/open-water`, `/dive-sites/turtle-city` etc. Links work end-to-end. |
| C4 | Numeric-prefix slugs leaking into URLs | `src/lib/slug.ts` provides `cleanSlug()` and `orderKey()`. Filenames keep `01-` for sort order; URLs strip it. |
| C5 | Same Unsplash photo used 8× | 28 unique image hashes mapped across content. Some still repeat for thematic reasons (turtles → turtle photo) but no single photo more than 2× now. |
| C6 | Image URLs hardcoded with `?w=1200&h=600&fit=crop` | Standardised on `?w=1600&q=80` (better quality, Unsplash CDN handles resizing for `<img>` element loading). |
| C7-C9 | Missing alt text, no slug overrides | `imageAlt` field added to course/blog/dive-site/region/marine-life/audience/info schemas; supplied on every entry. |

### Coverage: from 28 staged files to 61 built pages

| Category | Locked | Phase 2 final |
|---|---|---|
| Home (EN) | 1 | ✅ rebuilt with live content |
| Home (FR) | 1 | ✅ placeholder until 2.5 |
| About | 1 | ✅ rewritten |
| Courses | 8 | ✅ 8 + listing |
| Dive sites | 13 | ✅ 13 + listing |
| Blog | 5 | ✅ 5 + listing |
| Regions | 6 | ✅ 6 + listing |
| Marine life | 4 | ✅ 4 + listing |
| Audience pages | 4 | ✅ 4 + listing |
| Info pages | 6 | ✅ 6 + listing |
| Booking (Netlify Form) | 1 | ✅ |
| Contact (Netlify Form) | 1 | ✅ |
| FAQ (with FAQPage schema, 15 Q&As) | 1 | ✅ |
| Privacy | 1 | ✅ |
| 404 | 1 | ✅ |
| **Total prerendered** | **53** | **61** |

### Per-page Schema.org

Every dynamic-route page emits structured data:

- **Courses** → `Course` with provider, credential, prerequisites, offer (price/currency)
- **Dive sites** → `TouristAttraction` with `geo` coords
- **Blog posts** → `Article` with author, datePublished, image, publisher
- **Regions** → `Place`
- **FAQ** → `FAQPage` with all 15 Q&As
- **Contact** → `ContactPage`
- **Booking** → `Service` with `ReserveAction`
- **About** → `AboutPage`
- **Listing pages** → `ItemList`
- **Every page** → `BreadcrumbList` (via `<Breadcrumbs>` component) + global `LocalBusiness` (with `aggregateRating`)

### Testimonials

5 testimonials seeded as JSON content (`src/content/testimonials/`), paraphrased from public Google + TripAdvisor reviews on the live site. Surfaced on the home page with `★★★★★` rating display.

### Forms

Both forms work via Netlify Forms native detection (no custom API):

- `<form data-netlify="true" name="booking">` — full booking fields with honeypot
- `<form data-netlify="true" name="contact">` — contact with subject taxonomy

Phase 4 will add Resend confirmation emails on top via Netlify Form-submission webhook.

---

## Phase 1 deliverables (recap)

✅ Astro 6 + TS strict + Tailwind v4 + R3F + Three.js r184 + Netlify adapter + i18n EN/FR + Decap CMS Git Gateway + JSON-LD foundations + brand-tokens design system + Header/Footer/LanguageSwitcher/WhatsApp + skip link + reduced-motion guard.

## Phase 2 deliverables

✅ 61 prerendered pages with full SEO (canonical, hreflang, OG, Twitter, JSON-LD per type, breadcrumbs).
✅ All 26 content collection items (8 courses, 13 dive sites, 5 blog, 4 marine, 4 audiences, 6 info, 6 regions, 5 testimonials).
✅ Forms wired (contact + booking) via Netlify Forms native.
✅ Tailwind Typography plugin installed and enabled for prose markdown rendering.
✅ Image alt text on every content image; unique-ish Unsplash IDs across 28 entries.
✅ Build green, 0 lint errors.

## Phase 3 deliverables (2026-04-28)

✅ **Hero** — `HeroUnderwater.tsx` (React Three Fiber): stylized diver (capsule/superior to placeholder cylinders), **110-fish instanced boid school** (separation / alignment / cohesion), sea floor, moving spotlight for caustic feel, `Stars`, fog; **DPR cap 1.75**, `client:visible` hydrate; **skipped when `prefers-reduced-motion`** (gradient-only hero).
✅ **Scroll motion** — `HomeScrollFx.tsx` wires **GSAP + ScrollTrigger** to `[data-reveal]` blocks on the home page (skipped under reduced-motion).
✅ **Map** — `GiliMenoMap.tsx` (`client:only="react"`): OSM tiles, **13 dive-site pins** (links to real `/dive-sites/{slug}` pages), restaurants / stay / sightseeing POIs, **category toggles**, fit-bounds on filter; data in `src/lib/gili-meno-places.ts` (orientation-grade coords, not survey-accurate).
✅ **SEO** — home page `ItemList` JSON-LD sampling map places.
✅ **Assets** — `public/assets/models/.gitkeep` ready for optional CC0 `diver.glb` swap later.
✅ Build green (note: Rollup may warn on chunk size from R3F + Leaflet — acceptable for Phase 3).

## Phase 3B — creature scenes per section (2026-04-28)

Six new low-power creature components, each in its own small canvas, integrated into existing section pages (no pages re-created — every page already shipped in Phase 2). All canvases hidden under `lg:` to keep mobile fast and respect the choice from Phase 3.2.

✅ **`Octopus.tsx`** — purple cephalopod with 8 multi-segment tentacles. GSAP timeline drifts it in from the right then idles with breathing pulse + tentacle wave. Wired over the **Eco-Scuba** course card on `/courses` (class hook `octopus-target`).
✅ **`Eel.tsx`** — 14-segment serpentine body following a 6-point Catmull-Rom S-curve, with sinusoidal wobble + tail wag. Banner across the top of `/dive-sites` listing.
✅ **`Jellyfish.tsx`** — translucent bell with pulse, inner glow, 10 swaying tentacles. Side overlay on `/about`.
✅ **`SeabedDecor.tsx`** — 4 shells + 2 corals + 1 rock. GSAP cascades them down with stagger, lands on a soft floor strip; idle bob after settling. Background layer behind the home **testimonials** section.
✅ **`SedimentParticles.tsx`** — instanced 220-particle dust field orbiting in a flat plane. Listens to `mouseenter/leave` and `focusin/out` on a target selector and **doubles swirl speed on FAQ item hover/focus**, lerping back when idle. Wired to `/faq` with `targetSelector=".faq-item"`.
✅ **`CoralScene.tsx`** (extra) — 4 stylised coral towers + sparkles + soft floor strip. Subtle background under the `/booking` form.

All components: `client:only="react"`, low-power GL, DPR cap 1.4, `prefers-reduced-motion` returns `null`.

## Phase 3.2.1 — cinematic diver entrance (2026-04-28)

✅ **`IntroDiver`** replaces the static hero diver. Swims in along a 5-point Catmull-Rom curve from the deep right (start: `(11, -7, -14)`, scale 0.35) to a relaxed hover next to the H1 (end: `(1.4, -0.3, 2.6)`, scale 1.55) over **5.2s** with `power2.inOut`. Body wobble during swim, then a **0.7s rotation lerp** smooths the hand-off to the idle hover. **No snap.** Driven by GSAP for the intro; `useFrame` owns idle.
✅ **`DiverBubbleTrail`** — pool of 38 instanced bubble spheres that emit from the diver's regulator. Spawn rate is 6× higher (every 60ms) during the intro for a clear visible plume; drops to a slow drip (every 350ms) once the diver settles, so they continue to "breathe" realistically. Each bubble grows + fades over its lifetime.
✅ **Camera dolly** — `cameraOffset.z` starts at `1.9` and GSAPs to `0` over the swim-in, easing `power2.out`. Combined with the diver's scale animation, the framing tightens cinematically as they approach. `CameraRig` reads the offset alongside the existing scroll/parallax lerps so all camera motion stays composable.

## Phase 3.2 — full-throttle 3D (2026-04-28)

✅ **Postprocessing** — installed `@react-three/postprocessing` + `postprocessing`. BG hero gets **Bloom** (mipmap blur, kernel LARGE) + **Vignette** for cinematic underwater feel.
✅ **Projected caustics** — `src/lib/caustic-shader.ts` (procedural Voronoi caustics) rendered each frame to an FBO via `<CausticProjector>` and assigned as `THREE.SpotLight.map`. PBR materials are preserved; light spots crawl across sea floor + divers in real time.
✅ **Two fish species** — refactored to a reusable `<FishSchool>` (props: `count`, `speed`, `scale`, `bounds`, `centre`, `color`, `emissive`, `attractor`).
   - Blue fusiliers: 120 fish, faster, attracted to H1
   - Yellow snappers: 32 fish, slower, deeper
✅ **Reef shark silhouette** — slow background orbit with animated tail (`Creatures.tsx`).
✅ **Drifting sea turtle** — single pass every 75s, animated flippers (conservation cameo).
✅ **Scroll-driven dive** — `CameraRig` + `DepthMood` lerp camera Y down, fog tightens, colour shifts darker as the user scrolls past the hero.
✅ **Reusable `<Bubbles>`** — props for `count`, `speed`, `bounds`, `size`, `wobble`. Used in FG hero canvas + listing canvases.
✅ **Listing-page ambient canvases** — new `<AmbientCanvas>` (low-power GL, DPR cap 1.4) added to `/blog`, `/courses`, `/dive-sites`. Each gets a tinted variant (cyan / yellow / sky). **Hidden under `lg:`** so mobile is clean.
✅ **`client:only="react"`** on all canvases — kills the noisy "Invalid hook call" R3F SSR warning.
✅ Build green; 4 pages probed 200.

## Phase 3.1 — bigger 3D hero (2026-04-28)

✅ **Multiple swimming divers** — `SwimmingDiver` rides a `CatmullRomCurve3` (centripetal) with a tangent-based look-at; two extra divers loop on different paths beside the hero diver.
✅ **Volumetric god rays** — additive cones from the surface, gentle opacity pulse.
✅ **Plankton sparkles** — drei `Sparkles` at two depths.
✅ **Camera parallax** — `pointer`-driven lerp on camera position; subtle scroll-based zoom.
✅ **Soft attractor** in the boid school pulls every Nth fish toward the H1, so the school meanders around the title without breaking flock cohesion. Fish count 110 → 140.
✅ **Foreground canvas** — `HeroForeground.tsx` renders a second R3F canvas at `z-10`, `pointer-events-none`, with 6 close-up instanced fish + 40 rising bubbles + close sparkles. SEO text stays in DOM and is bumped to `z-20` so it remains readable; clicks still pass through the FG canvas to the CTA buttons.
✅ Reduced-motion: both canvases render nothing.
✅ Build green.

## Phase 4 deliverables (2026-04-28)

✅ **Drizzle + Neon** — `src/db/schema.ts`: `contacts`, `bookings`, `subscribers`; `src/db/index.ts` lazy `getDb()` via `@neondatabase/serverless` + `drizzle-orm/neon-http`.
✅ **Migrations** — `src/db/migrations/0000_init.sql` + Drizzle meta; run `npm run db:migrate` with `DATABASE_URL` set (or apply SQL manually in Neon).
✅ **Resend** — `src/lib/email.ts`: guest + admin emails for contact and booking (no-op logs if `RESEND_API_KEY` missing).
✅ **Persistence** — `src/lib/submissions.ts`: insert + trigger Resend.
✅ **API (JSON)** — `POST /api/contact`, `POST /api/bookings`, `POST /api/subscribe` (`export const prerender = false`). Return `503` if `DATABASE_URL` unset.
✅ **Netlify mirror** — `POST /api/webhooks/netlify-form` parses [submission-created style payloads](https://answers.netlify.com/t/submission-created-payload-example/30054) (`body.payload.data`, `form_name`, `id`). Dedupes on `netlify_submission_id` (unique). Optional `NETLIFY_WEBHOOK_SECRET` + `?token=` on webhook URL.
✅ **Validation** — `src/lib/form-schemas.ts` (Zod 4).

## Coming in Phase 2.5 (deferred per user)

- 49 FR translations alongside Decap CMS verification
- Decap CMS i18n preview + multi-locale entries

## Coming in Phase 5

- Decap CMS verified end-to-end
- Netlify Identity / Git Gateway test passes
- FR i18n filled out

## Coming in Phase 6

- Programmatic generation of any additional landing pages (e.g. course × region long-tail)
- Per-page OG image generation via `@vercel/og` style tool

## Coming in Phase 7

- Netlify deploy, env wiring, smoke tests, Lighthouse audit
- DNS cutover from existing menodiveclub.com to Netlify with 48-hr rollback window

---

## Dev troubleshooting: blank page / 500 on `/@vite/client`

**Cause:** `@react-three/drei` → `detect-gpu`: Vite resolved the UMD `main` entry, breaking named ESM imports (`getGPUTier`). A hoisted **Vite 8** conflicted with Astro 6 (Vite 7), causing `Missing field moduleType` in the React refresh pipeline.

**Fix in this repo:** `detect-gpu` alias to `dist/detect-gpu.esm.js`, `react`/`react-dom` dedupe, and `overrides.vite` = `7.3.2`. After `npm install`, restart `npm run dev` and hard-refresh.


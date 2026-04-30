import { ui, defaultLang, type UiKey } from './ui'
import type { Locale } from '../consts'

/**
 * Extract the active locale from a URL path. Falls back to defaultLang.
 */
export function getLangFromUrl(url: URL): Locale {
  const [, segment] = url.pathname.split('/')
  if (segment in ui) return segment as Locale
  return defaultLang
}

/**
 * Returns a translator function bound to the given locale.
 *
 * Usage:
 *   const t = useTranslations(lang)
 *   <h1>{t('hero.title')}</h1>
 */
export function useTranslations(lang: Locale) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key]
  }
}

/**
 * Routes that have a FR translation built. Anything outside this list always
 * resolves to the English route, even if `lang === 'fr'`, so users on the FR
 * home page never hit a 404 by clicking a nav link.
 *
 * As FR sub-pages get built (Phase 2.5), add their roots here.
 */
const FR_AVAILABLE: ReadonlyArray<string> = ['/']

/**
 * Build a localized path. Default locale (`en`) has no prefix; others do.
 *   localizedPath('en', '/courses') → '/courses'
 *   localizedPath('fr', '/courses') → '/courses'   (no FR translation yet)
 *   localizedPath('fr', '/')        → '/fr'
 */
export function localizedPath(lang: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (lang === defaultLang) return clean
  // Only prefix /fr for routes we know are translated
  const root = '/' + (clean.split('/').filter(Boolean)[0] ?? '')
  if (!FR_AVAILABLE.includes(root) && !FR_AVAILABLE.includes(clean)) return clean
  return `/${lang}${clean === '/' ? '' : clean}`
}

/**
 * Swap the locale in the current URL while keeping the same page.
 * Used by the language switcher.
 *
 * If the target language doesn't have a translation for the current path,
 * fall back to that language's home (so users never land on a 404 from
 * the language switcher).
 */
export function switchLocale(url: URL, target: Locale): string {
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts[0] === 'en' || parts[0] === 'fr') parts.shift()
  const rest = parts.length ? `/${parts.join('/')}` : '/'
  if (target === defaultLang) return rest
  // Going to a non-default locale — only allow if route is translated
  const root = '/' + (rest.split('/').filter(Boolean)[0] ?? '')
  const translated = FR_AVAILABLE.includes(root) || FR_AVAILABLE.includes(rest)
  if (!translated) return `/${target}`
  return `/${target}${rest === '/' ? '' : rest}`
}

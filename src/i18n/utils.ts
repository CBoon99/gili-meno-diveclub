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
 * Build a localized path. The default locale (`en`) has no prefix; others do.
 *   localizedPath('en', '/courses') → '/courses'
 *   localizedPath('fr', '/courses') → '/fr/courses'
 */
export function localizedPath(lang: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (lang === defaultLang) return clean
  return `/${lang}${clean === '/' ? '' : clean}`
}

/**
 * Swap the locale in the current URL while keeping the same page.
 * Used by the language switcher.
 */
export function switchLocale(url: URL, target: Locale): string {
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts[0] === 'en' || parts[0] === 'fr') parts.shift()
  const rest = parts.length ? `/${parts.join('/')}` : '/'
  return target === defaultLang ? rest : `/${target}${rest === '/' ? '' : rest}`
}

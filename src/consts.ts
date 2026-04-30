/**
 * Site-wide constants. Single source of truth for SEO + branding.
 *
 * Contact + social fields are CMS-editable via `/admin` — the customer can
 * change phone, email, WhatsApp, and social URLs and they propagate site-wide
 * (Header, Footer, schema.org, contact page, WhatsApp button).
 */
import generalSettings from './content/settings/general.json'

const general = generalSettings as Partial<{
  phone: string
  phoneIntl: string
  whatsapp: string
  email: string
  instagram: string
  facebook: string
  google: string
}>

export const SITE_CONFIG = {
  name: 'Meno Dive Club',
  shortName: 'Meno Dive',
  url: 'https://menodiveclub.com',
  defaultLocale: 'en' as const,
  locales: ['en', 'fr'] as const,

  contact: {
    email: general.email ?? 'info@menodiveclub.com',
    phone: general.phone ?? '+62 8786 4074156',
    phoneIntl: general.phoneIntl ?? '+6287864074156',
    whatsapp: general.whatsapp ?? '6287864074156',
  },

  location: {
    name: 'Gili Meno, Lombok',
    streetAddress: 'Jl. Gili Meno',
    locality: 'Pemenang',
    region: 'North Lombok Regency, West Nusa Tenggara',
    postalCode: '83352',
    country: 'ID',
    coordinates: { lat: -8.3559, lng: 116.0623 },
  },

  social: {
    instagram: general.instagram ?? 'https://instagram.com/menodiveclub',
    facebook: general.facebook ?? 'https://facebook.com/menodiveclub',
    google: general.google ?? 'https://g.page/menodiveclub',
  },

  partners: ['SSI'],

  // Color tokens — also defined in src/styles/global.css @theme.
  colors: {
    oceanDeep: '#051a2c',
    oceanMid: '#0E5A7A',
    oceanLight: '#0AADDB',
    sand: '#D4A574',
    foam: '#E8F4F8',
  },
} as const

export type Locale = (typeof SITE_CONFIG.locales)[number]

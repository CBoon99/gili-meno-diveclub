/**
 * Site-wide constants. Single source of truth for SEO + branding.
 */

export const SITE_CONFIG = {
  name: 'Meno Dive Club',
  shortName: 'Meno Dive',
  url: 'https://menodiveclub.com',
  defaultLocale: 'en' as const,
  locales: ['en', 'fr'] as const,

  // Confirmed by user (live site values, 2026-04-28).
  contact: {
    email: 'info@menodiveclub.com',
    phone: '+62 8786 4074156',
    phoneIntl: '+6287864074156',
    whatsapp: '6287864074156',
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
    instagram: 'https://instagram.com/menodiveclub',
    facebook: 'https://facebook.com/menodiveclub',
    google: 'https://g.page/menodiveclub',
  },

  partners: ['SSI', 'PADI'],

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

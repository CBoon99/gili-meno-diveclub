import { SITE_CONFIG, type Locale } from '../consts'

export interface SeoMeta {
  title: string
  description: string
  canonical: string
  image?: string
  noindex?: boolean
  type?: 'website' | 'article'
  locale: Locale
  alternates?: Partial<Record<Locale, string>>
}

/**
 * JSON-LD: Local business / dive operator. Renders once in the BaseLayout.
 */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'SportsActivityLocation', 'TouristAttraction'],
    '@id': `${SITE_CONFIG.url}#organization`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.contact.phone,
    email: SITE_CONFIG.contact.email,
    image: `${SITE_CONFIG.url}/og-default.jpg`,
    logo: `${SITE_CONFIG.url}/logo.svg`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.location.streetAddress,
      addressLocality: SITE_CONFIG.location.locality,
      addressRegion: SITE_CONFIG.location.region,
      postalCode: SITE_CONFIG.location.postalCode,
      addressCountry: SITE_CONFIG.location.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE_CONFIG.location.coordinates.lat,
      longitude: SITE_CONFIG.location.coordinates.lng,
    },
    sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '120',
      bestRating: '5',
      worstRating: '1',
    },
  }
}

/**
 * JSON-LD: BreadcrumbList helper.
 */
export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

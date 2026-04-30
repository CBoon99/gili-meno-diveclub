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
    logo: `${SITE_CONFIG.url}/icon-512.png`,
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
 * JSON-LD: WebSite (helps Google show a site-name + sitelinks search box).
 */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}#website`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    inLanguage: ['en', 'fr'],
    publisher: { '@id': `${SITE_CONFIG.url}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * JSON-LD: Organization (linked to LocalBusiness via @id).
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}#organization`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/icon-512.png`,
      width: 512,
      height: 512,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: SITE_CONFIG.contact.phone,
      email: SITE_CONFIG.contact.email,
      areaServed: 'ID',
      availableLanguage: ['English', 'French', 'Indonesian'],
    },
    sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook, SITE_CONFIG.social.google],
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

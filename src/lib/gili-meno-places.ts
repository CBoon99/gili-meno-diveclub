/**
 * Map POIs around Gili Meno — approximate positions for discovery UX, not navigation-grade GPS.
 */

export type MapPlaceCategory = 'dive-site' | 'restaurant' | 'accommodation' | 'sightseeing'

export type MapPlace = {
  id: string
  name: string
  category: MapPlaceCategory
  lat: number
  lng: number
  /** Internal path (dive sites) or optional external URL */
  href?: string
  blurb?: string
}

export const GILI_MENO_CENTER = { lat: -8.3559, lng: 116.0623 } as const

export const MAP_CATEGORY_LABEL: Record<MapPlaceCategory, string> = {
  'dive-site': 'Dive sites',
  restaurant: 'Restaurants',
  accommodation: 'Stay',
  sightseeing: 'Sightseeing',
}

/** Marker colours aligned with site palette */
export const MAP_CATEGORY_COLOR: Record<MapPlaceCategory, string> = {
  'dive-site': '#0aaddb',
  restaurant: '#d4a574',
  accommodation: '#7dd3fc',
  sightseeing: '#38bdf8',
}

export const giliMenoPlaces: MapPlace[] = [
  // —— Dive sites (link to site pages) ——
  {
    id: 'ds-turtle-city',
    name: 'Turtle City',
    category: 'dive-site',
    lat: -8.3521,
    lng: 116.0588,
    href: '/dive-sites/turtle-city',
    blurb: 'Turtles and coral gardens — easy conditions.',
  },
  {
    id: 'ds-secret-reef',
    name: 'Secret Reef',
    category: 'dive-site',
    lat: -8.3582,
    lng: 116.0595,
    href: '/dive-sites/secret-reef',
    blurb: 'Quieter site, rich hard & soft coral.',
  },
  {
    id: 'ds-meno-wall',
    name: 'Meno Wall',
    category: 'dive-site',
    lat: -8.3505,
    lng: 116.0642,
    href: '/dive-sites/meno-wall',
    blurb: 'Vertical wall with macro life and turtles.',
  },
  {
    id: 'ds-air-wall',
    name: 'Air Wall',
    category: 'dive-site',
    lat: -8.361,
    lng: 116.0615,
    href: '/dive-sites/air-wall',
    blurb: 'Wall dive with sandy patches and nudibranchs.',
  },
  {
    id: 'ds-hans-reef',
    name: 'Hans Reef',
    category: 'dive-site',
    lat: -8.3538,
    lng: 116.0665,
    href: '/dive-sites/hans-reef',
    blurb: 'Macro heaven — frogfish and critters.',
  },
  {
    id: 'ds-shallow-turbo',
    name: 'Shallow Turbo',
    category: 'dive-site',
    lat: -8.345,
    lng: 116.055,
    href: '/dive-sites/shallow-turbo',
    blurb: 'Fish schools and reef fish on a shallow plateau.',
  },
  {
    id: 'ds-deep-turbo',
    name: 'Deep Turbo',
    category: 'dive-site',
    lat: -8.3435,
    lng: 116.0588,
    href: '/dive-sites/deep-turbo',
    blurb: 'Deeper mounds — sharks, rays, pelagics possible.',
  },
  {
    id: 'ds-meno-slope',
    name: 'Meno Slope',
    category: 'dive-site',
    lat: -8.3575,
    lng: 116.0668,
    href: '/dive-sites/meno-slope',
    blurb: 'Gentle slope, mixed corals, all levels.',
  },
  {
    id: 'ds-bounty-wreck',
    name: 'Bounty Wreck',
    category: 'dive-site',
    lat: -8.3598,
    lng: 116.0542,
    href: '/dive-sites/bounty-wreck',
    blurb: 'Small wreck covered in life off southwest Meno.',
  },
  {
    id: 'ds-bio-rock',
    name: 'Bio Rock',
    category: 'dive-site',
    lat: -8.3544,
    lng: 116.0619,
    href: '/dive-sites/bio-rock',
    blurb: 'House reef & Bio Rock structures — great for a relaxed dive.',
  },
  {
    id: 'ds-halik-reef',
    name: 'Halik Reef',
    category: 'dive-site',
    lat: -8.3489,
    lng: 116.0634,
    href: '/dive-sites/halik-reef',
    blurb: 'Sloping reef with turtles among hard & soft coral.',
  },
  {
    id: 'ds-shark-point',
    name: 'Shark Point',
    category: 'dive-site',
    lat: -8.3472,
    lng: 116.0591,
    href: '/dive-sites/shark-point',
    blurb: 'Sandy canyons — reef sharks, rays, turtles.',
  },
  {
    id: 'ds-sunset-reef',
    name: 'Sunset Reef',
    category: 'dive-site',
    lat: -8.362,
    lng: 116.058,
    href: '/dive-sites/sunset-reef',
    blurb: 'Easy coral slope — ideal for a mellow afternoon dive.',
  },
  // —— Restaurants ——
  {
    id: 'r-tipsy-turtle',
    name: 'Tipsy Turtle Restaurant',
    category: 'restaurant',
    lat: -8.3554,
    lng: 116.0618,
    blurb: 'Beachfront dining — Indonesian & Western dishes.',
  },
  {
    id: 'r-yaya',
    name: 'Ya Ya Warung',
    category: 'restaurant',
    lat: -8.3561,
    lng: 116.0609,
    blurb: 'Local warung — homestyle Indonesian plates.',
  },
  {
    id: 'r-sasak',
    name: 'Sasak Cafe',
    category: 'restaurant',
    lat: -8.3548,
    lng: 116.0625,
    blurb: 'Juices, seafood & Lombok flavours by the water.',
  },
  {
    id: 'r-befamily',
    name: 'Warung Be Family',
    category: 'restaurant',
    lat: -8.3568,
    lng: 116.0612,
    blurb: 'Family-run spot with generous local portions.',
  },
  {
    id: 'r-bask',
    name: 'BASK',
    category: 'restaurant',
    lat: -8.3551,
    lng: 116.0632,
    blurb: 'Upscale dining & cocktails.',
  },
  {
    id: 'r-lepirate',
    name: 'Le Pirate Beach Club',
    category: 'restaurant',
    lat: -8.3572,
    lng: 116.0602,
    blurb: 'Relaxed beach club vibes, drinks & bites.',
  },
  {
    id: 'r-seaside',
    name: 'Beach cafes (east shore)',
    category: 'restaurant',
    lat: -8.3525,
    lng: 116.064,
    blurb: 'Several casual spots along the quieter east coast.',
  },
  {
    id: 'r-west-path',
    name: 'Warungs (west coast path)',
    category: 'restaurant',
    lat: -8.3579,
    lng: 116.0565,
    blurb: 'Low-key local eats toward the sunset side of the island.',
  },
  // —— Stay ——
  {
    id: 'a-sea-la-vie',
    name: 'Sea La Vie',
    category: 'accommodation',
    lat: -8.3533,
    lng: 116.0638,
    blurb: 'Boutique villa-style stays — ask us for dive & stay tips.',
  },
  {
    id: 'a-beach-bungalows',
    name: 'Beach bungalows & small resorts',
    category: 'accommodation',
    lat: -8.3565,
    lng: 116.0628,
    blurb: 'Gili Meno is walkable — most guesthouses are minutes from the jetty.',
  },
  {
    id: 'a-north-shore',
    name: 'North shore guesthouses',
    category: 'accommodation',
    lat: -8.3516,
    lng: 116.0614,
    blurb: 'Quiet north end, short stroll to the dive centre strip.',
  },
  {
    id: 'a-port-strip',
    name: 'Near harbour / main strip',
    category: 'accommodation',
    lat: -8.3574,
    lng: 116.0619,
    blurb: 'Handy for arrivals — we are a short walk inland from the beach path.',
  },
  // —— Sightseeing ——
  {
    id: 's-salt-lake',
    name: 'Salt Lake (walking loop)',
    category: 'sightseeing',
    lat: -8.35,
    lng: 116.0655,
    blurb: 'Inland trail — birds, mangroves, calm away from the beach.',
  },
  {
    id: 's-turtle-sanctuary',
    name: 'Turtle sanctuary',
    category: 'sightseeing',
    lat: -8.3528,
    lng: 116.0598,
    blurb: 'Small hatchery project — check opening times locally.',
  },
  {
    id: 's-nest-statue',
    name: 'Nest underwater statues (snorkel)',
    category: 'sightseeing',
    lat: -8.3587,
    lng: 116.0575,
    blurb: 'Famous snorkel spot off neighbouring Gili Meno waters — boat or organised trip.',
  },
  {
    id: 's-turtle-city-snorkel',
    name: 'Turtle City (snorkel)',
    category: 'sightseeing',
    lat: -8.3523,
    lng: 116.0587,
    blurb: 'Shallow turtles — fins, respect distance, no touching.',
  },
]

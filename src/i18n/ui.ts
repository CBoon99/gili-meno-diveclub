/**
 * Translation keys. Add new keys here and they're typed across the app.
 */

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.courses': 'Courses',
    'nav.diveSites': 'Dive Sites',
    'nav.gallery': 'Gallery',
    'nav.giliMeno': 'Gili Meno',
    'nav.diveStay': 'Dive & Stay',
    'nav.blog': 'Blog',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.book': 'Book Now',

    'hero.title': 'Your Underwater Adventure Awaits',
    'hero.subtitle':
      'SSI certified dive school on Gili Meno. Small groups, world-class reefs, life-changing experiences.',
    'hero.cta': 'Book your dive',
    'hero.secondary': 'Explore courses',

    'home.aboutHeading': 'Dive, learn, explore.',
    'home.aboutBody':
      'Meno Dive Club is a family-operated SSI dive centre on Gili Meno, Indonesia. From your first breath underwater to advanced certifications, we share our love of the ocean with divers of every level.',

    'footer.rights': 'All rights reserved.',
    'footer.partners': 'Official partner of',

    'lang.switchTo': 'Switch to',
    'lang.en': 'English',
    'lang.fr': 'Français',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.courses': 'Cours',
    'nav.diveSites': 'Sites de plongée',
    'nav.gallery': 'Galerie',
    'nav.giliMeno': 'Gili Meno',
    'nav.diveStay': 'Plonger & Séjourner',
    'nav.blog': 'Blog',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.book': 'Réserver',

    'hero.title': 'Votre aventure sous-marine vous attend',
    'hero.subtitle':
      'École de plongée certifiée SSI à Gili Meno. Petits groupes, récifs de classe mondiale, expériences inoubliables.',
    'hero.cta': 'Réserver une plongée',
    'hero.secondary': 'Voir les cours',

    'home.aboutHeading': 'Plongez, apprenez, explorez.',
    'home.aboutBody':
      "Meno Dive Club est un centre de plongée SSI familial à Gili Meno, en Indonésie. De votre première respiration sous l'eau aux certifications avancées, nous partageons notre passion pour l'océan avec les plongeurs de tous niveaux.",

    'footer.rights': 'Tous droits réservés.',
    'footer.partners': 'Partenaire officiel de',

    'lang.switchTo': 'Passer en',
    'lang.en': 'English',
    'lang.fr': 'Français',
  },
} as const

export type UiKey = keyof (typeof ui)['en']
export const defaultLang = 'en' as const

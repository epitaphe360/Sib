/** Slugs page_contents éditables depuis l’admin (pages vitrine SIB). */
export const VITRINE_PAGE_SLUGS = [
  { slug: 'presentation', label: 'Présentation', route: '/presentation' },
  { slug: 'pourquoi-visiter', label: 'Pourquoi visiter', route: '/pourquoi-visiter' },
  { slug: 'pourquoi-exposer', label: 'Pourquoi exposer', route: '/pourquoi-exposer' },
  { slug: 'infos-pratiques', label: 'Infos pratiques', route: '/infos-pratiques' },
  { slug: 'espaces-sib', label: 'Espaces SIB', route: '/espaces' },
  { slug: 'editions', label: 'Éditions / Historique', route: '/editions' },
  { slug: 'nouveautes', label: 'Nouveautés', route: '/nouveautes' },
  { slug: 'secteurs-activites', label: 'Secteurs d’activités', route: '/secteurs' },
  { slug: 'telechargements', label: 'Téléchargements', route: '/telechargements' },
  { slug: 'programme_scientifique', label: 'Programme scientifique', route: '/events' },
  { slug: 'contact', label: 'Contact', route: '/contact' },
  { slug: 'presse', label: 'Accréditation presse', route: '/press/accreditation' },
  { slug: 'venue', label: 'Lieu / Venue', route: '/venue' },
  { slug: 'femmes-hommes', label: 'Femmes & Hommes', route: '/salon/femmes-et-hommes' },
  { slug: 'site_footer', label: 'Footer global site', route: '/' },
  { slug: 'salons_hub', label: 'UrbaEvent — Hub salons (/salons)', route: '/salons' },
  { slug: 'salon_sir', label: 'Salon SIR (/salon/sir)', route: '/salon/sir' },
  { slug: 'salon_sip', label: 'Salon SIP (/salon/sip)', route: '/salon/sip' },
  { slug: 'salon_btp', label: 'Salon BTP (/salon/btp)', route: '/salon/btp' },
  { slug: 'salon_sie', label: 'Salon SIE (/salon/sie)', route: '/salon/sie' },
] as const;

/** Clés CMS fréquentes (aide à l’édition JSON). */
export const PAGE_CONTENT_FIELD_HINTS: Record<string, string[]> = {
  presentation: [
    'hero_title', 'hero_subtitle', 'about_text', 'stat_exposants', 'stat_visiteurs',
    'stat_pays', 'stat_surface', 'org_1_name', 'org_1_role', 'org_1_desc',
  ],
  'pourquoi-visiter': ['hero_title', 'hero_subtitle', 'intro_text', 'benefit_1_title', 'benefit_1_desc'],
  'pourquoi-exposer': ['hero_title', 'hero_subtitle', 'intro_text', 'reason_1_title', 'reason_1_desc'],
  'infos-pratiques': ['hero_title', 'dates', 'horaires', 'adresse', 'acces'],
  'espaces-sib': ['hero_title', 'hero_subtitle', 'space_1_name', 'space_1_desc'],
  editions: ['hero_title', 'hero_subtitle', 'timeline_intro'],
  nouveautes: ['hero_title', 'hero_subtitle', 'intro_text'],
  'secteurs-activites': ['hero_title', 'hero_subtitle', 'intro_text'],
  telechargements: ['hero_title', 'hero_subtitle', 'brochure_url'],
  programme_scientifique: ['title', 'subtitle', 'intro'],
  contact: [
    'hero_title', 'hero_description', 'address', 'email', 'phone',
    'hours_weekdays', 'hours_saturday', 'hours_sunday',
    'facebook_url', 'linkedin_url', 'twitter_url',
  ],
  presse: ['hero_title', 'hero_subtitle', 'success_title', 'success_message', 'note_important'],
  venue: ['hero_kicker', 'hero_title', 'hero_description'],
  'femmes-hommes': [
    'hero_eyebrow', 'hero_title', 'hero_title_accent', 'hero_subtitle', 'cta_exhibitor', 'cta_visitor',
    'stats_json', 'mission_kicker', 'mission_title', 'mission_text', 'mission_bullets_json',
    'profiles_json', 'metiers_json', 'cta_title', 'cta_subtitle',
  ],
  site_footer: [
    'tagline', 'contact_name', 'address', 'email', 'phone',
    'facebook_url', 'twitter_url', 'linkedin_url', 'youtube_url', 'copyright_suffix',
  ],
  salons_hub: [
    'hero_badge', 'hero_badge_sub', 'hero_title', 'hero_subtitle',
    'platform_stats_json', 'choose_title', 'choose_subtitle_connected', 'choose_subtitle_guest',
    'about_kicker', 'about_title', 'about_text', 'about_stats_json',
    'cta_title', 'cta_subtitle', 'salons_cards_json',
  ],
  salon_sir: [
    'code', 'name', 'tagline', 'description', 'dates', 'location', 'venue',
    'visitors', 'exhibitors', 'edition', 'color', 'bgColor', 'gradient',
    'highlights_json', 'features_json', 'program_json',
  ],
  salon_sip: [
    'code', 'name', 'tagline', 'description', 'dates', 'location', 'venue',
    'visitors', 'exhibitors', 'edition', 'color', 'bgColor', 'gradient',
    'highlights_json', 'features_json', 'program_json',
  ],
  salon_btp: [
    'code', 'name', 'tagline', 'description', 'dates', 'location', 'venue',
    'visitors', 'exhibitors', 'edition', 'color', 'bgColor', 'gradient',
    'highlights_json', 'features_json', 'program_json',
  ],
  salon_sie: [
    'code', 'name', 'tagline', 'description', 'dates', 'location', 'venue',
    'visitors', 'exhibitors', 'edition', 'color', 'bgColor', 'gradient',
    'highlights_json', 'features_json', 'program_json',
  ],
};

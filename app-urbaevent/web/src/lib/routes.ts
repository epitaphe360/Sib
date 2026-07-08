export const ROUTES = {
  HOME: '/',
  HOME_P1: '/accueil/1',
  HOME_P2: '/accueil/2',
  HOME_P3: '/accueil/3',
  HOME_P4: '/accueil/4',
  HOME_P5: '/accueil/5',
  HOME_P6: '/accueil/6',
  HOME_P7: '/accueil/7',
  HOME_P8: '/accueil/8',
  HOME_P9: '/accueil/9',
  HOME_P10: '/accueil/10',
  HOME_P11: '/accueil/11',
  HOME_P12: '/accueil/12',
  HOME_P13: '/accueil/13',
  HOME_P14: '/accueil/14',
  HOME_P15: '/accueil/15',
  HOME_P16: '/accueil/16',
  HOME_P17: '/accueil/17',
  HOME_WORLD: '/accueil/world',
  HOME_40ANS: '/accueil/40ans',
  HOME_DEMO: '/home/demo',
  HOME_VARIANTS: '/home/variants',
  DESIGN_HOME_MENU: '/design/menu-accueil',
  EXHIBITORS: '/exhibitors',
  EXHIBITOR_DETAIL: '/exhibitors/:id',
  PARTNERS: '/partners', // alias → /exhibitors (annuaire public)
  PARTNER_DETAIL: '/partners/:id', // alias → /exhibitors/:id
  PAVILIONS: '/pavilions',
  METRICS: '/metrics',
  NETWORKING: '/networking',
  B2B_NETWORKING_AI: '/networking/b2b-ai',
  EVENTS: '/events',
  LOGIN: '/login',
  DEMO_ACCOUNTS: '/demo',
  FORGOT_PASSWORD: '/forgot-password',
  REGISTER: '/register',
  REGISTER_VISITOR: '/register/visitor',
  REGISTER_EXHIBITOR: '/register/exhibitor',
  REGISTER_PARTNER: '/register/partner',
  SIGNUP_SUCCESS: '/signup-success',
  SIGNUP_CONFIRMATION: '/signup-confirmation',
  PENDING_ACCOUNT: '/pending-account',
  OAUTH_CALLBACK: '/auth/callback',
  PROFILE: '/profile',
  PROFILE_DETAILED: '/profile/detailed',
  PROFILE_MATCHING: '/profile/matching',
  ADVANCED_MATCHING: '/matching/advanced',
  DASHBOARD: '/dashboard',
  EXHIBITOR_PROFILE: '/exhibitor/profile',
  EXHIBITOR_DASHBOARD: '/exhibitor/dashboard',
  PARTNER_DASHBOARD: '/partner/dashboard',
  PARTNER_PROFILE: '/partner/profile',
  PARTNER_SETTINGS: '/partner/settings',
  VISITOR_DASHBOARD: '/visitor/dashboard',
  VISITOR_SETTINGS: '/visitor/settings',
  MESSAGES: '/messages',
  CHAT: '/chat',
  APPOINTMENTS: '/appointments',
  CALENDAR: '/calendar',
  MINISITE: '/minisite',
  MINISITE_DIRECTORY: '/minisites',
  MINISITE_CREATION: '/minisite-creation',
  RESET_PASSWORD: '/reset-password',
  MINISITE_EDITOR: '/minisite/editor',
  ADMIN_CREATE_EXHIBITOR: '/admin/create-exhibitor',
  ADMIN_EXHIBITORS: '/admin/exhibitors',
  ADMIN_CREATE_PARTNER: '/admin/create-partner',
  ADMIN_PARTNERS_MANAGE: '/admin/partners-manage',
  ADMIN_CREATE_EVENT: '/admin/create-event',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_VIP_VISITORS: '/admin/vip-visitors',
  ADMIN_SECURITY_ZONES: '/admin/security-zones',
  ADMIN_CREATE_NEWS: '/admin/create-news',
  ADMIN_NEWS: '/admin/news',
  MINISITE_PREVIEW: '/minisite/:exhibitorId',
  ADMIN_ACTIVITY: '/admin/activity',
  ADMIN_VALIDATION: '/admin/validation',
  ADMIN_REGISTRATION_REQUESTS: '/admin/registration-requests',
  ADMIN_MODERATION: '/admin/moderation',
  NEWS: '/news',
  NEWS_DETAIL: '/news/:id',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_CREATE_USER: '/admin/users/create',
  ADMIN_PAVILIONS: '/admin/pavilions',
  ADMIN_CREATE_PAVILION: '/admin/create-pavilion',
  ADMIN_PAVILION_ADD_DEMO: '/admin/pavilion/:pavilionId/add-demo',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_EMAIL_TEMPLATES: '/admin/email-templates',
  ADMIN_CONFIG: '/admin/config',
  ADMIN_BADGE_CONFIG: '/admin/badge-config',
  CONTACT: '/contact',
  CONTACT_SUCCESS: '/contact/success',
  PARTNERSHIP: '/partnership',
  SUPPORT: '/support',
  API: '/api',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  AVAILABILITY_SETTINGS: '/availability/settings',
  VENUE: '/venue',
  ACCOMMODATION: '/hebergement',

  // Pages sponsors
  PARTNER_ACTIVITY: '/partner/activity',
  PARTNER_ANALYTICS: '/partner/analytics',
  PARTNER_EVENTS: '/partner/events',
  PARTNER_LEADS: '/partner/leads',
  PARTNER_MEDIA: '/partner/media',
  PARTNER_NETWORKING: '/partner/networking',
  PARTNER_PROFILE_EDIT: '/partner/profile/edit',
  PARTNER_SATISFACTION: '/partner/satisfaction',
  PARTNER_SUPPORT_PAGE: '/partner/support-page',

  // Pages admin manquantes
  ADMIN_PARTNERS: '/admin/partners',
  ADMIN_MEDIA: '/admin/media',
  ADMIN_SALONS: '/admin/salons',
  ADMIN_PUSH_NOTIFICATIONS: '/admin/push-notifications',
  ADMIN_VISA_LETTERS: '/admin/visa-letters',
  ADMIN_EXHIBITORS_LIST: '/admin/exhibitors-list',
  ADMIN_USERS_LIST: '/admin/users-list',
  ADMIN_PUBLICATION_CONTROL: '/admin/publication-control',
  ADMIN_STAND_COLLABORATORS: '/admin/stand-collaborators',

  // Pages erreur
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/404',

  // Pages inscription/subscription
  EXHIBITOR_SUBSCRIPTION: '/exhibitor/subscription',
  PARTNER_SUBSCRIPTION: '/partner/subscription',

  // Pages visiteur
  VISITOR_SUBSCRIPTION: '/visitor/subscription',
  VISITOR_UPGRADE: '/visitor/upgrade',
  VISITOR_PAYMENT: '/visitor/payment',
  VISITOR_BANK_TRANSFER: '/visitor/bank-transfer',
  VISITOR_PAYMENT_SUCCESS: '/visitor/payment-success',
  VISITOR_PAYMENT_INSTRUCTIONS: '/visitor/payment-instructions',
  VISITOR_FREE_REGISTRATION: '/visitor/register/free',
  VISITOR_VIP_REGISTRATION: '/visitor/register/vip',
  BADGE: '/badge',

  // Mini-Site Builder
  CREATE_MINI_SITE: '/exhibitor/mini-site/create',
  EDIT_MINI_SITE: '/exhibitor/mini-site/:siteId/edit',
  MINI_SITE_VIEW: '/mini-sites/:siteId',

  // Networking & Matchmaking
  NETWORKING_MATCHMAKING: '/networking/matchmaking',
  NETWORKING_ROOMS: '/networking/rooms/:eventId',
  SPEED_NETWORKING: '/networking/speed/:sessionId',
  INTERACTION_HISTORY: '/networking/history',
  BADGE_DIGITAL: '/badge/digital',
  BADGE_SCANNER: '/badge/scanner',
  BADGE_PRINT_STATION: '/badge/print-station',
  SERVICE_CLIENT_PORTAL: '/service-client',
  SECURITY_SCANNER: '/security/scanner',

  // Partner upgrade routes
  PARTNER_UPGRADE: '/partner/upgrade',
  PARTNER_PAYMENT_SELECTION: '/partner/payment-selection',
  PARTNER_BANK_TRANSFER: '/partner/bank-transfer',

  // Admin payment
  ADMIN_PAYMENT_VALIDATION: '/admin/payment-validation',

  // Marketing Dashboard
  MARKETING_DASHBOARD: '/marketing/dashboard',

  // Media Routes - Nouvelles fonctionnalités
  MEDIA_LIBRARY: '/media',
  MEDIA_DETAIL: '/media/:id',
  WEBINARS: '/media/webinars',
  WEBINAR_DETAIL: '/media/webinar/:id',
  PODCASTS: '/media/podcasts',
  PODCAST_DETAIL: '/media/podcast/:id',
  CAPSULES_INSIDE: '/media/inside-sib',
  CAPSULE_DETAIL: '/media/capsule/:id',
  LIVE_STUDIO: '/media/live-studio',
  LIVE_STUDIO_DETAIL: '/media/live-studio/:id',
  BEST_MOMENTS: '/media/best-moments',
  BEST_MOMENTS_DETAIL: '/media/best-moments/:id',
  TESTIMONIALS: '/media/testimonials',
  TESTIMONIAL_DETAIL: '/media/testimonial/:id',

  // Admin Media Management
  ADMIN_MEDIA_CREATE: '/admin/media/create',
  ADMIN_MEDIA_MANAGE: '/admin/media/manage',
  ADMIN_MEDIA_LIBRARY: '/admin/media/library',
  ADMIN_MEDIA_EDIT: '/admin/media/edit/:id',
  ADMIN_LIVE_EVENTS: '/admin/live-events',
  ADMIN_LIVE_EVENT_CREATE: '/admin/live-events/create',
  ADMIN_PARTNER_MEDIA_APPROVAL: '/admin/partner-media/approval',

  // Partner Media Management
  PARTNER_MEDIA_UPLOAD: '/partner/media/upload',
  PARTNER_MEDIA_ANALYTICS: '/partner/media/analytics',
  PARTNER_MEDIA_LIBRARY: '/partner/media/library',

  // Autres
  PRODUCT_DETAIL: '/products/:id',
  EXHIBITOR_PROFILE_EDIT: '/exhibitor/profile/edit',
  DEV_TEST_FLOW: '/dev/test-flow',
  VISITOR_VISA_LETTER: '/visitor/visa-letter',
  PRESS_ACCREDITATION: '/press/accreditation',
  HALL_MAP: '/map',
  CATALOG: '/catalog',
  ADMIN_PRESS_ACCREDITATIONS: '/admin/press-accreditations',
  ADMIN_SESSION_CHECKIN: '/security/scanner',
  ADMIN_SESSION_REGISTRATIONS: '/admin/session-registrations',
  ADMIN_CREDENTIALS: '/admin/credentials',
  SPEAKERS: '/speakers',
  ADMIN_SPEAKERS: '/admin/speakers',

  // UrbaEvent - Sélection multi-salons
  SALON_SELECTION: '/salons',
  SALON_SIB: '/',
  SALON_SIR: '/salon/sir',
  SALON_SIP: '/salon/sip',
  SALON_BTP: '/salon/btp',
  SALON_SIE: '/salon/sie',

  // Pages statiques - Le Salon
  PRESENTATION: '/presentation',
  NOUVEAUTES: '/nouveautes',
  SECTEURS: '/secteurs',
  EDITIONS: '/editions',
  TELECHARGEMENTS: '/telechargements',
  FEMMES_HOMMES: '/salon/femmes-et-hommes',

  // Pages statiques - Exposer
  POURQUOI_EXPOSER: '/pourquoi-exposer',
  ESPACES_SIB: '/espaces',

  // Pages statiques - Visiter
  POURQUOI_VISITER: '/pourquoi-visiter',
  INFOS_PRATIQUES: '/infos-pratiques',

  // MODULE 1 — Collaborateurs de stand
  EXHIBITOR_TEAM: '/exhibitor/team',
  PARTNER_TEAM: '/partner/team',
  TEAM_BADGES_PRINT: '/print/badges-equipe',

  // MODULE 2 — Lettres d'invitation
  INVITATION_LETTER: '/invitation-letter',
  EXHIBITOR_INVITATION_LETTER: '/exhibitor/invitation-letter',
  PARTNER_INVITATION_LETTER: '/partner/invitation-letter',
  ADMIN_INVITATIONS: '/admin/invitations',

  // MODULE 3 — Location de matériel
  RENTAL_CATALOG: '/rental',
  RENTAL_CHECKOUT: '/rental/checkout',
  RENTAL_PAYMENT_SUCCESS: '/rental/payment-success',
  EXHIBITOR_RENTAL: '/exhibitor/rental',
  PARTNER_RENTAL: '/partner/rental',
  ADMIN_RENTAL: '/admin/rental',

  // MODULE 4 — Location de chapiteaux
  CHAPITEAU_CATALOG: '/chapiteau',
  CHAPITEAU_CHECKOUT: '/chapiteau/checkout',
  CHAPITEAU_PAYMENT_SUCCESS: '/chapiteau/payment-success',
  EXHIBITOR_CHAPITEAU: '/exhibitor/chapiteau',
  PARTNER_CHAPITEAU: '/partner/chapiteau',
  ADMIN_CHAPITEAU: '/admin/chapiteau',

  // MODULE 5 — Vente d'espaces publicitaires
  EXHIBITOR_ADVERTISING: '/exhibitor/advertising',
  PARTNER_ADVERTISING: '/partner/advertising',
  ADVERTISING_CHECKOUT: '/advertising/checkout',
  ADVERTISING_PAYMENT_SUCCESS: '/advertising/payment-success',
  ADMIN_ADVERTISING: '/admin/advertising',

  // MODULE 6 — Sponsor Média
  REGISTER_MEDIA_PARTNER: '/register/media-partner',
  MEDIA_PARTNER_DASHBOARD: '/media-partner/dashboard',

  // Exposant — pages dédiées
  EXHIBITOR_SCANS: '/exhibitor/scans',

  // Sponsor — pages dédiées
  PARTNER_SCANS: '/partner/scans',

  // MODULE FACTURATION
  ADMIN_INVOICES:    '/admin/facturation',
  EXHIBITOR_INVOICES: '/exposant/mes-factures',
  PARTNER_INVOICES:   '/partenaire/mes-factures',
  VISITOR_INVOICES:   '/visitor/mes-factures',

  // GESTION TARIFS
  ADMIN_PRICING:     '/admin/tarifs',

  // MODULE CODES PROMO
  ADMIN_PROMO_CODES: '/admin/promo-codes',

  // MODULE CATALOGUE EXPOSANTS
  ADMIN_CATALOGUE:             '/admin/catalogue',
  ADMIN_CATALOGUE_EDIT:        '/admin/catalogue/:entryId/edit',
  ADMIN_CATALOGUE_FORM_CONFIG: '/admin/catalogue/form-config',
  CATALOGUE_FILL:              '/catalogue/fill/:token',
} as const;

export type RouteKey = keyof typeof ROUTES;


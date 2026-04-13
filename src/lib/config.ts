
// Configuration centralisée pour toutes les valeurs de l'application
export const CONFIG = {
  // Support emails
  emails: {
    support: {
      technical: 'contact@sibevent.com',
      commercial: 'contact@sibevent.com',
      exhibitor: 'contact@sibevent.com',
      general: 'contact@sibevent.com',
      api: 'contact@sibevent.com',
      emergency: 'contact@sibevent.com'
    }
  },

  // Phone numbers
  phones: {
    support: {
      technical: '+212 6 68 38 52 28',
      commercial: '+212 6 68 38 52 28',
      api: '+212 6 68 38 52 28',
      emergency: ''
    }
  },

  // URLs
  urls: {
    api: {
      base: 'https://api.SIB2026.com',
      docs: '/docs/api',
      auth: '/auth'
    },
    external: {
      docs: 'https://docs.SIB2026.com'
    }
  },

  // User actions
  userActions: {
    activate: 'activate',
    suspend: 'suspend',
    delete: 'delete'
  },

  // Support types
  supportTypes: {
    technical: 'Support Technique',
    commercial: 'Support Commercial',
    exhibitor: 'Support Exposant',
    general: 'Support Général',
    api: 'Support API'
  },

  // View modes
  viewModes: {
    grid: 'grid',
    list: 'list'
  },

  // Tab IDs
  tabIds: {
    overview: 'overview',
    projects: 'projects',
    impact: 'impact',
    contact: 'contact',
    recommendations: 'recommendations',
    search: 'search',
    connections: 'connections',
    insights: 'insights',
    favorites: 'favorites'
  },

  // Default values
  defaults: {
    category: '',
    searchTerm: ''
  },

  // Partnership types
  partnershipTypes: {
    premium: 'Partenaire Premium',
    technical: 'Partenaire Technique',
    media: 'Partenaire Média'
  },

  // API endpoints
  apiEndpoints: {
    exhibitors: '/api/exhibitors',
    appointments: '/api/appointments',
    users: '/api/users'
  },

  // Messages
  messages: {
    support: {
      technical: 'Demande de support technique envoyée ! Notre équipe vous répondra sous 24h.',
      commercial: 'Demande de support commercial envoyée ! Notre équipe vous répondra sous 48h.',
      exhibitor: 'Demande de support exposant envoyée ! Notre équipe vous répondra sous 24h.',
      general: 'Demande de support général envoyée ! Notre équipe vous répondra sous 24h.',
      api: 'Demande d\'accès API envoyée ! Notre équipe technique vous contactera sous 48h.',
      partnership: 'Demande de partenariat envoyée ! Notre équipe commerciale vous contactera sous 48h.'
    },
    user: {
      activated: 'Utilisateur activé avec succès',
      suspended: 'Utilisateur suspendu avec succès',
      deleted: 'Utilisateur supprimé avec succès',
      bulkActivated: 'Utilisateurs activés avec succès',
      bulkSuspended: 'Utilisateurs suspendus avec succès',
      bulkDeleted: 'Utilisateurs supprimés avec succès'
    }
  },

  // Timeouts and delays
  timeouts: {
    toast: 3000,
    api: 5000,
    redirect: 2000
  }
} as const;

// Helper functions
export const getSupportEmail = (type: keyof typeof CONFIG.emails.support) =>
  CONFIG.emails.support[type];

export const getSupportPhone = (type: keyof typeof CONFIG.phones.support) =>
  CONFIG.phones.support[type];

export const getApiUrl = (endpoint: string) =>
  `${CONFIG.urls.api.base}${endpoint}`;

export const getSupportMessage = (type: keyof typeof CONFIG.messages.support) =>
  CONFIG.messages.support[type];

export const getUserActionMessage = (action: keyof typeof CONFIG.messages.user) =>
  CONFIG.messages.user[action];


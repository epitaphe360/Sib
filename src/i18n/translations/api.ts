/**
 * Traductions pour la documentation API
 */

export const apiTranslations = {
  fr: {
    // Titre principal
    'api.title': 'API SIB',
    'api.subtitle': 'Intégrez les données de SIB 2026 dans vos applications',
    'api.description': 'API RESTful complète pour accéder aux exposants, événements, médias et plus encore.',

    // Navigation
    'api.nav.overview': 'Vue d\'ensemble',
    'api.nav.authentication': 'Authentification',
    'api.nav.endpoints': 'Points de terminaison',
    'api.nav.examples': 'Exemples',
    'api.nav.rate_limits': 'Limites',
    'api.nav.support': 'Support',

    // Vue d'ensemble
    'api.overview.title': 'Vue d\'ensemble',
    'api.overview.description': 'L\'API SIB permet d\'accéder programmatiquement aux données du salon.',
    'api.overview.base_url': 'URL de base',
    'api.overview.version': 'Version',
    'api.overview.format': 'Format',

    // Caractéristiques
    'api.features.title': 'Caractéristiques',
    'api.features.restful': 'API RESTful',
    'api.features.restful_desc': 'Architecture REST standard avec méthodes HTTP',
    'api.features.realtime': 'Temps réel',
    'api.features.realtime_desc': 'WebSocket pour les mises à jour en temps réel',
    'api.features.secure': 'Sécurisé',
    'api.features.secure_desc': 'Authentification JWT et HTTPS obligatoire',
    'api.features.documented': 'Documenté',
    'api.features.documented_desc': 'Documentation complète avec exemples',

    // Authentification
    'api.auth.title': 'Authentification',
    'api.auth.description': 'L\'API utilise des tokens JWT pour l\'authentification.',
    'api.auth.get_token': 'Obtenir un token',
    'api.auth.use_token': 'Utiliser le token',
    'api.auth.header': 'En-tête d\'autorisation',
    'api.auth.expires': 'Expiration',
    'api.auth.refresh': 'Rafraîchir le token',

    // Endpoints
    'api.endpoints.title': 'Points de terminaison',
    'api.endpoints.exhibitors': 'Exposants',
    'api.endpoints.exhibitors_desc': 'Liste et détails des exposants',
    'api.endpoints.events': 'Événements',
    'api.endpoints.events_desc': 'Conférences, ateliers et programmes',
    'api.endpoints.partners': 'Partenaires',
    'api.endpoints.partners_desc': 'Organisations partenaires',
    'api.endpoints.media': 'Médias',
    'api.endpoints.media_desc': 'Webinaires, podcasts, vidéos',
    'api.endpoints.appointments': 'Rendez-vous',
    'api.endpoints.appointments_desc': 'Gestion des créneaux',

    // Méthodes HTTP
    'api.methods.get': 'GET - Récupérer des données',
    'api.methods.post': 'POST - Créer une ressource',
    'api.methods.put': 'PUT - Mettre à jour une ressource',
    'api.methods.delete': 'DELETE - Supprimer une ressource',

    // Paramètres
    'api.params.query': 'Paramètres de requête',
    'api.params.page': 'Page',
    'api.params.limit': 'Limite',
    'api.params.search': 'Recherche',
    'api.params.filter': 'Filtre',
    'api.params.sort': 'Tri',

    // Réponses
    'api.responses.title': 'Réponses',
    'api.responses.success': 'Succès (200-299)',
    'api.responses.error': 'Erreur (400-599)',
    'api.responses.format': 'Format de réponse',

    // Rate limiting
    'api.limits.title': 'Limites de taux',
    'api.limits.description': 'Protège l\'API contre les abus',
    'api.limits.requests': 'requêtes par heure',
    'api.limits.exceeded': 'Si limite dépassée',
    'api.limits.headers': 'En-têtes de limite',

    // Exemples
    'api.examples.title': 'Exemples de code',
    'api.examples.javascript': 'JavaScript',
    'api.examples.python': 'Python',
    'api.examples.curl': 'cURL',

    // Support
    'api.support.title': 'Support',
    'api.support.documentation': 'Documentation complète',
    'api.support.contact': 'Nous contacter',
    'api.support.status': 'Statut du service',
  },
  en: {
    // Main title
    'api.title': 'SIB API',
    'api.subtitle': 'Integrate SIB 2026 data into your applications',
    'api.description': 'Complete RESTful API to access exhibitors, events, media and more.',

    // Navigation
    'api.nav.overview': 'Overview',
    'api.nav.authentication': 'Authentication',
    'api.nav.endpoints': 'Endpoints',
    'api.nav.examples': 'Examples',
    'api.nav.rate_limits': 'Rate Limits',
    'api.nav.support': 'Support',

    // Overview
    'api.overview.title': 'Overview',
    'api.overview.description': 'The SIB API provides programmatic access to event data.',
    'api.overview.base_url': 'Base URL',
    'api.overview.version': 'Version',
    'api.overview.format': 'Format',

    // Features
    'api.features.title': 'Features',
    'api.features.restful': 'RESTful API',
    'api.features.restful_desc': 'Standard REST architecture with HTTP methods',
    'api.features.realtime': 'Real-time',
    'api.features.realtime_desc': 'WebSocket for real-time updates',
    'api.features.secure': 'Secure',
    'api.features.secure_desc': 'JWT authentication and mandatory HTTPS',
    'api.features.documented': 'Documented',
    'api.features.documented_desc': 'Complete documentation with examples',

    // Authentication
    'api.auth.title': 'Authentication',
    'api.auth.description': 'The API uses JWT tokens for authentication.',
    'api.auth.get_token': 'Get a token',
    'api.auth.use_token': 'Use the token',
    'api.auth.header': 'Authorization header',
    'api.auth.expires': 'Expiration',
    'api.auth.refresh': 'Refresh token',

    // Endpoints
    'api.endpoints.title': 'Endpoints',
    'api.endpoints.exhibitors': 'Exhibitors',
    'api.endpoints.exhibitors_desc': 'List and details of exhibitors',
    'api.endpoints.events': 'Events',
    'api.endpoints.events_desc': 'Conferences, workshops and programs',
    'api.endpoints.partners': 'Partners',
    'api.endpoints.partners_desc': 'Partner organizations',
    'api.endpoints.media': 'Media',
    'api.endpoints.media_desc': 'Webinars, podcasts, videos',
    'api.endpoints.appointments': 'Appointments',
    'api.endpoints.appointments_desc': 'Slots management',

    // HTTP methods
    'api.methods.get': 'GET - Retrieve data',
    'api.methods.post': 'POST - Create a resource',
    'api.methods.put': 'PUT - Update a resource',
    'api.methods.delete': 'DELETE - Delete a resource',

    // Parameters
    'api.params.query': 'Query parameters',
    'api.params.page': 'Page',
    'api.params.limit': 'Limit',
    'api.params.search': 'Search',
    'api.params.filter': 'Filter',
    'api.params.sort': 'Sort',

    // Responses
    'api.responses.title': 'Responses',
    'api.responses.success': 'Success (200-299)',
    'api.responses.error': 'Error (400-599)',
    'api.responses.format': 'Response format',

    // Rate limiting
    'api.limits.title': 'Rate Limits',
    'api.limits.description': 'Protects the API from abuse',
    'api.limits.requests': 'requests per hour',
    'api.limits.exceeded': 'If limit exceeded',
    'api.limits.headers': 'Limit headers',

    // Examples
    'api.examples.title': 'Code Examples',
    'api.examples.javascript': 'JavaScript',
    'api.examples.python': 'Python',
    'api.examples.curl': 'cURL',

    // Support
    'api.support.title': 'Support',
    'api.support.documentation': 'Complete documentation',
    'api.support.contact': 'Contact us',
    'api.support.status': 'Service status',
  },
};

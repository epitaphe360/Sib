/**
 * Traductions pour le networking et rendez-vous B2B
 */

export const networkingTranslations = {
  fr: {
    // Messages généraux
    'networking.title': 'Réseautage Intelligent',
    'networking.subtitle': 'Connectez-vous avec les bons professionnels',
    'networking.restricted': 'Le Réseautage Intelligent est réservé aux visiteurs Premium et VIP. Veuillez mettre à niveau votre compte.',

    // Erreurs
    'networking.error.loading_data': 'Certaines données n\'ont pas pu être chargées',
    'networking.error.generation': 'Erreur lors de la génération',
    'networking.error.search': 'Erreur lors de la recherche',
    'networking.error.profile_not_found': 'Profil utilisateur non trouvé',
    'networking.error.login_required': 'Connexion requise pour prendre rendez-vous',
    'networking.error.duplicate_appointment': 'Vous avez déjà un rendez-vous avec cet exposant/partenaire',
    'networking.error.no_exhibitor': 'Aucun exposant sélectionné',
    'networking.error.no_slot': 'Veuillez sélectionner un créneau horaire',
    'networking.error.slot_taken': 'Ce créneau vient d\'être réservé par quelqu\'un d\'autre. Veuillez en choisir un autre.',
    'networking.error.duplicate_slot': 'Vous avez déjà réservé ce créneau horaire',
    'networking.error.past_slot': 'Ce créneau est dans le passé. Veuillez choisir un créneau futur.',
    'networking.error.invalid_dates': 'Ce créneau est en dehors des dates du salon (25-29 Novembre 2026)',
    'networking.error.acceptance': 'Erreur lors de l\'acceptation',
    'networking.error.refusal': 'Erreur lors du refus',
    'networking.error.cancellation': 'Erreur lors de l\'annulation',
    'networking.error.must_be_logged': 'Vous devez être connecté',
    'networking.error.recommendations': 'Erreur lors de la génération des recommandations',

    // Succès
    'networking.success.generated': 'Vos recommandations sont prêtes !',
    'networking.success.recommendations': 'Recommandations IA générées avec succès !',
    'networking.success.appointment_created': 'Rendez-vous créé avec succès',
    'networking.success.appointment_cancelled': 'Rendez-vous annulé avec succès',
    'networking.success.accepted': 'Rendez-vous accepté',
    'networking.success.refused': 'Rendez-vous refusé',

    // Confirmations
    'networking.confirm.cancel': 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',

    // Actions
    'networking.action.book': 'Réserver un rendez-vous',
    'networking.action.cancel': 'Annuler ce rendez-vous',
    'networking.action.accept': 'Accepter',
    'networking.action.refuse': 'Refuser',
    'networking.action.generate_recommendations': 'Générer des recommandations',

    // IA Assistant
    'networking.ai.assistant': 'SIB AI Assistant v3.0',
    'networking.ai.info': 'Connectez-vous pour accéder à l\'IA complète avec recommandations intelligentes, matching par secteur et optimisation d\'agenda !',

    // Search
    'networking.search.no_results': 'Aucun résultat trouvé pour votre recherche',
    'networking.search.results_found': '{{count}} profil(s) trouvé(s)',

    // Generation
    'networking.generation.loading': '🤖 Génération de vos recommandations IA personnalisées...',

    // Quotas & Restrictions
    'networking.error.quota_reached_free': 'Accès restreint : votre Pass Gratuit ne permet pas de prendre de rendez-vous B2B. Passez au Pass Premium VIP pour des RDV B2B illimités !',
    'networking.error.quota_reached_limit': 'Quota atteint : vous avez déjà {{count}} RDV B2B confirmés pour votre niveau.',
    'networking.success.request_sent': '✅ Demande de RDV envoyée à {{name}} !',
  },
  en: {
    // General messages
    'networking.title': 'Intelligent Networking',
    'networking.subtitle': 'Connect with the right professionals',
    'networking.restricted': 'Intelligent Networking is reserved for Premium and VIP visitors. Please upgrade your account.',

    // Errors
    'networking.error.loading_data': 'Some data could not be loaded',
    'networking.error.generation': 'Error during generation',
    'networking.error.search': 'Error during search',
    'networking.error.profile_not_found': 'User profile not found',
    'networking.error.login_required': 'Login required to book appointment',
    'networking.error.duplicate_appointment': 'You already have an appointment with this exhibitor/partner',
    'networking.error.no_exhibitor': 'No exhibitor selected',
    'networking.error.no_slot': 'Please select a time slot',
    'networking.error.slot_taken': 'This slot was just booked by someone else. Please choose another.',
    'networking.error.duplicate_slot': 'You have already booked this time slot',
    'networking.error.past_slot': 'This slot is in the past. Please choose a future slot.',
    'networking.error.invalid_dates': 'This slot is outside the event dates (November 25-29, 2026)',
    'networking.error.acceptance': 'Error during acceptance',
    'networking.error.refusal': 'Error during refusal',
    'networking.error.cancellation': 'Error during cancellation',
    'networking.error.must_be_logged': 'You must be logged in',
    'networking.error.recommendations': 'Error generating recommendations',

    // Success
    'networking.success.generated': 'Your recommendations are ready!',
    'networking.success.recommendations': 'AI recommendations generated successfully!',
    'networking.success.appointment_created': 'Appointment created successfully',
    'networking.success.appointment_cancelled': 'Appointment cancelled successfully',
    'networking.success.accepted': 'Appointment accepted',
    'networking.success.refused': 'Appointment refused',

    // Confirmations

    // Search
    'networking.search.no_results': 'No results found for your search',
    'networking.search.results_found': '{{count}} profile(s) found',

    // Generation
    'networking.generation.loading': '🤖 Generating your personalized AI recommendations...',

    // Quotas & Restrictions
    'networking.error.quota_reached_free': 'Restricted access: your Free Pass does not allow B2B appointments. Upgrade to Premium VIP Pass for unlimited B2B meetings!',
    'networking.error.quota_reached_limit': 'Quota reached: you already have {{count}} confirmed B2B appointments for your level.',
    'networking.success.request_sent': '✅ Appointment request sent to {{name}}!',
    'networking.confirm.cancel': 'Are you sure you want to cancel this appointment?',

    // Actions
    'networking.action.book': 'Book appointment',
    'networking.action.cancel': 'Cancel this appointment',
    'networking.action.accept': 'Accept',
    'networking.action.refuse': 'Refuse',
    'networking.action.generate_recommendations': 'Generate recommendations',

    // AI Assistant
    'networking.ai.assistant': 'SIB AI Assistant v3.0',
    'networking.ai.info': 'Log in to access the complete AI with intelligent recommendations, sector matching, and agenda optimization!',
  },
};

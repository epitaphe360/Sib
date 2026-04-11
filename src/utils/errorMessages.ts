/**
 * Mapper les erreurs techniques vers des messages utilisateur compréhensibles
 *
 * OBJECTIF: Améliorer l'UX en traduisant les erreurs techniques
 * en messages clairs avec des suggestions d'action
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// Mapping des erreurs PostgreSQL/Supabase
const SUPABASE_ERROR_MAPPINGS: Record<string, UserFriendlyError> = {
  // Erreurs d'authentification
  'Invalid login credentials': {
    title: 'Identifiants incorrects',
    message: 'L\'adresse email ou le mot de passe est incorrect.',
    suggestion: 'Vérifiez vos identifiants et réessayez.',
    action: {
      label: 'Mot de passe oublié ?',
      href: '/forgot-password'
    }
  },

  'Email not confirmed': {
    title: 'Email non confirmé',
    message: 'Vous devez confirmer votre adresse email avant de vous connecter.',
    suggestion: 'Vérifiez votre boîte de réception et cliquez sur le lien de confirmation.',
    action: {
      label: 'Renvoyer l\'email',
      href: '/resend-confirmation'
    }
  },

  'User already registered': {
    title: 'Compte déjà existant',
    message: 'Un compte avec cette adresse email existe déjà.',
    suggestion: 'Essayez de vous connecter ou de réinitialiser votre mot de passe.',
    action: {
      label: 'Se connecter',
      href: '/login'
    }
  },

  // Erreurs de session
  'JWT expired': {
    title: 'Session expirée',
    message: 'Votre session a expiré pour des raisons de sécurité.',
    suggestion: 'Veuillez vous reconnecter pour continuer.',
    action: {
      label: 'Se reconnecter',
      href: '/login'
    }
  },

  'Invalid JWT': {
    title: 'Session invalide',
    message: 'Votre session est invalide.',
    suggestion: 'Veuillez vous reconnecter.',
    action: {
      label: 'Se reconnecter',
      href: '/login'
    }
  },

  // Erreurs de permissions (RLS)
  'PGRST116': {
    title: 'Accès refusé',
    message: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
    suggestion: 'Vérifiez que vous êtes connecté avec le bon compte.'
  },

  'new row violates row-level security': {
    title: 'Accès refusé',
    message: 'Vous n\'avez pas les droits pour créer cet élément.',
    suggestion: 'Contactez un administrateur si vous pensez qu\'il s\'agit d\'une erreur.'
  },

  // Erreurs de connexion réseau
  'Network request failed': {
    title: 'Problème de connexion',
    message: 'Impossible de se connecter au serveur.',
    suggestion: 'Vérifiez votre connexion internet et réessayez.',
    action: {
      label: 'Réessayer',
      onClick: () => window.location.reload()
    }
  },

  'Failed to fetch': {
    title: 'Erreur de connexion',
    message: 'La connexion au serveur a échoué.',
    suggestion: 'Vérifiez votre connexion internet ou réessayez dans quelques instants.'
  },

  // Erreurs de validation
  'duplicate key value violates unique constraint': {
    title: 'Élément déjà existant',
    message: 'Cet élément existe déjà dans la base de données.',
    suggestion: 'Vérifiez que vous n\'essayez pas de créer un doublon.'
  },

  'violates foreign key constraint': {
    title: 'Référence invalide',
    message: 'L\'élément que vous essayez d\'associer n\'existe pas ou plus.',
    suggestion: 'Actualisez la page et réessayez.'
  },

  'violates check constraint': {
    title: 'Données invalides',
    message: 'Certaines données ne respectent pas les règles de validation.',
    suggestion: 'Vérifiez les champs du formulaire et corrigez les erreurs.'
  },

  // Erreurs de quota
  'Quota de rendez-vous atteint': {
    title: 'Quota atteint',
    message: 'Vous avez atteint le nombre maximum de rendez-vous autorisés pour votre niveau.',
    suggestion: 'Passez à un niveau supérieur pour débloquer plus de rendez-vous.',
    action: {
      label: 'Voir les tarifs',
      href: '/pricing'
    }
  },

  // Erreurs génériques
  'null value in column': {
    title: 'Champ obligatoire manquant',
    message: 'Certains champs obligatoires n\'ont pas été remplis.',
    suggestion: 'Vérifiez que tous les champs requis sont complétés.'
  }
};

/**
 * Convertit une erreur technique en message utilisateur compréhensible
 */
export function getUserFriendlyError(error: Error | string): UserFriendlyError {
  const errorMessage = typeof error === 'string' ? error : error.message;

  // Chercher une correspondance dans les mappings
  for (const [pattern, friendlyError] of Object.entries(SUPABASE_ERROR_MAPPINGS)) {
    if (errorMessage.includes(pattern)) {
      return friendlyError;
    }
  }

  // Message par défaut si aucune correspondance
  return {
    title: 'Une erreur est survenue',
    message: errorMessage || 'Une erreur inattendue s\'est produite.',
    suggestion: 'Si le problème persiste, contactez le support.',
    action: {
      label: 'Contacter le support',
      href: '/support'
    }
  };
}

/**
 * Extrait un message court et clair d'une erreur
 */
export function getErrorMessage(error: Error | string | unknown): string {
  if (!error) return 'Une erreur est survenue';

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    const friendlyError = getUserFriendlyError(error);
    return friendlyError.message;
  }

  return 'Une erreur inattendue est survenue';
}

/**
 * Vérifie si une erreur est liée à l'authentification
 */
export function isAuthError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const authPatterns = [
    'Invalid login credentials',
    'Email not confirmed',
    'JWT expired',
    'Invalid JWT',
    'User already registered'
  ];

  return authPatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Vérifie si une erreur est liée au réseau
 */
export function isNetworkError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const networkPatterns = [
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    'net::ERR_'
  ];

  return networkPatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Vérifie si une erreur est liée aux permissions
 */
export function isPermissionError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const permissionPatterns = [
    'PGRST116',
    'row-level security',
    'permission denied',
    'Accès refusé'
  ];

  return permissionPatterns.some(pattern => errorMessage.includes(pattern));
}

export default {
  getUserFriendlyError,
  getErrorMessage,
  isAuthError,
  isNetworkError,
  isPermissionError
};

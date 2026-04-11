/**
 * Utilitaires pour valider et normaliser les URLs
 */

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

/**
 * Valide une URL et retourne le résultat de la validation
 */
export const validateUrl = (url: string): UrlValidationResult => {
  // Vérifier que l'URL n'est pas vide
  if (!url || url.trim().length === 0) {
    return {
      isValid: false,
      error: 'L\'URL ne peut pas être vide'
    };
  }

  const trimmedUrl = url.trim();

  // Ajouter http:// si aucun protocole n'est spécifié
  let urlToValidate = trimmedUrl;
  if (!trimmedUrl.match(/^https?:\/\//i)) {
    urlToValidate = `https://${trimmedUrl}`;
  }

  // Valider le format de l'URL
  try {
    const urlObj = new URL(urlToValidate);
    
    // Vérifier que le protocole est http ou https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'Seuls les protocoles HTTP et HTTPS sont autorisés'
      };
    }

    // Vérifier que le domaine est valide
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return {
        isValid: false,
        error: 'Le nom de domaine est invalide'
      };
    }

    // Vérifier qu'il y a au moins un point dans le domaine
    if (!urlObj.hostname.includes('.')) {
      return {
        isValid: false,
        error: 'Le nom de domaine doit contenir une extension (ex: .com, .fr)'
      };
    }

    // Vérifier que ce n'est pas localhost en production
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return {
        isValid: false,
        error: 'Les URLs localhost ne sont pas autorisées'
      };
    }

    return {
      isValid: true,
      normalizedUrl: urlObj.toString()
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'L\'URL fournie n\'est pas valide'
    };
  }
};

/**
 * Vérifie si une URL est accessible (ping)
 */
export const checkUrlAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // Éviter les problèmes CORS pour le ping
      signal: AbortSignal.timeout(5000) // 5 secondes timeout
    });
    return true; // Si pas d'erreur, l'URL est accessible
  } catch (error) {
    console.warn('URL non accessible:', error);
    return false;
  }
};

/**
 * Extrait le nom de domaine d'une URL
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

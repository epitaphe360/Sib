import { Video, Mic, Image } from 'lucide-react';
import type { MediaType } from './types';

/**
 * Utilitaires partagés pour le module Marketing (icônes, couleurs par type).
 */

/** Retourne l'icône Lucide correspondant au type de média */
export function getMediaTypeIcon(type: MediaType) {
  switch (type) {
    case 'podcast':
      return Mic;
    case 'webinar':
    case 'capsule_inside':
    case 'live_studio':
    case 'best_moments':
    case 'testimonial':
      return Video;
    default:
      return Image;
  }
}

/** Retourne les classes TW de couleur pour le badge type */
export function getMediaTypeColor(type: MediaType): string {
  switch (type) {
    case 'podcast':
      return 'text-orange-600 bg-orange-50';
    case 'webinar':
      return 'text-blue-600 bg-blue-50';
    case 'capsule_inside':
      return 'text-purple-600 bg-purple-50';
    case 'live_studio':
      return 'text-red-600 bg-red-50';
    case 'best_moments':
      return 'text-green-600 bg-green-50';
    case 'testimonial':
      return 'text-pink-600 bg-pink-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/** Retourne les classes de gradient du thumbnail selon le type */
export function getMediaThumbnailGradient(type: MediaType): string {
  switch (type) {
    case 'podcast':
      return 'from-orange-500 to-orange-700';
    case 'webinar':
      return 'from-blue-500 to-blue-700';
    case 'capsule_inside':
      return 'from-purple-500 to-purple-700';
    case 'live_studio':
      return 'from-red-500 to-red-700';
    case 'best_moments':
      return 'from-green-500 to-green-700';
    case 'testimonial':
      return 'from-pink-500 to-pink-700';
    default:
      return 'from-gray-500 to-gray-700';
  }
}

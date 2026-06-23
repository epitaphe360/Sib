/**
 * Utility functions for MiniSite Editor
 */

import type { Section, SectionContent } from './types';

/**
 * Get default content for a section type
 */
export function getDefaultContent(type: Section['type']): SectionContent {
  switch (type) {
    case 'hero':
      return {
        title: 'Votre titre',
        subtitle: 'Votre sous-titre',
        backgroundImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ctaText: 'En savoir plus',
        ctaLink: '#'
      };
    case 'about':
      return {
        title: 'À propos de nous',
        description: 'Décrivez votre entreprise ici...',
        features: ['Nouvelle fonctionnalité 1', 'Nouvelle fonctionnalité 2']
      };
    case 'products':
      return {
        title: 'Nos produits',
        products: []
      };
    case 'gallery':
      return {
        title: 'Galerie',
        images: []
      };
    case 'news':
      return {
        title: 'Actualités',
        articles: []
      };
    case 'contact':
      return {
        title: 'Contactez-nous',
        address: 'Votre adresse',
        phone: 'Votre téléphone',
        email: 'votre@email.com',
        website: 'https://votre-site.com',
        hours: 'Vos horaires'
      };
    default:
      return {};
  }
}

/**
 * Get preview width class based on preview mode
 */
export function getPreviewWidth(previewMode: 'desktop' | 'tablet' | 'mobile'): string {
  switch (previewMode) {
    case 'mobile':
      return 'w-80';
    case 'tablet':
      return 'w-96';
    case 'desktop':
      return 'w-full';
    default:
      return 'w-full';
  }
}

/**
 * Create a new section with default values
 */
export function createNewSection(
  type: Section['type'],
  order: number,
  sectionTitle: string
): Section {
  return {
    id: Date.now().toString(),
    type,
    title: sectionTitle,
    content: getDefaultContent(type),
    visible: true,
    order
  };
}

/**
 * Reorder sections after deletion
 */
export function reorderSections(sections: Section[]): Section[] {
  return sections.map((section, index) => ({
    ...section,
    order: index
  }));
}

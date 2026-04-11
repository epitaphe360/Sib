/**
 * ✅ Helper functions pour accéder aux sections MiniSite de manière type-safe
 *
 * Résout les erreurs TypeScript dans ExhibitorDetailPage et autres composants
 * qui accèdent à des propriétés inexistantes sur MiniSite
 */

import type { MiniSite, MiniSiteSection } from '../types';

// Types pour le contenu des différentes sections
export interface HeroSection {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  backgroundImage?: string;
  stats?: Array<{
    number: string;
    label: string;
  }>;
}

export interface AboutSection {
  title?: string;
  description?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  certifications?: Array<{
    name: string;
    year: number;
    organization: string;
  }>;
}

export interface GallerySection {
  title?: string;
  images?: Array<{
    url: string;
    caption?: string;
    alt?: string;
  }>;
}

export interface TestimonialsSection {
  title?: string;
  testimonials?: Array<{
    name: string;
    role: string;
    company: string;
    content: string;
    avatar?: string;
    rating?: number;
  }>;
}

/**
 * Extrait une section du MiniSite par son type
 */
function getSection<T = unknown>(miniSite: MiniSite | null | undefined, type: string): T | null {
  if (!miniSite || !miniSite.sections || !Array.isArray(miniSite.sections)) {
    return null;
  }

  const section = miniSite.sections.find((s: MiniSiteSection) => s.type === type && s.visible);

  if (!section) {
    return null;
  }

  return section.content as T;
}

/**
 * Extrait la section Hero
 */
export function getHeroSection(miniSite: MiniSite | null | undefined): HeroSection | null {
  return getSection<HeroSection>(miniSite, 'hero');
}

/**
 * Extrait la section About
 */
export function getAboutSection(miniSite: MiniSite | null | undefined): AboutSection | null {
  return getSection<AboutSection>(miniSite, 'about');
}

/**
 * Extrait la section Gallery
 */
export function getGallerySection(miniSite: MiniSite | null | undefined): GallerySection | null {
  return getSection<GallerySection>(miniSite, 'gallery');
}

/**
 * Extrait la section Testimonials
 */
export function getTestimonialsSection(miniSite: MiniSite | null | undefined): TestimonialsSection | null {
  return getSection<TestimonialsSection>(miniSite, 'testimonials');
}

/**
 * Vérifie si une section existe et est visible
 */
export function hasSection(miniSite: MiniSite | null | undefined, type: string): boolean {
  if (!miniSite || !miniSite.sections || !Array.isArray(miniSite.sections)) {
    return false;
  }

  return miniSite.sections.some((s: MiniSiteSection) => s.type === type && s.visible);
}

/**
 * Retourne toutes les sections visibles
 */
export function getVisibleSections(miniSite: MiniSite | null | undefined): MiniSiteSection[] {
  if (!miniSite || !miniSite.sections || !Array.isArray(miniSite.sections)) {
    return [];
  }

  return miniSite.sections.filter((s: MiniSiteSection) => s.visible);
}

/**
 * Obtient le nombre de vues du minisite
 */
export function getMiniSiteViews(miniSite: MiniSite | null | undefined): number {
  return miniSite?.views || 0;
}

/**
 * Obtient la dernière date de mise à jour
 */
export function getMiniSiteLastUpdated(miniSite: MiniSite | null | undefined): Date | null {
  if (!miniSite?.lastUpdated) {
    return null;
  }

  return miniSite.lastUpdated instanceof Date
    ? miniSite.lastUpdated
    : new Date(miniSite.lastUpdated);
}

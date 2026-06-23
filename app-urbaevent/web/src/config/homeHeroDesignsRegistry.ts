/**
 * Registre des 16 designs Hero — routes /home/:slug
 */
import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Box,
  Columns2,
  Minimize2,
  LayoutGrid,
  Type,
  Images,
  Crown,
  Sparkles,
  GalleryHorizontal,
  Zap,
  Film,
  Shapes,
  BookOpen,
  Cpu,
  Droplets,
  Ruler,
} from 'lucide-react';

export type HomeHeroDesignSlug =
  | 'immersive-3d'
  | 'split-screen'
  | 'minimalist'
  | 'bento-grid'
  | 'text-reveal'
  | 'carousel'
  | 'dark-luxury'
  | 'gradient-mesh'
  | 'parallax-gallery'
  | 'kinetic-type'
  | 'video-cinematic'
  | 'geometric'
  | 'magazine'
  | 'neon-cyberpunk'
  | 'liquid-morph'
  | 'architect-blueprint';

export interface HomeHeroDesignEntry {
  slug: HomeHeroDesignSlug;
  route: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Clé du composant hero dans HeroDesignLoaders */
  componentKey: HomeHeroDesignSlug;
}

export const HOME_HERO_DESIGNS: HomeHeroDesignEntry[] = [
  {
    slug: 'immersive-3d',
    route: '/home/immersive-3d',
    title: 'Immersif 3D',
    description: 'Effet parallax cinématique',
    icon: Box,
    componentKey: 'immersive-3d',
  },
  {
    slug: 'split-screen',
    route: '/home/split-screen',
    title: 'Split Screen',
    description: 'Design éditorial asymétrique',
    icon: Columns2,
    componentKey: 'split-screen',
  },
  {
    slug: 'minimalist',
    route: '/home/minimalist',
    title: 'Minimaliste Apple',
    description: 'Espace blanc, typographie soignée',
    icon: Minimize2,
    componentKey: 'minimalist',
  },
  {
    slug: 'bento-grid',
    route: '/home/bento-grid',
    title: 'Bento Grid',
    description: 'Grille dynamique asymétrique',
    icon: LayoutGrid,
    componentKey: 'bento-grid',
  },
  {
    slug: 'text-reveal',
    route: '/home/text-reveal',
    title: 'Text Reveal',
    description: 'Révélation lettre par lettre',
    icon: Type,
    componentKey: 'text-reveal',
  },
  {
    slug: 'carousel',
    route: '/home/carousel',
    title: 'Carousel Immersif',
    description: 'Slides avec transitions fluides',
    icon: Images,
    componentKey: 'carousel',
  },
  {
    slug: 'dark-luxury',
    route: '/home/dark-luxury',
    title: 'Dark Luxury',
    description: 'Or et noir, style VIP',
    icon: Crown,
    componentKey: 'dark-luxury',
  },
  {
    slug: 'gradient-mesh',
    route: '/home/gradient-mesh',
    title: 'Gradient Mesh',
    description: 'Mesh animé, glassmorphism',
    icon: Sparkles,
    componentKey: 'gradient-mesh',
  },
  {
    slug: 'parallax-gallery',
    route: '/home/parallax-gallery',
    title: 'Parallax Gallery',
    description: "Galerie d'images avec effet parallax",
    icon: GalleryHorizontal,
    componentKey: 'parallax-gallery',
  },
  {
    slug: 'kinetic-type',
    route: '/home/kinetic-type',
    title: 'Kinetic Type',
    description: 'Typographie cinétique',
    icon: Zap,
    componentKey: 'kinetic-type',
  },
  {
    slug: 'video-cinematic',
    route: '/home/video-cinematic',
    title: 'Video Cinematic',
    description: 'Effet cinématique avec overlay vidéo',
    icon: Film,
    componentKey: 'video-cinematic',
  },
  {
    slug: 'geometric',
    route: '/home/geometric',
    title: 'Geometric',
    description: 'Formes géométriques abstraites',
    icon: Shapes,
    componentKey: 'geometric',
  },
  {
    slug: 'magazine',
    route: '/home/magazine',
    title: 'Magazine',
    description: 'Style magazine éditorial',
    icon: BookOpen,
    componentKey: 'magazine',
  },
  {
    slug: 'neon-cyberpunk',
    route: '/home/neon-cyberpunk',
    title: 'Neon Cyberpunk',
    description: 'Néons et effets futuristes',
    icon: Cpu,
    componentKey: 'neon-cyberpunk',
  },
  {
    slug: 'liquid-morph',
    route: '/home/liquid-morph',
    title: 'Liquid Morph',
    description: 'Effet liquide avec morphing',
    icon: Droplets,
    componentKey: 'liquid-morph',
  },
  {
    slug: 'architect-blueprint',
    route: '/home/architect-blueprint',
    title: 'Architect Blueprint',
    description: "Style plan d'architecte",
    icon: Ruler,
    componentKey: 'architect-blueprint',
  },
];

export function getHomeHeroDesign(slug: string): HomeHeroDesignEntry | undefined {
  return HOME_HERO_DESIGNS.find((d) => d.slug === slug);
}

export function isHomeHeroDesignSlug(slug: string): slug is HomeHeroDesignSlug {
  return HOME_HERO_DESIGNS.some((d) => d.slug === slug);
}

export type HeroDesignComponent = ComponentType;

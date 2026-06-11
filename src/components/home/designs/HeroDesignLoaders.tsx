import React, { lazy } from 'react';
import type { HomeHeroDesignSlug } from '../../../config/homeHeroDesignsRegistry';

/** Lazy loaders — un fichier hero par design */
export const HERO_DESIGN_LOADERS: Record<
  HomeHeroDesignSlug,
  React.LazyExoticComponent<React.FC>
> = {
  'immersive-3d': lazy(() => import('./heroes/Immersive3DHero')),
  'split-screen': lazy(() => import('./heroes/SplitScreenHero')),
  minimalist: lazy(() => import('./heroes/MinimalistHero')),
  'bento-grid': lazy(() => import('./heroes/BentoGridHero')),
  'text-reveal': lazy(() => import('./heroes/TextRevealHero')),
  carousel: lazy(() => import('./heroes/CarouselHero')),
  'dark-luxury': lazy(() => import('./heroes/DarkLuxuryHero')),
  'gradient-mesh': lazy(() => import('./heroes/GradientMeshHero')),
  'parallax-gallery': lazy(() => import('./heroes/ParallaxGalleryHero')),
  'kinetic-type': lazy(() => import('./heroes/KineticTypeHero')),
  'video-cinematic': lazy(() => import('./heroes/VideoCinematicHero')),
  geometric: lazy(() => import('./heroes/GeometricHero')),
  magazine: lazy(() => import('./heroes/MagazineHero')),
  'neon-cyberpunk': lazy(() => import('./heroes/NeonCyberpunkHero')),
  'liquid-morph': lazy(() => import('./heroes/LiquidMorphHero')),
  'architect-blueprint': lazy(() => import('./heroes/ArchitectBlueprintHero')),
};

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { type ImageSource, img, srcSet } from '@/lib/images';

/**
 * SIB 2026 — SmartImage
 *
 * Composant Image premium avec:
 * - Srcset responsive (640/960/1280/1920/2560)
 * - Blur placeholder (low-quality preview)
 * - Fade-in au chargement
 * - Ratio aspect figé pour éviter layout shift
 * - Overlay dégradé optionnel pour titres
 */
export interface SmartImageProps {
  /** Source Unsplash (objet du catalogue IMAGES) ou URL directe */
  source?: ImageSource;
  /** URL directe (alternative à source) */
  src?: string;
  /** Texte alternatif — obligatoire si src est fourni */
  alt?: string;
  /** Ratio d'aspect CSS (ex: "16/9", "4/3", "1/1") */
  aspect?: string;
  /** Largeur cible (pour la qualité principale) */
  width?: number;
  /** Classes additionnelles sur le conteneur */
  className?: string;
  /** Classes additionnelles sur l'image */
  imgClassName?: string;
  /** Chargement prioritaire (above-the-fold) */
  priority?: boolean;
  /** Ajoute un overlay gradient noir (haut→bas) */
  overlay?: boolean | 'top' | 'bottom' | 'full';
  /** Rounding (par défaut rounded-xl) */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Effet de zoom au hover */
  zoom?: boolean;
  /** Contenu enfant (titre, CTA…) superposé */
  children?: React.ReactNode;
  /** Qualité (1-100) */
  quality?: number;
}

const roundedMap: Record<string, string> = {
  none: '',
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const SmartImage: React.FC<SmartImageProps> = ({
  source,
  src,
  alt,
  aspect,
  width = 1920,
  className,
  imgClassName,
  priority = false,
  overlay = false,
  rounded = 'xl',
  zoom = false,
  children,
  quality = 80,
}) => {
  const [loaded, setLoaded] = useState(false);

  const finalSrc = source ? img(source, width, undefined, quality) : src;
  const finalSrcSet = source ? srcSet(source) : undefined;
  const finalAlt = alt ?? source?.alt ?? '';

  // Preview basse qualité pour effet blur-up
  const blurSrc = source ? img(source, 40, undefined, 20) : undefined;

  const overlayClasses: Record<string, string> = {
    top:    'bg-gradient-to-b from-neutral-900/70 via-transparent to-transparent',
    bottom: 'bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent',
    full:   'bg-gradient-to-t from-neutral-900/80 via-neutral-900/30 to-neutral-900/40',
    true:   'bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent',
  };

  const overlayKey = typeof overlay === 'string' ? overlay : overlay ? 'true' : undefined;

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-neutral-100 dark:bg-neutral-800',
        roundedMap[rounded],
        className,
      )}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      {/* Blur preview */}
      {blurSrc && !loaded && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl"
        />
      )}

      {/* Image principale */}
      <img
        src={finalSrc}
        srcSet={finalSrcSet}
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        alt={finalAlt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={clsx(
          'h-full w-full object-cover transition-all duration-700 ease-out',
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
          zoom && 'group-hover:scale-105',
          imgClassName,
        )}
      />

      {/* Overlay dégradé */}
      {overlayKey && (
        <div className={clsx('absolute inset-0 pointer-events-none', overlayClasses[overlayKey])} />
      )}

      {/* Contenu superposé */}
      {children && (
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          {children}
        </div>
      )}
    </div>
  );
};

export default SmartImage;

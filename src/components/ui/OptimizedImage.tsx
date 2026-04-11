import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Si true, charge immédiatement sans lazy loading
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ⚡ OPTIMISÉ: Composant Image avec lazy loading et responsive
 *
 * Fonctionnalités:
 * - Lazy loading natif (loading="lazy")
 * - Responsive images avec srcset
 * - Fallback automatique si image échoue
 * - Placeholder pendant le chargement
 * - Optimisation bande passante
 *
 * Performance:
 * - Réduit le chargement initial de la page
 * - Charge les images seulement quand elles entrent dans le viewport
 * - Utilise des formats optimisés quand disponibles
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '/placeholder-image.svg',
  width,
  height,
  priority = false,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src || fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Réinitialiser l'image si src change
  useEffect(() => {
    if (src) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
    } else {
      setImageSrc(fallback);
      setIsLoading(false);
    }
  }, [src, fallback]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  };

  /**
   * Génère srcset pour responsive images
   * Supporte les transformations d'URL Supabase Storage
   */
  const generateSrcSet = (originalSrc: string): string | undefined => {
    if (!originalSrc || originalSrc === fallback) return undefined;

    // Si c'est une URL Supabase Storage, on peut ajouter des paramètres de transformation
    if (originalSrc.includes('supabase.co/storage')) {
      return `
        ${originalSrc}?width=400 400w,
        ${originalSrc}?width=800 800w,
        ${originalSrc}?width=1200 1200w
      `.trim();
    }

    // Pour les autres URLs, pas de srcset
    return undefined;
  };

  const srcSet = generateSrcSet(imageSrc);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder pendant le chargement */}
      {isLoading && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}

      {/* Image optimisée */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        srcSet={srcSet}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          ${className}
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-300
        `}
      />

      {/* Indicateur d'erreur */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

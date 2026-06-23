import React from 'react';
import type { ImageAsset } from './assets';

interface Sib2026PictureProps {
  asset: ImageAsset;
  alt?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  largeAsset?: ImageAsset;
}

export const Sib2026Picture: React.FC<Sib2026PictureProps> = ({
  asset,
  alt = '',
  className,
  loading = 'lazy',
  sizes = '100vw',
  largeAsset,
}) => (
  <picture>
    {largeAsset && (
      <source media="(min-width: 1920px)" srcSet={largeAsset.webp} type="image/webp" />
    )}
    <source srcSet={asset.webp} type="image/webp" />
    <img
      src={asset.jpg}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      sizes={sizes}
    />
  </picture>
);

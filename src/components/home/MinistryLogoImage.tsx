import React, { useEffect, useState } from 'react';
import { useSiteBanner } from '../../hooks/useSiteBanner';

const MINISTRY_ALT =
  "Royaume du Maroc — Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville";

interface MinistryLogoImageProps {
  className?: string;
}

/** Logo ministère — URL admin (site_banners) ou fichier public par défaut. */
export const MinistryLogoImage: React.FC<MinistryLogoImageProps> = ({ className }) => {
  const { src, fallback, secondaryFallback } = useSiteBanner('ministry_egide');
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleError = () => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
      return;
    }
    if (secondaryFallback && currentSrc !== secondaryFallback) {
      setCurrentSrc(secondaryFallback);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={MINISTRY_ALT}
      className={className}
      onError={handleError}
    />
  );
};

export default MinistryLogoImage;

import React, { useEffect, useRef } from 'react';

interface AccessibilityLiveRegionProps {
  message: string;
  role?: 'status' | 'alert';
  ariaLive?: 'polite' | 'assertive';
  ariaAtomic?: boolean;
}

/**
 * Composant pour les annonces d'accessibilité aux lecteurs d'écran
 * Permet d'annoncer les changements importants de l'UI
 */
export function AccessibilityLiveRegion({
  message,
  role = 'status',
  ariaLive = 'polite',
  ariaAtomic = true
}: AccessibilityLiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      // Le lecteur d'écran annoncera automatiquement le contenu
      regionRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      role={role}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className="sr-only"
      aria-label="Région d'annonces pour lecteur d'écran"
    />
  );
}

export default AccessibilityLiveRegion;

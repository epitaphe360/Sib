import { useState, useEffect, useRef } from 'react';

interface LogoWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

// Fonction pour générer un placeholder SVG avec les initiales
function generatePlaceholder(name: string): string {
  try {
    // Extraire uniquement les caractères ASCII pour éviter btoa/SVG Unicode errors
    const asciiName = name.replace(/[^\x00-\x7F]/g, '');
    const rawInitials = (asciiName.length > 0 ? asciiName : 'P')
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') || 'P';

    const colors = [
      '#1e40af', '#7c3aed', '#dc2626', '#059669',
      '#ea580c', '#0891b2', '#be185d', '#4338ca'
    ];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const backgroundColor = colors[colorIndex];

    // Utiliser encodeURIComponent pour une data URI UTF-8 safe (pas de btoa)
    const svgData = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="6" fill="${backgroundColor}"/><text x="24" y="30" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="600" font-size="16">${rawInitials}</text></svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  } catch {
    // Fallback ultime : carré coloré sans texte
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="6" fill="#1e40af"/></svg>')}`;
  }
}

export default function LogoWithFallback({
  src,
  alt,
  className = "h-12 w-12 rounded-lg object-cover",
  fallbackIcon
}: LogoWithFallbackProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Reset status when src changes
  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    // Preload image using JavaScript Image object (NOT lazy loaded)
    const img = new Image();
    
    // Timeout: if image hasn't loaded in 8 seconds, show fallback
    timeoutRef.current = setTimeout(() => {
      setStatus('error');
    }, 8000);

    img.onload = () => {
      clearTimeout(timeoutRef.current);
      setStatus('loaded');
    };

    img.onerror = () => {
      clearTimeout(timeoutRef.current);
      setStatus('error');
    };

    // Set referrerPolicy to avoid hotlink blocking
    img.referrerPolicy = 'no-referrer';
    img.src = src;

    return () => {
      clearTimeout(timeoutRef.current);
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Error/no-src state: show initials or fallback icon
  if (status === 'error' || !src) {
    if (fallbackIcon) {
      return (
        <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400`}>
          {fallbackIcon}
        </div>
      );
    }

    return (
      <img
        src={generatePlaceholder(alt)}
        alt={alt}
        className={className}
      />
    );
  }

  // Loading state: show pulse placeholder
  if (status === 'loading') {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="w-6 h-6 rounded bg-gray-300" />
      </div>
    );
  }

  // Loaded state: show the actual image
  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-200`}
      referrerPolicy="no-referrer"
      onError={() => setStatus('error')}
    />
  );
}

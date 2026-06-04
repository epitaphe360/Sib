import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll en haut à chaque changement de route, ou vers l'ancre #section si présente.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const scrollToAnchor = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      requestAnimationFrame(scrollToAnchor);
      const t = setTimeout(scrollToAnchor, 100);
      return () => clearTimeout(t);
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname, hash]);

  return null;
};

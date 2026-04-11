import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackingService } from '../services/analytics/trackingService';

/**
 * Hook useAnalytics - Intégration des services d'analytique
 * 
 * Fournit :
 * - Suivi automatique des pages
 * - Suivi des événements
 * - Suivi du temps passé
 * - Suivi du scroll
 */
export const useAnalytics = () => {
  const location = useLocation();
  const timeOnPageRef = useRef<number>(0);
  const pageStartTimeRef = useRef<Date>(new Date());

  // Suivi automatique des pages
  useEffect(() => {
    pageStartTimeRef.current = new Date();
    trackingService.trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Suivi du temps passé sur la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Math.round(
        (new Date().getTime() - pageStartTimeRef.current.getTime()) / 1000
      );
      if (timeSpent > 5) {
        // Ne tracker que si plus de 5 secondes
        trackingService.trackTimeOnPage(location.pathname, timeSpent);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname]);

  // Suivi du scroll
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        if (scrollPercentage > 0) {
          trackingService.trackScroll(scrollPercentage);
        }
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Callback pour tracker un événement personnalisé
  const trackEvent = useCallback(
    (category: string, action: string, label?: string, value?: number) => {
      trackingService.trackEvent({
        category,
        action,
        label,
        value,
      });
    },
    []
  );

  // Callback pour tracker un clic CTA
  const trackCTAClick = useCallback((ctaName: string, ctaType: string) => {
    trackingService.trackCTAClick(ctaName, ctaType);
  }, []);

  // Callback pour tracker une soumission de formulaire
  const trackFormSubmission = useCallback((formName: string, sector?: string) => {
    trackingService.trackFormSubmission(formName, sector);
  }, []);

  // Callback pour tracker un téléchargement
  const trackDownload = useCallback((fileName: string, fileType: string) => {
    trackingService.trackDownload(fileName, fileType);
  }, []);

  // Callback pour tracker un clic de contact
  const trackContactClick = useCallback((method: 'whatsapp' | 'email' | 'phone') => {
    trackingService.trackContactClick(method);
  }, []);

  // Callback pour tracker une prise de rendez-vous
  const trackAppointmentBooking = useCallback((type: string) => {
    trackingService.trackAppointmentBooking(type);
  }, []);

  return {
    trackEvent,
    trackCTAClick,
    trackFormSubmission,
    trackDownload,
    trackContactClick,
    trackAppointmentBooking,
  };
};


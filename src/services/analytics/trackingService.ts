/**
 * Service de suivi analytique
 * 
 * Intègre Google Analytics 4 et Hotjar
 * Centralise le suivi des événements et conversions
 */

export interface TrackingEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export interface ConversionEvent {
  type: 'form_submission' | 'cta_click' | 'download' | 'contact' | 'appointment';
  formName?: string;
  value?: number;
}

class TrackingService {
  /**
   * Initialiser les services d'analytique
   */
  static initialize(): void {
    // Google Analytics 4
    if (process.env.REACT_APP_GA_ID) {
      this.initializeGA4();
    }

    // Hotjar
    if (process.env.REACT_APP_HOTJAR_ID) {
      this.initializeHotjar();
    }
  }

  /**
   * Initialiser Google Analytics 4
   */
  private static initializeGA4(): void {
    const gaId = process.env.REACT_APP_GA_ID;
    if (!gaId) return;

    // Script d'initialisation GA4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Configuration GA4
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  }

  /**
   * Initialiser Hotjar
   */
  private static initializeHotjar(): void {
    const hjId = process.env.REACT_APP_HOTJAR_ID;
    if (!hjId) return;

    (window as any).hj =
      (window as any).hj ||
      function (...args: any[]) {
        ((window as any).hj.q = (window as any).hj.q || []).push(args);
      };
    (window as any)._hjSettings = {
      hjid: hjId,
      hjsv: 6,
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${hjId}.js`;
    document.head.appendChild(script);
  }

  /**
   * Tracker un événement personnalisé
   */
  static trackEvent(event: TrackingEvent): void {
    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties,
      });
    }

    // Hotjar
    if ((window as any).hj) {
      (window as any).hj('event', `${event.category}_${event.action}`);
    }

    // Console en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Événement suivi:', event);
    }
  }

  /**
   * Tracker une conversion
   */
  static trackConversion(event: ConversionEvent): void {
    this.trackEvent({
      category: 'conversion',
      action: event.type,
      label: event.formName,
      value: event.value,
    });

    // Google Analytics 4 - Conversion
    if ((window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        conversion_type: event.type,
        form_name: event.formName,
        value: event.value,
      });
    }
  }

  /**
   * Tracker une vue de page
   */
  static trackPageView(path: string, title: string): void {
    if ((window as any).gtag) {
      (window as any).gtag('config', process.env.REACT_APP_GA_ID, {
        page_path: path,
        page_title: title,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📄 Vue de page:', { path, title });
    }
  }

  /**
   * Tracker un clic CTA
   */
  static trackCTAClick(ctaName: string, ctaType: string): void {
    this.trackEvent({
      category: 'engagement',
      action: 'cta_click',
      label: ctaName,
      properties: {
        cta_type: ctaType,
      },
    });
  }

  /**
   * Tracker une soumission de formulaire
   */
  static trackFormSubmission(formName: string, sector?: string): void {
    this.trackConversion({
      type: 'form_submission',
      formName,
    });

    this.trackEvent({
      category: 'forms',
      action: 'submission',
      label: formName,
      properties: {
        sector,
      },
    });
  }

  /**
   * Tracker un téléchargement
   */
  static trackDownload(fileName: string, fileType: string): void {
    this.trackConversion({
      type: 'download',
      formName: fileName,
    });

    this.trackEvent({
      category: 'downloads',
      action: 'file_download',
      label: fileName,
      properties: {
        file_type: fileType,
      },
    });
  }

  /**
   * Tracker un clic de contact
   */
  static trackContactClick(method: 'whatsapp' | 'email' | 'phone'): void {
    this.trackConversion({
      type: 'contact',
    });

    this.trackEvent({
      category: 'contact',
      action: 'contact_click',
      label: method,
    });
  }

  /**
   * Tracker une prise de rendez-vous
   */
  static trackAppointmentBooking(type: string): void {
    this.trackConversion({
      type: 'appointment',
      formName: type,
    });

    this.trackEvent({
      category: 'appointments',
      action: 'booking',
      label: type,
    });
  }

  /**
   * Tracker un temps passé sur la page
   */
  static trackTimeOnPage(pagePath: string, seconds: number): void {
    this.trackEvent({
      category: 'engagement',
      action: 'time_on_page',
      label: pagePath,
      value: Math.round(seconds),
    });
  }

  /**
   * Tracker un scroll
   */
  static trackScroll(percentage: number): void {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'scroll', {
        scroll_percentage: percentage,
      });
    }
  }

  /**
   * Identifier un utilisateur (si authentifié)
   */
  static identifyUser(userId: string, properties?: Record<string, any>): void {
    if ((window as any).gtag) {
      (window as any).gtag('config', process.env.REACT_APP_GA_ID, {
        user_id: userId,
        ...properties,
      });
    }

    if ((window as any).hj) {
      (window as any).hj('identify', userId);
    }
  }
}

export const trackingService = TrackingService;

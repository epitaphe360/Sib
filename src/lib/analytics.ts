import { logger } from './logger';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

class Analytics {
  private userId: string | null = null;

  initialize(userId?: string) {
    this.userId = userId || null;

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: userId,
        send_page_view: false
      });
    }

    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      if (userId) {
        (window as any).mixpanel.identify(userId);
      }
      (window as any).mixpanel.register({
        environment: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION || '1.0.0'
      });
    }
  }

  track(event: AnalyticsEvent) {
    const { category, action, label, value, metadata } = event;

    logger.debug('Analytics event', {
      action: 'analytics_track',
      metadata: event
    });

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
        ...metadata
      });
    }

    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(`${category}:${action}`, {
        label,
        value,
        ...metadata,
        userId: this.userId
      });
    }
  }

  trackPageView(path: string, title: string) {
    this.track({
      category: 'navigation',
      action: 'page_view',
      label: title,
      metadata: { path }
    });

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: title
      });
    }
  }

  trackAppointmentBooked(slotId: string, exhibitorId: string) {
    this.track({
      category: 'appointment',
      action: 'booked',
      label: exhibitorId,
      metadata: { slotId, exhibitorId }
    });
  }

  trackEventRegistration(eventId: string, eventTitle: string) {
    this.track({
      category: 'event',
      action: 'registered',
      label: eventTitle,
      metadata: { eventId }
    });
  }

  trackChatMessage(conversationId: string, messageType: string) {
    this.track({
      category: 'chat',
      action: 'message_sent',
      label: messageType,
      metadata: { conversationId, messageType }
    });
  }

  trackSearch(query: string, resultsCount: number) {
    this.track({
      category: 'search',
      action: 'performed',
      label: query,
      value: resultsCount,
      metadata: { query, resultsCount }
    });
  }

  trackFunnelStep(funnel: string, step: number, stepName: string) {
    this.track({
      category: 'funnel',
      action: funnel,
      label: stepName,
      value: step,
      metadata: { funnel, step, stepName }
    });
  }
}

export const analytics = new Analytics();

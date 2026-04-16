/**
 * Service d'analytics avancées
 * Export de données, rapports, métriques détaillées
 */

import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';

export interface AnalyticsMetrics {
  total_visitors: number;
  active_users: number;
  page_views: number;
  unique_visitors: number;
  avg_session_duration: number;
  bounce_rate: number;
  conversion_rate: number;
}

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  session_id?: string;
  created_at: string;
}

export interface AnalyticsReport {
  period_start: string;
  period_end: string;
  metrics: AnalyticsMetrics;
  top_pages: Array<{ path: string; views: number }>;
  top_events: Array<{ type: string; count: number }>;
  user_demographics: {
    by_type: Record<string, number>;
    by_country: Record<string, number>;
  };
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  period_start?: string;
  period_end?: string;
  metrics?: string[];
}

class AnalyticsService {
  /**
   * Enregistrer un événement analytics
   */
  async trackEvent(event: {
    event_type: string;
    event_data?: Record<string, any>;
    user_id?: string;
    session_id?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('analytics')
        .insert([{
          user_id: event.user_id || null,
          event_type: event.event_type,
          event_data: event.event_data || {},
          session_id: event.session_id || null,
        }]);

      if (error) {throw error;}

      // Tracker aussi dans Google Analytics / Mixpanel
      if (analytics) {
        analytics.track({
          category: 'analytics',
          action: event.event_type,
          metadata: event.event_data,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur trackEvent:', error);
      return false;
    }
  }

  /**
   * Récupérer les métriques pour une période
   */
  async getMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics> {
    try {
      // Récupérer tous les événements de la période
      const { data: events, error } = await supabase
        .from('analytics')
        .select('id, user_id, event_type, session_id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {throw error;}

      // Calculer les métriques
      const sessionIds = new Set(events?.map(e => e.session_id).filter(Boolean) || []);
      const userIds = new Set(events?.map(e => e.user_id).filter(Boolean) || []);
      const pageViews = events?.filter(e => e.event_type === 'page_view') || [];

      // Récupérer les utilisateurs actifs
      const { data: activeUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      // Calculer bounce rate (sessions avec une seule page vue)
      const sessionPageViews = new Map<string, number>();
      pageViews.forEach(pv => {
        const sid = pv.session_id;
        if (sid) {
          sessionPageViews.set(sid, (sessionPageViews.get(sid) || 0) + 1);
        }
      });

      const bouncedSessions = Array.from(sessionPageViews.values()).filter(count => count === 1).length;
      const bounceRate = sessionIds.size > 0 ? (bouncedSessions / sessionIds.size) * 100 : 0;

      // Calculer la durée moyenne de session (approximation)
      const avgSessionDuration = this.calculateAvgSessionDuration(events || []);

      // Calculer conversion rate (achats / visiteurs uniques)
      const purchases = events?.filter(e => e.event_type === 'payment_completed') || [];
      const conversionRate = userIds.size > 0 ? (purchases.length / userIds.size) * 100 : 0;

      return {
        total_visitors: userIds.size,
        active_users: activeUsers || 0,
        page_views: pageViews.length,
        unique_visitors: userIds.size,
        avg_session_duration: avgSessionDuration,
        bounce_rate: Math.round(bounceRate * 100) / 100,
        conversion_rate: Math.round(conversionRate * 100) / 100,
      };
    } catch (error) {
      console.error('❌ Erreur getMetrics:', error);
      return {
        total_visitors: 0,
        active_users: 0,
        page_views: 0,
        unique_visitors: 0,
        avg_session_duration: 0,
        bounce_rate: 0,
        conversion_rate: 0,
      };
    }
  }

  /**
   * Calculer la durée moyenne de session
   */
  private calculateAvgSessionDuration(events: AnalyticsEvent[]): number {
    const sessionTimes = new Map<string, { start: number; end: number }>();

    events.forEach(event => {
      const sid = event.session_id;
      if (!sid) {return;}

      const time = new Date(event.created_at).getTime();
      const current = sessionTimes.get(sid);

      if (!current) {
        sessionTimes.set(sid, { start: time, end: time });
      } else {
        sessionTimes.set(sid, {
          start: Math.min(current.start, time),
          end: Math.max(current.end, time),
        });
      }
    });

    const durations = Array.from(sessionTimes.values()).map(
      ({ start, end }) => (end - start) / 1000 // en secondes
    );

    if (durations.length === 0) {return 0;}

    const total = durations.reduce((sum, d) => sum + d, 0);
    return Math.round(total / durations.length);
  }

  /**
   * Générer un rapport complet
   */
  async generateReport(startDate: string, endDate: string): Promise<AnalyticsReport> {
    try {
      // Métriques globales
      const metrics = await this.getMetrics(startDate, endDate);

      // Top pages
      const topPages = await this.getTopPages(startDate, endDate, 10);

      // Top événements
      const topEvents = await this.getTopEvents(startDate, endDate, 10);

      // Démographie utilisateurs
      const demographics = await this.getUserDemographics(startDate, endDate);

      return {
        period_start: startDate,
        period_end: endDate,
        metrics,
        top_pages: topPages,
        top_events: topEvents,
        user_demographics: demographics,
      };
    } catch (error) {
      console.error('❌ Erreur generateReport:', error);
      throw error;
    }
  }

  /**
   * Récupérer les pages les plus vues
   */
  async getTopPages(startDate: string, endDate: string, limit: number = 10): Promise<Array<{ path: string; views: number }>> {
    try {
      const { data: events, error } = await supabase
        .from('analytics')
        .select('event_data')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {throw error;}

      // Compter les vues par page
      const pageViews = new Map<string, number>();
      events?.forEach(event => {
        const path = event.event_data?.path;
        if (path) {
          pageViews.set(path, (pageViews.get(path) || 0) + 1);
        }
      });

      // Trier et limiter
      return Array.from(pageViews.entries())
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Erreur getTopPages:', error);
      return [];
    }
  }

  /**
   * Récupérer les événements les plus fréquents
   */
  async getTopEvents(startDate: string, endDate: string, limit: number = 10): Promise<Array<{ type: string; count: number }>> {
    try {
      const { data: events, error } = await supabase
        .from('analytics')
        .select('event_type')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {throw error;}

      // Compter par type
      const eventCounts = new Map<string, number>();
      events?.forEach(event => {
        const type = event.event_type;
        eventCounts.set(type, (eventCounts.get(type) || 0) + 1);
      });

      // Trier et limiter
      return Array.from(eventCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Erreur getTopEvents:', error);
      return [];
    }
  }

  /**
   * Récupérer la démographie des utilisateurs
   */
  async getUserDemographics(startDate: string, endDate: string): Promise<{
    by_type: Record<string, number>;
    by_country: Record<string, number>;
  }> {
    try {
      // Récupérer les user_ids uniques de la période
      const { data: events, error } = await supabase
        .from('analytics')
        .select('user_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .not('user_id', 'is', null);

      if (error) {throw error;}

      const userIds = [...new Set(events?.map(e => e.user_id) || [])];

      if (userIds.length === 0) {
        return { by_type: {}, by_country: {} };
      }

      // Récupérer les infos utilisateurs
      const { data: users } = await supabase
        .from('users')
        .select('type, profile')
        .in('id', userIds);

      const byType: Record<string, number> = {};
      const byCountry: Record<string, number> = {};

      users?.forEach(user => {
        // Par type
        byType[user.type] = (byType[user.type] || 0) + 1;

        // Par pays (si dispo dans profile)
        const country = user.profile?.country;
        if (country) {
          byCountry[country] = (byCountry[country] || 0) + 1;
        }
      });

      return { by_type: byType, by_country: byCountry };
    } catch (error) {
      console.error('❌ Erreur getUserDemographics:', error);
      return { by_type: {}, by_country: {} };
    }
  }

  /**
   * Exporter des données analytics
   */
  async exportData(options: ExportOptions): Promise<Blob | null> {
    try {
      const startDate = options.period_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = options.period_end || new Date().toISOString();

      const report = await this.generateReport(startDate, endDate);

      switch (options.format) {
        case 'json':
          return this.exportAsJSON(report);

        case 'csv':
          return this.exportAsCSV(report);

        case 'xlsx':
          // Nécessite une bibliothèque comme xlsx
          console.warn('Export XLSX non implémenté, utiliser CSV à la place');
          return this.exportAsCSV(report);

        case 'pdf':
          // Nécessite une bibliothèque comme jsPDF
          console.warn('Export PDF non implémenté, utiliser JSON à la place');
          return this.exportAsJSON(report);

        default:
          return this.exportAsJSON(report);
      }
    } catch (error) {
      console.error('❌ Erreur exportData:', error);
      return null;
    }
  }

  /**
   * Exporter en JSON
   */
  private exportAsJSON(report: AnalyticsReport): Blob {
    const json = JSON.stringify(report, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Exporter en CSV
   */
  private exportAsCSV(report: AnalyticsReport): Blob {
    const lines: string[] = [];

    // Header
    lines.push('Rapport Analytics SIB 2026');
    lines.push(`Période: ${report.period_start} - ${report.period_end}`);
    lines.push('');

    // Métriques
    lines.push('Métriques');
    lines.push('Métrique,Valeur');
    lines.push(`Visiteurs totaux,${report.metrics.total_visitors}`);
    lines.push(`Utilisateurs actifs,${report.metrics.active_users}`);
    lines.push(`Pages vues,${report.metrics.page_views}`);
    lines.push(`Visiteurs uniques,${report.metrics.unique_visitors}`);
    lines.push(`Durée moyenne session (s),${report.metrics.avg_session_duration}`);
    lines.push(`Taux de rebond (%),${report.metrics.bounce_rate}`);
    lines.push(`Taux de conversion (%),${report.metrics.conversion_rate}`);
    lines.push('');

    // Top pages
    lines.push('Top Pages');
    lines.push('Page,Vues');
    report.top_pages.forEach(page => {
      lines.push(`${page.path},${page.views}`);
    });
    lines.push('');

    // Top événements
    lines.push('Top Événements');
    lines.push('Type,Nombre');
    report.top_events.forEach(event => {
      lines.push(`${event.type},${event.count}`);
    });
    lines.push('');

    // Démographie par type
    lines.push('Utilisateurs par Type');
    lines.push('Type,Nombre');
    Object.entries(report.user_demographics.by_type).forEach(([type, count]) => {
      lines.push(`${type},${count}`);
    });
    lines.push('');

    // Démographie par pays
    lines.push('Utilisateurs par Pays');
    lines.push('Pays,Nombre');
    Object.entries(report.user_demographics.by_country).forEach(([country, count]) => {
      lines.push(`${country},${count}`);
    });

    const csv = lines.join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Télécharger le fichier exporté
   */
  downloadExport(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exporter et télécharger
   */
  async exportAndDownload(options: ExportOptions): Promise<boolean> {
    try {
      const blob = await this.exportData(options);
      if (!blob) {return false;}

      const ext = options.format;
      const date = new Date().toISOString().split('T')[0];
      const filename = `analytics-sib-${date}.${ext}`;

      this.downloadExport(blob, filename);
      return true;
    } catch (error) {
      console.error('❌ Erreur exportAndDownload:', error);
      return false;
    }
  }

  /**
   * Raccourcis pour périodes communes
   */
  async getTodayMetrics(): Promise<AnalyticsMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();
    const endDate = new Date().toISOString();
    return this.getMetrics(startDate, endDate);
  }

  async getWeekMetrics(): Promise<AnalyticsMetrics> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.getMetrics(weekAgo.toISOString(), today.toISOString());
  }

  async getMonthMetrics(): Promise<AnalyticsMetrics> {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.getMetrics(monthAgo.toISOString(), today.toISOString());
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

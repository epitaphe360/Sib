import { supabase, isSupabaseReady } from '../lib/supabase';

export interface PavilionMetrics {
  totalExhibitors: number;
  totalVisitors: number;
  totalConferences: number;
  countries: number;
}

interface ExhibitorProfile {
  country?: string;
}

// Valeurs par défaut pour le développement - statistiques réalistes du salon
const defaultPavilionMetrics: PavilionMetrics = {
  totalExhibitors: 500,
  totalVisitors: 8500,
  totalConferences: 45,
  countries: 42
};

export class PavilionMetricsService {
  static async getMetrics(): Promise<PavilionMetrics> {
    // Si Supabase n'est pas configuré, retourner les valeurs par défaut
    if (!isSupabaseReady() || !supabase) {
      return defaultPavilionMetrics;
    }

    try {
      // Récupérer les métriques depuis Supabase
      const [
        exhibitorsResult,
        visitorsResult,
        eventsResult,
        countriesResult
      ] = await Promise.all([
        // Total exposants (tous les exposants vérifiés)
        supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', true),

        // Total visiteurs
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'visitor'),

        // Total conférences/événements
        supabase.from('events').select('id', { count: 'exact', head: true }),

        // Pays représentés
        supabase.from('exhibitor_profiles').select('country')
      ]);

      // Calculer le nombre de pays distincts
      const uniqueCountries = countriesResult.data ? new Set((countriesResult.data as ExhibitorProfile[]).map((p) => p.country).filter(Boolean)).size : 0;

      // Calculer les métriques réelles depuis la base de données
      const metrics: PavilionMetrics = {
        totalExhibitors: exhibitorsResult.count || 0,
        totalVisitors: visitorsResult.count || 0,
        totalConferences: eventsResult.count || 0,
        countries: Math.max(uniqueCountries, 1)
      };

      return metrics;

    } catch (error) {
      console.error('Erreur lors de la récupération des métriques de pavilions:', error);
      return defaultPavilionMetrics;
    }
  }

  // Méthode pour rafraîchir les métriques
  static async refreshMetrics(): Promise<PavilionMetrics> {
    return this.getMetrics();
  }
}

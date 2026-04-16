import { useMemo } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

interface DashboardStatsWithGrowth {
  profileViews: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  connections: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  appointments: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  messages: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  catalogDownloads: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  miniSiteViews: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  weeklyEngagement: Array<{ name: string; visits: number; interactions: number }>;
}

/**
 * Retourne '--' pour tous les indicateurs de croissance car les données historiques
 * (période précédente) ne sont pas disponibles dans la base de données.
 * Les vraies valeurs de croissance nécessiteraient une table de snapshots périodiques.
 */
const noGrowth = (): { growth: string; growthType: 'neutral' } => ({
  growth: '--',
  growthType: 'neutral'
});

/**
 * Hook pour récupérer les statistiques du dashboard depuis le store Supabase.
 * Les indicateurs de croissance affichent '--' en l'absence de données historiques réelles.
 */
export const useDashboardStats = (): DashboardStatsWithGrowth | null => {
  const { dashboard } = useDashboardStore();

  return useMemo(() => {
    if (!dashboard?.stats) {return null;}

    // Use real weekly engagement data if populated, otherwise empty array
    const weeklyEngagement = (dashboard as any).weeklyEngagement || [];

    return {
      profileViews: {
        value: dashboard.stats.profileViews || 0,
        ...noGrowth()
      },
      connections: {
        value: dashboard.stats.connections || 0,
        ...noGrowth()
      },
      appointments: {
        value: dashboard.stats.appointments || 0,
        ...noGrowth()
      },
      messages: {
        value: dashboard.stats.messages || 0,
        ...noGrowth()
      },
      catalogDownloads: {
        value: dashboard.stats.catalogDownloads || 0,
        ...noGrowth()
      },
      miniSiteViews: {
        value: dashboard.stats.miniSiteViews || 0,
        ...noGrowth()
      },
      weeklyEngagement
    };
  }, [dashboard]);
};


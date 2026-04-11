/**
 * Hook Dashboard Stats avec calcul de croissance RÉEL
 * Résout TODO: Implémenter le calcul de croissance réel
 * Ligne 15 de useDashboardStats.ts
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export interface DashboardStats {
  totalVisitors: number;
  totalExhibitors: number;
  totalPartners: number;
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  visitorsGrowth: number; // % de croissance vs période précédente
  exhibitorsGrowth: number;
  partnersGrowth: number;
  appointmentsGrowth: number;
}

export interface StatsOptions {
  period?: 'week' | 'month' | 'quarter' | 'year';
  compareWithPrevious?: boolean;
}

export function useDashboardStatsReal(options: StatsOptions = {}) {
  const { period = 'month', compareWithPrevious = true } = options;
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    totalExhibitors: 0,
    totalPartners: 0,
    totalAppointments: 0,
    confirmedAppointments: 0,
    pendingAppointments: 0,
    visitorsGrowth: 0,
    exhibitorsGrowth: 0,
    partnersGrowth: 0,
    appointmentsGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [period]);

  const getPeriodDates = (period: string) => {
    const now = new Date();
    const currentPeriodStart = new Date();
    const previousPeriodStart = new Date();
    const previousPeriodEnd = new Date();

    switch (period) {
      case 'week':
        currentPeriodStart.setDate(now.getDate() - 7);
        previousPeriodStart.setDate(now.getDate() - 14);
        previousPeriodEnd.setDate(now.getDate() - 7);
        break;
      case 'month':
        currentPeriodStart.setMonth(now.getMonth() - 1);
        previousPeriodStart.setMonth(now.getMonth() - 2);
        previousPeriodEnd.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        currentPeriodStart.setMonth(now.getMonth() - 3);
        previousPeriodStart.setMonth(now.getMonth() - 6);
        previousPeriodEnd.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        currentPeriodStart.setFullYear(now.getFullYear() - 1);
        previousPeriodStart.setFullYear(now.getFullYear() - 2);
        previousPeriodEnd.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      currentStart: currentPeriodStart.toISOString(),
      currentEnd: now.toISOString(),
      previousStart: previousPeriodStart.toISOString(),
      previousEnd: previousPeriodEnd.toISOString(),
    };
  };

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      logger.info('Loading dashboard stats', { period, compareWithPrevious });

      const dates = getPeriodDates(period);

      // Période actuelle
      const [visitorsResult, exhibitorsResult, partnersResult, appointmentsResult] =
        await Promise.all([
          // Visitors
          supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('type', 'visitor')
            .gte('created_at', dates.currentStart)
            .lte('created_at', dates.currentEnd),

          // Exhibitors
          supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('type', 'exhibitor')
            .gte('created_at', dates.currentStart)
            .lte('created_at', dates.currentEnd),

          // Partners
          supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('type', 'partner')
            .gte('created_at', dates.currentStart)
            .lte('created_at', dates.currentEnd),

          // Appointments
          supabase
            .from('appointments')
            .select('id, status', { count: 'exact' })
            .gte('created_at', dates.currentStart)
            .lte('created_at', dates.currentEnd),
        ]);

      const currentVisitors = visitorsResult.count || 0;
      const currentExhibitors = exhibitorsResult.count || 0;
      const currentPartners = partnersResult.count || 0;
      const currentAppointments = appointmentsResult.count || 0;

      const appointments = appointmentsResult.data || [];
      const confirmedAppointments = appointments.filter(
        (a) => a.status === 'confirmed'
      ).length;
      const pendingAppointments = appointments.filter(
        (a) => a.status === 'pending'
      ).length;

      let visitorsGrowth = 0;
      let exhibitorsGrowth = 0;
      let partnersGrowth = 0;
      let appointmentsGrowth = 0;

      // Calcul croissance vs période précédente
      if (compareWithPrevious) {
        const [
          prevVisitorsResult,
          prevExhibitorsResult,
          prevPartnersResult,
          prevAppointmentsResult,
        ] = await Promise.all([
          supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('type', 'visitor')
            .gte('created_at', dates.previousStart)
            .lte('created_at', dates.previousEnd),

          supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('type', 'exhibitor')
            .gte('created_at', dates.previousStart)
            .lte('created_at', dates.previousEnd),

          supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('type', 'partner')
            .gte('created_at', dates.previousStart)
            .lte('created_at', dates.previousEnd),

          supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .gte('created_at', dates.previousStart)
            .lte('created_at', dates.previousEnd),
        ]);

        const prevVisitors = prevVisitorsResult.count || 0;
        const prevExhibitors = prevExhibitorsResult.count || 0;
        const prevPartners = prevPartnersResult.count || 0;
        const prevAppointments = prevAppointmentsResult.count || 0;

        visitorsGrowth = calculateGrowth(currentVisitors, prevVisitors);
        exhibitorsGrowth = calculateGrowth(currentExhibitors, prevExhibitors);
        partnersGrowth = calculateGrowth(currentPartners, prevPartners);
        appointmentsGrowth = calculateGrowth(currentAppointments, prevAppointments);
      }

      setStats({
        totalVisitors: currentVisitors,
        totalExhibitors: currentExhibitors,
        totalPartners: currentPartners,
        totalAppointments: currentAppointments,
        confirmedAppointments,
        pendingAppointments,
        visitorsGrowth,
        exhibitorsGrowth,
        partnersGrowth,
        appointmentsGrowth,
      });

      logger.info('Dashboard stats loaded', {
        period,
        totalVisitors: currentVisitors,
        visitorsGrowth,
      });
    } catch (error) {
      logger.error('Failed to load dashboard stats', error as Error);
      // Fallback to zero stats
      setStats({
        totalVisitors: 0,
        totalExhibitors: 0,
        totalPartners: 0,
        totalAppointments: 0,
        confirmedAppointments: 0,
        pendingAppointments: 0,
        visitorsGrowth: 0,
        exhibitorsGrowth: 0,
        partnersGrowth: 0,
        appointmentsGrowth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, reload: loadStats };
}

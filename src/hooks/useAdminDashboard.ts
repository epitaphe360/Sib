import { useState, useEffect, useRef } from 'react';
import {
  UserCheck, FileText, AlertTriangle, Users, Shield, Activity
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useAdminDashboardStore } from '../store/adminDashboardStore';
import { useNewsStore } from '../store/newsStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from './useTranslation';

export function useAdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { metrics, isLoading, error, fetchMetrics } = useAdminDashboardStore();
  const { fetchFromOfficialSite } = useNewsStore();
  const [showRegistrationRequests, setShowRegistrationRequests] = useState(false);
  const [isImportingArticles, setIsImportingArticles] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchMetrics();
    pollingRef.current = setInterval(() => { fetchMetrics(); }, 2 * 60 * 1000);

    const channel = supabase
      ?.channel('admin-users-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, () => {
        fetchMetrics();
      })
      .subscribe();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      channel?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adminMetrics = metrics || {
    totalUsers: 0, activeUsers: 0, totalExhibitors: 0, totalPartners: 0, totalVisitors: 0,
    totalEvents: 0, systemUptime: 0, dataStorage: 0, apiCalls: 0, avgResponseTime: 0,
    pendingValidations: 0, activeContracts: 0, contentModerations: 0,
  };

  const userGrowthData = adminMetrics.userGrowthData || [];
  const trafficData = adminMetrics.trafficData || [];
  const recentAdminActivity = adminMetrics.recentActivity || [];

  const activityData = [
    { name: t('admin.visits'), value: adminMetrics.totalConnections || 0 },
    { name: t('appointments.calendar'), value: adminMetrics.totalAppointments || 0 },
    { name: t('chat.messages'), value: adminMetrics.totalMessages || 0 },
    { name: t('common.download'), value: adminMetrics.totalDownloads || 0 },
  ];

  const hasActivityData = activityData.some(item => item.value > 0);

  const userTypeDistribution = [
    { name: t('admin.visitors'), value: adminMetrics.totalVisitors || 0, color: '#3b82f6' },
    { name: t('admin.exhibitors'), value: adminMetrics.totalExhibitors || 0, color: '#10b981' },
    { name: t('admin.partners'), value: adminMetrics.totalPartners || 0, color: '#f59e0b' },
  ];

  const systemHealth = [
    { name: 'API Performance', status: adminMetrics.avgResponseTime > 300 ? 'warning' : 'excellent', value: adminMetrics.avgResponseTime > 0 ? `${adminMetrics.avgResponseTime}ms` : '--', color: adminMetrics.avgResponseTime > 300 ? 'text-yellow-600' : 'text-green-600' },
    { name: 'Database', status: adminMetrics.systemUptime > 0 ? 'excellent' : 'warning', value: adminMetrics.systemUptime > 0 ? `${adminMetrics.systemUptime}%` : 'Hors ligne', color: adminMetrics.systemUptime > 0 ? 'text-green-600' : 'text-red-600' },
    { name: 'Storage', status: adminMetrics.dataStorage > 5 ? 'warning' : 'excellent', value: adminMetrics.dataStorage > 0 ? `${adminMetrics.dataStorage} GB` : '0 GB', color: adminMetrics.dataStorage > 5 ? 'text-yellow-600' : 'text-green-600' },
    { name: t('admin.api_calls_24h'), status: 'info', value: adminMetrics.apiCalls > 0 ? adminMetrics.apiCalls.toLocaleString() : '0', color: 'text-blue-600' },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'account_validation': return UserCheck;
      case 'content_moderation': return FileText;
      case 'system_alert': return AlertTriangle;
      case 'user_management': return Users;
      case 'security': return Shield;
      default: return Activity;
    }
  };

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleImportArticles = async () => {
    setIsImportingArticles(true);
    try {
      toast.loading('🔄 Synchronisation des articles depuis sib2026.ma...', { id: 'import-articles', duration: 10000 });
      const result = await fetchFromOfficialSite();
      if (result && result.success && result.stats) {
        const { inserted, updated, total } = result.stats;
        toast.success(
          `✅ Synchronisation réussie !\n${inserted} nouveau${inserted > 1 ? 'x' : ''} article${inserted > 1 ? 's' : ''}, ${updated} mis à jour sur ${total} trouvé${total > 1 ? 's' : ''}`,
          { id: 'import-articles', duration: 6000, description: 'Les articles sont maintenant disponibles sur la page Actualités' }
        );
      } else {
        toast.success('✅ Articles synchronisés avec succès !', { id: 'import-articles', duration: 4000 });
      }
    } catch (err) {
      console.error('❌ Erreur importation articles:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error('❌ Échec de la synchronisation automatique', {
        id: 'import-articles', duration: 8000,
        description: `Utilisez le script manuel : node scripts/sync-sib-news.mjs\n${errorMsg}`,
      });
    } finally {
      setIsImportingArticles(false);
    }
  };

  return {
    user, t,
    isLoading, error, fetchMetrics,
    adminMetrics,
    showRegistrationRequests, setShowRegistrationRequests,
    isImportingArticles, handleImportArticles,
    userGrowthData, trafficData, activityData, hasActivityData,
    userTypeDistribution, systemHealth,
    recentAdminActivity, formatDate, getActivityIcon, getActivityColor,
  };
}

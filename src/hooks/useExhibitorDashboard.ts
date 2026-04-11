import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useDashboardStats } from './useDashboardStats';
import { useBasicPredictions } from '../components/common/AIPredictions';
import { useTranslation } from './useTranslation';
import { supabase } from '../lib/supabase';
import { getExhibitorLevelByArea } from '../config/exhibitorQuotas';
import { toast } from 'sonner';

export function useExhibitorDashboard() {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'availability' | 'appointments'>('availability');
  const [modal, setModal] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingAppointment, setProcessingAppointment] = useState<string | null>(null);
  const [showMiniSiteSetup, setShowMiniSiteSetup] = useState(false);
  const [showMiniSiteScrapper, setShowMiniSiteScrapper] = useState(false);
  const [isPublished, setIsPublished] = useState<boolean | null>(null);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [exhibitorDbId, setExhibitorDbId] = useState<string | null>(null);

  // ─── External stores ───────────────────────────────────────────────────────
  const { user } = useAuthStore();
  const { dashboard, fetchDashboard, error: dashboardError } = useDashboardStore();
  const {
    appointments,
    fetchAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    isLoading: isAppointmentsLoading,
  } = useAppointmentStore();
  const dashboardStats = useDashboardStats();

  // ─── Effect: mini-site first‑login check ──────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkMiniSiteStatus = async () => {
      if (!user?.id || user?.status !== 'active') return;
      if (user?.type !== 'exhibitor' && (user as any)?.role !== 'exhibitor') return;
      if (localStorage.getItem(`sibs_minisite_skipped_${user.id}`) === 'true') return;

      try {
        const { data: exhibitor } = await supabase!
          .from('exhibitors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        const exhibitorId = (exhibitor as any)?.id;

        const [userResult, miniSiteResult] = await Promise.all([
          supabase!.from('users').select('minisite_created').eq('id', user.id).maybeSingle(),
          exhibitorId
            ? supabase!.from('mini_sites').select('id').eq('exhibitor_id', exhibitorId).limit(1)
            : Promise.resolve({ data: null }),
        ]);

        const flagSaysCreated = !!(userResult.data as any)?.minisite_created;
        const hasMiniSiteInDB = !!(miniSiteResult.data && miniSiteResult.data.length > 0);

        if (flagSaysCreated || hasMiniSiteInDB) {
          if (hasMiniSiteInDB && !flagSaysCreated) {
            // @ts-ignore – table not in generated Supabase types
            await supabase!.from('users').update({ minisite_created: true }).eq('id', user.id);
          }
          return;
        }

        if (isMounted) {
          timeoutId = setTimeout(() => {
            if (isMounted) setShowMiniSiteSetup(true);
          }, 2000);
        }
      } catch (err) {
        if (isMounted) console.error('Error checking minisite status:', err);
      }
    };

    checkMiniSiteStatus();
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user?.id, user?.status]);

  // ─── Effect: resolve exhibitorDbId (exhibitors.id for this user) ──────────
  useEffect(() => {
    if (!user?.id) return;
    supabase!
      .from('exhibitors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setExhibitorDbId((data as any).id);
      });
  }, [user?.id]);

  // ─── Effect: appointments + Realtime ──────────────────────────────────────
  useEffect(() => {
    const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
      Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        await withTimeout(fetchAppointments(), 10_000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (!msg.includes('timeout')) {
          console.error('Erreur lors du chargement des rendez-vous:', err);
          setError(t('exhibitor.error_load_appointments'));
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();

    const channel = supabase!
      .channel('dashboard-appointments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Effect: auto-clear error ──────────────────────────────────────────────
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // ─── Effect: dashboard data ────────────────────────────────────────────────
  useEffect(() => {
    if (user?.status === 'pending') return;
    fetchDashboard().catch((err) => {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError(t('exhibitor.error_load_dashboard'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.status]);

  // ─── Effect: publication status ───────────────────────────────────────────
  useEffect(() => {
    if (!user || (user.type !== 'exhibitor' && (user as any).role !== 'exhibitor')) return;

    supabase!
      .from('exhibitors')
      .select('is_published')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err && err.code !== 'PGRST116') {
          console.error('Erreur vérification statut publication:', err);
        }
        setIsPublished((data as any)?.is_published ?? false);
      });
  }, [user]);

  // ─── Computed data ─────────────────────────────────────────────────────────
  const visitorEngagementData = useMemo(
    () => dashboardStats?.weeklyEngagement || [],
    [dashboardStats?.weeklyEngagement]
  );

  const myAppointments = useMemo(() => {
    if (!user?.id || !appointments) return [];
    return appointments.filter((a) =>
      // exhibitorId = exhibitors.id (résolu via exhibitorDbId)
      (exhibitorDbId && a.exhibitorId === exhibitorDbId) ||
      // fallback: exhibitor_id == users.id (si FK directe)
      (a as any).exhibitorUserId === user.id ||
      (a as any).exhibitor?.user_id === user.id ||
      (a as any).exhibitor?.id === user.id
    );
  }, [appointments, user?.id, exhibitorDbId]);

  const appointmentStatusData = useMemo(
    () => [
      { name: t('exhibitor.status.confirmed'), value: myAppointments.filter((a) => a.status === 'confirmed').length, color: '#10b981' },
      { name: t('exhibitor.status.pending'), value: myAppointments.filter((a) => a.status === 'pending').length, color: '#f59e0b' },
      { name: t('exhibitor.status.completed'), value: myAppointments.filter((a) => a.status === 'completed').length, color: '#3b82f6' },
    ],
    [myAppointments, t]
  );

  const activityBreakdownData = useMemo(
    () => [
      { name: t('exhibitor.chart_minisite_views'), value: dashboardStats?.miniSiteViews?.value || 0 },
      { name: t('exhibitor.chart_downloads'), value: dashboardStats?.catalogDownloads?.value || 0 },
      { name: t('exhibitor.chart_messages'), value: dashboardStats?.messages?.value || 0 },
      { name: t('exhibitor.chart_connections'), value: dashboardStats?.connections?.value || 0 },
    ],
    [dashboardStats, t]
  );

  const hasRealData = useMemo(() => {
    const totalActivity = activityBreakdownData.reduce((sum, item) => sum + item.value, 0);
    const totalAppointments = appointmentStatusData.reduce((sum, item) => sum + item.value, 0);
    return totalActivity > 0 || totalAppointments > 0;
  }, [activityBreakdownData, appointmentStatusData]);

  const receivedAppointments = myAppointments;
  const pendingAppointments = receivedAppointments.filter((a) => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter((a) => a.status === 'confirmed');
  const now = new Date();
  const upcomingAppointments = receivedAppointments.filter(
    (a) => (a.status === 'pending' || (!a.startTime || new Date(a.startTime) > now)) && a.status !== 'cancelled'
  );
  const pastAppointments = receivedAppointments.filter(
    (a) => a.status !== 'pending' && a.startTime && new Date(a.startTime) < now
  );
  const cancelledAppointments = receivedAppointments.filter((a) => a.status === 'cancelled');

  // ─── Filtered appointment states ───────────────────────────────────────────
  const [filteredUpcoming, setFilteredUpcoming] = useState(upcomingAppointments);
  const [filteredPast, setFilteredPast] = useState(pastAppointments);
  const [filteredCancelled, setFilteredCancelled] = useState(cancelledAppointments);

  useEffect(() => {
    setFilteredUpcoming(upcomingAppointments);
    setFilteredPast(pastAppointments);
    setFilteredCancelled(cancelledAppointments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingAppointments.length, pastAppointments.length, cancelledAppointments.length]);

  // ─── IA predictions ────────────────────────────────────────────────────────
  const predictions = useBasicPredictions({
    appointments: confirmedAppointments.length,
    views: dashboardStats?.miniSiteViews?.value || 0,
    connections: dashboardStats?.connections?.value || 0,
  });

  const exhibitorLevel = getExhibitorLevelByArea(user?.profile?.standArea || 9);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const togglePublished = async () => {
    if (!user?.id || isTogglingPublish) return;
    setIsTogglingPublish(true);
    try {
      const newStatus = !isPublished;
      const { error: err } = await supabase!
        .from('exhibitors')
        // @ts-ignore – column not in generated Supabase types
        .update({ is_published: newStatus })
        .eq('user_id', user.id);
      if (err) throw err;
      setIsPublished(newStatus);
      toast.success(
        newStatus ? t('exhibitor.toast_profile_visible') : t('exhibitor.toast_profile_hidden'),
        { duration: 5000 }
      );
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      toast.error(t('exhibitor.error_toggle_visibility'));
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const handleAccept = async (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    const exhibitorUserId = (appointment as any)?.exhibitorUserId || (appointment as any)?.exhibitor?.user_id;
    if (!appointment || !user?.id || exhibitorUserId !== user.id) {
      setError(t('exhibitor.error_unauthorized_confirm'));
      return;
    }
    setProcessingAppointment(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
    } catch (err) {
      console.error("Erreur lors de l'acceptation:", err);
      setError(t('exhibitor.error_accept_failed'));
    } finally {
      setProcessingAppointment(null);
    }
  };

  const handleReject = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    const exhibitorUserId = (appointment as any)?.exhibitorUserId || (appointment as any)?.exhibitor?.user_id;
    if (!appointment || !user?.id || exhibitorUserId !== user.id) {
      setError(t('exhibitor.error_unauthorized_reject'));
      return;
    }
    setConfirmRejectId(appointmentId);
  };

  const doReject = async (appointmentId: string) => {
    setConfirmRejectId(null);
    setProcessingAppointment(appointmentId);
    try {
      await cancelAppointment(appointmentId);
    } catch (err) {
      console.error('Erreur lors du refus:', err);
      setError(t('exhibitor.error_reject_failed'));
    } finally {
      setProcessingAppointment(null);
    }
  };

  const downloadQRCode = async () => {
    setIsDownloadingQR(true);
    try {
      const canvas = qrCodeRef.current as unknown as HTMLCanvasElement | null;
      if (canvas) {
        const link = document.createElement('a');
        const companyName = user?.profile?.company || 'stand';
        link.download = `qr-code-${companyName}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success(t('exhibitor.qr_download_success'));
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      toast.error(t('exhibitor.qr_download_error'));
    } finally {
      setIsDownloadingQR(false);
    }
  };

  const handleViewAllActivities = () => {
    setModal({
      title: t('exhibitor.activity.view_all'),
      content: React.createElement(
        'div',
        { className: 'space-y-4 max-h-96 overflow-y-auto' },
        dashboard?.recentActivity?.length
          ? dashboard.recentActivity.map((activity) =>
              React.createElement(
                'div',
                { key: activity.id, className: 'flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border' },
                React.createElement(
                  'div',
                  { className: 'flex-shrink-0 w-10 h-10 bg-siports-primary text-white rounded-full flex items-center justify-center text-sm font-medium' },
                  activity.type === 'profile_view' ? '👁️' :
                  activity.type === 'message' ? '💬' :
                  activity.type === 'appointment' ? '📅' :
                  activity.type === 'connection' ? '🤝' : '📥'
                ),
                React.createElement(
                  'div',
                  { className: 'flex-1 min-w-0' },
                  React.createElement('p', { className: 'text-sm font-medium text-gray-900' }, activity.description),
                  React.createElement(
                    'p',
                    { className: 'text-xs text-gray-500' },
                    new Date(activity.timestamp).toLocaleString('fr-FR')
                  )
                )
              )
            )
          : React.createElement(
              'div',
              { className: 'text-center py-8' },
              React.createElement('div', { className: 'text-4xl mb-4' }, '📊'),
              React.createElement('p', { className: 'text-gray-600' }, t('exhibitor.activity.none'))
            )
      ),
    });
  };

  const handleStatClick = (statType: string) => {
    const configs: Record<string, { title: string; color: string; value: string; text: string; route?: string }> = {
      miniSiteViews: {
        title: t('exhibitor.modals.views_title'),
        color: 'blue',
        value: dashboardStats?.miniSiteViews?.value?.toLocaleString() || '0',
        text: t('exhibitor.modals.views_text', { count: dashboardStats?.miniSiteViews?.value?.toLocaleString() || '0' }),
      },
      appointments: {
        title: t('exhibitor.modals.appointments_title'),
        color: 'green',
        value: String(dashboardStats?.appointments?.value || '0'),
        text: t('exhibitor.modals.appointments_text', { count: dashboardStats?.appointments?.value || '0' }),
        route: '/appointments',
      },
      downloads: {
        title: t('exhibitor.modals.downloads_title'),
        color: 'purple',
        value: String(dashboardStats?.catalogDownloads?.value || '0'),
        text: t('exhibitor.modals.downloads_text', { count: dashboardStats?.catalogDownloads?.value || '0' }),
      },
      messages: {
        title: t('exhibitor.modals.messages_title'),
        color: 'orange',
        value: String(dashboardStats?.messages?.value || '0'),
        text: t('exhibitor.modals.messages_text', { count: dashboardStats?.messages?.value || '0' }),
        route: '/chat',
      },
    };
    const cfg = configs[statType];
    if (!cfg) return;

    setModal({
      title: cfg.title,
      content: React.createElement(
        'div',
        { className: `bg-${cfg.color}-50 p-4 rounded-lg` },
        React.createElement('p', { className: `text-${cfg.color}-700 mt-2` }, cfg.text)
      ),
    });
  };

  return {
    // refs
    qrCodeRef: qrCodeRef as React.RefObject<HTMLCanvasElement>,
    // ui state
    showQRModal, setShowQRModal,
    activeTab, setActiveTab,
    modal, setModal,
    isDownloadingQR,
    error, setError,
    isLoading,
    processingAppointment,
    showMiniSiteSetup, setShowMiniSiteSetup,
    showMiniSiteScrapper, setShowMiniSiteScrapper,
    isPublished,
    isTogglingPublish,
    confirmRejectId, setConfirmRejectId,
    historyTab, setHistoryTab,
    filteredUpcoming, setFilteredUpcoming,
    filteredPast, setFilteredPast,
    filteredCancelled, setFilteredCancelled,
    // external
    user,
    dashboard,
    fetchDashboard,
    dashboardError,
    appointments,
    fetchAppointments,
    isAppointmentsLoading,
    dashboardStats,
    // computed
    visitorEngagementData,
    myAppointments,
    appointmentStatusData,
    activityBreakdownData,
    hasRealData,
    receivedAppointments,
    pendingAppointments,
    confirmedAppointments,
    upcomingAppointments,
    pastAppointments,
    cancelledAppointments,
    predictions,
    exhibitorLevel,
    // handlers
    togglePublished,
    handleAccept,
    handleReject,
    doReject,
    downloadQRCode,
    handleViewAllActivities,
    handleStatClick,
  };
}

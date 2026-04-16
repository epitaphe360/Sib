import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useDashboardStats } from './useDashboardStats';
import { useTranslation } from './useTranslation';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function usePartnerDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { dashboard, isLoading, error: dashboardError, fetchDashboard } = useDashboardStore();
  const dashboardStats = useDashboardStats();
  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment } = useAppointmentStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'networking' | 'analytics'>('overview');
  const [processingAppointment, setProcessingAppointment] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [isPublished, setIsPublished] = useState<boolean | null>(null);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.type !== 'partner') {return;}
    fetchDashboard().catch((err) => console.error('Erreur chargement dashboard:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user || user.type !== 'partner') {return;}
    fetchAppointments().catch((err) => console.error('Erreur chargement rendez-vous:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user || user.type !== 'partner' || user.status !== 'active') {return;}
    supabase!.from('partner_profiles').select('id').eq('user_id', user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {console.error('Erreur vérification profil:', error);}
        setShowProfileModal(!data);
      })
      .catch((err) => console.error('Erreur:', err));
  }, [user]);

  useEffect(() => {
    if (!user || user.type !== 'partner') {return;}
    supabase!.from('partners').select('is_published').eq('user_id', user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {console.error('Erreur statut publication:', error);}
        setIsPublished((data as any)?.is_published ?? false);
      })
      .catch(() => setIsPublished(false));
  }, [user]);

  const togglePublished = async () => {
    if (!user?.id || isTogglingPublish) {return;}
    setIsTogglingPublish(true);
    try {
      const newStatus = !isPublished;
      // @ts-expect-error – column not in generated Supabase types
      const { error } = await supabase!.from('partners').update({ is_published: newStatus }).eq('user_id', user.id);
      if (error) {throw error;}
      setIsPublished(newStatus);
      toast.success(newStatus ? t('exhibitor.toast_profile_visible') : t('exhibitor.toast_profile_hidden'), { duration: 4000 });
    } catch (err) {
      console.error('Erreur changement statut:', err);
      toast.error(t('exhibitor.error_toggle_visibility'));
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const receivedAppointments = appointments.filter(a => user && user.id && a.exhibitorId === user.id);
  const pendingAppointments = receivedAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter(a => a.status === 'confirmed');

  const brandExposureData = dashboardStats?.weeklyEngagement || [];

  const hasRealAnalyticsData = (
    (dashboardStats?.profileViews?.value || 0) > 0 ||
    (dashboardStats?.connections?.value || 0) > 0 ||
    (dashboardStats?.messages?.value || 0) > 0
  );

  const engagementChannelsData = useMemo(() => [
    { name: t('partner.stats.profile_views'), value: dashboardStats?.profileViews?.value || 0, color: '#8b5cf6' },
    { name: t('partner.stats.messages'), value: dashboardStats?.messages?.value || 0, color: '#06b6d4' },
    { name: t('partner.stats.appointments'), value: dashboardStats?.appointments?.value || 0, color: '#f97316' },
    { name: 'Téléchargements', value: dashboardStats?.catalogDownloads?.value || 0, color: '#10b981' },
  ], [dashboardStats, t]);

  const roiMetricsData = useMemo(() => [
    { name: t('partner.stats.connections'), value: dashboardStats?.connections?.value || 0 },
    { name: 'Leads qualifiés', value: 0 },
    { name: 'RDV Confirmés', value: confirmedAppointments.length },
    { name: t('partner.stats.messages'), value: dashboardStats?.messages?.value || 0 },
  ], [dashboardStats, confirmedAppointments.length, t]);

  const partnerTier = ((user as any)?.partner_tier || user?.profile?.partner_tier || 'partner') as string;

  const handleAccept = async (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment || !user?.id || appointment.exhibitorId !== user.id) {
      toast.error("Vous n'êtes pas autorisé à confirmer ce rendez-vous");
      return;
    }
    setProcessingAppointment(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
    } catch (err) {
      console.error('Erreur acceptation:', err);
      toast.error("Impossible d'accepter le rendez-vous");
    } finally {
      setProcessingAppointment(null);
    }
  };

  const handleReject = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment || !user?.id || appointment.exhibitorId !== user.id) {
      toast.error("Vous n'êtes pas autorisé à refuser ce rendez-vous");
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
      console.error('Erreur refus:', err);
      toast.error("Impossible de refuser le rendez-vous");
    } finally {
      setProcessingAppointment(null);
    }
  };

  return {
    user, t,
    dashboard, isLoading, dashboardError, fetchDashboard,
    dashboardStats,
    activeTab, setActiveTab,
    processingAppointment,
    showProfileModal, setShowProfileModal,
    showEditorModal, setShowEditorModal,
    isPublished, isTogglingPublish,
    confirmRejectId, setConfirmRejectId,
    togglePublished,
    receivedAppointments, pendingAppointments, confirmedAppointments,
    brandExposureData, hasRealAnalyticsData, engagementChannelsData, roiMetricsData,
    partnerTier,
    handleAccept, handleReject, doReject,
  };
}

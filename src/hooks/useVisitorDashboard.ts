import { useState, useEffect, useCallback, useMemo } from 'react';
import useAuthStore from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useVisitorStore } from '../store/visitorStore';
import { useVisitorStats } from './useVisitorStats';
import { useBasicPredictions } from '../components/common/AIPredictions';
import { useTranslation } from './useTranslation';
import { calculateRemainingQuota, getVisitorQuota } from '../config/quotas';
import type { Appointment } from '../types';

export function useVisitorDashboard() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();

  // ─── UI state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'schedule' | 'appointments'>('schedule');
  const [historyTab, setHistoryTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState<{ exhibitorId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Stores ─────────────────────────────────────────────────────────────────
  const {
    appointments,
    fetchAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    isLoading: isAppointmentsLoading,
  } = useAppointmentStore();
  const { fetchVisitorData } = useVisitorStore();
  const {
    events,
    registeredEvents,
    fetchEvents,
    fetchUserEventRegistrations,
    unregisterFromEvent,
  } = useEventStore();
  const stats = useVisitorStats();

  // ─── Effect: visitor data ────────────────────────────────────────────────────
  useEffect(() => {
    if (user) fetchVisitorData();
  }, [user, fetchVisitorData]);

  // ─── Effect: appointments ────────────────────────────────────────────────────
  useEffect(() => {
    const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
      Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

    const load = async () => {
      try {
        setError(null);
        setIsLoading(true);
        await withTimeout(fetchAppointments(), 10_000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (!msg.includes('Failed to fetch') && !msg.includes('timeout')) {
          console.error('Erreur chargement rendez-vous:', err);
          setError(t('visitor.error_loading_appointments'));
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Effect: events ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
      fetchUserEventRegistrations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ─── Effect: auto-clear error ────────────────────────────────────────────────
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  // ─── Computed: appointments ──────────────────────────────────────────────────
  const receivedAppointments = useMemo(
    () => appointments?.filter((a) => user && a.visitorId === user.id) || [],
    [appointments, user]
  );
  const pendingAppointments = useMemo(
    () => receivedAppointments.filter((a) => a.status === 'pending'),
    [receivedAppointments]
  );
  const confirmedAppointments = useMemo(
    () => receivedAppointments.filter((a) => a.status === 'confirmed'),
    [receivedAppointments]
  );
  const refusedAppointments = useMemo(
    () => receivedAppointments.filter((a) => a.status === 'cancelled'),
    [receivedAppointments]
  );
  const now = new Date();
  const upcomingAppointments = useMemo(
    () =>
      receivedAppointments.filter(
        (a) => new Date(a.startTime || (a.createdAt as unknown as string) || 0) > now && a.status !== 'cancelled'
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receivedAppointments]
  );
  const pastAppointments = useMemo(
    () =>
      receivedAppointments.filter(
        (a) => new Date(a.startTime || (a.createdAt as unknown as string) || 0) < now
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receivedAppointments]
  );

  // ─── Filtered state ──────────────────────────────────────────────────────────
  const [filteredUpcoming, setFilteredUpcoming] = useState<Appointment[]>([]);
  const [filteredPast, setFilteredPast] = useState<Appointment[]>([]);
  const [filteredCancelled, setFilteredCancelled] = useState<Appointment[]>([]);

  useEffect(() => {
    setFilteredUpcoming(upcomingAppointments);
    setFilteredPast(pastAppointments);
    setFilteredCancelled(refusedAppointments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingAppointments.length, pastAppointments.length, refusedAppointments.length]);

  // ─── Level & quota ───────────────────────────────────────────────────────────
  const userLevel: string =
    user?.status === 'pending_payment' ? 'free' : (user as any)?.visitor_level || 'free';
  const remaining = calculateRemainingQuota(userLevel, confirmedAppointments.length);

  // ─── IA predictions ──────────────────────────────────────────────────────────
  const predictions = useBasicPredictions({
    appointments: confirmedAppointments.length,
    views: stats.exhibitorsVisited,
    connections: stats.connections,
  });

  // ─── Chart data ──────────────────────────────────────────────────────────────
  const safeExhibitorsVisited = stats.exhibitorsVisited || 0;
  const safeConnections = stats.connections || 0;

  const visitActivityData = useMemo(
    () => [
      { name: t('common.days.mon'), visites: Math.floor(safeExhibitorsVisited * 0.12), interactions: Math.floor(safeConnections * 0.14) },
      { name: t('common.days.tue'), visites: Math.floor(safeExhibitorsVisited * 0.15), interactions: Math.floor(safeConnections * 0.17) },
      { name: t('common.days.wed'), visites: Math.floor(safeExhibitorsVisited * 0.18), interactions: Math.floor(safeConnections * 0.21) },
      { name: t('common.days.thu'), visites: Math.floor(safeExhibitorsVisited * 0.14), interactions: Math.floor(safeConnections * 0.16) },
      { name: t('common.days.fri'), visites: Math.floor(safeExhibitorsVisited * 0.20), interactions: Math.floor(safeConnections * 0.24) },
      { name: t('common.days.sat'), visites: Math.floor(safeExhibitorsVisited * 0.13), interactions: Math.floor(safeConnections * 0.15) },
      { name: t('common.days.sun'), visites: Math.floor(safeExhibitorsVisited * 0.08), interactions: Math.floor(safeConnections * 0.13) },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeExhibitorsVisited, safeConnections]
  );

  const appointmentStatusData = useMemo(
    () => [
      { name: t('status.confirmed'), value: confirmedAppointments.length, color: '#10b981' },
      { name: t('status.pending'), value: pendingAppointments.length, color: '#f59e0b' },
      { name: t('visitor.refused'), value: refusedAppointments.length, color: '#ef4444' },
    ],
    [confirmedAppointments.length, pendingAppointments.length, refusedAppointments.length, t]
  );

  const interestAreasData = useMemo(
    () => [
      { name: t('visitor.exhibitors_visited'), value: stats.exhibitorsVisited },
      { name: t('visitor.favorites'), value: stats.bookmarks },
      { name: t('visitor.connections'), value: stats.connections },
      { name: t('visitor.messages'), value: stats.messagesSent },
    ],
    [stats, t]
  );

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleAccept = useCallback(
    async (appointmentId: string) => {
      try {
        await updateAppointmentStatus(appointmentId, 'confirmed');
      } catch (err) {
        console.error("Erreur acceptation:", err);
        setError(t('errors.accept_appointment'));
      }
    },
    [updateAppointmentStatus, t]
  );

  const handleReject = useCallback(
    async (appointmentId: string) => {
      try {
        await cancelAppointment(appointmentId);
      } catch (err) {
        console.error("Erreur refus:", err);
        setError(t('errors.reject_appointment'));
      }
    },
    [cancelAppointment, t]
  );

  const handleRequestAnother = useCallback((exhibitorId: string) => {
    setShowAvailabilityModal({ exhibitorId });
  }, []);

  const handleUnregisterFromEvent = useCallback(
    async (eventId: string) => {
      try {
        await unregisterFromEvent(eventId);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.unregister_event'));
      }
    },
    [unregisterFromEvent, t]
  );

  const getExhibitorName = useCallback(
    (appointment: { exhibitor?: { companyName?: string; name?: string }; exhibitorId?: string }) => {
      if (appointment.exhibitor?.companyName) return appointment.exhibitor.companyName;
      if (appointment.exhibitor?.name) return appointment.exhibitor.name;
      return `Exposant #${appointment.exhibitorId}`;
    },
    []
  );

  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return events
      .filter((e) => registeredEvents.includes(e.id))
      .sort((a, b) => {
        const aDate = a.date || new Date(0);
        const bDate = b.date || new Date(0);
        if (aDate > now && bDate <= now) return -1;
        if (aDate <= now && bDate > now) return 1;
        return aDate.getTime() - bDate.getTime();
      })
      .slice(0, 5);
  }, [events, registeredEvents]);

  const isEventPast = useCallback((eventDate: Date) => eventDate < new Date(), []);

  return {
    // auth
    user,
    isAuthenticated,
    // ui state
    activeTab, setActiveTab,
    historyTab, setHistoryTab,
    showAvailabilityModal, setShowAvailabilityModal,
    error, setError,
    isLoading,
    isAppointmentsLoading,
    // appointments
    receivedAppointments,
    pendingAppointments,
    confirmedAppointments,
    refusedAppointments,
    upcomingAppointments,
    pastAppointments,
    filteredUpcoming, setFilteredUpcoming,
    filteredPast, setFilteredPast,
    filteredCancelled, setFilteredCancelled,
    // level
    userLevel,
    remaining,
    getVisitorQuota,
    // stats & charts
    stats,
    predictions,
    visitActivityData,
    appointmentStatusData,
    interestAreasData,
    // events
    events,
    registeredEvents,
    // handlers
    handleAccept,
    handleReject,
    handleRequestAnother,
    handleUnregisterFromEvent,
    getExhibitorName,
    getUpcomingEvents,
    isEventPast,
  };
}

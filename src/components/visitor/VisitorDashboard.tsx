import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, X, QrCode, Download, Star, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { DashboardSkeleton } from '../ui/Skeleton';
import { QuotaSummaryCard } from '../common/QuotaWidget';
import { useVisitorDashboard } from '../../hooks/useVisitorDashboard';
import { ROUTES } from '../../lib/routes';
import {
  VisitorPendingPaymentBanner,
  VisitorHeader,
  VisitorStatsGrid,
  VisitorVIPBenefits,
  VisitorQuickActions,
  VisitorAnalyticsSection,
  VisitorCommunicationCards,
  VisitorNetworkingHub,
  VisitorAvailabilityModal,
} from './components';
import { getVisitorQuota } from '../../config/quotas';
import { Calendar } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import useAuthStore from '../../store/authStore';

export default memo(function VisitorDashboard() {
  const { t } = useTranslation();
  const ctx = useVisitorDashboard();

  if (ctx.isLoading) return <DashboardSkeleton />;

  if (!ctx.isAuthenticated || !ctx.user) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-8 max-w-md">
            <div className="h-14 w-14 mx-auto mb-5 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
              {t('visitor.unauthorized_access')}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              {t('visitor.please_login')}
            </p>
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary" size="md" className="w-full">
                <Activity className="h-4 w-4 mr-1.5" />
                {t('nav.login')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Vue simplifiée pour visiteur FREE : QR code uniquement ──────────────
  if (ctx.userLevel === 'free') {
    return <VisitorFreeQRDashboard user={ctx.user} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-container mx-auto px-6 lg:px-8 py-10">

        {/* Pending payment banner */}
        {ctx.user.status === 'pending_payment' && <VisitorPendingPaymentBanner />}

        {/* Header */}
        <VisitorHeader
          user={ctx.user}
          userLevel={ctx.userLevel}
          remaining={ctx.remaining}
          registeredEventsCount={ctx.registeredEvents.length}
          connectionsRequested={ctx.stats.connectionsRequested}
        />

        {/* Quota summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
          <QuotaSummaryCard
            title={t('dashboard.your_quotas')}
            level={ctx.userLevel}
            type="visitor"
            quotas={[{
              label: t('visitor.b2b_appointments'),
              current: ctx.confirmedAppointments.length,
              limit: getVisitorQuota(ctx.userLevel),
              icon: <Calendar className="h-4 w-4 text-gray-400" />,
            }]}
            upgradeLink={ctx.userLevel === 'free' ? ROUTES.VISITOR_UPGRADE : undefined}
          />
        </motion.div>

        {/* VIP benefits */}
        {(ctx.userLevel === 'premium' || ctx.userLevel === 'vip') && <VisitorVIPBenefits />}

        {/* Error banner */}
        {ctx.error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mb-6 p-4 bg-white dark:bg-neutral-900 border border-danger-200 dark:border-danger-500/30 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-lg bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center shrink-0">
              <X className="h-4 w-4 text-danger-600" />
            </div>
            <p className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">{ctx.error}</p>
            <button
              type="button"
              onClick={() => ctx.setError(null)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Stats grid */}
        <VisitorStatsGrid
          userLevel={ctx.userLevel}
          appointmentsBooked={ctx.stats.appointmentsBooked}
          exhibitorsVisited={ctx.stats.exhibitorsVisited}
          registeredEventsCount={ctx.registeredEvents.length}
          connectionsRequested={ctx.stats.connectionsRequested}
        />

        {/* Quick actions */}
        <VisitorQuickActions userLevel={ctx.userLevel} remaining={ctx.remaining} />

        {/* Analytics */}
        <VisitorAnalyticsSection
          userLevel={ctx.userLevel}
          visitActivityData={ctx.visitActivityData}
          appointmentStatusData={ctx.appointmentStatusData}
          interestAreasData={ctx.interestAreasData}
          confirmedCount={ctx.confirmedAppointments.length}
          receivedCount={ctx.receivedAppointments.length}
          exhibitorsVisited={ctx.stats.exhibitorsVisited}
          connections={ctx.stats.connections}
          predictions={ctx.predictions}
        />

        {/* Communication cards */}
        <VisitorCommunicationCards userLevel={ctx.userLevel} />

        {/* Networking hub */}
        <VisitorNetworkingHub
          activeTab={ctx.activeTab}
          setActiveTab={ctx.setActiveTab}
          historyTab={ctx.historyTab}
          setHistoryTab={ctx.setHistoryTab}
          userLevel={ctx.userLevel}
          upcomingAppointments={ctx.upcomingAppointments}
          pastAppointments={ctx.pastAppointments}
          refusedAppointments={ctx.refusedAppointments}
          filteredUpcoming={ctx.filteredUpcoming}
          filteredPast={ctx.filteredPast}
          filteredCancelled={ctx.filteredCancelled}
          setFilteredUpcoming={ctx.setFilteredUpcoming}
          setFilteredPast={ctx.setFilteredPast}
          setFilteredCancelled={ctx.setFilteredCancelled}
          confirmedCount={ctx.confirmedAppointments.length}
          pendingCount={ctx.pendingAppointments.length}
          isAppointmentsLoading={ctx.isAppointmentsLoading}
          getUpcomingEvents={ctx.getUpcomingEvents}
          isEventPast={ctx.isEventPast}
          handleUnregisterFromEvent={ctx.handleUnregisterFromEvent}
          handleAccept={ctx.handleAccept}
          handleReject={ctx.handleReject}
          handleRequestAnother={ctx.handleRequestAnother}
          getExhibitorName={ctx.getExhibitorName}
          registeredEventsCount={ctx.registeredEvents.length}
        />

        {/* Availability modal */}
        <VisitorAvailabilityModal
          exhibitorId={ctx.showAvailabilityModal?.exhibitorId ?? null}
          onClose={() => ctx.setShowAvailabilityModal(null)}
        />
      </div>
    </div>
  );
});

// ── Tableau de bord simplifié visiteur FREE (QR code uniquement) ─────────────
function VisitorFreeQRDashboard({ user }: { user: any }) {
  const { t } = useTranslation();
  const { signOut } = useAuthStore();

  const visitorName = user?.name || user?.profile?.firstName || 'Visiteur';

  async function handleLogout() {
    await signOut();
  }

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white h-10 w-10 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <span className="text-white font-semibold text-base tracking-tight">SIB 2026</span>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent-500 mt-0.5">
                Pass Visiteur Gratuit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Bienvenue, {visitorName}
          </h1>
          <p className="text-white/70 mt-2 text-sm">Votre badge d'accès au salon SIB 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden mb-6"
        >
          <div className="bg-primary-700 px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2 text-white">
              <QrCode className="h-4 w-4 text-accent-500" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">Mon E-Badge QR Code</span>
            </div>
            <p className="text-white/75 text-xs mt-1.5">Présentez ce badge à l'entrée du salon</p>
          </div>

          <div className="p-8 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 mb-5">
                <QrCode className="h-28 w-28 text-primary-700 opacity-30" />
              </div>
              <p className="text-neutral-500 text-sm mb-4">
                Cliquez ci-dessous pour afficher votre QR code complet
              </p>
            </div>

            <div className="space-y-2 mt-2">
              <Link to={ROUTES.BADGE} className="block">
                <Button variant="primary" size="lg" className="w-full">
                  <QrCode className="h-4 w-4 mr-1.5" />
                  Voir et télécharger mon E-Badge
                </Button>
              </Link>
              <Link to={ROUTES.BADGE_DIGITAL} className="block">
                <Button variant="secondary" size="md" className="w-full">
                  <Download className="h-4 w-4 mr-1.5" />
                  Badge numérique téléchargeable
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <div className="h-1.5 w-1.5 rounded-full bg-success-500 flex-shrink-0" />
              <span>Email : <strong className="text-neutral-900">{user?.email}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <div className="h-1.5 w-1.5 rounded-full bg-success-500 flex-shrink-0" />
              <span>Niveau : <strong className="text-neutral-900">Pass Gratuit</strong></span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-6 text-center bg-gradient-to-br from-accent-600 to-accent-500 border border-accent-500/40"
        >
          <div className="flex items-center justify-center gap-2 text-white font-semibold mb-1.5 tracking-tight">
            <Star className="h-4 w-4" />
            Passez au niveau Standard ou VIP
          </div>
          <p className="text-white/90 text-xs mb-4 leading-relaxed">
            Accédez au networking, aux rendez-vous B2B, aux conférences et bien plus.
          </p>
          <Link to={ROUTES.VISITOR_UPGRADE}>
            <Button variant="secondary" size="md" className="bg-white text-accent-700 hover:bg-white/95 border-0">
              Découvrir les offres Premium
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-SIB-primary to-SIB-secondary rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-SIB-gold" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('visitor.unauthorized_access')}</h3>
            <p className="text-gray-600 mb-6">{t('visitor.please_login')}</p>
            <Link to={ROUTES.LOGIN}>
              <Button className="w-full bg-gradient-to-r from-SIB-primary to-SIB-secondary hover:from-SIB-secondary hover:to-SIB-primary text-white">
                <Activity className="h-4 w-4 mr-2" />{t('nav.login')}
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="ml-3 text-red-800 text-sm font-medium flex-1">{ctx.error}</p>
              <button onClick={() => ctx.setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                <X className="h-5 w-5" />
              </button>
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">SIB 2026</span>
              <p className="text-green-200 text-xs">Pass Visiteur Gratuit</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-green-200 hover:text-white transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-white">
            Bienvenue, {visitorName} !
          </h1>
          <p className="text-green-200 mt-1">
            Votre badge d'accès au salon SIB 2026
          </p>
        </motion.div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6"
        >
          <div className="bg-green-600 px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white">
              <QrCode className="h-5 w-5" />
              <span className="font-semibold text-lg">Mon E-Badge QR Code</span>
            </div>
            <p className="text-green-100 text-sm mt-1">
              Présentez ce badge à l'entrée du salon
            </p>
          </div>

          <div className="p-8 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="bg-gray-50 border-2 border-green-100 rounded-xl p-6 mb-4">
                <QrCode className="h-32 w-32 text-green-700 opacity-30" />
              </div>
              <p className="text-gray-500 text-sm mb-2">
                Cliquez ci-dessous pour afficher votre QR code complet
              </p>
            </div>

            <div className="space-y-3 mt-2">
              <Link to={ROUTES.BADGE} className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  <QrCode className="h-5 w-5 mr-2" />
                  Voir et télécharger mon E-Badge
                </Button>
              </Link>
              <Link to={ROUTES.BADGE_DIGITAL} className="block">
                <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50 py-3">
                  <Download className="h-4 w-4 mr-2" />
                  Badge numérique téléchargeable
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
              <span>Email : <strong>{user?.email}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
              <span>Niveau : <strong>Pass Gratuit</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl p-5 text-center shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 text-white font-bold text-base mb-1">
            <Star className="h-5 w-5" />
            Passez au niveau Standard ou VIP
          </div>
          <p className="text-yellow-100 text-sm mb-3">
            Accédez au networking, aux rendez-vous B2B, aux conférences et bien plus
          </p>
          <Link to={ROUTES.VISITOR_UPGRADE}>
            <Button className="bg-white text-amber-600 hover:bg-yellow-50 font-semibold px-6">
              Découvrir les offres Premium
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

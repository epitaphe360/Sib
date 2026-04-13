import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, X } from 'lucide-react';
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

export default memo(function VisitorDashboard() {
  const { t } = useTranslation();
  const ctx = useVisitorDashboard();

  if (ctx.isLoading) return <DashboardSkeleton />;

  if (!ctx.isAuthenticated || !ctx.user) {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md border border-sib-gray-100">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#C9A84C]/15 rounded-full flex items-center justify-center border border-[#C9A84C]/30">
              <Users className="h-10 w-10 text-[#C9A84C]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('visitor.unauthorized_access')}</h3>
            <p className="text-gray-600 mb-6">{t('visitor.please_login')}</p>
            <Link to={ROUTES.LOGIN}>
              <Button className="w-full bg-[#1B365D] hover:bg-[#0F2034] text-white">
                <Activity className="h-4 w-4 mr-2" />{t('nav.login')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sib-bg">
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

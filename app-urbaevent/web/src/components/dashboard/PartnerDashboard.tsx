import { AnimatePresence, motion } from 'framer-motion';
import { Shield, CreditCard, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ROUTES } from '../../lib/routes';
import { ErrorMessage, LoadingMessage } from '../common/ErrorMessage';
import PartnerProfileCreationModal from '../partner/PartnerProfileCreationModal';
import { usePartnerDashboard } from '../../hooks/usePartnerDashboard';
import {
  PartnerHeader,
  PartnerTabNav,
  PartnerOverviewTab,
  PartnerProfileTab,
  PartnerNetworkingTab,
  PartnerAnalyticsTab,
  PartnerRejectModal,
  PartnerScrapperModal,
  PartnerEditorModal,
} from './partner';
import { useTranslation } from '../../hooks/useTranslation';

export default function PartnerDashboard() {
  const ctx = usePartnerDashboard();
  const { t } = useTranslation();
  const { user } = ctx;

  if (user?.status === 'pending_payment') {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-10 text-center space-y-5">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center">
            <CreditCard className="h-7 w-7 text-warning-600 dark:text-warning-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t('partner.activation_required')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('partner.payment_validation_needed')}
          </p>
          <div className="pt-2 flex justify-center">
            <Link to="/partner/payment-selection">
              <Button variant="primary" size="lg">{t('partner.finalize_payment')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.type !== 'partner') {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-8">
          <div className="h-14 w-14 mx-auto mb-5 rounded-2xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-danger-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
            {t('partner.access_denied')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            {t('partner.reserved_partners')}
          </p>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="primary" size="md" className="w-full">
              {t('common.back_to_dashboard')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (ctx.isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
        <div className="max-w-container mx-auto text-center py-14">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 dark:border-neutral-800 border-t-primary-600 mx-auto mb-4" />
          <LoadingMessage message="Chargement du tableau de bord partenaire..." />
        </div>
      </div>
    );
  }

  if (!ctx.dashboard && ctx.dashboardError) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-8">
          <ErrorMessage message={ctx.dashboardError} />
          <Button variant="primary" size="md" onClick={() => ctx.fetchDashboard()} className="mt-5">
            <Activity className="h-4 w-4 mr-1.5" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <PartnerHeader
        user={user}
        partnerTier={ctx.partnerTier}
        isPublished={ctx.isPublished}
        isTogglingPublish={ctx.isTogglingPublish}
        onTogglePublish={ctx.togglePublished}
      />

      <div className="max-w-container mx-auto px-6 lg:px-8 pb-20">
        <PartnerTabNav activeTab={ctx.activeTab} onTabChange={ctx.setActiveTab} />

        <AnimatePresence mode="wait">
          <motion.div
            key={ctx.activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'circOut' }}
          >
            {ctx.activeTab === 'overview' && (
              <PartnerOverviewTab
                dashboardStats={ctx.dashboardStats}
                dashboard={ctx.dashboard}
                partnerTier={ctx.partnerTier}
                confirmedAppointments={ctx.confirmedAppointments}
              />
            )}
            {ctx.activeTab === 'profile' && (
              <PartnerProfileTab
                onOpenScrapper={() => ctx.setShowScrapperModal(true)}
                onOpenEditor={() => ctx.setShowEditorModal(true)}
              />
            )}
            {ctx.activeTab === 'networking' && (
              <PartnerNetworkingTab
                userId={user.id}
                pendingAppointments={ctx.pendingAppointments as any}
                confirmedCount={ctx.confirmedAppointments.length}
                processingId={ctx.processingAppointment}
                onAccept={ctx.handleAccept}
                onReject={ctx.handleReject}
              />
            )}
            {ctx.activeTab === 'analytics' && (
              <PartnerAnalyticsTab
                hasRealData={ctx.hasRealAnalyticsData}
                brandExposureData={ctx.brandExposureData as any}
                engagementChannelsData={ctx.engagementChannelsData}
                roiMetricsData={ctx.roiMetricsData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Modals ── */}
      {ctx.confirmRejectId && (
        <PartnerRejectModal
          appointmentId={ctx.confirmRejectId}
          onConfirm={ctx.doReject}
          onCancel={() => ctx.setConfirmRejectId(null)}
        />
      )}

      {user?.status === 'active' && (
        <PartnerProfileCreationModal
          isOpen={ctx.showProfileModal}
          onClose={() => ctx.setShowProfileModal(false)}
          onComplete={() => ctx.setShowProfileModal(false)}
        />
      )}

      {ctx.showScrapperModal && (
        <PartnerScrapperModal
          partnerId={user.id}
          onSuccess={() => { ctx.setShowScrapperModal(false); ctx.fetchDashboard(); }}
          onClose={() => ctx.setShowScrapperModal(false)}
        />
      )}

      {ctx.showEditorModal && (
        <PartnerEditorModal
          partnerId={user.id}
          onSave={() => { ctx.setShowEditorModal(false); ctx.fetchDashboard(); }}
          onClose={() => ctx.setShowEditorModal(false)}
        />
      )}
    </div>
  );
}

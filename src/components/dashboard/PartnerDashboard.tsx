import { AnimatePresence, motion } from 'framer-motion';
import { Shield, CreditCard, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
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
  PartnerEditorModal,
} from './partner';
import { useTranslation } from '../../hooks/useTranslation';

export default function PartnerDashboard() {
  const ctx = usePartnerDashboard();
  const { t } = useTranslation();
  const { user } = ctx;

  // ── Early returns (before render) ────────────────────────────────────────
  if (user?.status === 'pending_payment') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-[#C9A84C]/15 rounded-full flex items-center justify-center mb-6">
            <CreditCard className="w-12 h-12 text-[#C9A84C]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('partner.activation_required')}</h2>
          <p className="text-lg text-gray-600">{t('partner.payment_validation_needed')}</p>
          <div className="pt-4 flex justify-center gap-4">
            <Link to="/partner/payment-selection">
              <Button className="bg-[#1B365D] hover:bg-[#0F2034] text-white px-8 py-4 rounded-xl text-lg">
                {t('partner.finalize_payment')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.type !== 'partner') {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center p-4">
        <Card className="p-8 text-center bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#1B365D]/10 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-[#C9A84C]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('partner.access_denied')}</h2>
          <p className="text-gray-600 mb-6">{t('partner.reserved_partners')}</p>
          <Link to={ROUTES.DASHBOARD}>
            <Button className="w-full bg-[#1B365D] hover:bg-[#0F2034]">
              {t('common.back_to_dashboard')}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (ctx.isLoading) {
    return (
      <div className="min-h-screen bg-sib-bg p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B365D] mx-auto mb-4"></div>
          <LoadingMessage message="Chargement du tableau de bord partenaire..." />
        </div>
      </div>
    );
  }

  if (!ctx.dashboard && ctx.dashboardError) {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <ErrorMessage message={ctx.dashboardError} />
          <Button onClick={() => ctx.fetchDashboard()} className="mt-4 bg-[#1B365D] hover:bg-[#0F2034]">
            <Activity className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerHeader
        user={user}
        partnerTier={ctx.partnerTier}
        isPublished={ctx.isPublished}
        isTogglingPublish={ctx.isTogglingPublish}
        onTogglePublish={ctx.togglePublished}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, CreditCard, Activity, Calendar, Users, FileText, Crown, Handshake, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RentalBanner } from '../common/RentalBanner';
import ChapiteauBanner from '../common/ChapiteauBanner';
import AdvertisingBanner from '../common/AdvertisingBanner';
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
  PartnerServicesTab,
  PartnerRejectModal,
  PartnerEditorModal,
} from './partner';
import { useTranslation } from '../../hooks/useTranslation';
import { ExhibitorCalendarSection, ExhibitorActivitySection, ExhibitorScannedVisitors, ExhibitorQRModal } from './exhibitor';
import { QuotaSummaryCard } from '../common/QuotaWidget';
import { getPartnerQuota, type PartnerTier } from '../../config/partnerTiers';
import { PartnerQuickActions } from './partner';
import { DynamicBadge } from '../badge/DynamicBadge';
import { ProgrammeRegistrationsSection } from '../programme/ProgrammeRegistrationsSection';

export default function PartnerDashboard() {
  const ctx = usePartnerDashboard();
  const { t } = useTranslation();
  const { user } = ctx;
  const [calendarTab, setCalendarTab] = useState<'availability' | 'appointments'>('appointments');
  const [scansOpen, setScansOpen] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);

  const downloadQRCode = async () => {
    setIsDownloadingQR(true);
    try {
      const canvas = qrCodeRef.current as unknown as HTMLCanvasElement | null;
      if (canvas) {
        const link = document.createElement('a');
        const companyName = user?.profile?.company || 'partenaire';
        link.download = `qr-code-${companyName}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } finally {
      setIsDownloadingQR(false);
    }
  };

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

  if (user?.type !== 'partner') {
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
          <LoadingMessage message="Chargement du tableau de bord sponsor..." />
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
        <div className="pt-6">
          <RentalBanner variant="compact" to="/partner/rental" />
          <div className="mt-4">
            <ChapiteauBanner variant="compact" to={ROUTES.PARTNER_CHAPITEAU} />
          </div>
          <div className="mt-4">
            <AdvertisingBanner variant="compact" to={ROUTES.PARTNER_ADVERTISING} />
          </div>
        </div>

        {/* Bannière RDV en attente */}
        {ctx.pendingAppointments.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-sm">
                  {ctx.pendingAppointments.length} rendez-vous en attente de confirmation
                </p>
                <p className="text-xs text-amber-700">Allez dans l'onglet Networking pour les traiter</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid — toujours visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Vues du profil', value: ctx.dashboardStats?.profileViews?.value?.toLocaleString() || '0', growth: ctx.dashboardStats?.profileViews?.growth || '--', growthType: ctx.dashboardStats?.profileViews?.growthType || 'neutral', Icon: Crown },
            { label: 'Connexions', value: ctx.dashboardStats?.connections?.value?.toString() || '0', growth: ctx.dashboardStats?.connections?.growth || '--', growthType: ctx.dashboardStats?.connections?.growthType || 'neutral', Icon: Handshake },
            { label: 'Rendez-vous', value: ctx.dashboardStats?.appointments?.value?.toString() || '0', growth: ctx.dashboardStats?.appointments?.growth || '--', growthType: ctx.dashboardStats?.appointments?.growthType || 'neutral', Icon: Calendar },
            { label: 'Messages', value: ctx.dashboardStats?.messages?.value?.toString() || '0', growth: ctx.dashboardStats?.messages?.growth || '--', growthType: ctx.dashboardStats?.messages?.growthType || 'neutral', Icon: Zap },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-[#1B365D]/8 rounded-xl group-hover:scale-110 transition-transform">
                  <stat.Icon className="h-5 w-5 text-[#1B365D]" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.growthType === 'positive' ? 'bg-green-100 text-green-700' : stat.growthType === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{stat.growth}</span>
              </div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quotas — toujours visible */}
        <div className="mb-8">
          <QuotaSummaryCard
            title="Mes quotas partenaire"
            level={ctx.partnerTier}
            type="partner"
            quotas={[
              { label: 'Rendez-vous B2B', current: ctx.confirmedAppointments.length, limit: getPartnerQuota(ctx.partnerTier as PartnerTier, 'appointments'), icon: <Calendar className="h-4 w-4" /> },
              { label: 'Membres équipe', current: 0, limit: getPartnerQuota(ctx.partnerTier as PartnerTier, 'teamMembers'), icon: <Users className="h-4 w-4" /> },
              { label: 'Médias uploadés', current: ctx.dashboardStats?.catalogDownloads?.value || 0, limit: getPartnerQuota(ctx.partnerTier as PartnerTier, 'mediaUploads'), icon: <FileText className="h-4 w-4" /> },
            ]}
          />
        </div>

        <ExhibitorCalendarSection
          userId={user.id}
          activeTab={calendarTab}
          onTabChange={setCalendarTab}
        />

        <PartnerQuickActions onOpenBadge={() => setShowBadgeModal(true)} onOpenQR={() => setShowQRModal(true)} />

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
              <PartnerOverviewTab />
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
            {ctx.activeTab === 'services' && (
              <PartnerServicesTab />
            )}
          </motion.div>
        </AnimatePresence>

        <ExhibitorActivitySection
          activities={(ctx.dashboard?.recentActivity ?? []).map((a: any) => ({ ...a, timestamp: a.timestamp instanceof Date ? a.timestamp.toISOString() : a.timestamp }))}
          onViewAll={() => {}}
        />

        <ExhibitorScannedVisitors
          isExpanded={scansOpen}
          onToggle={() => setScansOpen(v => !v)}
        />

        {/* Mes sessions du programme — visible depuis tous les onglets */}
        <ProgrammeRegistrationsSection accent="amber" />

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

      {showQRModal && (
        <ExhibitorQRModal
          user={user}
          qrCodeRef={qrCodeRef}
          isDownloadingQR={isDownloadingQR}
          onDownload={downloadQRCode}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {showBadgeModal && (
        <DynamicBadge user={user} onClose={() => setShowBadgeModal(false)} />
      )}
    </div>
  );
}

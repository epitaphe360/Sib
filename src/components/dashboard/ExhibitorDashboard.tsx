import React, { memo } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Users, FileText, Award, Scan } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

import { useExhibitorDashboard } from '../../hooks/useExhibitorDashboard';
import {
  ExhibitorHeader,
  ExhibitorStatsGrid,
  ExhibitorCalendarSection,
  ExhibitorAnalyticsSection,
  ExhibitorQuickActions,
  ExhibitorAppointmentSection,
  ExhibitorActivitySection,
  ExhibitorInfoSection,
  ExhibitorQRModal,
  ExhibitorRejectModal,
  ExhibitorGenericModal,
} from './exhibitor';

import { Button } from '../ui/Button';
import { DashboardSkeleton } from '../ui/Skeleton';
import { ErrorMessage } from '../common/ErrorMessage';
import { QuotaSummaryCard } from '../common/QuotaWidget';
import { MiniSiteSetupModal } from '../exhibitor/MiniSiteSetupModal';
import ExhibitorMiniSiteScrapper from '../exhibitor/ExhibitorMiniSiteScrapper';
import { ROUTES } from '../../lib/routes';
import { getExhibitorQuota } from '../../config/exhibitorQuotas';
import { useTranslation } from '../../hooks/useTranslation';

export default memo(function ExhibitorDashboard() {
  const { t } = useTranslation();
  const ctx = useExhibitorDashboard();

  if (ctx.user?.status === 'pending') {
    return <Navigate to={ROUTES.PENDING_ACCOUNT} replace />;
  }

  if (ctx.isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <ExhibitorHeader
        user={ctx.user}
        isPublished={ctx.isPublished}
        isTogglingPublish={ctx.isTogglingPublish}
        exhibitorLevel={ctx.exhibitorLevel}
        onTogglePublish={ctx.togglePublished}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-6">

        {(ctx.error || ctx.dashboardError) && (
          <ErrorMessage
            message={ctx.error || ctx.dashboardError || 'Une erreur est survenue'}
            onDismiss={() => ctx.setError(null)}
          />
        )}

        {ctx.pendingAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-sm">
                  {ctx.pendingAppointments.length}{' '}
                  {ctx.pendingAppointments.length === 1
                    ? t('exhibitor.alert_pending_singular')
                    : t('exhibitor.alert_pending_plural')}
                </p>
                <p className="text-xs text-amber-700">{t('exhibitor.alert_pending_hint')}</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0"
              onClick={() => document.getElementById('appointments-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('exhibitor.alert_pending_cta')} →
            </Button>
          </motion.div>
        )}

        <div className="mb-8">
          <QuotaSummaryCard
            title={t('dashboard.exhibitor_quotas')}
            level={ctx.exhibitorLevel}
            type="exhibitor"
            quotas={[
              {
                label: t('exhibitor.quota_b2b'),
                current: ctx.confirmedAppointments.length,
                limit: getExhibitorQuota(ctx.exhibitorLevel, 'appointments'),
                icon: <Calendar className="h-4 w-4 text-gray-400" />,
              },
              {
                label: t('exhibitor.quota_team'),
                current: 0,
                limit: getExhibitorQuota(ctx.exhibitorLevel, 'teamMembers'),
                icon: <Users className="h-4 w-4 text-gray-400" />,
              },
              {
                label: t('exhibitor.quota_demo'),
                current: 0,
                limit: getExhibitorQuota(ctx.exhibitorLevel, 'demoSessions'),
                icon: <Award className="h-4 w-4 text-gray-400" />,
              },
              {
                label: t('exhibitor.quota_scans'),
                current: 0,
                limit: getExhibitorQuota(ctx.exhibitorLevel, 'leadScans'),
                icon: <Scan className="h-4 w-4 text-gray-400" />,
              },
              {
                label: t('exhibitor.quota_media'),
                current: ctx.dashboardStats?.catalogDownloads?.value || 0,
                limit: getExhibitorQuota(ctx.exhibitorLevel, 'mediaUploads'),
                icon: <FileText className="h-4 w-4 text-gray-400" />,
              },
            ]}
            upgradeLink={undefined}
          />
        </div>

        <ExhibitorStatsGrid
          dashboardStats={ctx.dashboardStats}
          onStatClick={ctx.handleStatClick}
        />

        <ExhibitorCalendarSection
          userId={ctx.user?.id || ''}
          activeTab={ctx.activeTab}
          onTabChange={ctx.setActiveTab}
        />

        <ExhibitorAnalyticsSection
          hasRealData={ctx.hasRealData}
          visitorEngagementData={ctx.visitorEngagementData}
          appointmentStatusData={ctx.appointmentStatusData}
          activityBreakdownData={ctx.activityBreakdownData}
          receivedAppointments={ctx.receivedAppointments}
          confirmedAppointments={ctx.confirmedAppointments}
          miniSiteViews={ctx.dashboardStats?.miniSiteViews?.value || 0}
          predictions={ctx.predictions}
        />

        <ExhibitorQuickActions
          onOpenScrapper={() => ctx.setShowMiniSiteScrapper(true)}
          onOpenQR={() => ctx.setShowQRModal(true)}
        />

        <ExhibitorAppointmentSection
          upcomingAppointments={ctx.upcomingAppointments}
          pastAppointments={ctx.pastAppointments}
          cancelledAppointments={ctx.cancelledAppointments}
          isAppointmentsLoading={ctx.isAppointmentsLoading}
          processingAppointment={ctx.processingAppointment}
          onAccept={ctx.handleAccept}
          onReject={ctx.handleReject}
        />

        <ExhibitorActivitySection
          activities={ctx.dashboard?.recentActivity || []}
          onViewAll={ctx.handleViewAllActivities}
        />

        <ExhibitorInfoSection />

      </div>

      {ctx.showQRModal && (
        <ExhibitorQRModal
          user={ctx.user}
          qrCodeRef={ctx.qrCodeRef as React.RefObject<InstanceType<typeof QRCode>>}
          isDownloadingQR={ctx.isDownloadingQR}
          onDownload={ctx.downloadQRCode}
          onClose={() => ctx.setShowQRModal(false)}
        />
      )}

      {ctx.modal && (
        <ExhibitorGenericModal
          title={ctx.modal.title}
          content={ctx.modal.content}
          onClose={() => ctx.setModal(null)}
        />
      )}

      {ctx.confirmRejectId && (
        <ExhibitorRejectModal
          onConfirm={() => ctx.doReject(ctx.confirmRejectId!)}
          onCancel={() => ctx.setConfirmRejectId(null)}
        />
      )}

      {ctx.user?.id && (
        <MiniSiteSetupModal
          isOpen={ctx.showMiniSiteSetup}
          onClose={() => ctx.setShowMiniSiteSetup(false)}
          userId={ctx.user.id}
        />
      )}

      {ctx.showMiniSiteScrapper && ctx.user?.id && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Mini-Site with AI</h2>
                  <p className="text-sm text-gray-600">Automatically generate your mini-site from your website</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => ctx.setShowMiniSiteScrapper(false)} className="rounded-full">
                ✕
              </Button>
            </div>
            <div className="p-6">
              <ExhibitorMiniSiteScrapper
                exhibitorId={ctx.user.id}
                userId={ctx.user.id}
                onSuccess={() => {
                  ctx.setShowMiniSiteScrapper(false);
                  ctx.fetchDashboard();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
});

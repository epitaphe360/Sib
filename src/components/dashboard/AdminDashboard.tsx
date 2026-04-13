import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ROUTES } from '../../lib/routes';
import RegistrationRequests from '../admin/RegistrationRequests';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import {
  AdminHeader,
  AdminActionsPanel,
  AdminMetricsGrid,
  AdminChartsSection,
  SystemHealthPanel,
  ActivityFeed,
} from './admin';

export default function AdminDashboard() {
  const ctx = useAdminDashboard();
  const { user, t, isLoading, error, fetchMetrics, adminMetrics } = ctx;

  // ── Early returns ─────────────────────────────────────────────────────────
  if (!user || user.type !== 'admin') {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-[#1B365D]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-[#1B365D]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0F2034] mb-2">{t('dashboard.restricted_access')}</h2>
          <p className="text-sib-gray-500 mb-6">{t('dashboard.restricted_message')}</p>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="default" className="bg-[#1B365D] hover:bg-[#0F2034]">{t('dashboard.back_to_dashboard')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sib-bg p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-40 bg-[#1B365D]/10 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={`sk-${i}`} className="h-28 bg-sib-gray-100 rounded-xl" />)}
          </div>
          <div className="h-56 bg-sib-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-[#C9A84C] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#0F2034] mb-2">{t('dashboard.metrics_error')}</h2>
          <p className="text-sib-gray-500 mb-6">{error}</p>
          <Button variant="default" className="bg-[#1B365D] hover:bg-[#0F2034]" onClick={() => fetchMetrics()}>
            {t('dashboard.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <AdminHeader
          user={user}
          adminMetrics={adminMetrics as any}
          isLoading={isLoading}
          onRefresh={fetchMetrics}
          t={t}
        />

        <AdminActionsPanel
          adminMetrics={adminMetrics as any}
          showRegistrationRequests={ctx.showRegistrationRequests}
          onToggleRegistrationRequests={() => ctx.setShowRegistrationRequests(v => !v)}
          t={t}
        />

        {ctx.showRegistrationRequests && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <span className="text-white font-bold text-sm">{t('admin.registration_requests')}</span>
              </div>
              <div className="p-6">
                <RegistrationRequests />
              </div>
            </div>
          </motion.div>
        )}

        <AdminMetricsGrid adminMetrics={adminMetrics as any} t={t} />

        <AdminChartsSection
          userGrowthData={ctx.userGrowthData}
          activityData={ctx.activityData}
          trafficData={ctx.trafficData}
          userTypeDistribution={ctx.userTypeDistribution}
          hasActivityData={ctx.hasActivityData}
          isLoading={isLoading}
        />

        {/* Santé + Activité côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <SystemHealthPanel healthItems={ctx.systemHealth as any} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <ActivityFeed activities={ctx.recentAdminActivity as any} formatDate={ctx.formatDate} />
          </motion.div>
        </div>

        {/* Métriques détaillées — navy sobre */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-4">
          <div className="bg-[#0F2034] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30">
                <BarChart3 className="h-6 w-6 text-[#C9A84C]" />
              </div>
              <div>
                <h3 className="text-white font-heading font-bold">{t('admin.detailed_metrics')}</h3>
                <p className="text-slate-400 text-sm">{t('admin.detailed_metrics_desc')}</p>
              </div>
            </div>
            <Link to={ROUTES.METRICS}>
              <Button
                variant="outline"
                className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 bg-transparent whitespace-nowrap"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('admin.full_metrics')}
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}



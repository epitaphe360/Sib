import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ROUTES } from '../../lib/routes';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import {
  AdminHeader,
  AdminActionsPanel,
  AdminMetricsGrid,
  AdminChartsSection,
  SystemHealthPanel,
  ActivityFeed,
  AdminNavVisibility,
} from './admin';

export default function AdminDashboard() {
  const ctx = useAdminDashboard();
  const { user, t, isLoading, error, fetchMetrics, adminMetrics } = ctx;

  // ── Early returns ─────────────────────────────────────────────────────────
  if (!user || user.type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-indigo-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-indigo-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.restricted_access')}</h2>
          <p className="text-gray-500 mb-6">{t('dashboard.restricted_message')}</p>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="default" className="bg-indigo-700 hover:bg-indigo-800">{t('dashboard.back_to_dashboard')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-40 bg-indigo-100 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={`sk-${i}`} className="h-28 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="h-56 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.metrics_error')}</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button variant="default" className="bg-indigo-700 hover:bg-indigo-800" onClick={() => fetchMetrics()}>
            {t('dashboard.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <AdminHeader
          user={user}
          adminMetrics={adminMetrics as any}
          isLoading={isLoading}
          onRefresh={fetchMetrics}
          t={t}
        />

        {/* Premium section divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-8 flex items-center gap-4 origin-left"
        >
          <div className="w-2 h-2 rounded bg-indigo-400" />
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent" />
        </motion.div>

        <AdminActionsPanel
          adminMetrics={adminMetrics as any}
          showRegistrationRequests={ctx.showRegistrationRequests}
          onToggleRegistrationRequests={() => ctx.setShowRegistrationRequests(v => !v)}
          t={t}
        />

        <AdminNavVisibility />

        {/* Premium section divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-8 flex items-center gap-4 origin-left"
        >
          <div className="w-2 h-2 rounded bg-indigo-400" />
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent" />
        </motion.div>

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
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: 0.05 }}>
            <SystemHealthPanel healthItems={ctx.systemHealth as any} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: 0.1 }}>
            <ActivityFeed activities={ctx.recentAdminActivity as any} formatDate={ctx.formatDate} />
          </motion.div>
        </div>

        {/* Métriques détaillées — navy sobre */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4 }} className="mb-4">
          <div className="rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/15 border border-white/25">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-heading font-bold">{t('admin.detailed_metrics')}</h3>
                <p className="text-white/70 text-sm">{t('admin.detailed_metrics_desc')}</p>
              </div>
            </div>
            <Link to={ROUTES.METRICS}>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-indigo-700 bg-transparent whitespace-nowrap"
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



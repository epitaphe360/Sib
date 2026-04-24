import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, BarChart3 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ROUTES } from '../../lib/routes';
import RegistrationRequests from '../admin/RegistrationRequests';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import {
  AdminHeader,
  AdminAlertsSection,
  AdminMetricsGrid,
  AdminChartsSection,
  AdminQuickActions,
  SystemHealthPanel,
  ActivityFeed,
} from './admin';

export default function AdminDashboard() {
  const ctx = useAdminDashboard();
  const { user, t, isLoading, error, fetchMetrics, adminMetrics } = ctx;

  if (!user || user.type !== 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm">
          <div className="h-14 w-14 mx-auto mb-5 rounded-2xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-danger-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
            {t('dashboard.restricted_access')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            {t('dashboard.restricted_message')}
          </p>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="primary" size="md">{t('dashboard.back_to_dashboard')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
        <div className="max-w-container mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={`sk-${i}`} className="h-32 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm">
          <div className="h-14 w-14 mx-auto mb-5 rounded-2xl bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-warning-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
            {t('dashboard.metrics_error')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">{error}</p>
          <Button variant="primary" size="md" onClick={() => fetchMetrics()}>
            {t('dashboard.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-container mx-auto px-6 lg:px-8 py-10">
        <AdminHeader
          user={user}
          adminMetrics={adminMetrics as any}
          isLoading={isLoading}
          onRefresh={fetchMetrics}
          t={t}
        />

        <AdminAlertsSection
          adminMetrics={adminMetrics as any}
          showRegistrationRequests={ctx.showRegistrationRequests}
          onToggleRegistrationRequests={() => ctx.setShowRegistrationRequests((v) => !v)}
          t={t}
        />

        {ctx.showRegistrationRequests && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <RegistrationRequests />
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

        <AdminQuickActions adminMetrics={adminMetrics as any} t={t} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <SystemHealthPanel healthItems={ctx.systemHealth as any} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <ActivityFeed activities={ctx.recentAdminActivity as any} formatDate={ctx.formatDate} />
        </motion.div>

        {/* Detailed metrics CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-10 relative overflow-hidden rounded-2xl p-10 bg-gradient-to-br from-primary-900 to-primary-700 border border-primary-800"
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto text-white">
            <div className="h-14 w-14 mx-auto mb-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-accent-500" />
            </div>
            <div className="sib-kicker mb-3 justify-center !text-accent-500">Admin</div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-3 tracking-tight">
              {t('admin.detailed_metrics')}
            </h3>
            <p className="text-white/80 mb-8 leading-relaxed">{t('admin.detailed_metrics_desc')}</p>

            <div className="flex items-center justify-center flex-wrap gap-3">
              <Link to={ROUTES.METRICS}>
                <Button variant="accent" size="lg">
                  <BarChart3 className="mr-1 h-4 w-4" />
                  {t('admin.full_metrics')}
                </Button>
              </Link>
              <Badge variant="error" size="md" dot>
                <Shield className="h-3 w-3 mr-1" />
                {t('admin.admin_access_only')}
              </Badge>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, BarChart3, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
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

  // ── Early returns ─────────────────────────────────────────────────────────
  if (!user || user.type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.restricted_access')}</h2>
          <p className="text-gray-600 mb-4">{t('dashboard.restricted_message')}</p>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="default">{t('dashboard.back_to_dashboard')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={`sk-${i}`} className="h-32 bg-gray-200 rounded-lg"></div>)}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.metrics_error')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="default" onClick={() => fetchMetrics()}>{t('dashboard.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
          onToggleRegistrationRequests={() => ctx.setShowRegistrationRequests(v => !v)}
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

        {/* System Health */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mb-8">
          <SystemHealthPanel healthItems={ctx.systemHealth as any} />
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <ActivityFeed
            activities={ctx.recentAdminActivity as any}
            formatDate={ctx.formatDate}
          />
        </motion.div>

        {/* Metrics link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="mt-8">
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <div className="p-8 text-center">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.detailed_metrics')}</h3>
              <p className="text-gray-600 mb-6">{t('admin.detailed_metrics_desc')}</p>
              <div className="flex items-center justify-center space-x-4">
                <Link to={ROUTES.METRICS}>
                  <Button variant="default" size="lg" className="bg-red-600 hover:bg-red-700">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {t('admin.full_metrics')}
                  </Button>
                </Link>
                <Badge variant="error" size="sm">
                  <Shield className="h-3 w-3 mr-1" />
                  {t('admin.admin_access_only')}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}

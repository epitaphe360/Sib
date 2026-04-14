import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { LineChartCard, BarChartCard, PieChartCard } from '../charts';
import { useTranslation } from '../../../hooks/useTranslation';

interface ChartItem { name: string; value: number; color?: string; }

interface AdminChartsSectionProps {
  userGrowthData: Record<string, unknown>[];
  activityData: ChartItem[];
  trafficData: Record<string, unknown>[];
  userTypeDistribution: ChartItem[];
  hasActivityData: boolean;
  isLoading: boolean;
}

export function AdminChartsSection({
  userGrowthData, activityData, trafficData, userTypeDistribution, hasActivityData, isLoading
}: AdminChartsSectionProps) {
  const { t } = useTranslation();
  const hasTrafficData = trafficData.some(d => d.visits > 0 || d.pageViews > 0);
  return (
    <div className="mb-8 space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">{t('admin.analytics_trends')}</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TrendingUp className="h-4 w-4" />
          <span>{t('admin.realtime_data')}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
      >
        <LineChartCard
          title={t('admin.user_growth')}
          data={userGrowthData}
          dataKeys={[
            { key: 'users', color: '#3b82f6', name: t('admin.total_users_chart') },
            { key: 'exhibitors', color: '#10b981', name: t('admin.exhibitors') },
            { key: 'visitors', color: '#8b5cf6', name: t('admin.visitors') },
          ]}
          height={350}
          showArea={true}
          loading={isLoading}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PieChartCard
            title={t('admin.user_distribution')}
            data={userTypeDistribution}
            colors={userTypeDistribution.map(d => d.color || '#cbd5e1')}
            height={320}
            loading={isLoading}
            showPercentage={true}
          />
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BarChartCard
            title={t('admin.platform_activity')}
            data={activityData}
            dataKey="value"
            colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
            height={320}
            loading={isLoading}
          />
          {!hasActivityData && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl">
              <BarChart3 className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">{t('exhibitor.analytics_no_activity')}</p>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <LineChartCard
          title={t('admin.weekly_traffic')}
          data={trafficData}
          dataKeys={[
            { key: 'visits', color: '#3b82f6', name: t('admin.chart_visits') },
            { key: 'pageViews', color: '#10b981', name: t('admin.chart_pageviews') },
          ]}
          height={300}
          loading={isLoading}
        />
      </motion.div>
    </div>
  );
}

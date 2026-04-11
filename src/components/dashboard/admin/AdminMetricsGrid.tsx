import { motion } from 'framer-motion';
import { Users, Building2, Award, UserCheck } from 'lucide-react';

interface AdminMetricsGridProps {
  adminMetrics: Record<string, number | unknown>;
  t: (key: string, params?: Record<string, unknown>) => string;
}

export function AdminMetricsGrid({ adminMetrics: m, t }: AdminMetricsGridProps) {
  const metrics = m as any;
  const cards = [
    {
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      Icon: Users,
      value: metrics.totalUsers?.toLocaleString() ?? '0',
      label: t('admin.total_users'),
      sub: t('admin.active_users_count', { count: metrics.activeUsers?.toLocaleString() ?? '0' }),
      badge: '+8%',
      delay: 0.2,
    },
    {
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      Icon: Building2,
      value: metrics.totalExhibitors ?? 0,
      label: t('admin.exhibitors'),
      sub: `${metrics.onlineExhibitors || 0} ${t('admin.online')}`,
      badge: null,
      delay: 0.3,
    },
    {
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
      Icon: Award,
      value: metrics.totalPartners ?? 0,
      label: t('admin.partners'),
      sub: null,
      badge: null,
      delay: 0.4,
    },
    {
      gradient: 'from-cyan-500 via-sky-600 to-blue-600',
      Icon: UserCheck,
      value: metrics.totalVisitors?.toLocaleString() ?? '0',
      label: t('admin.visitors'),
      sub: `${metrics.activeUsers?.toLocaleString() ?? '0'} ${t('admin.online')}`,
      badge: null,
      delay: 0.5,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.platform_statistics')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ gradient, Icon, value, label, sub, badge, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5 }}
          >
            <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {badge && <div className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full">{badge}</div>}
                </div>
                <div className="text-4xl font-bold text-white mb-2">{value}</div>
                <div className="text-sm font-medium opacity-80 text-white">{label}</div>
                <div className="mt-4 flex items-center text-xs opacity-80 text-white">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  {sub}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

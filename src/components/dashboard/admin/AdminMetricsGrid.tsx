import { motion } from 'framer-motion';
import { Users, Building2, Award, UserCheck, TrendingUp, ArrowUpRight } from 'lucide-react';

interface AdminMetricsGridProps {
  adminMetrics: Record<string, number | unknown>;
  t: (key: string, params?: Record<string, unknown>) => string;
}

export function AdminMetricsGrid({ adminMetrics: m, t }: AdminMetricsGridProps) {
  const metrics = m as any;

  const cards = [
    {
      Icon: Users,
      value: metrics.totalUsers?.toLocaleString() ?? '0',
      label: t('admin.total_users'),
      sub: `${metrics.activeUsers?.toLocaleString() ?? '0'} actifs`,
      trend: '+12%',
      gradient: 'from-blue-500 to-blue-700',
      lightBg: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600',
      delay: 0.1,
    },
    {
      Icon: Building2,
      value: String(metrics.totalExhibitors ?? 0),
      label: t('admin.exhibitors'),
      sub: `${metrics.onlineExhibitors || 0} en ligne`,
      trend: '+5%',
      gradient: 'from-amber-400 to-amber-600',
      lightBg: 'from-amber-50 to-orange-100',
      iconBg: 'bg-amber-500',
      textColor: 'text-amber-600',
      delay: 0.2,
    },
    {
      Icon: Award,
      value: String(metrics.totalPartners ?? 0),
      label: t('admin.partners'),
      sub: 'Partenaires actifs',
      trend: '+3%',
      gradient: 'from-emerald-500 to-emerald-700',
      lightBg: 'from-emerald-50 to-green-100',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      delay: 0.3,
    },
    {
      Icon: UserCheck,
      value: metrics.totalVisitors?.toLocaleString() ?? '0',
      label: t('admin.visitors'),
      sub: `${metrics.activeUsers?.toLocaleString() ?? '0'} en ligne`,
      trend: '+18%',
      gradient: 'from-purple-500 to-purple-700',
      lightBg: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-600',
      delay: 0.4,
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t('admin.platform_statistics')}
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Temps réel
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ Icon, value, label, sub, trend, gradient, lightBg, iconBg, textColor, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.4, type: 'spring', stiffness: 120 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
          >
            {/* Fond dégradé léger */}
            <div className={`absolute inset-0 bg-gradient-to-br ${lightBg} opacity-60`} />

            {/* Cercle décoratif fond */}
            <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />

            <div className="relative p-5 border border-white rounded-2xl bg-white/70 backdrop-blur-sm h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className={`p-2.5 rounded-xl ${iconBg} shadow-md`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </motion.div>
                <span className={`flex items-center gap-0.5 text-xs font-bold ${textColor} bg-white rounded-full px-2 py-0.5 shadow-sm`}>
                  <ArrowUpRight className="h-3 w-3" />
                  {trend}
                </span>
              </div>

              {/* Valeur animée */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
                className="text-3xl font-black text-gray-900 mb-1 font-mono"
              >
                {value}
              </motion.div>
              <div className="text-sm font-bold text-gray-700 mb-2">{label}</div>

              {/* Barre de progression décorative */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ delay: delay + 0.3, duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

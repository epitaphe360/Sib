import { Eye, Calendar, Download, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDashboardStats } from '../../../hooks/useDashboardStats';

type DashboardStats = ReturnType<typeof useDashboardStats>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface ExhibitorStatsGridProps {
  dashboardStats: DashboardStats | null;
  onStatClick: (type: string) => void;
}

export function ExhibitorStatsGrid({ dashboardStats, onStatClick }: ExhibitorStatsGridProps) {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('exhibitor.stats.mini_site_views'),
      value: dashboardStats?.miniSiteViews?.value?.toLocaleString?.() || '0',
      icon: Eye,
      change: dashboardStats?.miniSiteViews?.growth || '--',
      changeType: dashboardStats?.miniSiteViews?.growthType || 'neutral',
      type: 'miniSiteViews',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: t('exhibitor.stats_requests'),
      value: dashboardStats?.appointments?.value?.toString() || '0',
      icon: Calendar,
      change: dashboardStats?.appointments?.growth || '--',
      changeType: dashboardStats?.appointments?.growthType || 'neutral',
      type: 'appointments',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: t('exhibitor.stats_downloads'),
      value: dashboardStats?.catalogDownloads?.value?.toString() || '0',
      icon: Download,
      change: dashboardStats?.catalogDownloads?.growth || '--',
      changeType: dashboardStats?.catalogDownloads?.growthType || 'neutral',
      type: 'downloads',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: t('exhibitor.stats_messages'),
      value: dashboardStats?.messages?.value?.toString() || '0',
      icon: MessageSquare,
      change: dashboardStats?.messages?.growth || '--',
      changeType: dashboardStats?.messages?.growthType || 'neutral',
      type: 'messages',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.title}
          variants={itemVariants}
          className="cursor-pointer"
          onClick={() => onStatClick(stat.type)}
        >
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-current group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  stat.changeType === 'positive'
                    ? 'bg-green-100 text-green-800'
                    : stat.changeType === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {stat.change}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

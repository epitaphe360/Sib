import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Globe,
  Target,
  Activity,
  Eye,
  MessageCircle,
  Handshake,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { AdminMetricsService } from '../../services/adminMetrics';
import { PavilionMetricsService } from '../../services/pavilionMetrics';
import { useTranslation } from '../../hooks/useTranslation';

interface MetricCard {
  title: string;
  value: string;
  target: string;
  progress: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}

interface PavilionMetric {
  name: string;
  exhibitors: number;
  visitors: number;
  conferences: number;
  satisfaction: number;
  color: string;
}

export default function MetricsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 0,
    onlineExhibitors: 0,
    scheduledMeetings: 0,
    messagesExchanged: 0
  });

  const [adminMetrics, setAdminMetrics] = useState({
    totalUsers: 0,
    totalExhibitors: 0,
    totalVisitors: 0,
    totalEvents: 0,
    totalAppointments: 0,
    totalMessages: 0,
    totalConnections: 0,
    totalDownloads: 0
  });

  const [pavilionData, setPavilionData] = useState({
    totalExhibitors: 0,
    totalVisitors: 0,
    totalConferences: 0,
    countries: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Load admin metrics
        const adminData = await AdminMetricsService.getMetrics();
        setAdminMetrics({
          totalUsers: adminData.totalUsers,
          totalExhibitors: adminData.totalExhibitors,
          totalVisitors: adminData.totalVisitors,
          totalEvents: adminData.totalEvents,
          totalAppointments: adminData.totalAppointments,
          totalMessages: adminData.totalMessages,
          totalConnections: adminData.totalConnections,
          totalDownloads: adminData.totalDownloads
        });

        // Load pavilion metrics
        const pavilionData = await PavilionMetricsService.getMetrics();
        setPavilionData({
          totalExhibitors: pavilionData.totalExhibitors,
          totalVisitors: pavilionData.totalVisitors,
          totalConferences: pavilionData.totalConferences,
          countries: pavilionData.countries
        });

        // Load real-time metrics from database
        setRealTimeMetrics({
          activeUsers: adminData.totalUsers, // Total utilisateurs inscrits
          onlineExhibitors: adminData.totalExhibitors, // Total exposants inscrits
          scheduledMeetings: adminData.totalAppointments, // Total rendez-vous
          messagesExchanged: adminData.totalMessages // Total messages
        });
      } catch (error) {
        console.error('Erreur lors du chargement des métriques:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  // Rediriger si l'utilisateur n'est pas admin
  if (user?.type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('metrics.restricted_title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('metrics.restricted_desc')}
          </p>
          <Link to={ROUTES.ADMIN_DASHBOARD}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('metrics.back_dashboard')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const keyMetrics: MetricCard[] = [
    {
      title: t('metrics.key_exhibitors'),
      value: loading ? '...' : adminMetrics.totalExhibitors.toString(),
      target: '600+',
      progress: loading ? 0 : Math.round((adminMetrics.totalExhibitors / 600) * 100),
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up',
      trendValue: '+10%'
    },
    {
      title: t('metrics.key_visitors'),
      value: loading ? '...' : pavilionData.totalVisitors.toLocaleString(),
      target: '200 000+',
      progress: loading ? 0 : Math.round((pavilionData.totalVisitors / 200000) * 100),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'up',
      trendValue: '+5%'
    },
    {
      title: t('metrics.key_conferences'),
      value: loading ? '...' : pavilionData.totalConferences.toString(),
      target: '20+',
      progress: loading ? 0 : Math.round((pavilionData.totalConferences / 20) * 100),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'up',
      trendValue: '+33%'
    },
    {
      title: t('metrics.key_countries'),
      value: loading ? '...' : pavilionData.countries.toString(),
      target: '40',
      progress: loading ? 0 : Math.round((pavilionData.countries / 40) * 100),
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: 'up',
      trendValue: '+5%'
    }
  ];

  // Fonction pour calculer la performance globale d'un pavillon
  const getPerformanceLevel = (pavilion: PavilionMetric): { label: string, variant: 'success' | 'warning' | 'error' | 'default' } => {
    const totalScore = pavilion.exhibitors + Math.floor(pavilion.visitors / 10) + pavilion.conferences;

    if (totalScore >= 25) {
      return { label: t('metrics.perf_excellent'), variant: 'success' };
    } else if (totalScore >= 15) {
      return { label: t('metrics.perf_good'), variant: 'warning' };
    } else if (totalScore >= 5) {
      return { label: t('metrics.perf_average'), variant: 'default' };
    } else {
      return { label: t('metrics.perf_low'), variant: 'error' };
    }
  };

  const pavilionMetrics: PavilionMetric[] = [
    {
      name: t('metrics.pav_institutional'),
      exhibitors: loading ? 0 : Math.round(pavilionData.totalExhibitors * 0.25),
      visitors: loading ? 0 : Math.round(pavilionData.totalVisitors * 0.25),
      conferences: loading ? 0 : Math.round(pavilionData.totalConferences * 0.25),
      satisfaction: 0,
      color: 'bg-purple-500'
    },
    {
      name: t('metrics.pav_industry'),
      exhibitors: loading ? 0 : Math.round(pavilionData.totalExhibitors * 0.30),
      visitors: loading ? 0 : Math.round(pavilionData.totalVisitors * 0.30),
      conferences: loading ? 0 : Math.round(pavilionData.totalConferences * 0.20),
      satisfaction: 0,
      color: 'bg-blue-500'
    },
    {
      name: t('metrics.pav_performance'),
      exhibitors: loading ? 0 : Math.round(pavilionData.totalExhibitors * 0.20),
      visitors: loading ? 0 : Math.round(pavilionData.totalVisitors * 0.20),
      conferences: loading ? 0 : Math.round(pavilionData.totalConferences * 0.15),
      satisfaction: 0,
      color: 'bg-green-500'
    },
    {
      name: t('metrics.pav_academic'),
      exhibitors: loading ? 0 : Math.round(pavilionData.totalExhibitors * 0.15),
      visitors: loading ? 0 : Math.round(pavilionData.totalVisitors * 0.15),
      conferences: loading ? 0 : Math.round(pavilionData.totalConferences * 0.25),
      satisfaction: 0,
      color: 'bg-orange-500'
    },
    {
      name: t('metrics.pav_museum'),
      exhibitors: loading ? 0 : Math.round(pavilionData.totalExhibitors * 0.10),
      visitors: loading ? 0 : Math.round(pavilionData.totalVisitors * 0.10),
      conferences: loading ? 0 : Math.round(pavilionData.totalConferences * 0.15),
      satisfaction: 0,
      color: 'bg-indigo-500'
    }
  ];

  const engagementMetrics = [
    {
      title: t('metrics.eng_meetings'),
      value: loading ? '...' : adminMetrics.totalAppointments.toLocaleString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('metrics.eng_messages'),
      value: loading ? '...' : adminMetrics.totalMessages.toLocaleString(),
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: t('metrics.eng_connections'),
      value: loading ? '...' : adminMetrics.totalConnections.toLocaleString(),
      icon: Handshake,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: t('metrics.eng_views'),
      value: loading ? '...' : adminMetrics.totalDownloads.toLocaleString(),
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bouton de retour */}
          <div className="mb-6">
            <Link to={ROUTES.ADMIN_DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('metrics.back_dashboard')}
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('metrics.page_title')}
            </h1>
            <p className="text-gray-600">
              {t('metrics.page_subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques Clés */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('metrics.kpi_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${metric.bgColor} p-3 rounded-lg`}>
                          <Icon className={`h-6 w-6 ${metric.color}`} />
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className={`h-4 w-4 ${
                            metric.trend === 'up' ? 'text-green-500' :
                            metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            metric.trend === 'up' ? 'text-green-600' :
                            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {metric.trendValue}
                          </span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="text-3xl font-bold text-gray-900">
                          {metric.value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t('metrics.objective', { target: metric.target })}
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{metric.title}</span>
                          <span className="text-gray-900 font-medium">{metric.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              metric.progress >= 100 ? 'bg-green-500' :
                              metric.progress >= 80 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(metric.progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {metric.progress >= 100 && (
                        <Badge variant="success" size="sm">
                          <Target className="h-3 w-3 mr-1" />
                          {t('metrics.target_reached')}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Métriques Temps Réel */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('metrics.realtime_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-6 w-6" />
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs">Live</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {realTimeMetrics.activeUsers.toLocaleString()}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {t('metrics.total_users')}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-6 w-6" />
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs">Live</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {realTimeMetrics.onlineExhibitors}
                  </div>
                  <div className="text-green-100 text-sm">
                    {t('metrics.total_exhibitors')}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-6 w-6" />
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs">Live</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {realTimeMetrics.scheduledMeetings}
                  </div>
                  <div className="text-purple-100 text-sm">
                    {t('metrics.total_meetings')}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MessageCircle className="h-6 w-6" />
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs">Live</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {realTimeMetrics.messagesExchanged.toLocaleString()}
                  </div>
                  <div className="text-orange-100 text-sm">
                    {t('metrics.total_messages')}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Performance par Pavillon */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('metrics.pavilion_title')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pavilionMetrics.map((pavilion, index) => (
              <motion.div
                key={pavilion.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-4 h-4 rounded-full ${pavilion.color}`} />
                      <h3 className="font-semibold text-gray-900">
                        {pavilion.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {pavilion.exhibitors}
                        </div>
                        <div className="text-xs text-gray-600">{t('metrics.col_exhibitors')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {pavilion.visitors.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">{t('metrics.col_visitors')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {pavilion.conferences}
                        </div>
                        <div className="text-xs text-gray-600">{t('metrics.col_conferences')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">
                          N/A
                        </div>
                        <div className="text-xs text-gray-600">{t('metrics.col_satisfaction')}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('metrics.global_performance')}</span>
                      <Badge variant={getPerformanceLevel(pavilion).variant} size="sm">
                        <Activity className="h-3 w-3 mr-1" />
                        {getPerformanceLevel(pavilion).label}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Métriques d'Engagement */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('metrics.engagement_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagementMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${metric.bgColor} border-0`}>
                    <div className="p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                          <Icon className={`h-6 w-6 ${metric.color}`} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        {metric.title}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
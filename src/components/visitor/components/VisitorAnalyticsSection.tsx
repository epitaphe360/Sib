import { Activity, Calendar, Building2, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui/Badge';
import { LineChartCard, BarChartCard, PieChartCard } from '../../dashboard/charts';
import { PeriodComparisonGrid } from '../../common/PeriodComparison';
import { VisitorEngagementFunnel } from '../../common/ConversionFunnel';
import { AIPredictions, type Prediction } from '../../common/AIPredictions';
import { useTranslation } from '../../../hooks/useTranslation';

interface AnalyticsData { name: string; value: number; color?: string; }
interface ActivityData { name: string; visites: number; interactions: number; }

interface VisitorAnalyticsSectionProps {
  userLevel: string;
  visitActivityData: ActivityData[];
  appointmentStatusData: AnalyticsData[];
  interestAreasData: AnalyticsData[];
  confirmedCount: number;
  receivedCount: number;
  exhibitorsVisited: number;
  connections: number;
  predictions: Prediction[];
}

export function VisitorAnalyticsSection({
  userLevel,
  visitActivityData,
  appointmentStatusData,
  interestAreasData,
  confirmedCount,
  receivedCount,
  exhibitorsVisited,
  connections,
  predictions,
}: VisitorAnalyticsSectionProps) {
  const { t } = useTranslation();
  if (userLevel === 'free') {return null;}

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('visitor.your_activity')}</h2>
            <p className="text-sm text-gray-600">{t('visitor.your_activity_desc')}</p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">{t('visitor.live')}</Badge>
      </div>

      <div className="mb-6">
        <LineChartCard
          title={t('dashboard.visit_activity_7days')}
          data={visitActivityData as any}
          dataKeys={[
            { key: 'visites', color: '#3b82f6', name: t('visitor.visits') },
            { key: 'interactions', color: '#8b5cf6', name: t('visitor.interactions') },
          ]}
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PieChartCard title={t('dashboard.appointment_status')} data={appointmentStatusData} height={300} />
        <BarChartCard title={t('dashboard.interest_areas')} data={interestAreasData as any} dataKey="value" colors={['#3b82f6']} height={300} />
      </div>

      <div className="mb-6">
        <PeriodComparisonGrid
          comparisons={[
            {
              currentPeriod: { value: confirmedCount, label: t('visitor.currently') },
              previousPeriod: { value: Math.max(0, confirmedCount - 2), label: t('visitor.previous_period') },
              title: t('visitor.confirmed_appointments'),
              icon: <Calendar className="h-4 w-4" />,
              format: 'number',
            },
            {
              currentPeriod: { value: exhibitorsVisited, label: t('visitor.currently') },
              previousPeriod: { value: Math.max(0, exhibitorsVisited - 3), label: t('visitor.previous_period') },
              title: t('visitor.exhibitors_visited'),
              icon: <Building2 className="h-4 w-4" />,
              format: 'number',
            },
            {
              currentPeriod: { value: connections, label: t('visitor.currently') },
              previousPeriod: { value: Math.max(0, connections - 1), label: t('visitor.previous_period') },
              title: t('visitor.connections_established'),
              icon: <Network className="h-4 w-4" />,
              format: 'number',
            },
          ]}
        />
      </div>

      <div className="mb-6">
        <VisitorEngagementFunnel
          exhibitorsViewed={exhibitorsVisited}
          exhibitorsBookmarked={Math.floor(exhibitorsVisited * 0.4)}
          appointmentsSent={receivedCount}
          appointmentsConfirmed={confirmedCount}
        />
      </div>

      {(userLevel === 'vip' || userLevel === 'premium') && predictions.length > 0 && (
        <div className="mb-6">
          <AIPredictions predictions={predictions} />
        </div>
      )}
    </motion.div>
  );
}

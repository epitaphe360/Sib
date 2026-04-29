import { Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { LineChartCard, BarChartCard, PieChartCard } from '../charts';
import { ExhibitorConversionFunnel } from '../../common/ConversionFunnel';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface EngagementDataItem {
  name: string;
  visits: number;
  interactions: number;
}

interface ExhibitorAnalyticsSectionProps {
  hasRealData: boolean;
  visitorEngagementData: EngagementDataItem[];
  appointmentStatusData: ChartDataItem[];
  activityBreakdownData: ChartDataItem[];
  receivedAppointments: unknown[];
  confirmedAppointments: unknown[];
  miniSiteViews: number;
}

export function ExhibitorAnalyticsSection({
  hasRealData,
  visitorEngagementData,
  appointmentStatusData,
  activityBreakdownData,
  receivedAppointments,
  confirmedAppointments,
  miniSiteViews,
}: ExhibitorAnalyticsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          <TrendingUp className="inline-block mr-3 text-SIB-primary" />
          {t('exhibitor.analytics_title')}
        </h2>
        <Badge variant="info" size="md">
          {t('exhibitor.analytics_realtime')}
        </Badge>
      </div>

      {/* Empty state */}
      {!hasRealData && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-7 w-7 text-blue-500" />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-2">{t('exhibitor.analytics_empty_title')}</h3>
          <p className="text-sm text-gray-500 mb-4">{t('exhibitor.analytics_empty_desc')}</p>
          <Link to={ROUTES.MINISITE_CREATION}>
            <Button variant="default" size="sm">🎨 {t('exhibitor.header.create_edit_minisite')}</Button>
          </Link>
        </div>
      )}

      {/* Row 1: Visitor engagement line chart */}
      {hasRealData && (
        <LineChartCard
          title={t('dashboard.visitor_engagement_7days')}

          data={visitorEngagementData as any}
          dataKeys={[
            { key: 'visits', color: '#3b82f6', name: t('exhibitor.analytics_visits') },
            { key: 'interactions', color: '#10b981', name: t('exhibitor.analytics_interactions') },
          ]}
          height={300}
          showArea={true}
        />
      )}

      {/* Row 2: Appointment status + Activity breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {receivedAppointments.length > 0 ? (
          <PieChartCard
            title={t('exhibitor.analytics_appointment_status')}
            data={appointmentStatusData}
            colors={['#10b981', '#f59e0b', '#3b82f6']}
            height={400}
            showPercentage={true}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center">
            <Calendar className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">{t('exhibitor.analytics_no_appointments')}</p>
          </div>
        )}

        {hasRealData ? (
          <BarChartCard
            title={t('exhibitor.analytics_activity_breakdown')}

            data={activityBreakdownData as any}
            dataKey="value"
            colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
            height={400}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center">
            <TrendingUp className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">{t('exhibitor.analytics_no_activity')}</p>
          </div>
        )}
      </div>

      {/* Conversion funnel */}
      <div className="mb-6">
        <ExhibitorConversionFunnel
          miniSiteViews={miniSiteViews}
          appointmentRequests={receivedAppointments.length}
          appointmentsConfirmed={confirmedAppointments.length}
        />
      </div>
    </div>
  );
}

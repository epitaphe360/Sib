import { TrendingUp, BarChart3 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LineChartCard, BarChartCard, PieChartCard } from '../charts';
import { useTranslation } from '../../../hooks/useTranslation';

interface ChartItem { name: string; value: number; color?: string; }

interface PartnerAnalyticsTabProps {
  hasRealData: boolean;
  brandExposureData: Record<string, string | number>[];
  engagementChannelsData: ChartItem[];
  roiMetricsData: ChartItem[];
}

export function PartnerAnalyticsTab({
  hasRealData, brandExposureData, engagementChannelsData, roiMetricsData
}: PartnerAnalyticsTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      {!hasRealData && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-7 w-7 text-indigo-500" />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-2">{t('exhibitor.analytics_empty_title')}</h3>
          <p className="text-sm text-gray-500 mb-4">{t('exhibitor.analytics_empty_desc')}</p>
        </div>
      )}
      {hasRealData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LineChartCard
              title={t('partner.analytics_titles.brand_visibility')}
              data={brandExposureData}
              dataKeys={[
                { key: 'visits', color: '#6366f1', name: t('common.impressions') },
                { key: 'interactions', color: '#ec4899', name: t('common.interactions') },
              ]}
              height={300}
            />
          </div>
          <PieChartCard
            title={t('partner.analytics_titles.engagement_channels')}
            data={engagementChannelsData}
            height={300}
          />
        </div>
      )}
      <Card className="p-6 bg-white rounded-2xl shadow-md border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">{t('partner.global_roi_performance')}</h3>
          <Button variant="outline" size="sm" className="rounded-xl">{t('partner.export_pdf_report')}</Button>
        </div>
        {hasRealData ? (
          <BarChartCard
            title={t('partner.analytics_titles.metrics_distribution')}
            data={roiMetricsData}
            dataKey="value"
            colors={['#6366f1']}
            height={260}
          />
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-gray-300">
            <BarChart3 className="h-10 w-10 mb-2" />
            <p className="text-sm">{t('exhibitor.analytics_no_activity')}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

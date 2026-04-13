import { Calendar, Users, FileText, Zap, Crown, Handshake, Eye, MessageCircle } from 'lucide-react';
import { QuotaSummaryCard } from '../../common/QuotaWidget';
import { Card } from '../../ui/Card';
import { useTranslation } from '../../../hooks/useTranslation';
import { getPartnerQuota } from '../../../config/partnerTiers';
import type { PartnerTier } from '../../../config/partnerTiers';
import type { ReturnType as RT } from 'react';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import type { Dashboard } from '../../../store/dashboardStore';

interface PartnerOverviewTabProps {
  dashboardStats: ReturnType<typeof useDashboardStats>;
  dashboard: Dashboard | null;
  partnerTier: string;
  confirmedAppointments: unknown[];
}

export function PartnerOverviewTab({ dashboardStats, dashboard, partnerTier, confirmedAppointments }: PartnerOverviewTabProps) {
  const { t } = useTranslation();
  const stats = [
    { label: t('partner.stats.profile_views'), value: dashboardStats?.profileViews?.value?.toLocaleString() || '0', growth: dashboardStats?.profileViews?.growth || '--', growthType: dashboardStats?.profileViews?.growthType || 'neutral', icon: Crown, color: 'text-[#1B365D]', bg: 'bg-[#1B365D]/8', border: 'border-[#1B365D]/15' },
    { label: t('partner.stats.connections'), value: dashboardStats?.connections?.value?.toString() || '0', growth: dashboardStats?.connections?.growth || '--', growthType: dashboardStats?.connections?.growthType || 'neutral', icon: Handshake, color: 'text-[#1B365D]', bg: 'bg-[#1B365D]/8', border: 'border-[#1B365D]/15' },
    { label: t('partner.stats.appointments'), value: dashboardStats?.appointments?.value?.toString() || '0', growth: dashboardStats?.appointments?.growth || '--', growthType: dashboardStats?.appointments?.growthType || 'neutral', icon: Calendar, color: 'text-[#1B365D]', bg: 'bg-[#1B365D]/8', border: 'border-[#1B365D]/15' },
    { label: t('partner.stats.messages'), value: dashboardStats?.messages?.value?.toString() || '0', growth: dashboardStats?.messages?.growth || '--', growthType: dashboardStats?.messages?.growthType || 'neutral', icon: Zap, color: 'text-[#2D6A4F]', bg: 'bg-[#2D6A4F]/8', border: 'border-[#2D6A4F]/15' },
  ];
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className={`p-6 bg-white border ${stat.border} rounded-2xl hover:shadow-lg transition-all group`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 ${stat.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                stat.growthType === 'positive' ? 'bg-green-100 text-green-700'
                : stat.growthType === 'negative' ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
              }`}>{stat.growth}</span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <QuotaSummaryCard
            title={t('partner.quotas.title')}
            level={partnerTier}
            type="partner"
            quotas={[
              { label: t('partner.quotas.appointments'), current: (confirmedAppointments as any[]).length, limit: getPartnerQuota(partnerTier as PartnerTier, 'appointments'), icon: <Calendar className="h-4 w-4" /> },
              { label: t('partner.quotas.team_members'), current: 0, limit: getPartnerQuota(partnerTier as PartnerTier, 'teamMembers'), icon: <Users className="h-4 w-4" /> },
              { label: t('partner.quotas.media_files'), current: dashboardStats?.catalogDownloads?.value || 0, limit: getPartnerQuota(partnerTier as PartnerTier, 'mediaUploads'), icon: <FileText className="h-4 w-4" /> },
            ]}
          />
        </div>
        <Card className="p-6 h-full bg-[#0F2034] text-white rounded-2xl shadow-md overflow-hidden">
          <div className="">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Zap className="h-6 w-6 text-amber-400" />
              {t('partner.recent_activity')}
            </h3>
            <div className="space-y-6">
              {(dashboard as any)?.recentActivity?.slice(0, 4).map((activity: any) => (
                <div key={activity.id} className="flex gap-4 p-4 rounded-2xl bg-white/8 border border-white/15 hover:bg-white/10 transition-colors">
                  <div className="flex-shrink-0">{activity.type === 'profile_view' ? <Eye className="h-5 w-5 text-[#C9A84C]" /> : activity.type === 'message' ? <MessageCircle className="h-5 w-5 text-[#C9A84C]" /> : <Calendar className="h-5 w-5 text-[#C9A84C]" />}</div>
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {!(dashboard as any)?.recentActivity?.length && (
                <p className="text-slate-400 text-sm">{t('partner.no_recent_activity')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

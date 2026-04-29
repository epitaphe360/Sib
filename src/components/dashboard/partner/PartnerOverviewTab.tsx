import { Calendar, Users, FileText, Zap, Crown, Handshake, Eye, MessageCircle, Network, Brain, ArrowRight } from 'lucide-react';
import { QuotaSummaryCard } from '../../common/QuotaWidget';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import { getPartnerQuota, type PartnerTier } from '../../../config/partnerTiers';
import type { ReturnType as RT } from 'react';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import type { Dashboard } from '../../../store/dashboardStore';
import { ROUTES } from '../../../lib/routes';

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

      {/* Actions rapides — Réseautage & Matching IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[#1B365D] to-[#0F2034] text-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/15 rounded-xl">
                <Network className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold">{t('partner.advanced_networking')}</h3>
            </div>
            <p className="text-sm text-blue-200 mb-5">{t('partner.advanced_networking_desc')}</p>
            <Link to={ROUTES.NETWORKING}>
              <Button className="w-full bg-white text-[#1B365D] hover:bg-blue-50 font-bold shadow-md transition-all flex items-center justify-center gap-2">
                <Network className="h-4 w-4" />
                {t('partner.access_networking')}
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#C9A84C] to-[#A88830] text-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold">{t('partner.ai_matching')}</h3>
            </div>
            <p className="text-sm text-amber-100 mb-5">{t('partner.ai_matching_desc')}</p>
            <Link to={ROUTES.ADVANCED_MATCHING}>
              <Button className="w-full bg-white text-[#A88830] hover:bg-amber-50 font-bold shadow-md transition-all flex items-center justify-center gap-2">
                <Brain className="h-4 w-4" />
                {t('partner.access_ai_matching')}
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </div>
        </Card>
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

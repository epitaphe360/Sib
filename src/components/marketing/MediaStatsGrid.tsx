import { Video, Mic, Globe, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';
import type { MediaStats as MediaStatsType } from './types';

interface MediaStatsProps {
  stats: MediaStatsType;
}

/**
 * Grille de cartes statistiques pour la médiathèque.
 */
export default function MediaStats({ stats }: MediaStatsProps) {
  const { t } = useTranslation();

  const items = [
    { label: t('marketing.stats.total_media'), value: stats.total, icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('marketing.stats.webinars'), value: stats.webinars, icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: t('marketing.stats.podcasts'), value: stats.podcasts, icon: Mic, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: t('marketing.stats.capsules'), value: stats.capsules, icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('marketing.stats.online'), value: stats.published, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('marketing.stats.drafts'), value: stats.draft, icon: EyeOff, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
      {items.map((stat, i) => (
        <Card
          key={i}
          className="p-4 md:p-6 border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl hover:-translate-y-1 transition-all"
        >
          <div
            className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-inner`}
          >
            <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800 mb-1">{stat.value}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}


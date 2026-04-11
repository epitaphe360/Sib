import { Video, Mic, Eye, EyeOff, Plus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { MediaFilterType, MediaStatus } from './types';

interface MediaFiltersProps {
  filterType: MediaFilterType;
  filterStatus: MediaStatus;
  onFilterTypeChange: (type: MediaFilterType) => void;
  onFilterStatusChange: (status: MediaStatus) => void;
  onAddMedia: () => void;
}

/**
 * Barre de filtres pour la médiathèque : filtre par type + filtre par statut + bouton ajout.
 */
export default function MediaFilters({
  filterType,
  filterStatus,
  onFilterTypeChange,
  onFilterStatusChange,
  onAddMedia,
}: MediaFiltersProps) {
  const { t } = useTranslation();

  const typeFilters: { value: MediaFilterType; label: string; icon?: typeof Video }[] = [
    { value: 'all', label: t('marketing.filters.all') },
    { value: 'webinar', label: t('marketing.filters.webinars'), icon: Video },
    { value: 'podcast', label: t('marketing.filters.podcasts'), icon: Mic },
    { value: 'capsule_inside', label: t('marketing.filters.capsules'), icon: Video },
    { value: 'live_studio', label: t('marketing.filters.live_studio'), icon: Video },
    { value: 'best_moments', label: t('marketing.filters.best_moments'), icon: Video },
    { value: 'testimonial', label: t('marketing.filters.testimonial'), icon: Video },
  ];

  const statusFilters: { value: MediaStatus; label: string; icon?: typeof Eye }[] = [
    { value: 'all', label: t('marketing.filters.all') },
    { value: 'published', label: t('marketing.filters.published'), icon: Eye },
    { value: 'draft', label: t('marketing.filters.drafts'), icon: EyeOff },
  ];

  return (
    <Card className="p-6 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border-none relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />

      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* Type filter */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {t('marketing.filters.filter_by')}
            </span>
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
              {typeFilters.map((f) => (
                <Button
                  key={f.value}
                  variant={filterType === f.value ? 'default' : 'ghost'}
                  size="sm"
                  className={`rounded-xl px-3 ${filterType === f.value ? 'bg-blue-600' : 'text-slate-600'}`}
                  onClick={() => onFilterTypeChange(f.value)}
                >
                  {f.icon && <f.icon className="h-4 w-4 mr-1" />}
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 hidden md:block" />

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {t('marketing.filters.status')}
            </span>
            <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
              {statusFilters.map((f) => (
                <Button
                  key={f.value}
                  variant={filterStatus === f.value ? 'default' : 'ghost'}
                  size="sm"
                  className={`rounded-xl px-4 ${filterStatus === f.value ? 'bg-blue-600' : 'text-slate-600'}`}
                  onClick={() => onFilterStatusChange(f.value)}
                >
                  {f.icon && <f.icon className="h-4 w-4 mr-1" />}
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Add media */}
        <div className="ml-auto">
          <Button
            onClick={onAddMedia}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('marketing.media.add_media')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

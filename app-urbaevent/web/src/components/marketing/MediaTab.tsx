import { useState } from 'react';
import { Image, Plus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import MediaStatsGrid from './MediaStatsGrid';
import MediaFilters from './MediaFilters';
import MediaCard from './MediaCard';
import UploadModal from './UploadModal';
import type { MediaItem, MediaFilterType, MediaStatus, MediaStats, UploadableMediaType, UploadFormData } from './types';

interface MediaTabProps {
  stats: MediaStats;
  filteredMedia: MediaItem[];
  filterType: MediaFilterType;
  filterStatus: MediaStatus;
  onFilterTypeChange: (type: MediaFilterType) => void;
  onFilterStatusChange: (status: MediaStatus) => void;
  onTogglePublish: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  onCopyShortcode: (shortcode: string) => void;
  onAddMedia: (type: UploadableMediaType, data: UploadFormData) => Promise<boolean>;
}

/**
 * Onglet Médiathèque : affiche les stats, filtres et la grille de médias.
 */
export default function MediaTab({
  stats,
  filteredMedia,
  filterType,
  filterStatus,
  onFilterTypeChange,
  onFilterStatusChange,
  onTogglePublish,
  onDelete,
  onCopyShortcode,
  onAddMedia,
}: MediaTabProps) {
  const { t } = useTranslation();
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Statistiques */}
      <MediaStatsGrid stats={stats} />

      {/* Filtres */}
      <MediaFilters
        filterType={filterType}
        filterStatus={filterStatus}
        onFilterTypeChange={onFilterTypeChange}
        onFilterStatusChange={onFilterStatusChange}
        onAddMedia={() => setShowUploadModal(true)}
      />

      {/* Grille médias / État vide */}
      {filteredMedia.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl">
          <div className="text-gray-400 mb-4">
            <Image className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('marketing.media.no_media')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('marketing.media.start_adding')}
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('marketing.media.add_media')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onTogglePublish={onTogglePublish}
              onDelete={onDelete}
              onCopyShortcode={onCopyShortcode}
            />
          ))}
        </div>
      )}

      {/* Modal d'upload */}
      {showUploadModal && (
        <UploadModal
          onUpload={onAddMedia}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}

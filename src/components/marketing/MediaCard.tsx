import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Trash2, Tag, Calendar, Download } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getMediaTypeIcon, getMediaTypeColor, getMediaThumbnailGradient } from './mediaUtils';
import type { MediaItem } from './types';

interface MediaCardProps {
  item: MediaItem;
  onTogglePublish: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  onCopyShortcode: (shortcode: string) => void;
}

/**
 * Carte individuelle d'un média (webinaire, podcast, capsule, etc.).
 * Affiche thumbnail, badge type/statut, métadonnées, shortcode et actions.
 */
export default function MediaCard({ item, onTogglePublish, onDelete, onCopyShortcode }: MediaCardProps) {
  const { t } = useTranslation();
  const TypeIcon = getMediaTypeIcon(item.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gray-100">
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`flex items-center justify-center h-full bg-gradient-to-br ${getMediaThumbnailGradient(item.type)}`}>
              <TypeIcon className="h-16 w-16 text-white" />
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMediaTypeColor(item.type)}`}>
              <TypeIcon className="h-4 w-4" />
              <span className="capitalize">{t(`marketing.filters.${item.type}`)}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={item.status === 'published' ? 'success' : 'default'}>
              {item.status === 'published'
                ? `✅ ${t('marketing.status.published')}`
                : `📝 ${t('marketing.status.draft')}`}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

          {/* Category */}
          {item.category && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
              <Tag className="h-3 w-3" />
              {item.category}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {item.views_count ?? 0}
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {item.likes_count ?? 0}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(item.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>

          {/* Shortcode */}
          <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs text-blue-600 font-mono flex-1 overflow-x-auto">
                [media id=&quot;{item.id}&quot;]
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCopyShortcode(`[media id="${item.id}"]`)}
                className="flex-shrink-0"
              >
                <Copy className="h-3 w-3 mr-1" />
                {t('actions.copy')}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={item.status === 'published' ? 'outline' : 'default'}
              className="flex-1"
              onClick={() => onTogglePublish(item)}
            >
              {item.status === 'published' ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  {t('marketing.media.unpublish')}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  {t('marketing.media.publish')}
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(item)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

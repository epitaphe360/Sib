/**
 * Composant MediaCard réutilisable
 * Pour afficher un média (webinaire, podcast, capsule, etc.)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Users, Calendar, Award } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ROUTES } from '../../lib/routes';
import type { MediaContent } from '../../types/media';
import { MEDIA_TYPE_LABELS, MEDIA_TYPE_ICONS } from '../../types/media';

interface MediaCardProps {
  media: MediaContent;
  showSponsor?: boolean;
  className?: string;
  linkTo?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  showSponsor = true,
  className = '',
  linkTo
}) => {
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getMediaRoute = (type: string, id: string) => {
    switch (type) {
      case 'webinar': return ROUTES.WEBINAR_DETAIL.replace(':id', id);
      case 'podcast': return ROUTES.PODCAST_DETAIL.replace(':id', id);
      case 'capsule_inside': return ROUTES.CAPSULE_DETAIL.replace(':id', id);
      case 'live_studio': return ROUTES.LIVE_STUDIO_DETAIL.replace(':id', id);
      case 'best_moments': return ROUTES.BEST_MOMENTS_DETAIL.replace(':id', id);
      case 'testimonial': return ROUTES.TESTIMONIAL_DETAIL.replace(':id', id);
      default: return `/media/${type}/${id}`;
    }
  };

  const href = linkTo || getMediaRoute(media.type, media.id);

  return (
    <Link to={href} className={`group block ${className}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
        {/* Thumbnail with Play Overlay */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
          {media.thumbnail_url ? (
            <img
              src={media.thumbnail_url}
              alt={media.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {MEDIA_TYPE_ICONS[media.type]}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-blue-600 ml-1" />
            </div>
          </div>

          {/* Type Badge */}
          <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
            {MEDIA_TYPE_LABELS[media.type]}
          </Badge>

          {/* Sponsor Badge */}
          {showSponsor && media.sponsor_partner && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Award className="h-3 w-3 mr-1" />
              Sponsorisé
            </Badge>
          )}

          {/* Duration */}
          {media.duration && (
            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(media.duration)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {media.title}
          </h3>

          {media.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {media.description}
            </p>
          )}

          {/* Speakers */}
          {media.speakers && media.speakers.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center flex-wrap gap-2">
                {media.speakers.slice(0, 2).map((speaker) => (
                  <div
                    key={speaker.name}
                    className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-full"
                  >
                    <Users className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700 font-medium">{speaker.name}</span>
                  </div>
                ))}
                {media.speakers.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{media.speakers.length - 2} autres
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(media.published_at)}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{media.views_count.toLocaleString()} vues</span>
            </div>
          </div>

          {/* Sponsor Info */}
          {showSponsor && media.sponsor_partner && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {media.sponsor_partner.logo_url && (
                  <img
                    src={media.sponsor_partner.logo_url}
                    alt={media.sponsor_partner.company_name}
                    className="h-6 w-6 object-contain rounded"
                  />
                )}
                <div>
                  <p className="text-xs text-gray-500">Sponsorisé par</p>
                  <p className="text-sm font-medium text-gray-900">
                    {media.sponsor_partner.company_name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default MediaCard;

import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Play, Clock, Eye, ArrowLeft, Search, Filter } from 'lucide-react';
import { MediaService } from '../../services/mediaService';
import { MediaContent } from '../../types/media';
import { MediaCard } from '../../components/media/MediaCard';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';

export const PodcastsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadPodcasts();
  }, [categoryFilter]);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const filters = {
        type: 'podcast' as const,
        status: 'published' as const,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      };
      const data = await MediaService.getMedia(filters);
      setPodcasts(data);
    } catch (error) {
      console.error('Erreur chargement podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['all', 'Business', 'Innovation', 'Leadership', 'Technologie'];

  const stats = {
    totalPodcasts: podcasts.length,
    totalListens: podcasts.reduce((sum, p) => sum + p.views_count, 0),
    totalDuration: Math.floor(podcasts.reduce((sum, p) => sum + (p.duration || 0), 0) / 60),
  };

  const featuredPodcast = podcasts.find(p => p.status === 'published');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center text-white/80 hover:text-white mb-6">
            {t('common.back_home') || 'Retour à l\'accueil'}
          </Link>

          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Mic className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{t('media.podcast.page_title')}</h1>
              <p className="text-xl text-white/90">{t('media.podcast.page_subtitle')}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('media.stats.total_episodes')}</p>
                  <p className="text-3xl font-bold">{stats.totalPodcasts}</p>
                </div>
                <Mic className="w-8 h-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('media.stats.listens')}</p>
                  <p className="text-3xl font-bold">{stats.totalListens.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('media.stats.hours')}</p>
                  <p className="text-3xl font-bold">{stats.totalDuration}h</p>
                </div>
                <Clock className="w-8 h-8 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Podcast */}
        {featuredPodcast && (
          <div className="mb-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 border border-purple-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-semibold">{t('media.podcast.featured_episode')}</p>
                  <h2 className="text-2xl font-bold text-gray-900">{featuredPodcast.title}</h2>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-6">{featuredPodcast.description}</p>
            <div className="flex items-center space-x-6">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  if (featuredPodcast.media_url) {
                    navigate(`${ROUTES.MEDIA_DETAIL.replace(':id', featuredPodcast.id)}`);
                  } else {
                    toast.error(t('media.info.audio_unavailable'));
                  }
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                {t('media.action.listen_now')}
              </Button>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {Math.floor((featuredPodcast.duration || 0) / 60)} min
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Eye className="w-4 h-4 mr-1" />
                {featuredPodcast.views_count.toLocaleString()} {t('media.stats.listening')}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('media.podcast.search_placeholder') || 'Rechercher un épisode...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? t('media.filter.all_categories') : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Podcasts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredPodcasts.length === 0 ? (
          <div className="text-center py-20">
            <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('media.podcast.no_results')}</h3>
            <p className="text-gray-500">{t('media.info.try_filter')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPodcasts.map(podcast => (
              <MediaCard key={podcast.id} media={podcast} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastsPage;

/**
 * Page des Webinaires SIB
 * Affiche tous les webinaires sponsorisés disponibles en replay
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Calendar, Users, Clock, Filter, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import MediaCard from '../../components/media/MediaCard';
import { MediaService } from '../../services/mediaService';
import { ROUTES } from '../../lib/routes';
import type { MediaContent } from '../../types/media';

export const WebinarsPage: React.FC = () => {
  const [webinars, setWebinars] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadWebinars();
  }, [filter]);

  const loadWebinars = async () => {
    setLoading(true);
    try {
      const orderBy = filter === 'popular' ? 'views_count' : 'published_at';

      const data = await MediaService.getMediaByType('webinar', {
        status: 'published',
        orderBy,
        order: 'desc'
      });

      setWebinars(data);
    } catch (error) {
      console.error('❌ Erreur chargement webinaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = searchQuery === '' ||
      webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webinar.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || webinar.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories = Array.from(new Set(webinars.map(w => w.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('pages.webinars.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('media.back_to_home')}
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Play className="h-10 w-10 text-white ml-1" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {t('pages.webinars.title')}
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pages.webinars.description')}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">{t('pages.webinars.total_webinars')}</p>
                <p className="text-3xl font-bold text-blue-900">{webinars.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium mb-1">{t('common.views')}</p>
                <p className="text-3xl font-bold text-purple-900">
                  {webinars.reduce((sum, w) => sum + w.views_count, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 font-medium mb-1">{t('pages.webinars.hours_content')}</p>
                <p className="text-3xl font-bold text-pink-900">
                  {Math.floor(webinars.reduce((sum, w) => sum + (w.duration || 0), 0) / 3600)}h
                </p>
              </div>
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('pages.webinars.search_webinars')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                {t('pages.webinars.filter_all')}
              </Button>
              <Button
                variant={filter === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('recent')}
              >
                {t('pages.webinars.filter_recent')}
              </Button>
              <Button
                variant={filter === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('popular')}
              >
                {t('pages.webinars.filter_popular')}
              </Button>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-2">{t('common.categories')}:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('pages.webinars.filter_all')}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category || t('pages.webinars.no_category')}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Featured Webinar */}
        {filteredWebinars[0] && (
          <Link to={ROUTES.WEBINAR_DETAIL.replace(':id', filteredWebinars[0].id)}>
            <Card className="mb-12 overflow-hidden hover:shadow-2xl transition-shadow bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="p-8 md:flex items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Thumbnail */}
                <div className="md:w-1/2 relative group">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={filteredWebinars[0].thumbnail_url || '/placeholder-video.jpg'}
                      alt={filteredWebinars[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://placehold.co/800x450/e2e8f0/64748b?text=Webinar`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                        <Play className="h-10 w-10 text-blue-600 ml-1" />
                      </div>
                    </div>
                    {filteredWebinars[0].duration && (
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white text-sm px-3 py-1 rounded">
                        {Math.floor((filteredWebinars[0].duration || 0) / 60)} min
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-1/2">
                  <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    ⭐ {t('common.featured')}
                  </Badge>

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {filteredWebinars[0].title}
                  </h2>

                  <p className="text-gray-600 mb-6 text-lg">
                    {filteredWebinars[0].description}
                  </p>

                  {/* Speakers */}
                  {filteredWebinars[0].speakers && filteredWebinars[0].speakers.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">{t('common.speakers')}:</p>
                      <div className="flex flex-wrap gap-3">
                        {filteredWebinars[0].speakers.map((speaker, idx) => (
                          <div key={`speaker-${idx}-${speaker?.name || 'unknown'}`} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {speaker?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{speaker?.name || 'Intervenant'}</p>
                              <p className="text-xs text-gray-600">{speaker?.company || ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(filteredWebinars[0].published_at || '').toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{(filteredWebinars[0].views_count || 0).toLocaleString()} {t('common.views')}</span>
                    </div>
                  </div>

                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Play className="h-5 w-5 mr-2" />
                    {t('common.watch_replay')}
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Webinars Grid */}
        {filteredWebinars.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {searchQuery || selectedCategory ? t('common.results') : t('common.all_items')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWebinars.slice(1).map((webinar) => (
                <MediaCard
                  key={webinar.id}
                  media={webinar}
                  showSponsor={true}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('pages.webinars.no_results')}
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory
                ? t('common.modify_filters')
                : t('common.coming_soon')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebinarsPage;

import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { Play, ArrowLeft, Search, Filter, Eye, Clock } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { MediaContent } from '../../types/media';
import { MediaCard } from '../../components/media/MediaCard';
import { ROUTES } from '../../lib/routes';

export const CapsulesPage: React.FC = () => {
  const [capsules, setCapsules] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadCapsules();
  }, []);

  const loadCapsules = async () => {
    try {
      setLoading(true);
      const filters = { type: 'capsule_inside' as const, status: 'published' as const };
      const data = await mediaService.getMedia(filters);
      setCapsules(data);
    } catch (error) {
      console.error('Erreur chargement capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCapsules = capsules.filter(capsule =>
    capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    capsule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('media.back_to_home')}
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Play className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{t('pages.capsules.title')}</h1>
              <p className="text-xl text-white/90">{t('pages.capsules.description')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('pages.capsules.total_capsules')}</p>
                  <p className="text-3xl font-bold">{capsules.length}</p>
                </div>
                <Play className="w-8 h-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('pages.capsules.total_views')}</p>
                  <p className="text-3xl font-bold">
                    {capsules.reduce((sum, c) => sum + c.views_count, 0).toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('pages.capsules.filter_recent')}</p>
                  <p className="text-3xl font-bold">
                    {Math.floor(capsules.reduce((sum, c) => sum + (c.duration || 0), 0) / capsules.length / 60)} min
                  </p>
                </div>
                <Clock className="w-8 h-8 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('pages.capsules.search_capsules')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Capsules Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredCapsules.length === 0 ? (
          <div className="text-center py-20">
            <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('pages.capsules.no_results')}</h3>
            <p className="text-gray-500">{t('common.modify_filters')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCapsules.map((capsule) => (
              <MediaCard key={capsule.id} media={capsule} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CapsulesPage;

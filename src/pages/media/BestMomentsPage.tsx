import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft, Search, Play } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { MediaContent } from '../../types/media';
import { MediaCard } from '../../components/media/MediaCard';
import { ROUTES } from '../../lib/routes';
import { PageHero } from '../../components/ui/PageHero';

export const BestMomentsPage: React.FC = () => {
  const [moments, setMoments] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadMoments();
  }, []);

  const loadMoments = async () => {
    try {
      setLoading(true);
      const filters = { type: 'best_moments' as const, status: 'published' as const };
      const data = await mediaService.getMedia(filters);
      setMoments(data);
    } catch (error) {
      console.error('Erreur chargement best moments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMoments = moments.filter(moment =>
    moment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    moment.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHero
        badge={<><Star className="w-4 h-4 text-yellow-300" /><span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">Meilleurs Moments</span></>}
        title={<>{t('pages.moments.title')}</>}
        subtitle={t('pages.moments.description')}
        py="py-16 md:py-20"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('pages.moments.search_moments')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Moments Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          </div>
        ) : filteredMoments.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('pages.moments.no_results')}</h3>
            <p className="text-gray-500">{t('common.coming_soon')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMoments.map((moment) => (
              <MediaCard key={moment.id} media={moment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestMomentsPage;

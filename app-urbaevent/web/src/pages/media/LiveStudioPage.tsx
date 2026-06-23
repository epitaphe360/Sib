import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { Video, ArrowLeft, Search, Calendar, Users, Play } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { MediaContent } from '../../types/media';
import { MediaCard } from '../../components/media/MediaCard';
import { ROUTES } from '../../lib/routes';

export const LiveStudioPage: React.FC = () => {
  const [interviews, setInterviews] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const filters = { type: 'live_studio' as const, status: 'published' as const };
      const data = await mediaService.getMedia(filters);
      setInterviews(data);
    } catch (error) {
      console.error('Erreur chargement interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('media.back_to_home')}
          </Link>

          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Video className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{t('pages.live.title')}</h1>
              <p className="text-xl text-white/90">{t('pages.live.description')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('pages.live.scheduled_broadcasts')}</p>
                  <p className="text-3xl font-bold">{interviews.length}</p>
                </div>
                <Video className="w-8 h-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('pages.live.total_viewers')}</p>
                  <p className="text-3xl font-bold">{interviews.length}</p>
                </div>
                <Users className="w-8 h-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t('pages.live.average_duration')}</p>
                  <p className="text-xl font-bold">7 jours</p>
                </div>
                <Calendar className="w-8 h-8 text-white/50" />
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
              placeholder={t('pages.live.search_streams')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Interviews Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('pages.live.no_results')}</h3>
            <p className="text-gray-500">{t('common.coming_soon')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterviews.map((interview) => (
              <MediaCard key={interview.id} media={interview} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStudioPage;

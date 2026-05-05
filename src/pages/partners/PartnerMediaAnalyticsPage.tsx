import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { ArrowLeft, TrendingUp, Eye, Heart, Share2, Clock, BarChart3 } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { useAuthStore } from '../../store/authStore';
import type { MediaContent } from '../../types/media';

export const PartnerMediaAnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalDuration: 0,
    avgViewDuration: 0,
    topMedia: null as MediaContent | null
  });

  useEffect(() => {
    loadPartnerMedia();
  }, []);

  const loadPartnerMedia = async () => {
    if (!user) {return;}

    try {
      setLoading(true);
      const data = await mediaService.getMedia({
        partnerId: user.id,
        status: 'published'
      });
      setMedia(data);
      calculateStats(data);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (mediaList: MediaContent[]) => {
    const totalViews = mediaList.reduce((sum, m) => sum + (m.view_count || 0), 0);
    const totalLikes = mediaList.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const totalDuration = mediaList.reduce((sum, m) => sum + (m.duration || 0), 0);
    const topMedia = mediaList.reduce((top, m) =>
      !top || (m.view_count || 0) > (top.view_count || 0) ? m : top,
      null as MediaContent | null
    );

    setStats({
      totalViews,
      totalLikes,
      totalShares: Math.floor(totalViews * 0.15), // Estimation
      totalDuration,
      avgViewDuration: mediaList.length > 0 ? totalDuration / mediaList.length : 0,
      topMedia
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Tableau de Bord
          </Link>
          <Link to="/partner/media" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à ma bibliothèque
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Médias</h1>
          <p className="mt-2 text-gray-600">Suivez les performances de vos contenus</p>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm opacity-90">Vues totales</p>
            <p className="text-3xl font-bold mt-1">{stats.totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm opacity-90">Likes totaux</p>
            <p className="text-3xl font-bold mt-1">{stats.totalLikes.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Share2 className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm opacity-90">Partages</p>
            <p className="text-3xl font-bold mt-1">{stats.totalShares.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <BarChart3 className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm opacity-90">Durée moyenne</p>
            <p className="text-3xl font-bold mt-1">{Math.round(stats.avgViewDuration)} min</p>
          </div>
        </div>

        {/* Top performer */}
        {stats.topMedia && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
              Meilleure performance
            </h2>
            <div className="flex items-center gap-4">
              {stats.topMedia.thumbnail_url && (
                <img
                  src={stats.topMedia.thumbnail_url}
                  alt={stats.topMedia.title}
                  className="w-32 h-20 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{stats.topMedia.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{stats.topMedia.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {stats.topMedia.view_count || 0} vues
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {stats.topMedia.like_count || 0} likes
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des médias avec stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Performance par média</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun média publié</p>
              <Link
                to="/partner/media/upload"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700"
              >
                Uploader votre premier média
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Média
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taux engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date publication
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {media.map((item) => {
                    const engagementRate = item.view_count
                      ? ((item.like_count || 0) / item.view_count * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {item.thumbnail_url && (
                              <img
                                src={item.thumbnail_url}
                                alt={item.title}
                                className="w-16 h-10 object-cover rounded mr-3"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-gray-900">
                            <Eye className="w-4 h-4 text-gray-400" />
                            {(item.view_count || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-gray-900">
                            <Heart className="w-4 h-4 text-gray-400" />
                            {(item.like_count || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${
                            parseFloat(engagementRate) > 5 ? 'text-green-600' :
                            parseFloat(engagementRate) > 2 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {engagementRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerMediaAnalyticsPage;




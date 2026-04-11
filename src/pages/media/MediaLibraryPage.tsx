import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { Library, ArrowLeft, Search, Filter, Video, Mic, Play, MessageSquare, Star } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { MediaContent, MediaType, MEDIA_TYPE_LABELS } from '../../types/media';
import { MediaCard } from '../../components/media/MediaCard';
import { ROUTES } from '../../lib/routes';

export const MediaLibraryPage: React.FC = () => {
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadMedia();
  }, [typeFilter, categoryFilter]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const filters = {
        type: typeFilter !== 'all' ? typeFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: 'published' as const,
      };
      const data = await mediaService.getMedia(filters);
      setMedia(data);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['all', 'Technologie', 'Innovation', 'Business', 'Environnement', 'Leadership'];

  const stats = {
    total: media.length,
    webinars: media.filter(m => m.type === 'webinar').length,
    podcasts: media.filter(m => m.type === 'podcast').length,
    capsules: media.filter(m => m.type === 'capsule_inside').length,
    testimonials: media.filter(m => m.type === 'testimonial').length,
  };

  const getTypeIcon = (type: MediaType) => {
    const icons = {
      webinar: Video,
      podcast: Mic,
      capsule_inside: Play,
      live_studio: Video,
      best_moments: Star,
      testimonial: MessageSquare,
    };
    return icons[type] || Play;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Library className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Bibliothèque Média</h1>
              <p className="text-xl text-white/90">Tous les contenus sib en un seul endroit</p>
            </div>
          </div>

          {/* Stats Grid - Masqué temporairement */}
          {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-xs mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-xs mb-1">Webinaires</p>
              <p className="text-2xl font-bold">{stats.webinars}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-xs mb-1">Podcasts</p>
              <p className="text-2xl font-bold">{stats.podcasts}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-xs mb-1">Capsules</p>
              <p className="text-2xl font-bold">{stats.capsules}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-xs mb-1">Témoignages</p>
              <p className="text-2xl font-bold">{stats.testimonials}</p>
            </div>
          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contenu masqué - En cours de mise à jour */}
        {/* Filters */}
        {/* <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans tous les médias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as MediaType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="webinar">Webinaires</option>
                <option value="podcast">Podcasts</option>
                <option value="capsule_inside">Capsules Inside</option>
                <option value="live_studio">Live Studio</option>
                <option value="best_moments">Best Moments</option>
                <option value="testimonial">Témoignages</option>
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div> */}

        {/* Media Grid */}
        {/* {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-20">
            <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun média trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <MediaCard key={item} media={item} />
            ))}
          </div>
        )} */}

        {/* Message de mise à jour */}
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="bg-white rounded-3xl shadow-xl p-12 border-2 border-indigo-100">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Library className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contenu en cours de mise à jour
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Notre bibliothèque média est actuellement en cours d'enrichissement par notre agence.
            </p>
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
              <p className="text-gray-700 mb-4">
                <span className="font-semibold text-indigo-700">Les contenus suivants seront progressivement ajoutés :</span>
              </p>
              <ul className="space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-center gap-3 text-gray-700">
                  <Video className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>Webinaires exclusifs</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Mic className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>Épisodes de podcasts</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Play className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>Capsules "Inside sib"</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Video className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>Interviews Live Studio</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Star className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>Best Moments de l'événement</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <MessageSquare className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>Témoignages de participants</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 text-gray-500 italic">
              Les contenus seront disponibles au fur et à mesure de leur production.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




export default MediaLibraryPage;

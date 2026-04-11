import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Download, Share2, BookmarkPlus, Play, Headphones } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AudioPlayer } from '../../components/media/AudioPlayer';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'sonner';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  content_url: string;
  thumbnail_url?: string;
  duration?: number;
  category?: string;
  host_name?: string;
  host_avatar?: string;
  guest_name?: string;
  published_date?: string;
  views_count?: number;
  episode_number?: number;
  season_number?: number;
  created_at: string;
}

export const PodcastEpisodeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadEpisode();
    }
  }, [id]);

  const loadEpisode = async () => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, title, description, content_url:audio_url, thumbnail_url, duration, category, host_name, host_avatar, guest_name, published_date:published_at, views_count, episode_number, season_number, created_at')
        .eq('id', id)
        .eq('type', 'podcast')
        .maybeSingle();

      if (error) throw error;
      setEpisode(data);
    } catch (error) {
      console.error('Error loading podcast episode:', error);
      toast.error('Erreur lors du chargement de l\'épisode');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: episode?.title,
        text: episode?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Épisode introuvable</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Player */}
            <AudioPlayer
              src={episode.content_url}
              title={episode.title}
              artist={episode.host_name}
              coverImage={episode.thumbnail_url}
            />

            {/* Title & Episode Info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Headphones className="h-5 w-5 text-blue-600" />
                {episode.season_number && episode.episode_number && (
                  <span className="text-sm text-gray-600">
                    Saison {episode.season_number} • Épisode {episode.episode_number}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {episode.title}
              </h1>

              {episode.category && (
                <Badge variant="default" className="mb-4">{episode.category}</Badge>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant={isSaved ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleSave}
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  {isSaved ? 'Enregistré' : 'Enregistrer'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={episode.content_url} download>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </a>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {episode.views_count && (
                  <div className="flex items-center">
                    <Play className="h-4 w-4 mr-1" />
                    {episode.views_count.toLocaleString()} écoutes
                  </div>
                )}
                {episode.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(episode.duration)}
                  </div>
                )}
                {episode.published_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(episode.published_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description de l'épisode
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {episode.description}
                </p>
              </div>
            </div>

            {/* Guest Info */}
            {episode.guest_name && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Invité de cet épisode
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">
                      {episode.guest_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{episode.guest_name}</h3>
                    <p className="text-sm text-gray-600">Invité spécial</p>
                  </div>
                </div>
              </div>
            )}

            {/* Related Episodes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Autres épisodes
              </h2>
              <p className="text-gray-600 text-sm">
                Découvrez d'autres épisodes de ce podcast...
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Card */}
            {episode.host_name && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Animateur
                </h3>
                <div className="flex items-start space-x-4">
                  {episode.host_avatar ? (
                    <img
                      src={episode.host_avatar}
                      alt={episode.host_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-600">
                        {episode.host_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {episode.host_name}
                    </h4>
                    <p className="text-sm text-gray-600">Animateur</p>
                  </div>
                </div>
              </div>
            )}

            {/* Episode Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Détails de l'épisode
              </h3>
              <div className="space-y-3">
                {episode.published_date && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Publié le</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(episode.published_date)}
                      </p>
                    </div>
                  </div>
                )}
                {episode.duration && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Durée</p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(episode.duration)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subscribe Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Abonnez-vous au podcast
              </h3>
              <p className="text-sm text-purple-100 mb-4">
                Ne manquez aucun épisode de nos podcasts SIB
              </p>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" className="flex-1">
                  Apple Podcasts
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  Spotify
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PodcastEpisodeDetailPage;
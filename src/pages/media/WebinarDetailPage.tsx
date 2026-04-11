import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Clock, Download, Share2, BookmarkPlus, Play } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VideoStreamPlayer } from '../../components/media/VideoStreamPlayer';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'sonner';

interface Webinar {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  category?: string;
  instructor_name?: string;
  instructor_title?: string;
  instructor_avatar?: string;
  scheduled_date?: string;
  attendees_count?: number;
  views_count?: number;
  created_at: string;
}

export const WebinarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadWebinar();
    }
  }, [id]);

  const loadWebinar = async () => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, title, description, video_url, thumbnail_url, duration, category, instructor_name, instructor_title, instructor_avatar, scheduled_date, attendees_count, views_count, created_at')
        .eq('id', id)
        .eq('type', 'webinar')
        .maybeSingle();

      if (error) throw error;
      setWebinar(data);
    } catch (error) {
      console.error('Error loading webinar:', error);
      toast.error('Erreur lors du chargement du webinaire');
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
        title: webinar?.title,
        text: webinar?.description,
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

  if (!webinar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Webinaire introuvable</h2>
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
            {/* Video Player */}
            {webinar.video_url ? (
              <VideoStreamPlayer
                src={webinar.video_url}
                poster={webinar.thumbnail_url}
                title={webinar.title}
                isLive={false}
              />
            ) : (
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Vidéo non disponible</p>
                </div>
              </div>
            )}

            {/* Title & Actions */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {webinar.title}
                  </h1>
                  {webinar.category && (
                    <Badge variant="default">{webinar.category}</Badge>
                  )}
                </div>
              </div>

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
                {webinar.video_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={webinar.video_url} download>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </a>
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {webinar.views_count && (
                  <div className="flex items-center">
                    <Play className="h-4 w-4 mr-1" />
                    {webinar.views_count.toLocaleString()} vues
                  </div>
                )}
                {webinar.attendees_count && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {webinar.attendees_count.toLocaleString()} participants
                  </div>
                )}
                {webinar.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(webinar.duration)}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                À propos de ce webinaire
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {webinar.description}
                </p>
              </div>
            </div>

            {/* Related Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Webinaires similaires
              </h2>
              <p className="text-gray-600 text-sm">
                Découvrez d'autres webinaires dans la même catégorie...
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor Card */}
            {webinar.instructor_name && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Intervenant
                </h3>
                <div className="flex items-start space-x-4">
                  {webinar.instructor_avatar ? (
                    <img
                      src={webinar.instructor_avatar}
                      alt={webinar.instructor_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-600">
                        {webinar.instructor_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {webinar.instructor_name}
                    </h4>
                    {webinar.instructor_title && (
                      <p className="text-sm text-gray-600">
                        {webinar.instructor_title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Détails
              </h3>
              <div className="space-y-3">
                {webinar.scheduled_date && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(webinar.scheduled_date)}
                      </p>
                    </div>
                  </div>
                )}
                {webinar.duration && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Durée</p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(webinar.duration)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Inscrivez-vous à SIB 2026
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Participez à nos webinaires en direct et accédez à tous les replays
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/register">
                  S'inscrire maintenant
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WebinarDetailPage;
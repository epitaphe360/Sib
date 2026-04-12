import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Radio, Calendar, Clock, Share2, Bell, MessageCircle, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VideoStreamPlayer } from '../../components/media/VideoStreamPlayer';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'sonner';

interface LiveStudio {
  id: string;
  title: string;
  description: string;
  content_url: string;
  thumbnail_url?: string;
  duration?: number;
  category?: string;
  host_name?: string;
  guest_name?: string;
  guest_title?: string;
  scheduled_date?: string;
  is_live?: boolean;
  viewers_count?: number;
  recording_url?: string;
  created_at: string;
}

export const LiveStudioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [liveStudio, setLiveStudio] = useState<LiveStudio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotified, setIsNotified] = useState(false);

  useEffect(() => {
    if (id) {
      loadLiveStudio();
    }
  }, [id]);

  const loadLiveStudio = async () => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, title, description, content_url:video_url, thumbnail_url, duration, category, host_name, guest_name, guest_title, scheduled_date, is_live, viewers_count, recording_url, created_at')
        .eq('id', id)
        .eq('type', 'live_studio')
        .maybeSingle();

      if (error) throw error;
      setLiveStudio(data);
    } catch (error) {
      console.error('Error loading live studio:', error);
      toast.error('Erreur lors du chargement du Live Studio');
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = () => {
    setIsNotified(!isNotified);
    toast.success(
      isNotified 
        ? 'Notification désactivée' 
        : 'Vous serez notifié au début du live'
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: liveStudio?.title,
        text: liveStudio?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!liveStudio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Studio introuvable</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const isUpcoming = liveStudio.scheduled_date && new Date(liveStudio.scheduled_date) > new Date();

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
            {/* Video Player or Placeholder */}
            <div className="relative">
              {liveStudio.is_live ? (
                <Badge 
                  variant="destructive" 
                  className="absolute top-4 left-4 z-10 animate-pulse"
                >
                  🔴 EN DIRECT
                </Badge>
              ) : isUpcoming ? (
                <Badge 
                  variant="default" 
                  className="absolute top-4 left-4 z-10"
                >
                  📅 À VENIR
                </Badge>
              ) : (
                <Badge 
                  variant="secondary" 
                  className="absolute top-4 left-4 z-10"
                >
                  🎬 REPLAY
                </Badge>
              )}
              
              {(liveStudio.is_live || liveStudio.recording_url) ? (
                <VideoStreamPlayer
                  src={liveStudio.is_live ? liveStudio.content_url : (liveStudio.recording_url || liveStudio.content_url)}
                  poster={liveStudio.thumbnail_url}
                  title={liveStudio.title}
                  isLive={liveStudio.is_live}
                />
              ) : (
                <div 
                  className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundImage: liveStudio.thumbnail_url ? `url(${liveStudio.thumbnail_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="text-center text-white p-8">
                    <Radio className="h-16 w-16 mx-auto mb-4 opacity-80" />
                    <h3 className="text-2xl font-bold mb-2">
                      {isUpcoming ? 'Live à venir' : 'Live terminé'}
                    </h3>
                    {liveStudio.scheduled_date && (
                      <p className="text-lg opacity-90">
                        {formatDate(liveStudio.scheduled_date)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Title & Actions */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Radio className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">LIVE STUDIO SIB</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {liveStudio.title}
              </h1>

              {liveStudio.category && (
                <Badge variant="default" className="mb-4">{liveStudio.category}</Badge>
              )}

              <div className="flex items-center space-x-4 mb-6">
                {isUpcoming && (
                  <Button
                    variant={isNotified ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleNotify}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {isNotified ? 'Notification activée' : 'Me notifier'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
                {liveStudio.is_live && (
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat en direct
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {liveStudio.is_live && liveStudio.viewers_count && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-red-600" />
                    <span className="text-red-600 font-medium">
                      {liveStudio.viewers_count.toLocaleString()} spectateurs
                    </span>
                  </div>
                )}
                {liveStudio.scheduled_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(liveStudio.scheduled_date)}
                  </div>
                )}
                {liveStudio.duration && !liveStudio.is_live && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(liveStudio.duration)}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                À propos de cette interview
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {liveStudio.description}
                </p>
              </div>
            </div>

            {/* Guest Info */}
            {liveStudio.guest_name && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Invité
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">
                      {liveStudio.guest_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{liveStudio.guest_name}</h3>
                    {liveStudio.guest_title && (
                      <p className="text-sm text-gray-600">{liveStudio.guest_title}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat (only if live) */}
            {liveStudio.is_live && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Chat en direct
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                  <p className="text-gray-600 text-sm text-center">
                    Le chat sera disponible pendant le live
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Card */}
            {liveStudio.host_name && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Animateur
                </h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-blue-600">
                      {liveStudio.host_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {liveStudio.host_name}
                    </h4>
                    <p className="text-sm text-gray-600">Animateur Live Studio</p>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Info */}
            {isUpcoming && liveStudio.scheduled_date && (
              <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-lg font-semibold mb-2">
                  Live prévu le
                </h3>
                <p className="text-sm text-red-100 mb-4">
                  {formatDate(liveStudio.scheduled_date)}
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleNotify}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Me rappeler
                </Button>
              </div>
            )}

            {/* Live Studio Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Live Studio SIB
              </h3>
              <p className="text-sm text-gray-600">
                Des interviews exclusives avec les acteurs clés du secteur du bâtiment, en direct de notre studio.
              </p>
            </div>

            {/* More Lives CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Tous les Lives
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Découvrez tous nos Lives Studios et replays
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/media/live-studio">
                  Voir tous les lives
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LiveStudioDetailPage;
import React, { useEffect, useState } from 'react';
import { Radio, Play, Pause, Square, Settings, Users, Eye, MessageCircle, Clock, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { VideoStreamPlayer } from '../../../components/media/VideoStreamPlayer';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  content_url: string;
  thumbnail_url?: string;
  scheduled_date?: string;
  is_live: boolean;
  viewers_count: number;
  host_name?: string;
  guest_name?: string;
  stream_key?: string;
  rtmp_url?: string;
  created_at: string;
}

export const LiveEventManager: React.FC = () => {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [currentLive, setCurrentLive] = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewersCount, setViewersCount] = useState(0);

  useEffect(() => {
    loadLiveEvents();
    
    // Setup real-time subscription for live updates
    const subscription = supabase
      .channel('live-events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'media_contents',
        filter: 'type=eq.live_studio'
      }, () => {
        loadLiveEvents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadLiveEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, title, description, content_url:video_url, thumbnail_url, scheduled_date, is_live, viewers_count, host_name, guest_name, stream_key, rtmp_url, created_at')
        .eq('type', 'live_studio')
        .order('scheduled_date', { ascending: false })
        .range(0, 49);

      if (error) throw error;
      setLiveEvents(data || []);
      
      // Find current live event
      const live = data?.find(e => e.is_live);
      if (live) {
        setCurrentLive(live);
        setIsStreaming(true);
        setViewersCount(live.viewers_count || 0);
      }
    } catch (error) {
      console.error('Error loading live events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLive = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .update({ 
          is_live: true,
          viewers_count: 0
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      
      setCurrentLive(data);
      setIsStreaming(true);
      toast.success('Live démarré !');
    } catch (error) {
      console.error('Error starting live:', error);
      toast.error('Erreur lors du démarrage du live');
    }
  };

  const handleStopLive = async () => {
    if (!currentLive) return;

    try {
      const { error } = await supabase
        .from('media_contents')
        .update({ 
          is_live: false,
          recording_url: currentLive.content_url // Save as recording
        })
        .eq('id', currentLive.id);

      if (error) throw error;
      
      setCurrentLive(null);
      setIsStreaming(false);
      setViewersCount(0);
      toast.success('Live terminé et enregistré');
      loadLiveEvents();
    } catch (error) {
      console.error('Error stopping live:', error);
      toast.error('Erreur lors de l\'arrêt du live');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Radio className="h-8 w-8 mr-3 text-red-600" />
            Gestion des Lives Studio
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos événements live et surveillez les statistiques en temps réel
          </p>
        </div>

        {/* Current Live Section */}
        {isStreaming && currentLive ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-red-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Badge variant="destructive" className="animate-pulse">
                  🔴 EN DIRECT
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentLive.title}
                </h2>
              </div>
              <Button
                variant="destructive"
                onClick={handleStopLive}
              >
                <Square className="h-4 w-4 mr-2" />
                Arrêter le live
              </Button>
            </div>

            {/* Video Player */}
            <div className="mb-6">
              <VideoStreamPlayer
                src={currentLive.content_url}
                poster={currentLive.thumbnail_url}
                title={currentLive.title}
                isLive={true}
              />
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Spectateurs</p>
                    <p className="text-3xl font-bold text-red-900">{viewersCount}</p>
                  </div>
                  <Users className="h-10 w-10 text-red-600 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Vues totales</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {currentLive.viewers_count || 0}
                    </p>
                  </div>
                  <Eye className="h-10 w-10 text-blue-600 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Messages</p>
                    <p className="text-3xl font-bold text-green-900">0</p>
                  </div>
                  <MessageCircle className="h-10 w-10 text-green-600 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Durée</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {Math.floor((Date.now() - new Date(currentLive.created_at).getTime()) / 60000)} min
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-purple-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Live Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentLive.host_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Animateur</p>
                    <p className="text-gray-900">{currentLive.host_name}</p>
                  </div>
                )}
                {currentLive.guest_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Invité</p>
                    <p className="text-gray-900">{currentLive.guest_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stream Settings */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Paramètres de diffusion
              </h3>
              <div className="space-y-2 text-sm">
                {currentLive.rtmp_url && (
                  <div>
                    <span className="font-medium text-gray-700">URL RTMP: </span>
                    <code className="bg-white px-2 py-1 rounded text-xs">
                      {currentLive.rtmp_url}
                    </code>
                  </div>
                )}
                {currentLive.stream_key && (
                  <div>
                    <span className="font-medium text-gray-700">Stream Key: </span>
                    <code className="bg-white px-2 py-1 rounded text-xs">
                      {currentLive.stream_key}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* No Live Active */
          <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-8">
            <Radio className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun live en cours
            </h3>
            <p className="text-gray-600">
              Sélectionnez un événement planifié pour démarrer un live
            </p>
          </div>
        )}

        {/* Scheduled Events */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Événements planifiés
          </h2>

          {liveEvents.filter(e => !e.is_live).length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Aucun événement planifié
            </p>
          ) : (
            <div className="space-y-4">
              {liveEvents
                .filter(e => !e.is_live)
                .map((event) => {
                  const isUpcoming = event.scheduled_date && new Date(event.scheduled_date) > new Date();
                  
                  return (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            {isUpcoming ? (
                              <Badge variant="default">À venir</Badge>
                            ) : (
                              <Badge variant="secondary">Passé</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {event.description}
                          </p>

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            {event.scheduled_date && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(event.scheduled_date)}
                              </div>
                            )}
                            {event.host_name && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {event.host_name}
                                {event.guest_name && ` & ${event.guest_name}`}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {isUpcoming && !isStreaming && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStartLive(event.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Démarrer
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/media/live-studio/${event.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

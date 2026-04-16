import React, { useState, useEffect } from 'react';
import { Video, Clock, Users, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SpeedNetworkingService } from '../../services/speedNetworking';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

interface SpeedNetworkingProps {
  sessionId: string;
}

interface SpeedNetworkingSession {
  id: string;
  duration: number;
  participants: string[];
  [key: string]: unknown;
}

interface SpeedNetworkingMatch {
  startTime: string;
  [key: string]: unknown;
}

export const SpeedNetworking: React.FC<SpeedNetworkingProps> = ({ sessionId }) => {
  const { user } = useAuthStore();
  const [session, setSession] = useState<SpeedNetworkingSession | null>(null);
  const [currentMatch, setCurrentMatch] = useState<SpeedNetworkingMatch | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  // Check for current match changes every 5 seconds
  useEffect(() => {
    if (sessionId) {
      const interval = setInterval(checkCurrentMatch, 5000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  useEffect(() => {
    if (currentMatch && session) {
      const timer = setInterval(() => {
        const matchStart = new Date(currentMatch.startTime).getTime();
        const now = new Date().getTime();
        const elapsed = now - matchStart;
        const remaining = Math.max(0, (session.duration * 60000) - elapsed);
        setTimeRemaining(Math.floor(remaining / 1000));

        if (remaining === 0) {
          checkCurrentMatch();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentMatch, session]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from('speed_networking_sessions')
        .select('id, event_id, eventId:event_id, name, description, start_time, startTime:start_time, duration, max_participants, maxParticipants:max_participants, participants, status, matches')
        .eq('id', sessionId)
        .maybeSingle();

      if (error) {throw error;}
      setSession(data);
      setIsParticipant(data?.participants?.includes(user?.id) ?? false);
      await checkCurrentMatch();
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Erreur lors du chargement de la session');
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentMatch = async () => {
    if (!user) {return;}

    try {
      const match = await SpeedNetworkingService.getCurrentMatch(sessionId, user.id);
      setCurrentMatch(match);
    } catch (error) {
      console.error('Error checking current match:', error);
    }
  };

  const handleRegister = async () => {
    if (!user) {return;}

    try {
      await SpeedNetworkingService.registerParticipant(sessionId, user.id);
      toast.success('Inscription confirmée !');
      loadSession();
    } catch (error: unknown) {
      const errorInfo = error as Record<string, unknown>;
      toast.error((errorInfo.message as string) || 'Erreur lors de l\'inscription');
    }
  };

  const handleConnect = async (userId: string) => {
    if (!user) {return;}

    try {
      await supabase
        .from('networking_interactions')
        .insert([{
          from_user_id: user.id,
          to_user_id: userId,
          type: 'connection',
          timestamp: new Date().toISOString()
        }]);

      toast.success('Demande de connexion envoyée !');
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Erreur lors de la connexion');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Session non trouvée</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{session.name}</h1>
            <p className="text-blue-100 mb-4">{session.description}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{session.duration} min par rencontre</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{session.participants.length}/{session.max_participants} participants</span>
              </div>
              <Badge className={
                session.status === 'active' ? 'bg-green-500' :
                session.status === 'scheduled' ? 'bg-yellow-500' :
                'bg-gray-500'
              }>
                {session.status === 'active' ? '🔴 En cours' :
                 session.status === 'scheduled' ? '⏰ Programmé' :
                 '✅ Terminé'}
              </Badge>
            </div>
          </div>

          {!isParticipant && session.status === 'scheduled' && (
            <Button
              onClick={handleRegister}
              disabled={session.participants.length >= session.max_participants}
              className="bg-white text-purple-600 hover:bg-blue-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              S'inscrire
            </Button>
          )}
        </div>
      </div>

      {/* Current Match */}
      {isParticipant && session.status === 'active' && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {currentMatch ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <Video className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Rencontre en cours</h2>
                <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-blue-600 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-gray-600">Temps restant pour cette rencontre</p>
              </div>

              {/* Partner Info */}
              <div className="border rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {currentMatch.user2?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">
                      {currentMatch.user2_profile?.company || 'Partenaire'}
                    </h3>
                    <p className="text-gray-600">
                      {currentMatch.user2_profile?.role || 'Professionnel'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {currentMatch.user2_profile?.interests?.slice(0, 3).map((interest: string) => (
                        <Badge key={interest} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConnect(currentMatch.user2)}
                    className="bg-blue-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connecter
                  </Button>
                </div>
              </div>

              {/* Video Call Placeholder */}
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Espace de rencontre virtuelle</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Intégration vidéo (Zoom, Meet, etc.)
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">En attente de la prochaine rencontre</h3>
              <p className="text-gray-600">Votre prochaine rencontre commencera bientôt</p>
            </div>
          )}
        </div>
      )}

      {/* Schedule */}
      {isParticipant && session.matches && session.matches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📅 Votre programme</h2>
          <div className="space-y-3">
            {session.matches
              .filter((match: any) => match.user1 === user?.id || match.user2 === user?.id)
              .map((match: any, index: number) => {
                const partner = match.user1 === user?.id ? match.user2 : match.user1;
                const startTime = new Date(match.startTime);
                const isCurrent = currentMatch?.roomId === match.roomId;
                const isPast = new Date().getTime() > startTime.getTime() + session.duration * 60000;

                return (
                  <div
                    key={match.roomId}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      isCurrent ? 'border-green-500 bg-green-50' :
                      isPast ? 'border-gray-200 bg-gray-50 opacity-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm text-gray-600">
                        Rencontre avec {partner}
                      </div>
                    </div>
                    {isCurrent && (
                      <Badge className="bg-green-500">En cours</Badge>
                    )}
                    {isPast && (
                      <Badge variant="outline">Terminé</Badge>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Waiting Room */}
      {isParticipant && session.status === 'scheduled' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-2">Session programmée</h2>
          <p className="text-gray-600 mb-4">
            La session débutera le {new Date(session.start_time).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-sm text-gray-500">
            Vous recevrez une notification au démarrage
          </p>
        </div>
      )}
    </div>
  );
};

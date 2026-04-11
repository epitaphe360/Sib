import React, { useState, useEffect } from 'react';
import { Eye, Heart, MessageCircle, Video, Calendar, Filter } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { MatchmakingService } from '../../services/matchmaking';
import useAuthStore from '../../store/authStore';
import type { NetworkingInteraction } from '../../types/site-builder';

export const InteractionHistory: React.FC = () => {
  const { user } = useAuthStore();
  const [interactions, setInteractions] = useState<NetworkingInteraction[]>([]);
  const [filteredInteractions, setFilteredInteractions] = useState<NetworkingInteraction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const interactionTypes = [
    { id: 'all', label: 'Toutes', icon: '📋' },
    { id: 'view', label: 'Vues', icon: '👁️' },
    { id: 'like', label: 'Likes', icon: '❤️' },
    { id: 'message', label: 'Messages', icon: '💬' },
    { id: 'meeting', label: 'Réunions', icon: '🎥' },
    { id: 'connection', label: 'Connexions', icon: '🤝' }
  ];

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    filterInteractions();
  }, [interactions, filterType]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const history = await MatchmakingService.getInteractionHistory(user.id);
      setInteractions(history);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInteractions = () => {
    if (filterType === 'all') {
      setFilteredInteractions(interactions);
    } else {
      setFilteredInteractions(interactions.filter(i => i.type === filterType));
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      case 'meeting':
        return <Video className="w-5 h-5 text-purple-600" />;
      case 'connection':
        return <Badge className="bg-yellow-500">🤝 Connecté</Badge>;
      default:
        return null;
    }
  };

  const getInteractionLabel = (type: string) => {
    const labels: Record<string, string> = {
      view: 'a consulté votre profil',
      like: 'a aimé votre profil',
      message: 'vous a envoyé un message',
      meeting: 'a eu une réunion avec vous',
      connection: 'est maintenant connecté avec vous'
    };
    return labels[type] || type;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else if (days < 7) {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getStats = () => {
    const stats = {
      total: interactions.length,
      views: interactions.filter(i => i.type === 'view').length,
      likes: interactions.filter(i => i.type === 'like').length,
      messages: interactions.filter(i => i.type === 'message').length,
      meetings: interactions.filter(i => i.type === 'meeting').length,
      connections: interactions.filter(i => i.type === 'connection').length
    };
    return stats;
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Historique des Interactions</h1>
        <p className="text-gray-600">
          Suivez toutes vos interactions de networking
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.views}</div>
          <div className="text-xs text-gray-600">Vues</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.likes}</div>
          <div className="text-xs text-gray-600">Likes</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.messages}</div>
          <div className="text-xs text-gray-600">Messages</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.meetings}</div>
          <div className="text-xs text-gray-600">Réunions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.connections}</div>
          <div className="text-xs text-gray-600">Connexions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {interactionTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {type.icon} {type.label}
              {type.id !== 'all' && (
                <span className="ml-2 text-xs opacity-75">
                  ({stats[type.id as keyof typeof stats] || 0})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredInteractions.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Aucune interaction pour ce filtre</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredInteractions.map((interaction, index) => (
              <div
                key={`${interaction.id}-${index}`}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getInteractionIcon(interaction.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold">
                          Professionnel #{interaction.toUserId.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getInteractionLabel(interaction.type)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(interaction.timestamp)}
                      </span>
                    </div>

                    {/* Metadata */}
                    {interaction.metadata && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                        {JSON.stringify(interaction.metadata)}
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {interaction.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="mt-6 text-center">
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          📥 Exporter l'historique (CSV)
        </button>
      </div>
    </div>
  );
};

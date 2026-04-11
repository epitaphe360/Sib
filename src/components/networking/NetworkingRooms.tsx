import React, { useState, useEffect } from 'react';
import { Users, Search, LogIn, LogOut, MessageCircle, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import type { NetworkingRoom } from '../../types/site-builder';
import { toast } from 'sonner';

interface NetworkingRoomsProps {
  eventId: string;
}

export const NetworkingRooms: React.FC<NetworkingRoomsProps> = ({ eventId }) => {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<NetworkingRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<NetworkingRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sectors = [
    'all',
    'Sport Business',
    'Marketing & Communication',
    'Médias & Broadcast',
    'E-sport & Gaming',
    'Équipementiers',
    'Sponsoring',
    'Innovation & Tech',
    'Infrastructures',
    'Santé & Performance'
  ];

  useEffect(() => {
    loadRooms();
    const unsubscribe = subscribeToRoomUpdates();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [eventId]);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchQuery, selectedSector]);

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('networking_rooms')
        .select('id, name, sector, description, capacity, participants, moderator, status, tags, event_id')
        .eq('event_id', eventId)
        .order('sector', { ascending: true })
        .range(0, 49);

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Erreur lors du chargement des salles');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRoomUpdates = () => {
    const subscription = supabase
      .channel('networking_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'networking_rooms',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          loadRooms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (selectedSector !== 'all') {
      filtered = filtered.filter(room => room.sector === selectedSector);
    }

    if (searchQuery) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredRooms(filtered);
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;

      if (room.participants.length >= room.capacity) {
        toast.error('Cette salle est pleine');
        return;
      }

      if (room.participants.includes(user.id)) {
        toast.error('Vous êtes déjà dans cette salle');
        return;
      }

      // Leave current room if in one
      if (currentRoom) {
        await handleLeaveRoom(currentRoom);
      }

      const { error } = await supabase
        .from('networking_rooms')
        .update({
          participants: [...room.participants, user.id]
        })
        .eq('id', roomId);

      if (error) throw error;

      setCurrentRoom(roomId);
      toast.success(`Vous avez rejoint ${room.name}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Erreur lors de l\'entrée dans la salle');
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    if (!user) return;

    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;

      const { error } = await supabase
        .from('networking_rooms')
        .update({
          participants: room.participants.filter(id => id !== user.id)
        })
        .eq('id', roomId);

      if (error) throw error;

      if (currentRoom === roomId) {
        setCurrentRoom(null);
      }

      toast.success('Vous avez quitté la salle');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Erreur lors de la sortie');
    }
  };

  const getRoomStatusColor = (room: NetworkingRoom) => {
    const occupancy = (room.participants.length / room.capacity) * 100;
    
    if (room.status === 'closed') return 'bg-gray-500';
    if (occupancy >= 90) return 'bg-red-500';
    if (occupancy >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🚪 Salles de Networking</h1>
        <p className="text-gray-600">
          Rejoignez des discussions thématiques et élargissez votre réseau
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('networking.search_room')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* Sector Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedSector === sector
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {sector === 'all' ? '📁 Tous les secteurs' : sector}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Aucune salle trouvée</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => {
            const isInRoom = currentRoom === room.id;
            const isFull = room.participants.length >= room.capacity;
            const occupancyPercent = (room.participants.length / room.capacity) * 100;

            return (
              <div
                key={room.id}
                className={`bg-white rounded-lg shadow-sm p-6 transition-all ${
                  isInRoom ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{room.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{room.sector}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getRoomStatusColor(room)}`} />
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {room.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Participants</span>
                    <span className="font-semibold">
                      {room.participants.length}/{room.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        occupancyPercent >= 90 ? 'bg-red-500' :
                        occupancyPercent >= 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                {/* Moderator */}
                {room.moderator && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Shield className="w-4 h-4" />
                    <span>Modéré par {room.moderator}</span>
                  </div>
                )}

                {/* Actions */}
                {isInRoom ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleLeaveRoom(room.id)}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Quitter la salle
                    </Button>
                    <Button className="w-full bg-blue-600">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ouvrir le chat
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={isFull || room.status === 'closed'}
                    className="w-full"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isFull ? 'Salle pleine' : room.status === 'closed' ? 'Fermée' : 'Rejoindre'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

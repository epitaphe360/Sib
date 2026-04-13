
import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, X, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TimeSlot } from '../../types';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';
import { getMinSlotDate, getMaxSlotDate } from '../../config/salonInfo';

interface AvailabilityManagerProps {
  userId: string;
  userType: 'exhibitor' | 'partner';
  onAvailabilityUpdate?: (timeSlots: TimeSlot[]) => void;
}

export default function AvailabilityManager({ userId, userType, onAvailabilityUpdate }: AvailabilityManagerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: getMinSlotDate(),
    startTime: '',
    endTime: '',
    type: 'in-person' as const,
    maxBookings: 5,
    location: ''
  });

  // Fetch time slots from Supabase for the current user
  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      try {
        const slots = await SupabaseService.getTimeSlotsByUser(userId);
        setTimeSlots(slots);
      } catch {
        toast.error('Erreur lors du chargement des créneaux');
      }
      setIsLoading(false);
    };
    fetchTimeSlots();
  }, [userId]);

  const handleAddTimeSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    const startMinutes = timeToMinutes(newSlot.startTime);
    const endMinutes = timeToMinutes(newSlot.endTime);

    if (endMinutes <= startMinutes) {
      toast.error("L'heure de fin doit être après l'heure de début.");
      return;
    }

    // Check for overlapping time slots
    const newSlotStart = new Date(`${newSlot.date}T${newSlot.startTime}:00`);
    const newSlotEnd = new Date(`${newSlot.date}T${newSlot.endTime}:00`);

    const overlappingSlot = timeSlots.find(slot => {
      const existingSlotStart = new Date(`${slot.date}T${slot.startTime}:00`);
      const existingSlotEnd = new Date(`${slot.date}T${slot.endTime}:00`);

      return (
        (newSlotStart < existingSlotEnd && newSlotEnd > existingSlotStart)
      );
    });

    if (overlappingSlot) {
      toast.error("Ce créneau chevauche un créneau existant.");
      return;
    }
    setIsLoading(true);
    try {
      const newTimeSlot = await SupabaseService.createTimeSlot({
        userId,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        duration: calculateDuration(newSlot.startTime, newSlot.endTime),
        type: newSlot.type,
        maxBookings: newSlot.maxBookings,
        location: newSlot.location || undefined
      });

      toast.success('Créneau ajouté avec succès');
      setTimeSlots(prev => [...prev, newTimeSlot]);
      onAvailabilityUpdate?.([...timeSlots, newTimeSlot]);
      setNewSlot({
        date: getMinSlotDate(),
        startTime: '',
        endTime: '',
        type: 'in-person',
        maxBookings: 5,
        location: ''
      });
      setShowAddForm(false);
    } catch {
      toast.error('Erreur lors de l\'ajout du créneau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    setIsLoading(true);
    try {
      await SupabaseService.deleteTimeSlot(slotId);
      const updatedSlots = timeSlots.filter(slot => slot.id !== slotId);
      setTimeSlots(updatedSlots);
      onAvailabilityUpdate?.(updatedSlots);
      toast.success('Créneau supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return endMinutes - startMinutes;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'in-person': return 'bg-blue-100 text-blue-800';
      case 'virtual': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'in-person': return 'Présentiel';
      case 'virtual': return 'Virtuel';
      case 'hybrid': return 'Hybride';
      default: return type;
    }
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-10 w-10 opacity-80" />
            <div className="text-right">
              <div className="text-4xl font-black">{timeSlots.length}</div>
              <div className="text-sm font-medium opacity-90">Total créneaux</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-10 w-10 opacity-80" />
            <div className="text-right">
              <div className="text-4xl font-black">{timeSlots.filter(s => s.available).length}</div>
              <div className="text-sm font-medium opacity-90">Places disponibles</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-10 w-10 opacity-80" />
            <div className="text-right">
              <div className="text-4xl font-black">
                {timeSlots.reduce((acc, slot) => acc + slot.currentBookings, 0)}
              </div>
              <div className="text-sm font-medium opacity-90">RDV réservés</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
            <Calendar className="h-6 w-6 mr-3 text-blue-600" />
            Gestion des Disponibilités
          </h3>
          <p className="text-base text-gray-600">
            Créez et gérez vos créneaux de rendez-vous pour SIB 2026
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Créneau
        </Button>
      </div>

      {/* Add Time Slot Form */}
      {showAddForm && (
        <Card className="p-8 border-4 border-blue-300/50 shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ✨ Nouveau Créneau
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                Date *
              </label>
              <input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                min={getMinSlotDate()}
                max={getMaxSlotDate()}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-xs bg-blue-100 text-blue-800 font-semibold px-3 py-2 rounded-lg inline-flex items-center">
                📅 SIB 2026 : Du 25 au 29 novembre 2026
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Type de rencontre
              </label>
              <select
                value={newSlot.type}
                onChange={(e) => setNewSlot({...newSlot, type: e.target.value as any})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="in-person">🏢 Présentiel</option>
                <option value="virtual">💻 Virtuel</option>
                <option value="hybrid">🌐 Hybride</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-600" />
                Heure de début *
              </label>
              <input
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-600" />
                Heure de fin *
              </label>
              <input
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2 text-purple-600" />
                Nombre max de RDV
              </label>
              <input
                type="number"
                value={newSlot.maxBookings}
                onChange={(e) => setNewSlot({...newSlot, maxBookings: parseInt(e.target.value)})}
                min="1"
                max="10"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                📍 Lieu (optionnel)
              </label>
              <input
                type="text"
                value={newSlot.location}
                onChange={(e) => setNewSlot({...newSlot, location: e.target.value})}
                placeholder="Stand A-12, Zoom, etc."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t-2 border-gray-100">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 border-2 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddTimeSlot}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? <span className="animate-spin">⚙️</span> : <Save className="h-5 w-5 mr-2" />}
              {isLoading ? 'Ajout...' : 'Ajouter le créneau'}
            </Button>
          </div>
        </Card>
      )}

      {/* Time Slots List */}
      <div className="space-y-4">
        {timeSlots.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Aucune disponibilité configurée
            </h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Commencez par ajouter vos créneaux de disponibilité pour permettre aux visiteurs de prendre rendez-vous avec vous pendant SIB 2026.
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer mon premier créneau
            </Button>
          </Card>
        ) : (
          timeSlots.map((slot) => (
            <Card key={slot.id} className="p-6 hover:shadow-xl transition-all duration-300 bg-white border-2 border-gray-100 hover:border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-bold text-xl text-gray-900">
                        {formatDate(slot.date)}
                      </span>
                      <Badge className={`${getTypeColor(slot.type)} px-3 py-1 text-sm font-bold`}>
                        {getTypeLabel(slot.type)}
                      </Badge>
                    </div>
                    <div className="text-base text-gray-700 font-medium mb-1">
                      ⏰ {slot.startTime} - {slot.endTime} <span className="text-gray-500">({slot.duration} min)</span>
                      {slot.location && <span className="ml-2">📍 {slot.location}</span>}
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                        👥 {slot.currentBookings}/{slot.maxBookings} RDV réservés
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={slot.available ? 'success' : 'error'}
                    className="px-4 py-2 text-sm font-bold"
                  >
                    {slot.available ? '✅ Disponible' : '🔒 Complet'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTimeSlot(slot.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? <span className="animate-spin text-lg">⚙️</span> : <Trash2 className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Section */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Gestion des créneaux obligatoire
            </h4>
            <p className="text-sm text-blue-700">
              En tant qu'{userType === 'partner' ? 'partenaire' : 'exposant'}, vous devez définir vos créneaux de disponibilité
              pour permettre aux autres participants de prendre rendez-vous. Ces créneaux apparaîtront dans votre profil
              et seront visibles lors des recommandations IA.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Handshake } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TimeSlot, User } from '../../types';
import { toast } from 'sonner';

interface AvailabilityCalendarProps {
  user: User;
  showBooking?: boolean;
  onBookSlot?: (slot: TimeSlot) => void;
}

export default function AvailabilityCalendar({ user, showBooking = false, onBookSlot }: AvailabilityCalendarProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-04-01T00:00:00'));
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from API based on user ID
  useEffect(() => {
    const mockTimeSlots: TimeSlot[] = [
      {
        id: '1',
        date: new Date('2026-04-01T00:00:00'),
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        type: 'in-person',
        maxBookings: 3,
        currentBookings: 1,
        available: true,
        location: 'Stand A-12'
      },
      {
        id: '2',
        date: new Date('2026-04-01T00:00:00'),
        startTime: '14:00',
        endTime: '15:00',
        duration: 60,
        type: 'virtual',
        maxBookings: 5,
        currentBookings: 2,
        available: true,
        location: 'Zoom Meeting'
      },
      {
        id: '3',
        date: new Date('2026-04-02T00:00:00'),
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        type: 'hybrid',
        maxBookings: 4,
        currentBookings: 4,
        available: false,
        location: 'Stand A-12 + Zoom'
      },
      {
        id: '4',
        date: new Date('2026-04-03T00:00:00'),
        startTime: '15:00',
        endTime: '16:00',
        duration: 60,
        type: 'in-person',
        maxBookings: 3,
        currentBookings: 0,
        available: true,
        location: 'Stand A-12'
      }
    ];
    setTimeSlots(mockTimeSlots);
  }, [user.id]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in-person': return <MapPin className="h-4 w-4" />;
      case 'virtual': return <Video className="h-4 w-4" />;
      case 'hybrid': return <Handshake className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'in-person': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'virtual': return 'bg-green-100 text-green-800 border-green-200';
      case 'hybrid': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getAvailableSlotsForDate = (date: Date) => {
    return timeSlots.filter(slot =>
      slot.date.toDateString() === date.toDateString() &&
      slot.available
    );
  };

  const handleBookSlot = async (slot: TimeSlot) => {
    if (!showBooking) return;

    setIsLoading(true);
    try {
      // Mock booking process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update slot bookings
      setTimeSlots(prevSlots =>
        prevSlots.map(s =>
          s.id === slot.id
            ? { ...s, currentBookings: s.currentBookings + 1, available: s.currentBookings + 1 < s.maxBookings }
            : s
        )
      );

      toast.success(`Rendez-vous réservé avec ${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''} le ${formatDate(slot.date)} à ${slot.startTime}`);
      onBookSlot?.(slot);
    } catch {
      toast.error('Erreur lors de la réservation');
    } finally {
      setIsLoading(false);
    }
  };

  const availableDates = [...new Set(
    timeSlots
      .filter(slot => slot.available)
      .map(slot => slot.date.toDateString())
  )].map(dateStr => new Date(dateStr));

  const selectedDateSlots = getAvailableSlotsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Disponibilités de {user?.profile?.firstName || 'l\'utilisateur'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {user.type === 'partner' ? 'Partenaire' : 'Exposant'} • {timeSlots.filter(s => s.available).length} créneau{timeSlots.filter(s => s.available).length !== 1 ? 'x' : ''} disponible{timeSlots.filter(s => s.available).length !== 1 ? 's' : ''}
          </p>
          <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
            📅 SIB 2026 : 1-3 avril uniquement
          </div>
        </div>
        {showBooking && (
          <Badge variant="info" className="bg-green-100 text-green-800">
            Réservation possible
          </Badge>
        )}
      </div>

      {/* Date Selector */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">Sélectionner une date</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableDates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedDate.toDateString() === date.toDateString()
                  ? 'bg-blue-100 border-blue-300 text-blue-900'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium">
                {new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date)}
              </div>
              <div className="text-lg font-bold">
                {date.getDate()}
              </div>
              <div className="text-xs text-gray-500">
                {new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date)}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Time Slots for Selected Date */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Créneaux disponibles le {formatDate(selectedDate)}
        </h4>

        {selectedDateSlots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Aucun créneau disponible pour cette date
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateSlots.map((slot) => {
              // Vérifier si le créneau est complet (toutes les places réservées)
              const isFullyBooked = (slot.currentBookings || 0) >= (slot.maxBookings || 1);
              const hasBookings = (slot.currentBookings || 0) > 0;
              
              return (
              <div
                key={slot.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  isFullyBooked 
                    ? 'border-red-200 bg-red-50' 
                    : hasBookings
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg border ${getTypeColor(slot.type)}`}>
                    {getTypeIcon(slot.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <Badge className={getTypeColor(slot.type)}>
                        {getTypeLabel(slot.type)}
                      </Badge>
                      {isFullyBooked && (
                        <Badge className="bg-red-100 text-red-800 border-red-300">
                          COMPLET
                        </Badge>
                      )}
                      {hasBookings && !isFullyBooked && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                          {slot.currentBookings} RÉSERVÉ{slot.currentBookings > 1 ? 'S' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {slot.location && `${slot.location} • `}
                      {slot.currentBookings}/{slot.maxBookings} places réservées
                    </div>
                  </div>
                </div>

                {showBooking && (
                  <Button
                    onClick={() => handleBookSlot(slot)}
                    disabled={isLoading || !slot.available || isFullyBooked}
                    size="sm"
                    className={isFullyBooked ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
                  >
                    {isLoading ? 'Réservation...' : isFullyBooked ? 'Complet' : 'Réserver'}
                  </Button>
                )}
              </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Legend */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-3">Légende des types de rencontre</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded border bg-blue-100 border-blue-200">
              <MapPin className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700">Présentiel - Rencontre sur stand</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded border bg-green-100 border-green-200">
              <Video className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-sm text-gray-700">Virtuel - Via Zoom/Teams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded border bg-purple-100 border-purple-200">
              <Handshake className="h-3 w-3 text-purple-600" />
            </div>
            <span className="text-sm text-gray-700">Hybride - Présentiel + Virtuel</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

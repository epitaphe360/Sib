
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Calendar, Clock } from 'lucide-react';
import { TimeSlot } from '../../types';
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';

interface PublicAvailabilityProps {
  userId: string;
}

const PublicAvailability = ({ userId }: PublicAvailabilityProps) => {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const user = useAuthStore((state: any) => state.user);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const slots = await SupabaseService.getTimeSlotsByUser(userId);
        setTimeSlots(slots);
      } catch (error) {
        console.error('Erreur lors du chargement des créneaux:', error);
      }
      setIsLoading(false);
    };
    fetchSlots();
  }, [userId]);

  // Demande de rendez-vous
  const handleRequestAppointment = async (slot: TimeSlot) => {
    if (!user) {
      toast.error("Veuillez vous connecter pour prendre un rendez-vous");
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`/exhibitor/${userId}`)}`);
      return;
    }
    setRequesting(slot.id);
    setSuccessId(null);
    try {
      await SupabaseService.createAppointment({
        exhibitorId: userId,
        visitorId: user.id,
        timeSlotId: slot.id,
        status: 'pending',
        meetingType: slot.type
      });
      setSuccessId(slot.id);
      toast.success('Demande de rendez-vous envoyée avec succès !');
    } catch (error) {
      console.error('Erreur RDV:', error);
      toast.error('Erreur lors de la demande de rendez-vous');
    }
    setRequesting(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'in-person': return 'Présentiel';
      case 'virtual': return 'Virtuel';
      case 'hybrid': return 'Hybride';
      default: return type;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div>Chargement des créneaux...</div>
      ) : (
        timeSlots.filter(slot => slot.available && slot.currentBookings < slot.maxBookings).length === 0 ? (
          <Card className="p-6 text-center">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-600">Aucun créneau disponible pour le moment.</div>
          </Card>
        ) : (
          timeSlots.filter(slot => slot.available && slot.currentBookings < slot.maxBookings).map(slot => (
            <Card key={slot.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">{formatDate(slot.date)}</div>
                <div className="text-sm text-gray-600">{slot.startTime} - {slot.endTime} ({slot.duration} min)</div>
                <div className="text-xs text-gray-500 mt-1">{slot.location}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge>{getTypeLabel(slot.type)}</Badge>
              {user && user.id !== userId && (
                <Button
                  size="sm"
                  disabled={requesting === slot.id}
                  onClick={() => handleRequestAppointment(slot)}
                  variant={successId === slot.id ? 'outline' : 'default'}
                >
                  {successId === slot.id
                    ? 'Demande envoyée'
                    : requesting === slot.id
                      ? 'Envoi...'
                      : 'Demander un rendez-vous'}
                </Button>
              )}
            </div>
            </Card>
          ))
        )
      )}
    </div>
  );
};

export default PublicAvailability;

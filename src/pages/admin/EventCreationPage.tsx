import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EventCreationForm from '../../components/admin/EventCreationForm';
import { SupabaseService } from '../../services/supabaseService';
import { Event } from '../../types';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';

export default function EventCreationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [eventToEdit, setEventToEdit] = useState<Event | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const editId = searchParams.get('edit');

  useEffect(() => {
    if (editId) {
      loadEvent(editId);
    }
  }, [editId]);

  const loadEvent = async (id: string) => {
    setIsLoading(true);
    try {
      const events = await SupabaseService.getEvents();
      const event = events.find(e => e.id === id);
      if (event) {
        setEventToEdit({
          ...event,
          date: event.date ? new Date(event.date) : new Date(),
        });
      } else {
        toast.error('Événement non trouvé');
        navigate(ROUTES.ADMIN_EVENTS);
      }
    } catch (error) {
      console.error('Erreur chargement événement:', error);
      toast.error('Impossible de charger l\'événement');
      navigate(ROUTES.ADMIN_EVENTS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate(ROUTES.ADMIN_EVENTS);
  };

  const handleCancel = () => {
    navigate(ROUTES.ADMIN_EVENTS);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <EventCreationForm 
      eventToEdit={eventToEdit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

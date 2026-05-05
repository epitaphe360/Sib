import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { ArrowLeft, Calendar, Crown, BadgePercent } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  status: string;
  max_participants: number;
  registrations?: { count: number }[];
}

export const PartnerEventsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      // Charger les événements depuis Supabase
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations:event_registrations(count)
        `)
        .order('start_date', { ascending: false })
        .range(0, 49);

      if (error) {throw error;}
      if (data) {setEvents(data as unknown as Event[]);} // Cast might be needed depending on type definitions, but for now assuming it fits
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusLabel = (status: string) => {
    if (status === 'published') {return t('partner.status.upcoming', 'À venir');}
    if (status === 'draft') {return t('partner.status.draft', 'Brouillon');}
    return status;
  };

  const getStatusVariant = (status: string): 'info' | 'warning' | 'success' => {
    if (status === 'published') {return 'info';}
    if (status === 'draft') {return 'warning';}
    return 'success';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('partner.back_to_dashboard', 'Retour au tableau de bord')}
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('partner.events.title', 'Événements Sponsorisés')}</h1>
              <p className="text-gray-600">{t('partner.events.subtitle', 'Gérez vos événements partenaires et suivez leur impact')}</p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-medium">{t('partner.events.program', 'Programme Événements Partenaires')}</span>
              <Badge className="bg-purple-100 text-purple-800" size="sm">
                {t('partner.priority', 'Prioritaire')}
              </Badge>
            </div>
          </div>
        </div>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {t('partner.events.available', 'Événements disponibles')} ({events.length})
            </h3>

            {loading ? (
              <div className="text-center py-12 text-gray-500">{t('partner.events.loading', 'Chargement des événements...')}</div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {t('partner.events.none', 'Aucun événement disponible pour le moment.')}
              </div>
            ) : (
              <div data-testid="event-list" className="space-y-4">
                {events.map(evt => {
                  const registrationCount = evt.registrations?.[0]?.count || 0;

                  return (
                    <div key={evt.id} className="flex items-center justify-between border p-4 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{evt.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{evt.description?.substring(0, 100)}...</div>
                        <div className="text-sm text-gray-500 mt-2">
                          {evt.event_type} • {new Date(evt.start_time).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={getStatusVariant(evt.status)} size="sm">
                          {getStatusLabel(evt.status)}
                        </Badge>
                        <span className="text-sm text-gray-700">
                          {registrationCount > 0 ? `${registrationCount} ${t('partner.events.registered', 'inscrits')}` : `${t('partner.events.capacity', 'Capacité')}: ${evt.max_participants || 'N/A'}`}
                        </span>
                        <Button variant="outline" size="sm">
                          <BadgePercent className="h-4 w-4 mr-2" />
                          {t('partner.details', 'Détails')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PartnerEventsPage;

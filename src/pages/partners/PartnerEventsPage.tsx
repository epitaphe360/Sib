import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { ArrowLeft, Calendar, Crown, BadgePercent, X, MapPin, Users, Clock } from 'lucide-react';
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
  start_date: string;
  end_date: string;
  event_type: string;
  status: string;
  max_participants: number;
  location?: string;
  speaker?: string;
  registrations?: { count: number }[];
}

export const PartnerEventsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations:event_registrations(count)
        `)
        .order('start_date', { ascending: false })
        .range(0, 199);

      if (error) { throw error; }
      if (data) { setEvents(data as unknown as Event[]); }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusLabel = (status: string) => {
    if (status === 'published') { return t('partner.status.upcoming', 'À venir'); }
    if (status === 'draft') { return t('partner.status.draft', 'Brouillon'); }
    return status;
  };

  const getStatusVariant = (status: string): 'info' | 'warning' | 'success' => {
    if (status === 'published') { return 'info'; }
    if (status === 'draft') { return 'warning'; }
    return 'success';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('partner.back_to_dashboard', 'Retour au tableau de bord')}
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-indigo-600 p-3 rounded-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('partner.events.title', 'Événements Sponsorisés')}</h1>
              <p className="text-gray-600">{t('partner.events.subtitle', 'Gérez vos événements sponsors et suivez leur impact')}</p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-medium">{t('partner.events.program', 'Programme Événements Sponsors')}</span>
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
                  const dateDisplay = formatDate(evt.start_date || evt.start_time);

                  return (
                    <div key={evt.id} className="flex items-center justify-between border p-4 rounded-lg hover:bg-slate-50 transition">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{evt.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{evt.description?.substring(0, 100)}...</div>
                        <div className="text-sm text-gray-500 mt-2">
                          {evt.event_type} • {dateDisplay}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={getStatusVariant(evt.status)} size="sm">
                          {getStatusLabel(evt.status)}
                        </Badge>
                        <span className="text-sm text-gray-700">
                          {registrationCount > 0
                            ? `${registrationCount} ${t('partner.events.registered', 'inscrits')}`
                            : `${t('partner.events.capacity', 'Capacité')}: ${evt.max_participants || 'N/A'}`}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEvent(evt)}>
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

      {/* Modal détails événement */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedEvent(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getStatusVariant(selectedEvent.status)} size="sm">
                    {getStatusLabel(selectedEvent.status)}
                  </Badge>
                  <span className="text-sm text-gray-500 capitalize">{selectedEvent.event_type}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <p className="text-gray-700 leading-relaxed">{selectedEvent.description || t('partner.events.no_description', 'Aucune description disponible.')}</p>
              </div>

              <div className="border-t pt-4 space-y-3">
                {/* Date début */}
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('partner.events.start', 'Début')}</span>
                    <p className="text-sm text-gray-800">{formatDate(selectedEvent.start_date || selectedEvent.start_time)}</p>
                  </div>
                </div>

                {/* Date fin */}
                {(selectedEvent.end_date || selectedEvent.end_time) && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('partner.events.end', 'Fin')}</span>
                      <p className="text-sm text-gray-800">{formatDate(selectedEvent.end_date || selectedEvent.end_time)}</p>
                    </div>
                  </div>
                )}

                {/* Lieu */}
                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('partner.events.location', 'Lieu')}</span>
                      <p className="text-sm text-gray-800">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {/* Capacité */}
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('partner.events.capacity', 'Capacité')}</span>
                    <p className="text-sm text-gray-800">
                      {selectedEvent.registrations?.[0]?.count
                        ? `${selectedEvent.registrations[0].count} / ${selectedEvent.max_participants || 'N/A'}`
                        : selectedEvent.max_participants || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Intervenant */}
                {selectedEvent.speaker && (
                  <div className="flex items-start gap-3">
                    <Crown className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('partner.events.speaker', 'Intervenant')}</span>
                      <p className="text-sm text-gray-800">{selectedEvent.speaker}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 pb-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                {t('common.close', 'Fermer')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerEventsPage;

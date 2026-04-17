import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { Calendar, Search, Filter, Users, Clock, MapPin, Video, MoreVertical, Edit, Eye, Plus, CheckCircle, XCircle, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { EventsService, Event } from '../../services/eventsService';
import { useFilterSearch } from '../../hooks/useFilterSearch';
import { toast } from 'sonner';

export default function EventsPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await EventsService.getAllEvents();

      const formattedEvents = data.map((event: Event) => {
        const startDate = new Date(event.start_time);
        const endDate = new Date(event.end_date);
        const now = new Date();

        let status: 'confirmed' | 'completed' | 'cancelled' | 'pending' = 'confirmed'; // Default status
        if (event.status) { // If status is provided by the backend
          status = event.status;
        } else if (endDate < now) {
          status = 'completed';
        } else if (startDate > now) {
          status = 'pending'; // Assuming events in the future are pending until confirmed
        }

        return {
          ...event,
          date: startDate, // Add a date property for easier display
          startTime: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          endTime: endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          status, // Use the determined status
          // Default values for missing fields if necessary
          location: event.location || 'N/A',
          capacity: event.capacity || 0,
          registered: event.registered || 0,
          organizer: event.organizer_id || 'SIB Team', // Assuming organizer_id can be used as organizer name
          virtual: event.virtual || false,
          speakers: event.speakers || [], // Assuming speakers can be part of the event object
        };
      });

      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again later.');
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  };

  const { searchTerm, setSearchTerm, selectedFilter: selectedType, setSelectedFilter: setSelectedType, filteredData: filteredEventsByType } =
    useFilterSearch<Event>({
      data: events,
      searchKeys: ['title', 'description', 'organizer'],
      filterKey: 'event_type',
    });

  const { selectedFilter: selectedStatus, setSelectedFilter: setSelectedStatus, filteredData: finalFilteredEvents } =
    useFilterSearch<Event>({
      data: filteredEventsByType,
      searchKeys: [], // Already filtered by searchTerm
      filterKey: 'status',
    });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'conference': return 'Conférence';
      case 'workshop': return 'Atelier';
      case 'roundtable': return 'Table ronde';
      case 'networking': return 'Réseautage';
      case 'demo': return 'Démonstration';
      case 'keynote': return 'Keynote';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Confirmé</Badge>;
      case 'pending':
        return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'cancelled':
        return <Badge variant="error"><XCircle className="h-3 w-3 mr-1" />Annulé</Badge>;
      case 'completed':
        return <Badge variant="info">Terminé</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const handleEventAction = (eventId: string, action: string) => {
    // Ici vous pouvez implémenter les actions réelles
  };

  const eventTypes = [
    { value: 'conference', label: 'Conférence' },
    { value: 'workshop', label: 'Atelier' },
    { value: 'roundtable', label: 'Table ronde' },
    { value: 'networking', label: 'Réseautage' },
    { value: 'demo', label: 'Démonstration' },
    { value: 'keynote', label: 'Keynote' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chargement des événements...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
              <p className="text-gray-600 mt-2">
                Administration et organisation des événements SIB 2026
              </p>
            </div>
            <Link to="/admin/content">
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Créer Événement
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Événements</p>
                  <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmés</p>
                  <p className="text-3xl font-bold text-green-600">
                    {events.filter(e => e.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participants Totaux</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {events.reduce((sum, e) => sum + e.registered, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {events.length > 0 && events.reduce((sum, e) => sum + e.capacity, 0) > 0
                      ? Math.round((events.reduce((sum, e) => sum + e.registered, 0) /
                                   events.reduce((sum, e) => sum + e.capacity, 0)) * 100)
                      : 0}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, description ou organisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="confirmed">Confirmé</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulé</option>
                <option value="completed">Terminé</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalFilteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {getEventTypeLabel(event.event_type)} • {event.organizer}
                      </p>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="ml-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.registered}/{event.capacity} participants</span>
                    </div>
                    {event.virtual && (
                      <div className="flex items-center text-sm text-blue-600">
                        <Video className="h-4 w-4 mr-2" />
                        <span>Événement virtuel</span>
                      </div>
                    )}
                  </div>

                  {event.speakers && event.speakers.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Intervenants :</h4>
                      <div className="space-y-1">
                        {event.speakers.slice(0, 2).map((speaker) => (
                          <div key={speaker.name} className="text-sm text-gray-600">
                            {speaker.name} - {speaker.company}
                          </div>
                        ))}
                        {event.speakers.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{event.speakers.length - 2} autres...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEventAction(event.id, 'view')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEventAction(event.id, 'edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEventAction(event.id, 'more')}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {finalFilteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};




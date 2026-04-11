import React, { useState, useMemo } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Search, Filter, X, Calendar, Clock } from 'lucide-react';
import type { Appointment } from '../../types';

interface AppointmentFiltersProps {
  appointments: Appointment[];
  onFilteredChange: (filtered: Appointment[]) => void;
  getDisplayName: (appointment: Appointment) => string;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  appointments,
  onFilteredChange,
  getDisplayName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage et tri
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Recherche par nom
    if (searchTerm) {
      filtered = filtered.filter(app =>
        getDisplayName(app).toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filtre par date
    if (dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(app => {
        const appDate = new Date(app.startTime);
        switch (dateRange) {
          case 'today':
            return appDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return appDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return appDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          break;
        case 'name':
          comparison = getDisplayName(a).localeCompare(getDisplayName(b));
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [appointments, searchTerm, statusFilter, dateRange, sortBy, sortOrder, getDisplayName]);

  // Notifier le parent des changements
  React.useEffect(() => {
    onFilteredChange(filteredAppointments);
  }, [filteredAppointments, onFilteredChange]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange('all');
    setSortBy('date');
    setSortOrder('asc');
  };

  const activeFiltersCount = [
    searchTerm !== '',
    statusFilter !== 'all',
    dateRange !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 mb-6">
      {/* Barre de recherche principale */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un rendez-vous..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Rechercher dans les rendez-vous"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
          aria-label="Afficher les filtres"
          aria-expanded={showFilters}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge 
              variant="error" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Panneau de filtres avancés */}
      {showFilters && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                aria-label="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            {/* Filtre par période */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Période
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                aria-label="Filtrer par période"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Trier par
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  aria-label="Trier par"
                >
                  <option value="date">Date</option>
                  <option value="name">Nom</option>
                  <option value="status">Statut</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                  aria-label={`Ordre ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>

          {/* Résumé et réinitialisation */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="text-sm text-white/60">
              {filteredAppointments.length} rendez-vous trouvé{filteredAppointments.length > 1 ? 's' : ''}
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-indigo-300 hover:text-indigo-100"
              >
                <X className="h-4 w-4 mr-1" />
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filtres actifs (tags) */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="info" className="flex items-center gap-1">
              Recherche: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="info" className="flex items-center gap-1">
              Statut: {statusFilter}
              <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange !== 'all' && (
            <Badge variant="info" className="flex items-center gap-1">
              Période: {dateRange}
              <button onClick={() => setDateRange('all')} className="ml-1 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

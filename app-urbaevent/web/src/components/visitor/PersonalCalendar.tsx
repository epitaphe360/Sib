import { useState, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Video, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useEventStore } from '../../store/eventStore';
import useAuthStore from '../../store/authStore';

interface PersonalCalendarProps {
  compact?: boolean;
}

// OPTIMIZATION: Memoized PersonalCalendar to prevent unnecessary re-renders
export default memo(function PersonalCalendar({ compact = false }: PersonalCalendarProps) {
  const { isAuthenticated } = useAuthStore();
  const { events, registeredEvents, fetchEvents } = useEventStore();
  // SIB 2026 dates focus
  const [currentDate, setCurrentDate] = useState(new Date('2026-04-01T00:00:00'));
  const [selectedDate, setSelectedDate] = useState(new Date('2026-04-01T00:00:00'));

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, fetchEvents]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // OPTIMIZATION: Memoized callbacks
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event =>
      registeredEvents.includes(event.id) &&
      event.date.toDateString() === date.toDateString()
    );
  }, [events, registeredEvents]);

  const formatMonth = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  }, []);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const daysInMonth = getDaysInMonth(currentDate);
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (!isAuthenticated) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Calendrier personnel
          </h3>
          <p className="text-gray-600">
            Connectez-vous pour voir votre calendrier d'événements
          </p>
        </div>
      </Card>
    );
  }

  if (compact) {
    const upcomingEvents = events
      .filter(event => registeredEvents.includes(event.id))
      .filter(event => event.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
          Événements à venir
        </h3>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <div key={event.id} className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
              <div className="bg-indigo-100 p-2 rounded-lg">
                {event.virtual ? <Video className="h-4 w-4 text-indigo-600" /> : <MapPin className="h-4 w-4 text-indigo-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                <p className="text-xs text-gray-600">
                  {new Intl.DateTimeFormat('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  }).format(event.date)} • {event.startTime}
                </p>
                {event.location && <p className="text-xs text-gray-500">{event.location}</p>}
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucun événement planifié
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
          Calendrier personnel
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center">
            {formatMonth(currentDate)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2" />;
          }

          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={date.toISOString()}
              className={`p-2 min-h-[60px] border cursor-pointer hover:bg-gray-50 ${
                isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
              } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 bg-indigo-100 text-indigo-700 rounded truncate"
                    title={event.title}
                  >
                    {event.startTime}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Événements du {new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            }).format(selectedDate)}
          </h4>

          <div className="space-y-3">
            {getEventsForDate(selectedDate).map(event => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  {event.virtual ? <Video className="h-4 w-4 text-indigo-600" /> : <MapPin className="h-4 w-4 text-indigo-600" />}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm">{event.title}</h5>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {event.startTime} - {event.endTime}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  <Badge variant="info" size="sm" className="mt-2">
                    {event.type === 'webinar' ? 'Webinaire' :
                     event.type === 'conference' ? 'Conférence' :
                     event.type === 'workshop' ? 'Atelier' :
                     event.type === 'networking' ? 'Réseautage' :
                     event.type === 'roundtable' ? 'Table ronde' : event.type}
                  </Badge>
                </div>
              </div>
            ))}

            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun événement prévu ce jour
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
});

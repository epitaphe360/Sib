import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import useAuthStore from '../../store/authStore';
import { getMinSlotDate, getMaxSlotDate } from '../../config/salonInfo';
import { useTranslation } from '../../hooks/useTranslation';

export const AppointmentCalendarWidget: React.FC = () => {
  const { t } = useTranslation();
  const { appointments, timeSlots, fetchAppointments, fetchTimeSlots, isLoading } = useAppointmentStore();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const eventDay1 = new Date(`${getMinSlotDate()}T00:00:00`);
    return eventDay1;
  });

  useEffect(() => {
    fetchAppointments();
    if (user) {
      fetchTimeSlots(user.id);
    }
  }, [fetchAppointments, fetchTimeSlots, user]);

  const handleDateChange = (days: number) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      
      // Limiter entre le 1er et le 3 avril 2026
      const minDate = new Date(`${getMinSlotDate()}T00:00:00`);
      const maxDate = new Date(`${getMaxSlotDate()}T00:00:00`);
      
      if (newDate < minDate) return minDate;
      if (newDate > maxDate) return maxDate;
      
      return newDate;
    });
  };

  const todayAppointments = useMemo(() => {
    return appointments
      .map(appointment => {
        const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
        if (!slot) return null;
        return { ...appointment, slot };
      })
      .filter((appointment): appointment is NonNullable<typeof appointment> => {
        if (!appointment) return false;
        const appointmentDate = new Date(appointment.slot.date);
        return appointmentDate.toDateString() === selectedDate.toDateString();
      })
      .sort((a, b) => {
        // Parse time strings (HH:MM) to minutes for comparison
        const timeToMinutes = (t: string) => {
          const [hh, mm] = t.split(':').map(Number);
          return (hh || 0) * 60 + (mm || 0);
        };
        return timeToMinutes(a.slot.startTime) - timeToMinutes(b.slot.startTime);
      });
  }, [appointments, timeSlots, selectedDate]);

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card className="SIB-glass-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {t('appointments.calendar')}
          </h3>
          <Link to={ROUTES.APPOINTMENTS}>
            <Button variant="ghost" size="sm" className="text-SIB-primary">
              {t('common.view_all')}
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
          <Button variant="ghost" size="sm" onClick={() => handleDateChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="font-semibold text-gray-800">
              {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleDateChange(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 h-64 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-SIB-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">{t('common.loading')}</p>
            </div>
          ) : todayAppointments.length > 0 ? (
            todayAppointments.map(appointment => (
              <div key={appointment.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-semibold text-gray-800">{t('appointments.meeting_with', { name: appointment.visitorId })}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.slot.startTime} - {appointment.slot.endTime}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(appointment.status)} size="sm">
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">{t('appointments.no_appointments_date')}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

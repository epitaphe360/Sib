import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Video, Globe, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Sparkles, CalendarDays, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Appointment } from '../../types';
import { useAppointmentStore } from '../../store/appointmentStore';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PersonalAppointmentsCalendarProps {
  userType: 'exhibitor' | 'partner' | 'visitor';
  standalone?: boolean;
}

export default function PersonalAppointmentsCalendar({ userType, standalone = true }: PersonalAppointmentsCalendarProps) {
  const { user } = useAuthStore();
  const {
    appointments,
    timeSlots,
    fetchAppointments,
    fetchTimeSlots,
    updateAppointmentStatus,
    cancelAppointment,
    isLoading
  } = useAppointmentStore();

  const [selectedWeek, setSelectedWeek] = useState(new Date('2026-04-01T00:00:00'));
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    fetchAppointments();
    if (user?.id) {
      fetchTimeSlots(user.id);
    }
  }, [fetchAppointments, fetchTimeSlots, user?.id]);

  // Filtrer les rendez-vous selon le type d'utilisateur
  const getFilteredAppointments = () => {
    if (!user) return [];

    let filteredByUser: Appointment[] = [];
    
    if (userType === 'visitor') {
      // Pour les visiteurs : rendez-vous qu'ils ont demandés
      filteredByUser = appointments.filter(apt => apt.visitorId === user.id);
    } else {
      // Pour les exposants/partenaires : rendez-vous qu'ils reçoivent
      filteredByUser = appointments.filter(apt => apt.exhibitorId === user.id);
    }

    // Appliquer le filtre de statut
    if (filter === 'all') return filteredByUser;
    return filteredByUser.filter(apt => apt.status === filter);
  };

  const handleAccept = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
      toast.success('Rendez-vous confirmé');
      fetchAppointments();
    } catch (error) {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      toast.success('Rendez-vous refusé');
      fetchAppointments();
    } catch (error) {
      toast.error('Erreur lors du refus');
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    
    try {
      await cancelAppointment(appointmentId);
      toast.success('Rendez-vous annulé');
      fetchAppointments();
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return <Video className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      case 'hybrid': return <Globe className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getWeekDays = (date: Date) => {
    return [
      new Date('2026-04-01T00:00:00'),
      new Date('2026-04-02T00:00:00'),
      new Date('2026-04-03T00:00:00')
    ];
  };

  const weekDays = getWeekDays(selectedWeek);
  // Pour cette démo, on simule que les appointments ont des timeSlots
  // Dans une vraie implémentation, il faudrait faire un join avec les timeSlots
  const weekAppointments = getFilteredAppointments();

  const getAppointmentTitle = () => {
    if (userType === 'visitor') {
      return `RDV avec Exposant`;
    } else {
      return `RDV avec Visiteur`;
    }
  };

  return (
    <div className={`${standalone ? 'min-h-screen bg-[#f8fafc] p-4 md:p-8' : 'p-0 bg-transparent'}`} data-testid="personal-appointments-calendar">
      {/* Hero Header Premium - Masqué si non standalone */}
      {standalone && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] p-8 md:p-12 mb-10 shadow-2xl border border-white/10"
        >
          {/* Motif Marocain Subtil */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center space-x-8">
              <div className="p-5 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/20 shadow-2xl transform hover:rotate-3 transition-transform duration-500">
                <CalendarDays className="w-12 h-12 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1">
                    Espace B2B
                  </Badge>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">Session 2026</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                  Mes Rendez-vous B2B
                </h1>
                <p className="text-blue-100/60 text-lg font-medium max-w-xl italic">
                  {userType === 'visitor' 
                    ? '🎯 Gérez vos rencontres stratégiques avec les leaders de l\'industrie du bâtiment'
                    : '📩 Optimisez votre réseau et validez vos opportunités d\'affaires'}
                </p>
              </div>
            </div>

            {/* Stats Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total', value: getFilteredAppointments().length, color: 'blue' },
                { label: 'Confirmés', value: getFilteredAppointments().filter(apt => apt.status === 'confirmed').length, color: 'emerald' },
                { label: 'En attente', value: getFilteredAppointments().filter(apt => apt.status === 'pending').length, color: 'amber' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center min-w-[120px] hover:bg-white/10 transition-colors">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-8">
        {/* Barre de contrôle stylisée */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Filtrage</span>
              <div className="h-4 w-[2px] bg-gray-200"></div>
              <div className="flex items-center gap-1 p-1">
                {[
                  { id: 'all', label: 'Tous', icon: '📋' },
                  { id: 'pending', label: 'En attente', icon: '⏳' },
                  { id: 'confirmed', label: 'Confirmés', icon: '✅' },
                  { id: 'cancelled', label: 'Annulés', icon: '❌' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFilter(s.id as any)}
                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 flex items-center gap-2 ${
                      filter === s.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span className="uppercase tracking-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl group">
             <Calendar className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform" />
             <div className="text-left">
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-tighter">
                  Planning Événementiel
                </h4>
                <p className="text-[10px] font-bold text-blue-600/70">25-29 Nov. 2026 • Parc d'Exposition Mohammed VI</p>
             </div>
          </div>
        </div>

        {/* Grille Temporelle Premium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {weekDays.map((day, index) => {
            const dayAppointments = weekAppointments.filter(appointment => {
              const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
              if (!slot) return false;
              const slotDate = new Date(slot.date);
              return slotDate.toDateString() === day.toDateString();
            });
            const isToday = day.toDateString() === new Date().toDateString();
            const hasAppointments = dayAppointments.length > 0;

            return (
              <motion.div 
                key={day.toISOString()} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col h-full min-h-[500px] rounded-[2.5rem] bg-white border-2 transition-all duration-500 overflow-hidden group ${
                  isToday 
                    ? 'border-blue-500 shadow-2xl shadow-blue-900/10' 
                    : 'border-gray-50 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5'
                }`}
              >
                {/* Header du Jour Stylisé */}
                <div className={`p-8 relative overflow-hidden ${
                  isToday ? 'bg-blue-600' : hasAppointments ? 'bg-slate-900' : 'bg-gray-50'
                }`}>
                  {/* Pattern marocain en background du header */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                  
                  <div className="relative z-10 flex items-center justify-between text-center md:text-left">
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${
                        isToday || hasAppointments ? 'text-white/60' : 'text-gray-400'
                      }`}>
                        {day.toLocaleDateString('fr-FR', { weekday: 'long' })}
                      </div>
                      <div className={`text-3xl sm:text-4xl md:text-5xl font-black flex items-baseline gap-2 ${
                        isToday || hasAppointments ? 'text-white' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                        <span className="text-base font-bold opacity-40 uppercase tracking-widest">AVR</span>
                      </div>
                    </div>
                    {isToday && (
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
                        <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Aujourd'hui</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Liste des RDV */}
                <div className="p-6 space-y-4 flex-1 bg-gradient-to-b from-transparent to-gray-50/30">
                  <AnimatePresence mode="popLayout">
                    {dayAppointments.length > 0 ? dayAppointments.map((appointment, aptIndex) => {
                      const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
                      const displayTime = slot ? slot.startTime : 'TBD';

                      return (
                        <motion.div
                          key={appointment.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-5 rounded-3xl border-2 bg-white group/card hover:shadow-xl transition-all duration-300 relative ${
                            appointment.status === 'confirmed' ? 'border-emerald-100 hover:border-emerald-400' :
                            appointment.status === 'pending' ? 'border-amber-100 hover:border-amber-400' :
                            'border-red-100 hover:border-red-400'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-2xl transform group-hover/card:rotate-6 transition-transform ${
                                appointment.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                appointment.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-red-50 text-red-600'
                              }`}>
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xl font-black text-gray-900 leading-none mb-1">{displayTime}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session B2B</div>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                              appointment.status === 'confirmed' ? 'bg-emerald-500 text-white border-emerald-500/20' :
                              appointment.status === 'pending' ? 'bg-amber-500 text-white border-amber-500/20' :
                              'bg-red-500 text-white border-red-500/20'
                            }`}>
                              {appointment.status}
                            </div>
                          </div>
                          
                          <div className="space-y-3 py-4 border-y border-gray-50">
                            <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                              <div className="p-1.5 bg-gray-100 rounded-lg">
                                 <User className="w-4 h-4 text-blue-500" />
                              </div>
                              <span>{getAppointmentTitle()}</span>
                            </div>
                            {appointment.meetingLink && (
                              <div className="flex items-center gap-3 text-xs font-bold text-blue-600 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                                <Video className="w-4 h-4" />
                                <span>Salon Virtuel Disponible</span>
                              </div>
                            )}
                          </div>

                          {/* Actions Contextuelles */}
                          <div className="flex gap-2 mt-4">
                            {userType !== 'visitor' && appointment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAccept(appointment.id)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/10"
                                >
                                  Accepter
                                </button>
                                <button
                                  onClick={() => handleReject(appointment.id)}
                                  className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                  Refuser
                                </button>
                              </>
                            )}
                            
                            {appointment.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="w-full bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                Annuler le créneau
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <div className="h-full flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-200 group-hover:border-blue-200 transition-colors">
                          <Calendar className="w-10 h-10 text-gray-300 group-hover:text-blue-200 transition-all pointer-events-none" />
                        </div>
                        <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-1">Disponible</p>
                        <p className="text-gray-300 text-[10px] font-medium max-w-[150px]">Aucun rendez-vous sur ce créneau pour le moment</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State Premium */}
        {getFilteredAppointments().length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden p-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 text-center shadow-2xl shadow-blue-900/5 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
            
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-600/20"
            >
              <CalendarDays className="w-16 h-16 text-white" />
            </motion.div>
            
            <h4 className="relative z-10 text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {filter === 'all' 
                ? 'Planning Vierge'
                : `Aucun RDV ${filter}`}
            </h4>
            
            <p className="relative z-10 text-slate-500 text-lg font-medium max-w-xl mx-auto italic">
              {userType === 'visitor' 
                ? '🔍 Votre agenda B2B est prêt. Explorez le catalogue des exposants pour initier des connexions transformatrices pour SIB 2026.'
                : '⏰ Patience. Votre visibilité est maximale. Les demandes de rendez-vous apparaîtront ici dès validation par les visiteurs.'}
            </p>

            <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Sparkles className="w-24 h-24 text-blue-600" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
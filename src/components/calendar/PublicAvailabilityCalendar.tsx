import { useState, useEffect } from 'react';
import {
  Calendar, Plus, Users, MapPin, Video, Globe, Save, X,
  Clock, Trash2, Edit, Grid3x3, List,
  Lock, Unlock, Wand2
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TimeSlot } from '../../types';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';
import { motion, AnimatePresence } from 'framer-motion';
import { getMinSlotDate, getMaxSlotDate } from '../../config/salonInfo';
import { BulkSlotGenerator } from './BulkSlotGenerator';

interface PublicAvailabilityCalendarProps {
  userId: string;
  isEditable?: boolean;
  standalone?: boolean;
}

export default function PublicAvailabilityCalendar({
  userId,
  isEditable = true,
  standalone = true
}: PublicAvailabilityCalendarProps) {
  const { t } = useTranslation();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'single' | 'bulk'>('single');
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [newSlot, setNewSlot] = useState({
    date: getMinSlotDate(),
    startTime: '',
    endTime: '',
    type: 'in-person' as 'in-person' | 'virtual' | 'hybrid',
    maxBookings: 5,
    location: '',
    description: ''
  });

  // Helper pour parser une date string (YYYY-MM-DD) en Date locale sans décalage UTC
  const parseLocalDate = (dateStr: string | Date): Date => {
    if (dateStr instanceof Date) return dateStr;
    // Format YYYY-MM-DD -> créer une date à minuit heure locale
    const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    fetchTimeSlots();
  }, [userId]);

  // Populate form when editing an existing slot
  useEffect(() => {
    if (selectedSlot) {
      const formatDateForInput = (date: Date | string): string => {
        let dateObj: Date;
        if (date instanceof Date) {
          dateObj = date;
        } else if (typeof date === 'string' && date.includes('T')) {
          dateObj = new Date(date);
        } else if (typeof date === 'string') {
          // YYYY-MM-DD format
          return date;
        } else {
          dateObj = new Date();
        }
        
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setNewSlot({
        date: formatDateForInput(selectedSlot.date),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: selectedSlot.type as 'in-person' | 'virtual' | 'hybrid',
        maxBookings: selectedSlot.maxBookings,
        location: selectedSlot.location || '',
        description: ''
      });
    }
  }, [selectedSlot]);

  const fetchTimeSlots = async () => {
    setIsLoading(true);
    try {
      const slots = await SupabaseService.getTimeSlotsByUser(userId);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
      toast.error('Erreur lors du chargement des créneaux');
    }
    setIsLoading(false);
  };

  const handleAddTimeSlot = async () => {
    console.log('🔵 handleAddTimeSlot appelé', { newSlot, isLoading });
    
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Veuillez remplir tous les champs requis');
      console.log('❌ Champs manquants:', { date: newSlot.date, startTime: newSlot.startTime, endTime: newSlot.endTime });
      return;
    }

    // Validation: date ne doit pas être dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(newSlot.date + 'T00:00:00'); // Force local timezone
    if (slotDate < today) {
      toast.error('❌ Impossible de créer un créneau pour une date passée');
      return;
    }

    // Validation: startTime < endTime
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    console.log('✅ Validation passée, création du créneau...');
    setIsLoading(true);
    try {
      const duration = calculateDuration(newSlot.startTime, newSlot.endTime);

      // Note: On permet les créneaux identiques (mêmes horaires) car plusieurs personnes
      // peuvent recevoir simultanément au même stand
      // Pas de validation de chevauchement ou duplication

      let result: TimeSlot | undefined;
      
      if (selectedSlot) {
        // MODE MODIFICATION: Update existing slot
        console.log('🔄 Modification du créneau:', selectedSlot.id);
        result = await SupabaseService.updateTimeSlot(selectedSlot.id, {
          date: newSlot.date as unknown as Date,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          duration,
          type: newSlot.type,
          maxBookings: newSlot.maxBookings || 1,
          location: newSlot.location || undefined
        });
        
        toast.success('✅ Créneau modifié avec succès');
        if (result) setTimeSlots(prev => prev.map(s => s.id === selectedSlot.id ? result! : s));
      } else {
        // MODE CRÉATION: Create new slot
        console.log('➕ Création d\'un nouveau créneau');
        result = await SupabaseService.createTimeSlot({
          exhibitorId: userId,
          date: newSlot.date as unknown as Date,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          duration,
          type: newSlot.type,
          maxBookings: newSlot.maxBookings || 1, // Valeur par défaut
          location: newSlot.location || undefined
        });

        toast.success('✅ Créneau ajouté avec succès');
        if (result) setTimeSlots(prev => [...prev, result!]);
      }
      
      resetForm();
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du créneau:', error);

      // Gestion spécifique erreur 409 (conflit)
      if (error?.code === '409' || error?.message?.includes('409')) {
        toast.error('Ce créneau existe déjà à cette date et heure');
      } else {
        toast.error('Erreur lors de l\'ajout du créneau');
      }
    }
    setIsLoading(false);
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60);
  };

  const resetForm = () => {
    setNewSlot({
      date: '2026-04-01',
      startTime: '',
      endTime: '',
      type: 'in-person',
      maxBookings: 5,
      location: '',
      description: ''
    });
    setSelectedSlot(null);
  };

  const handleToggleSlotStatus = async (e: React.MouseEvent, slot: TimeSlot) => {
    e.stopPropagation();
    
    const isFull = slot.currentBookings >= slot.maxBookings;
    let newMax = slot.maxBookings;
    
    if (isFull) {
        if (!confirm(`Le créneau est complet (${slot.currentBookings}/${slot.maxBookings}). Voulez-vous augmenter la capacité à ${slot.currentBookings + 1} pour le réouvrir ?`)) return;
        newMax = slot.currentBookings + 1;
    } else {
        if (!confirm(`Voulez-vous fermer ce créneau ? (Capacité réduite à ${slot.currentBookings})`)) return;
        newMax = slot.currentBookings;
    }

    try {
        const updated = await SupabaseService.updateTimeSlot(slot.id, { maxBookings: newMax });
        setTimeSlots(prev => prev.map(s => s.id === slot.id ? updated : s));
        toast.success(isFull ? 'Créneau réouvert' : 'Créneau fermé temporairement');
    } catch (error) {
        console.error('Erreur toggle:', error);
        toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;

    try {
      await SupabaseService.deleteTimeSlot(slotId);
      setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
      toast.success('Créneau supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return <Video className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      case 'hybrid': return <Globe className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };







  const weekDays = [
    new Date('2026-04-01T00:00:00'),
    new Date('2026-04-02T00:00:00'),
    new Date('2026-04-03T00:00:00')
  ];
  const weekSlots = timeSlots.filter(slot => {
    const slotDate = parseLocalDate(slot.date);
    return weekDays.some(day =>
      day.toDateString() === slotDate.toDateString()
    );
  });

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6">
      {/* Header - Masqué si non standalone */}
      {standalone && (
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
          <div className="p-8 relative">
            {/* Motif décoratif */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <Calendar className="w-full h-full" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Gestion des Disponibilités
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Créez et gérez vos créneaux de rendez-vous pour SIB 2026
                    </p>
                  </div>
                </div>

                {isEditable && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    data-testid="button-add-availability"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau Créneau
                  </Button>
                )}
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                  <div className="text-blue-100 text-sm mb-1">{t('calendar.total_slots')}</div>
                  <div className="text-3xl font-bold">{timeSlots.length}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                  <div className="text-blue-100 text-sm mb-1">{t('calendar.this_week')}</div>
                  <div className="text-3xl font-bold">{weekSlots.length}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                  <div className="text-blue-100 text-sm mb-1">{t('calendar.available_spots')}</div>
                  <div className="text-3xl font-bold">
                    {timeSlots.reduce((sum, slot) => sum + (slot.maxBookings - slot.currentBookings), 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation & Vue */}
      {/* Navigation - LIMITÉ AUX JOURS DE L'ÉVÉNEMENT */}
      <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="bg-slate-800 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {t('calendar.title')}
                </h3>
                <p className="text-xs text-slate-400">{t('calendar.event_days_description')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isEditable && (
                <>
                  <Button
                    onClick={() => {
                      setModalTab('bulk');
                      setShowAddModal(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold"
                    data-testid="button-bulk-generate-header"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Auto
                  </Button>
                  <Button
                    onClick={() => {
                      setModalTab('single');
                      setShowAddModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold"
                    data-testid="button-add-slot-header"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </>
              )}
              
              {/* Toggle Vue */}
              <div className="flex items-center bg-slate-700 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-2.5 py-1 rounded-md transition-all text-xs flex items-center space-x-1 ${
                    viewMode === 'week' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-3 h-3" />
                  <span>{t('calendar.grid_view')}</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-md transition-all text-xs flex items-center space-x-1 ${
                    viewMode === 'list' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-3 h-3" />
                  <span>{t('calendar.list_view')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3">
        {/* Vue Hebdomadaire */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {weekDays.map((day) => {
              const daySlots = weekSlots.filter(slot =>
                parseLocalDate(slot.date).toDateString() === day.toDateString()
              );
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group rounded-2xl border-2 transition-all duration-300 flex flex-col overflow-hidden ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/30'
                      : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-xl'
                  }`}
                >
                  {/* En-tête jour */}
                  <div className={`px-3 py-2 flex items-center justify-between ${
                    isToday ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    <div>
                      <div className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isToday ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {day.toLocaleDateString('fr-FR', { weekday: 'long' })}
                      </div>
                      <div className={`text-base font-bold leading-tight ${
                        isToday ? 'text-white' : 'text-gray-800'
                      }`}>
                        {day.getDate()} <span className="text-xs font-medium opacity-70">{day.toLocaleDateString('fr-FR', { month: 'long' })}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isToday ? 'bg-white/20 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                      {daySlots.length} créneaux
                    </span>
                  </div>

                  {/* Créneaux du jour */}
                  <div className="p-2 space-y-1 flex-1 bg-white">
                    <AnimatePresence mode="popLayout">
                      {daySlots.map((slot) => {
                        const isFull = slot.currentBookings >= slot.maxBookings;
                        const borderColor = isFull ? 'border-l-red-400' :
                          slot.type === 'virtual' ? 'border-l-blue-400' :
                          slot.type === 'in-person' ? 'border-l-emerald-400' :
                          'border-l-amber-400';
                        
                        return (
                        <motion.div
                          key={slot.id}
                          layout
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          className={`border-l-[3px] ${borderColor} bg-gray-50 hover:bg-white hover:shadow-sm transition-all duration-150 cursor-pointer rounded-r-md ${isFull ? 'opacity-60' : ''}`}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowAddModal(true);
                          }}
                        >
                          {/* Ligne principale */}
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="text-xs font-semibold text-gray-800 tabular-nums">
                                {slot.startTime}–{slot.endTime}
                              </span>
                            </div>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ml-1 ${
                              isFull ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isFull ? 'Complet' : `${slot.maxBookings - slot.currentBookings} dispo.`}
                            </span>
                          </div>

                          {/* Ligne localisation */}
                          {slot.location && (
                            <div className="flex items-center space-x-1 px-2 pb-1">
                              <MapPin className="w-2.5 h-2.5 text-gray-300 shrink-0" />
                              <span className="text-[10px] text-gray-400 truncate">{slot.location}</span>
                            </div>
                          )}

                          {/* Actions (si éditable) */}
                          {isEditable && (
                            <div className="flex border-t border-gray-100">
                              <button
                                onClick={(e) => handleToggleSlotStatus(e, slot)}
                                className="flex-1 flex items-center justify-center space-x-1 py-1 text-[10px] text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                {isFull ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                <span>{isFull ? 'Ouvrir' : 'Fermer'}</span>
                              </button>
                              <div className="w-px bg-gray-100" />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}
                                className="flex-1 flex items-center justify-center space-x-1 py-1 text-[10px] text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                <span>Suppr.</span>
                              </button>
                            </div>
                          )}
                        </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Message si aucun créneau */}
                    {daySlots.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Clock className="w-6 h-6 text-gray-200 mb-2" />
                        <p className="text-gray-400 text-xs">{t('calendar.no_slots')}</p>
                      </div>
                    )}

                    {/* Bouton Ajouter */}
                    {isEditable && (
                      <button
                        onClick={() => {
                          setNewSlot({ ...newSlot, date: formatDateForInput(day) });
                          setShowAddModal(true);
                        }}
                        className="w-full flex items-center justify-center space-x-1 py-1.5 mt-1 text-[11px] text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-dashed border-gray-200 hover:border-blue-300 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t('actions.add')}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Vue Liste */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {weekSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">
                  {t('calendar.no_slots_configured')}
                </h4>
                <p className="text-gray-500 mb-8 max-w-sm text-center">
                  {t('calendar.no_availability_message')}
                </p>
                {isEditable && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t('calendar.create_first_slot')}
                  </Button>
                )}
              </div>
            ) : (
              weekSlots
                .sort((a, b) => {
                  const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                  if (dateCompare !== 0) return dateCompare;
                  return a.startTime.localeCompare(b.startTime);
                })
                .map((slot) => (
                  <motion.div
                    key={slot.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group flex items-center justify-between p-5 bg-white border-2 rounded-2xl transition-all duration-300 ${slot.currentBookings >= slot.maxBookings ? 'border-red-200 bg-red-50' : 'border-gray-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10'}`}
                  >
                    <div className="flex items-center space-x-6 flex-1">
                      <div className={`p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform ${
                        slot.currentBookings >= slot.maxBookings ? 'bg-red-500 text-white' :
                        slot.type === 'virtual' ? 'bg-blue-600 text-white' : 
                        slot.type === 'in-person' ? 'bg-emerald-600 text-white' : 
                        'bg-amber-500 text-white shadow-amber-100'
                      }`}>
                        {getTypeIcon(slot.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-black text-xl text-gray-900 uppercase tracking-tight">
                            {parseLocalDate(slot.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            slot.currentBookings >= slot.maxBookings ? 'border-red-200 text-red-600 bg-white' :
                            slot.type === 'virtual' ? 'border-blue-200 text-blue-600 bg-blue-50' : 
                            slot.type === 'in-person' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 
                            'border-amber-200 text-amber-600 bg-amber-50'
                          }`}>
                            {slot.currentBookings >= slot.maxBookings ? 'COMPLET' : (slot.type === 'virtual' ? 'Virtuel' : slot.type === 'in-person' ? 'Présentiel' : 'Hybride')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 font-bold">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-900">{slot.startTime} - {slot.endTime}</span>
                          </div>
                          {slot.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-emerald-500" />
                              <span className="text-gray-900">{slot.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right pr-6 border-r-2 border-gray-50 mr-6">
                        {slot.currentBookings >= slot.maxBookings ? (
                           <>
                             <div className="text-xl font-black text-red-600">{t('status.full').toUpperCase()}</div>
                             <div className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">
                               {t('status.no_spots')}
                             </div>
                           </>
                        ) : (
                           <>
                             <div className="text-3xl font-black text-gray-900">
                               {slot.maxBookings - slot.currentBookings}
                             </div>
                             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                               {t('status.spots_available')}
                             </div>
                           </>
                        )}
                      </div>
                    </div>

                    {isEditable && (
                      <div className="flex flex-col space-y-2">
                        <button
                           onClick={(e) => handleToggleSlotStatus(e, slot)}
                           className={`p-2.5 rounded-xl transition-all shadow-sm ${slot.currentBookings >= slot.maxBookings ? 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white'}`}
                           title={slot.currentBookings >= slot.maxBookings ? 'Réouvrir' : 'Fermer le créneau'}
                         >
                            {slot.currentBookings >= slot.maxBookings ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                         </button>
                        <button
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowAddModal(true);
                          }}
                          className="p-2.5 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2.5 bg-gray-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
            )}
          </div>
        )}
        </div>
      </Card>


      {/* Message si aucun créneau */}
      {timeSlots.length === 0 && !isLoading && (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            Aucune disponibilité configurée
          </h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Commencez par ajouter vos créneaux de disponibilité pour permettre aux visiteurs de prendre rendez-vous avec vous pendant SIB 2026.
          </p>
          {isEditable && (
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => {
                  setModalTab('bulk');
                  setShowAddModal(true);
                }}
                variant="outline"
                className="px-8 py-3 text-lg border-2 border-amber-500 text-amber-600 hover:bg-amber-50"
                data-testid="button-bulk-generate-empty"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Générer tout mon planning
              </Button>
              <Button
                onClick={() => {
                  setModalTab('single');
                  setShowAddModal(true);
                }}
                className="px-8 py-3 text-lg"
                data-testid="button-add-first-slot"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un créneau manuel
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Bouton flottant pour ajouter un créneau - Visible quand il y a déjà des créneaux */}
      {isEditable && timeSlots.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 group"
          data-testid="button-add-slot-floating"
          title={t('calendar.add_new_slot')}
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Modal Ajout/Édition */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header Modal */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">
                        {modalTab === 'bulk' ? 'Générateur de créneaux' : (selectedSlot ? 'Modifier le créneau' : 'Nouveau créneau')}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

               {/* TABS FOR SINGLE VS BULK (Only show if creating new) */}
               {!selectedSlot && (
                  <div className="flex border-b border-gray-200">
                      <button
                          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${modalTab === 'single' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => setModalTab('single')}
                      >
                          Créneau unique
                      </button>
                      <button
                          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${modalTab === 'bulk' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => setModalTab('bulk')}
                      >
                          Générateur (Masse)
                      </button>
                  </div>
               )}

              {/* Body Modal */}
              <div className="p-6">
                 {modalTab === 'single' || selectedSlot ? (
                    <div className="space-y-6">
                        {/* Date et Type */}
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📅 Date du créneau *
                            </label>
                            <input
                            type="date"
                            value={newSlot.date}
                            onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                            min={getMinSlotDate()}
                            max={getMaxSlotDate()}
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            data-testid="input-slot-date"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📍 Type de rencontre *
                            </label>
                            <select
                            value={newSlot.type}
                            onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value as any })}
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            data-testid="select-slot-type"
                            >
                            <option value="in-person">🏢 Présentiel</option>
                            <option value="virtual">💻 Virtuel</option>
                            <option value="hybrid">🔄 Hybride</option>
                            </select>
                        </div>
                        </div>

                        {/* Horaires */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ⏰ Heure de début *
                            </label>
                            <input
                            type="time"
                            value={newSlot.startTime}
                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            data-testid="input-start-time"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ⏱️ Heure de fin *
                            </label>
                            <input
                            type="time"
                            value={newSlot.endTime}
                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            data-testid="input-end-time"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                            👥 Participants max *
                            </label>
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={newSlot.maxBookings}
                                    onChange={(e) => setNewSlot({ ...newSlot, maxBookings: parseInt(e.target.value) || 1 })}
                                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    data-testid="input-max-bookings"
                                />
                            </div>
                        </div>
                        </div>

                        {/* Lieu et Description */}
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🏛️ Lieu / Lien visioconférence
                            </label>
                            <input
                                type="text"
                                value={newSlot.location}
                                onChange={(e) => setNewSlot({ ...newSlot, location: e.target.value })}
                                placeholder="Stand A12, Salle B, https://meet.google.com/..."
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                             <p className="text-xs text-gray-500 mt-1">
                                Pour les RDV virtuels, indiquez le lien de visioconférence
                            </p>
                         </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📝 Description (optionnel)
                            </label>
                            <textarea
                                value={newSlot.description}
                                onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })}
                                placeholder="Sujet du rendez-vous, agenda, préparation nécessaire..."
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                rows={4}
                            />
                        </div>
                    </div>
                 ) : (
                    <BulkSlotGenerator userId={userId} onGenerate={fetchTimeSlots} onClose={() => setShowAddModal(false)} />
                 )}
              </div>

               {/* Footer Action */}
               {(modalTab === 'single' || selectedSlot) && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end space-x-4">
                    <Button
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 text-lg"
                    >
                    Annuler
                    </Button>
                    <Button
                    onClick={handleAddTimeSlot}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all"
                    data-testid="button-save-slot"
                    >
                    {isLoading ? (
                        <span className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enregistrement...
                        </span>
                    ) : (
                        <span className="flex items-center">
                        <Save className="w-5 h-5 mr-2" />
                        {selectedSlot ? 'Modifier' : 'Créer le créneau'}
                        </span>
                    )}
                    </Button>
                </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

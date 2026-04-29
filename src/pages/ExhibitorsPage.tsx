import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useExhibitorStore } from '../store/exhibitorStore';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';
import { CONFIG } from '../lib/config';
import { useTranslation } from '../hooks/useTranslation';
import { MoroccanPattern } from '../components/ui/MoroccanDecor';
import toast from 'react-hot-toast';
import ExhibitorCard from '../components/exhibitor/ExhibitorCard';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';
import { useAppointmentStore } from '../store/appointmentStore';
import { isDateInSalonRange } from '../config/salonInfo';

export default function ExhibitorsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const {
    filteredExhibitors,
    totalExhibitors,
    hasMore,
    filters,
    isLoading,
    fetchExhibitors,
    loadMoreExhibitors,
    setFilters
  } = useExhibitorStore();

  const [viewMode, setViewMode] = useState<keyof typeof CONFIG.viewModes>(CONFIG.viewModes.grid);
  const [showFilters, setShowFilters] = useState(false);

  // ─── Modal RDV ───
  const [rdvExhibitorId, setRdvExhibitorId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [appointmentMessage, setAppointmentMessage] = useState('');
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const { timeSlots, fetchTimeSlots, appointments, fetchAppointments } = useAppointmentStore();
  const rdvExhibitor = useMemo(
    () => filteredExhibitors.find(e => e.id === rdvExhibitorId) ?? null,
    [filteredExhibitors, rdvExhibitorId]
  );

  useEffect(() => {
    fetchExhibitors(true);
  }, [fetchExhibitors]);

  // ⚡ OPTIMISÉ: Mémoriser les catégories pour éviter la recréation à chaque render
  const categories = useMemo(() => [
    { value: '', label: t('pages.exhibitors.all_categories') },
    { value: 'institutional', label: t('pages.exhibitors.category_institutional') },
    { value: 'bâtiment-industry', label: t('pages.exhibitors.category_port_industry') },
    { value: 'bâtiment-operations', label: t('pages.exhibitors.category_operations') },
    { value: 'academic', label: t('pages.exhibitors.category_academic') }
  ], [t]);

  // ⚡ OPTIMISÉ: Mémoriser les secteurs pour le filtre (correspondant aux données réelles)
  const sectors = useMemo(() => [
    { value: '', label: t('exhibitors.all_sectors') },
    { value: 'Exploitation Bâtiment', label: 'Exploitation Bâtiment' },
    { value: 'Régulation Bâtiment', label: 'Régulation Bâtiment' },
    { value: 'Hub Logistique', label: 'Hub Logistique' },
    { value: 'Industrie & Export', label: 'Industrie & Export' },
    { value: 'Technologies du Bâtiment', label: 'Technologies du Bâtiment' },
    { value: 'Technologie Bâtiment', label: 'Technologie Bâtiment' },
    { value: 'Culture & Heritage Bâtiment', label: 'Culture & Heritage Bâtiment' },
    { value: 'Logistique Bâtiment', label: 'Logistique Bâtiment' },
    { value: 'Services du Bâtiment Premium', label: 'Services du Bâtiment Premium' },
    { value: 'Conseil Bâtiment', label: 'Conseil Bâtiment' },
    { value: 'Patrimoine Bâtiment', label: 'Patrimoine Bâtiment' },
    { value: 'Armement Bâtiment', label: 'Armement Bâtiment' },
    { value: 'Gestion Bâtiment', label: 'Gestion Bâtiment' },
    { value: 'Logistique Mondiale', label: 'Logistique Mondiale' }
  ], []);

  // ⚡ OPTIMISÉ: useCallback pour éviter de recréer ces fonctions à chaque render
  const getCategoryLabel = useCallback((category: string) => {
    const labels = {
      'institutional': t('pages.exhibitors.category_institutional'),
      'bâtiment-industry': t('pages.exhibitors.category_port_industry'),
      'port-industry': t('pages.exhibitors.category_port_industry'),
      'bâtiment-operations': t('pages.exhibitors.category_operations'),
      'port-operations': t('pages.exhibitors.category_operations'),
      'academic': t('pages.exhibitors.category_academic')
    };
    return labels[category as keyof typeof labels] || 'Industrie du Bâtiment';
  }, [t]);

  const getCategoryColor = useCallback((category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'institutional': 'success',
      'bâtiment-industry': 'error',
      'port-industry': 'error',
      'bâtiment-operations': 'info',
      'port-operations': 'info',
      'academic': 'warning'
    };
    return colors[category] || 'default';
  }, []);

  // ⚡ OPTIMISÉ: useCallback pour les handlers
  const handleViewDetails = useCallback((exhibitorId: string) => {
    navigate(`${ROUTES.EXHIBITORS}/${exhibitorId}`);
  }, [navigate]);

  const handleScheduleAppointment = useCallback((exhibitorId: string) => {
    const currentAuthState = useAuthStore.getState();
    if (!currentAuthState.isAuthenticated || !currentAuthState.user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`${ROUTES.EXHIBITORS}/${exhibitorId}`)}`);
      return;
    }
    setSelectedTimeSlot('');
    setAppointmentMessage('');
    setRdvExhibitorId(exhibitorId);
    fetchTimeSlots(exhibitorId);
    fetchAppointments().catch(() => {});
  }, [navigate, fetchTimeSlots, fetchAppointments]);

  const canChat = isAuthenticated && (
    user?.type === 'exhibitor' ||
    user?.type === 'partner' ||
    user?.type === 'admin' ||
    (user?.type === 'visitor' && user?.visitor_level === 'vip')
  );

  const handleExhibitorMessage = useCallback((exhibitorId: string) => {
    if (!canChat) {
      toast.error('La messagerie est réservée aux exposants, partenaires et visiteurs VIP');
      return;
    }
    navigate(`/messages?exhibitorId=${exhibitorId}`);
  }, [canChat, navigate]);

  const handleConfirmAppointment = async () => {
    if (!selectedTimeSlot) return;
    setIsBookingInProgress(true);
    try {
      const appointmentStore = useAppointmentStore.getState();
      await appointmentStore.bookAppointment(selectedTimeSlot, appointmentMessage);
      toast.success('Demande de rendez-vous envoyée !');
      await fetchAppointments();
      setRdvExhibitorId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la réservation');
    } finally {
      setIsBookingInProgress(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Premium Immersif */}
      <div className="relative bg-[#0A0A0A] pt-8 pb-24 px-4 overflow-hidden">
        {/* Pattern Subtil */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(231,209,146,0.8) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        {/* Lueurs Ambiantes Or */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E7D192]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E7D192]/3 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-sm border border-[rgba(231,209,146,0.2)] mb-8"
          >
             <div className="w-2 h-2 rounded-full bg-[#E7D192] animate-pulse"></div>
             <span className="text-[10px] font-light text-[#E7D192] uppercase tracking-[0.2em]">{t('exhibitors.catalog_label')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-light text-white mb-6 tracking-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {t('pages.exhibitors.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-xl font-light max-w-2xl mx-auto italic mb-12"
          >
            {t('pages.exhibitors.description')} • <span className="text-[#E7D192] font-light">{filteredExhibitors.length} {t('exhibitors.leaders_count')}</span>
          </motion.p>

          {/* Barre de Recherche Premium */}
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl p-2 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#E7D192]" />
              <input
                type="text"
                data-testid="search-input"
                placeholder={t('pages.exhibitors.search')}
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="w-full pl-14 pr-6 py-4 bg-transparent text-white placeholder-blue-200/40 text-lg font-bold border-none focus:ring-0 focus:outline-none"
              />
            </div>

            <div className="flex w-full md:w-auto p-1 gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 md:flex-none px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-300 font-black uppercase tracking-widest text-[10px] ${
                  showFilters ? 'bg-[#E7D192] text-[#0A0A0A] shadow-xl' : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>{t('exhibitors.filters')}</span>
              </button>

              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => setViewMode(CONFIG.viewModes.grid)}
                  className={`p-3 rounded-sm transition-all ${viewMode === CONFIG.viewModes.grid ? 'bg-[#E7D192] text-[#0A0A0A] shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode(CONFIG.viewModes.list)}
                  className={`p-3 rounded-sm transition-all ${viewMode === CONFIG.viewModes.list ? 'bg-[#E7D192] text-[#0A0A0A] shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Expanded */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto mt-6 p-8 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
              >
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">
                    {t('pages.exhibitors.filter_category')}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ category: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#E7D192] rounded-sm text-slate-900 font-light appearance-none transition-all cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">
                    {t('profile.sector')}
                  </label>
                  <select
                    value={filters.sector}
                    onChange={(e) => setFilters({ sector: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#E7D192] rounded-sm text-slate-900 font-light appearance-none transition-all cursor-pointer"
                  >
                    {sectors.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {sector.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">
                    {t('profile.location')}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Casablanca"
                    value={filters.country}
                    onChange={(e) => setFilters({ country: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#E7D192] rounded-sm text-slate-900 font-light transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logo Showcase Section - Bande défilante des logos exposants */}
      <div className="relative z-30">
        <LogoShowcaseSection type="exhibitors" />
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-[2.5rem] p-8 h-[450px] animate-pulse">
                <div className="h-40 bg-gray-100 rounded-3xl mb-8"></div>
                <div className="h-6 bg-gray-100 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-50 rounded-full"></div>
                  <div className="h-4 bg-gray-50 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredExhibitors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl sm:rounded-[3rem] p-8 sm:p-16 md:p-24 text-center border-2 border-dashed border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-[rgba(231,209,146,0.08)] rounded-sm flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Search className="h-10 w-10 text-[#E7D192]" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                {t('pages.exhibitors.no_results')}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium italic mb-10">
                {t('exhibitors.no_results_desc')}
              </p>
              <button
                onClick={() => setFilters({ search: '', category: '', sector: '', country: '' })}
                className="px-8 py-3 bg-[#1A1A1A] text-white rounded-sm font-light uppercase tracking-widest text-xs hover:bg-[#E7D192] hover:text-[#0A0A0A] transition-colors shadow-xl"
              >
                {t('exhibitors.reset_search')}
              </button>
            </div>
          </motion.div>
        ) : (
          <div>
            <div data-testid="exhibitors-list" className={viewMode === CONFIG.viewModes.grid
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10'
              : 'space-y-8 md:space-y-10'
            }>
              {filteredExhibitors.map((exhibitor, index) => (
                <ExhibitorCard
                  key={exhibitor.id}
                  exhibitor={exhibitor}
                  viewMode={viewMode}
                  index={index}
                  onViewDetails={handleViewDetails}
                  onScheduleAppointment={handleScheduleAppointment}
                  onMessage={handleExhibitorMessage}
                  canChat={canChat}
                  getCategoryLabel={getCategoryLabel}
                  getCategoryColor={getCategoryColor}
                  t={t}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <p className="text-sm text-slate-500 font-semibold">
                {t('exhibitors.page.displayed_count').replace('{{shown}}', String(filteredExhibitors.length)).replace('{{total}}', String(totalExhibitors))}
              </p>
              {hasMore && (
                <Button
                  onClick={loadMoreExhibitors}
                  disabled={isLoading}
                  className="px-8 py-3 bg-[#1A1A1A] hover:bg-[#E7D192] hover:text-[#0A0A0A] text-white rounded-sm font-light uppercase tracking-widest text-xs"
                >
                  {isLoading ? t('exhibitors.page.loading') : t('exhibitors.page.load_more')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ─── MODAL RDV ─── */}
    {rdvExhibitorId && rdvExhibitor && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1e3a5f] to-blue-700 text-white p-6 rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Prendre RDV avec {rdvExhibitor.companyName}</h3>
                <p className="text-blue-200 text-sm mt-0.5">Sélectionnez un créneau disponible</p>
              </div>
              <button onClick={() => setRdvExhibitorId(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Créneaux horaires */}
            {(() => {
              const filteredSlots = timeSlots.filter(slot => {
                if (slot.available === false) return false;
                if (!slot.date) return false;
                return isDateInSalonRange(new Date(slot.date as any));
              });

              if (filteredSlots.length === 0) return (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Aucun créneau disponible</p>
                  <p className="text-sm text-gray-400 mt-1">Veuillez réessayer plus tard ou contacter l'exposant</p>
                </div>
              );

              return (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Choisir un créneau horaire
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                    {filteredSlots.map(slot => {
                      const isSelected = selectedTimeSlot === slot.id;
                      const booked = appointments.find(a => a.timeSlotId === slot.id && a.visitorId === user?.id);
                      const dateLabel = new Date(slot.date as any).toLocaleDateString('fr-FR', {
                        weekday: 'long', day: '2-digit', month: 'long'
                      });
                      return (
                        <button
                          key={slot.id}
                          disabled={!!booked}
                          onClick={() => !booked && setSelectedTimeSlot(slot.id)}
                          className={`p-3 border-2 rounded-xl text-left transition-all relative ${
                            booked
                              ? 'border-green-200 bg-green-50 opacity-70 cursor-not-allowed'
                              : isSelected
                              ? 'border-[#1e3a5f] bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow'
                          }`}
                        >
                          <div className="font-semibold text-gray-800 capitalize text-xs mb-1">{dateLabel}</div>
                          <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            {slot.startTime} – {slot.endTime}
                          </div>
                          {slot.location && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{slot.location}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {slot.currentBookings || 0}/{slot.maxBookings} réservé(s)
                          </div>
                          {booked && (
                            <span className={`absolute top-2 right-2 text-xs text-white px-2 py-0.5 rounded-full font-bold ${
                              booked.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                              {booked.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                            </span>
                          )}
                          {isSelected && !booked && (
                            <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-[#1e3a5f]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Message optionnel */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                Message (optionnel)
              </label>
              <textarea
                value={appointmentMessage}
                onChange={e => setAppointmentMessage(e.target.value)}
                placeholder="Décrivez brièvement l'objet de votre rendez-vous..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] resize-none text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={handleConfirmAppointment}
                disabled={!selectedTimeSlot || isBookingInProgress}
                className={`flex-1 h-12 rounded-xl font-bold text-sm transition-colors ${
                  selectedTimeSlot && !isBookingInProgress
                    ? 'bg-[#1e3a5f] text-white hover:bg-[#163055]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isBookingInProgress ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Envoi en cours...
                  </span>
                ) : selectedTimeSlot ? 'Envoyer la demande' : 'Sélectionnez un créneau'}
              </button>
              <button
                onClick={() => setRdvExhibitorId(null)}
                className="px-6 h-12 border-2 border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

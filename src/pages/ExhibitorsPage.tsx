import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List
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
      'bâtiment-operations': t('pages.exhibitors.category_operations'),
      'academic': t('pages.exhibitors.category_academic')
    };
    return labels[category as keyof typeof labels] || category;
  }, [t]);

  const getCategoryColor = useCallback((category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'institutional': 'success',
      'bâtiment-industry': 'error',
      'bâtiment-operations': 'info',
      'academic': 'warning'
    };
    return colors[category] || 'default';
  }, []);

  // ⚡ OPTIMISÉ: useCallback pour les handlers
  const handleViewDetails = useCallback((exhibitorId: string) => {
    navigate(`${ROUTES.EXHIBITORS}/${exhibitorId}`);
  }, [navigate]);

  const handleScheduleAppointment = useCallback((exhibitorId: string) => {
    // Récupérer l'état actuel du store directement
    const currentAuthState = useAuthStore.getState();

    if (!currentAuthState.isAuthenticated || !currentAuthState.user) {
      // Rediriger vers la page de connexion avec redirection vers les RDV
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`)}`);
    } else {
      // Rediriger directement vers la page des RDV avec l'ID de l'exposant
      navigate(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`);
    }
  }, [navigate]);

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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Premium Immersif */}
      <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] pt-8 pb-24 px-4 overflow-hidden">
        {/* Pattern Zellige Subtil */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        {/* Cercles Lumineux */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8"
          >
             <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
             <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">{t('exhibitors.catalog_label')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            {t('pages.exhibitors.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100/60 text-xl font-medium max-w-2xl mx-auto italic mb-12"
          >
            {t('pages.exhibitors.description')} • <span className="text-white font-black">{filteredExhibitors.length} {t('exhibitors.leaders_count')}</span>
          </motion.p>

          {/* Barre de Recherche Premium */}
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl p-2 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
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
                  showFilters ? 'bg-white text-slate-900 shadow-xl' : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>{t('exhibitors.filters')}</span>
              </button>

              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => setViewMode(CONFIG.viewModes.grid)}
                  className={`p-3 rounded-xl transition-all ${viewMode === CONFIG.viewModes.grid ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode(CONFIG.viewModes.list)}
                  className={`p-3 rounded-xl transition-all ${viewMode === CONFIG.viewModes.list ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
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
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl text-slate-900 font-bold appearance-none transition-all cursor-pointer"
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
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl text-slate-900 font-bold appearance-none transition-all cursor-pointer"
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
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl text-slate-900 font-bold transition-all"
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
              <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Search className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                {t('pages.exhibitors.no_results')}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium italic mb-10">
                {t('exhibitors.no_results_desc')}
              </p>
              <button
                onClick={() => setFilters({ search: '', category: '', sector: '', country: '' })}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-colors shadow-xl"
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
                {filteredExhibitors.length} affichés sur {totalExhibitors} exposants
              </p>
              {hasMore && (
                <Button
                  onClick={loadMoreExhibitors}
                  disabled={isLoading}
                  className="px-8 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  {isLoading ? 'Chargement...' : 'Charger plus'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


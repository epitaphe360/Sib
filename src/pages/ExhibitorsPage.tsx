import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useExhibitorStore } from '../store/exhibitorStore';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';
import { CONFIG } from '../lib/config';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';
import ExhibitorCard from '../components/exhibitor/ExhibitorCard';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';
import { SmartImage } from '../components/ui/SmartImage';
import { IMAGES } from '../lib/images';

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
    setFilters,
  } = useExhibitorStore();

  const [viewMode, setViewMode] = useState<keyof typeof CONFIG.viewModes>(CONFIG.viewModes.grid);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExhibitors(true);
  }, [fetchExhibitors]);

  const categories = useMemo(() => [
    { value: '', label: t('pages.exhibitors.all_categories') },
    { value: 'institutional', label: t('pages.exhibitors.category_institutional') },
    { value: 'bâtiment-industry', label: t('pages.exhibitors.category_port_industry') },
    { value: 'bâtiment-operations', label: t('pages.exhibitors.category_operations') },
    { value: 'academic', label: t('pages.exhibitors.category_academic') },
  ], [t]);

  const sectors = useMemo(() => [
    { value: '', label: t('exhibitors.all_sectors') },
    { value: 'Exploitation Bâtiment', label: 'Exploitation Bâtiment' },
    { value: 'Régulation Bâtiment', label: 'Régulation Bâtiment' },
    { value: 'Hub Logistique', label: 'Hub Logistique' },
    { value: 'Industrie & Export', label: 'Industrie & Export' },
    { value: 'Technologies du Bâtiment', label: 'Technologies du Bâtiment' },
    { value: 'Culture & Heritage Bâtiment', label: 'Culture & Heritage Bâtiment' },
    { value: 'Logistique Bâtiment', label: 'Logistique Bâtiment' },
    { value: 'Services du Bâtiment Premium', label: 'Services du Bâtiment Premium' },
    { value: 'Conseil Bâtiment', label: 'Conseil Bâtiment' },
    { value: 'Patrimoine Bâtiment', label: 'Patrimoine Bâtiment' },
    { value: 'Gestion Bâtiment', label: 'Gestion Bâtiment' },
    { value: 'Logistique Mondiale', label: 'Logistique Mondiale' },
  ], [t]);

  const getCategoryLabel = useCallback((category: string) => {
    const labels = {
      'institutional': t('pages.exhibitors.category_institutional'),
      'bâtiment-industry': t('pages.exhibitors.category_port_industry'),
      'bâtiment-operations': t('pages.exhibitors.category_operations'),
      'academic': t('pages.exhibitors.category_academic'),
    };
    return labels[category as keyof typeof labels] || category;
  }, [t]);

  const getCategoryColor = useCallback((category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'institutional': 'success',
      'bâtiment-industry': 'error',
      'bâtiment-operations': 'info',
      'academic': 'warning',
    };
    return colors[category] || 'default';
  }, []);

  const handleViewDetails = useCallback((exhibitorId: string) => {
    navigate(`${ROUTES.EXHIBITORS}/${exhibitorId}`);
  }, [navigate]);

  const handleScheduleAppointment = useCallback((exhibitorId: string) => {
    const currentAuthState = useAuthStore.getState();
    if (!currentAuthState.isAuthenticated || !currentAuthState.user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`)}`);
    } else {
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
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-24">
        {/* 4K photo backdrop */}
        <div className="absolute inset-0 -z-10">
          <SmartImage
            source={IMAGES.hero.architecture}
            aspect="auto"
            rounded="none"
            priority
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/90 via-primary-900/85 to-primary-900/95" />
          <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
        </div>

        <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-8"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                {t('exhibitors.catalog_label')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
            >
              {t('pages.exhibitors.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-base lg:text-lg text-white/75 leading-relaxed mb-10"
            >
              {t('pages.exhibitors.description')} ·{' '}
              <span className="text-accent-500 font-semibold">
                {filteredExhibitors.length} {t('exhibitors.leaders_count')}
              </span>
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/15 shadow-xl flex flex-col md:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  data-testid="search-input"
                  placeholder={t('pages.exhibitors.search')}
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-white/50 text-sm border-0 focus:ring-0 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className={[
                    'flex-1 md:flex-none h-11 px-5 rounded-xl inline-flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider transition-all',
                    showFilters
                      ? 'bg-white text-primary-900 shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
                  ].join(' ')}
                >
                  <Filter className="h-4 w-4" />
                  {t('exhibitors.filters')}
                </button>

                <div className="flex bg-white/10 border border-white/10 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode(CONFIG.viewModes.grid)}
                    aria-label="Grid"
                    className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                      viewMode === CONFIG.viewModes.grid
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode(CONFIG.viewModes.list)}
                    aria-label="List"
                    className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                      viewMode === CONFIG.viewModes.list
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Filters panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl mx-auto mt-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] mb-2">
                      {t('pages.exhibitors.filter_category')}
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ category: e.target.value })}
                      className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 rounded-lg text-sm text-neutral-900 dark:text-white transition-all"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] mb-2">
                      {t('profile.sector')}
                    </label>
                    <select
                      value={filters.sector}
                      onChange={(e) => setFilters({ sector: e.target.value })}
                      className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 rounded-lg text-sm text-neutral-900 dark:text-white transition-all"
                    >
                      {sectors.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] mb-2">
                      {t('profile.location')}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Casablanca"
                      value={filters.country}
                      onChange={(e) => setFilters({ country: e.target.value })}
                      className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 rounded-lg text-sm text-neutral-900 dark:text-white transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Logo showcase */}
      <div className="relative z-10 -mt-6">
        <LogoShowcaseSection type="exhibitors" />
      </div>

      {/* Content */}
      <div className="max-w-container mx-auto px-6 lg:px-8 pt-6 pb-20 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={`skeleton-${i}`} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 h-96 animate-pulse border border-neutral-200 dark:border-neutral-800">
                <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-5" />
                <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredExhibitors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-12 sm:p-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Search className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
              {t('pages.exhibitors.no_results')}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
              {t('exhibitors.no_results_desc')}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setFilters({ search: '', category: '', sector: '', country: '' })}
            >
              {t('exhibitors.reset_search')}
            </Button>
          </motion.div>
        ) : (
          <div>
            <div
              data-testid="exhibitors-list"
              className={
                viewMode === CONFIG.viewModes.grid
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
              }
            >
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

            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                {filteredExhibitors.length} affichés sur {totalExhibitors} exposants
              </p>
              {hasMore && (
                <Button
                  onClick={loadMoreExhibitors}
                  disabled={isLoading}
                  variant="primary"
                  size="lg"
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
}

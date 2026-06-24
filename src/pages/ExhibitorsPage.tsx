import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useExhibitorStore } from '../store/exhibitorStore';
import { CONFIG } from '../lib/config';
import { useTranslation } from '../hooks/useTranslation';
import ExhibitorDirectoryCard from '../components/exhibitor/ExhibitorDirectoryCard';
import ExhibitorDirectoryTable from '../components/exhibitor/ExhibitorDirectoryTable';
import ExhibitorsLogoMarquee from '../components/exhibitor/ExhibitorsLogoMarquee';
import { ROUTES } from '../lib/routes';
import { motion, AnimatePresence } from 'framer-motion';
import { IMAGES, img } from '../lib/images';

export default function ExhibitorsPage() {
  const { t } = useTranslation();
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
    fetchExhibitors(true, { publicCatalog: true, limit: 200 });
  }, [fetchExhibitors]);

  const marqueeLogos = useMemo(
    () =>
      filteredExhibitors
        .filter((exhibitor) => exhibitor.logo?.trim())
        .map((exhibitor) => ({
          to: `${ROUTES.EXHIBITORS}/${exhibitor.id}`,
          src: exhibitor.logo!,
          alt: exhibitor.companyName,
        })),
    [filteredExhibitors],
  );

  const categories = useMemo(() => [
    { value: '', label: t('pages.exhibitors.all_categories') },
    { value: 'institutional', label: t('pages.exhibitors.category_institutional') },
    { value: 'bâtiment-industry', label: t('pages.exhibitors.category_port_industry') },
    { value: 'bâtiment-operations', label: t('pages.exhibitors.category_operations') },
    { value: 'academic', label: t('pages.exhibitors.category_academic') },
  ], [t]);

  const sectors = useMemo(() => [
    { value: '', label: t('exhibitors.all_sectors') },
    { value: 'Gros œuvre', label: 'Gros œuvre' },
    { value: 'Second œuvre', label: 'Second œuvre' },
    { value: 'Matériaux de construction', label: 'Matériaux de construction' },
    { value: 'Menuiserie & fermetures', label: 'Menuiserie & fermetures' },
    { value: 'Équipements techniques', label: 'Équipements techniques' },
    { value: 'Construction durable', label: 'Construction durable' },
    { value: 'Smart building & BIM', label: 'Smart building & BIM' },
    { value: 'Architecture & design', label: 'Architecture & design' },
    { value: 'Industrie & export', label: 'Industrie & export' },
  ], [t]);

  const directoryEntries = useMemo(
    () =>
      filteredExhibitors.map((exhibitor) => ({
        id: exhibitor.id,
        companyName: exhibitor.companyName,
        sector: exhibitor.sector,
        logo: exhibitor.logo,
        standNumber: exhibitor.standNumber,
        hallNumber: exhibitor.hallNumber,
      })),
    [filteredExhibitors],
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero — fond bleu garanti (pas de z-index négatif) */}
      <section className="relative isolate min-h-[220px] sm:min-h-[260px] overflow-hidden bg-primary-900">
        <img
          src={img(IMAGES.hero.architecture, 1920, undefined, 80)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary-900/90" aria-hidden />

        <div className="relative z-10 max-w-container mx-auto px-6 lg:px-8 py-12 lg:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary-200" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              {t('exhibitors.catalog_label')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-4"
            style={{ color: '#ffffff' }}
          >
            {t('pages.exhibitors.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base lg:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.92)' }}
          >
            {t('pages.exhibitors.description')}
          </motion.p>
        </div>
      </section>

      {marqueeLogos.length > 0 && (
        <section className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-4 overflow-hidden">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-primary-600 dark:text-primary-300 mb-3">
            {t('nav.exhibitors')}
          </p>
          <ExhibitorsLogoMarquee logos={marqueeLogos} fadeBg="#fafafa" />
        </section>
      )}

      {/* Recherche + filtres — zone claire, texte sombre */}
      <section className="home-light bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-6 lg:py-8">
        <div className="max-w-container mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-primary-800 dark:text-primary-200 mb-4">
            {filteredExhibitors.length} {t('exhibitors.leaders_count')}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white dark:bg-neutral-950 p-2 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 shadow-lg flex flex-col md:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                data-testid="search-input"
                placeholder={t('pages.exhibitors.search')}
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 text-sm border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600/40 focus:border-primary-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={[
                  'flex-1 md:flex-none h-11 px-5 rounded-xl inline-flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider transition-all border-2',
                  showFilters
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-600 hover:border-primary-500',
                ].join(' ')}
              >
                <Filter className="h-4 w-4" />
                {t('exhibitors.filters')}
              </button>

              <div className="flex bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-600 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode(CONFIG.viewModes.grid)}
                  aria-label="Grid"
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === CONFIG.viewModes.grid
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300'
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
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-3xl mx-auto mt-4 p-6 bg-white dark:bg-neutral-950 rounded-2xl shadow-lg border-2 border-neutral-200 dark:border-neutral-700 grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-[0.15em] mb-2">
                    {t('pages.exhibitors.filter_category')}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ category: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-600 focus:border-primary-600 rounded-lg text-sm text-neutral-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-[0.15em] mb-2">
                    {t('profile.sector')}
                  </label>
                  <select
                    value={filters.sector}
                    onChange={(e) => setFilters({ sector: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-600 focus:border-primary-600 rounded-lg text-sm text-neutral-900 dark:text-white"
                  >
                    {sectors.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-[0.15em] mb-2">
                    {t('profile.location')}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Casablanca"
                    value={filters.country}
                    onChange={(e) => setFilters({ country: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-600 focus:border-primary-600 rounded-lg text-sm text-neutral-900 dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Content */}
      <div className="home-light max-w-container mx-auto px-6 lg:px-8 pt-8 pb-20 bg-white dark:bg-neutral-950">
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
            {viewMode === CONFIG.viewModes.list ? (
              <ExhibitorDirectoryTable exhibitors={directoryEntries} />
            ) : (
              <div
                data-testid="exhibitors-list"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {directoryEntries.map((exhibitor, index) => (
                  <ExhibitorDirectoryCard key={exhibitor.id} exhibitor={exhibitor} index={index} />
                ))}
              </div>
            )}

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

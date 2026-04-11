/**
 * PartnersPage Optimisé avec Pagination
 * Utilise tous les nouveaux composants de Phase 1
 */

import React, { useEffect, useState } from 'react';
import { Download, Grid, List, Building, Search } from 'lucide-react';
import { useOptimizedList } from '../hooks/useOptimizedList';
import { Pagination } from '../components/ui/Pagination';
import { AdvancedSearch } from '../components/search/AdvancedSearch';
import { PartnerCard } from '../components/cards/PartnerCardMemo';
import { exportService } from '../services/exportService';
import { useRateLimit, RATE_LIMITS } from '../middleware/rateLimiter';
import { SupabaseService } from '../services/supabaseService';
import { logger } from '../lib/logger';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';
import type { Partner } from '../types';

// Fonction pour déterminer l'ordre d'importance des tiers
const getTierPriority = (partner: Partner): number => {
  const sponsorshipLevel = partner.sponsorshipLevel?.toLowerCase() || '';
  const partnerType = partner.partnerType?.toLowerCase() || '';
  
  // Égide (highest priority)
  if (sponsorshipLevel.includes('egide') || sponsorshipLevel.includes('égide')) return 1;
  
  // Stratégiques
  if (sponsorshipLevel.includes('strategic') || sponsorshipLevel.includes('stratégique')) return 2;
  
  // Platinum
  if (partnerType === 'platinum') return 3;
  
  // Gold
  if (partnerType === 'gold') return 4;
  
  // Silver
  if (partnerType === 'silver') return 5;
  
  // Support
  if (sponsorshipLevel.includes('support')) return 6;
  
  // Culturels
  if (sponsorshipLevel.includes('cultural') || sponsorshipLevel.includes('culturel')) return 7;
  
  // Académiques
  if (sponsorshipLevel.includes('academic') || sponsorshipLevel.includes('académique') || sponsorshipLevel.includes('academique')) return 8;
  
  // Autres (bronze, institutional, etc.)
  return 9;
};

export const PartnersPageOptimized: React.FC = () => {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');

  const { checkLimit: checkExportLimit, getRemaining } = useRateLimit(
    undefined,
    RATE_LIMITS.EXPORT
  );

  const {
    paginatedItems,
    totalItems,
    currentPage,
    totalPages,
    goToPage,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    toggleSort,
    setFilter,
    clearFilters,
  } = useOptimizedList({
    items: partners,
    itemsPerPage: 12,
    searchFields: ['organizationName', 'sector', 'description', 'country'],
    initialSortField: 'organizationName',
    filterFn: (partner, filters) => {
      if (filters.partnerType && partner.partnerType !== filters.partnerType) return false;
      if (filters.verified && !partner.verified) return false;
      if (filters.featured && !partner.featured) return false;
      if (filters.country && partner.country !== filters.country) return false;
      return true;
    },
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      logger.info('Loading partners');

      const data = await SupabaseService.getPartners();
      
      // Trier par ordre d'importance des tiers
      const sortedData = (data || []).sort((a, b) => {
        const priorityA = getTierPriority(a);
        const priorityB = getTierPriority(b);
        
        // Si même priorité, trier par ordre alphabétique
        if (priorityA === priorityB) {
          return a.organizationName.localeCompare(b.organizationName);
        }
        
        return priorityA - priorityB;
      });
      
      setPartners(sortedData);

      logger.info('Partners loaded', { count: data?.length || 0 });
    } catch (error) {
      logger.error('Failed to load partners', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!checkExportLimit()) {
      const remaining = getRemaining();
      toast.error(t('partners.export_limit', { remaining: remaining.toString() }));
      return;
    }

    try {
      logger.trackAction('export_partners', undefined, { format: exportFormat });
      await exportService.exportPartners(partners, exportFormat);
    } catch (error) {
      logger.error('Export failed', error as Error);
      toast.error(t('partners.export_error'));
    }
  };

  const suggestions = React.useMemo(() => {
    const uniqueSectors = Array.from(new Set(partners.map((p) => p.sector)));
    return uniqueSectors.slice(0, 10);
  }, [partners]);

  const uniqueCountries = React.useMemo(() => {
    return Array.from(new Set(partners.map((p) => p.country))).sort();
  }, [partners]);

  const searchFilters = [
    {
      key: 'partnerType',
      label: t('partners.type'),
      type: 'select' as const,
      options: [
        { value: 'institutional', label: t('partners.institutional') },
        { value: 'platinum', label: 'Platinum' },
        { value: 'gold', label: 'Gold' },
        { value: 'silver', label: 'Silver' },
        { value: 'bronze', label: 'Bronze' },
      ],
    },
    {
      key: 'country',
      label: t('partners.country'),
      type: 'select' as const,
      options: uniqueCountries.map((c) => ({ value: c, label: c })),
    },
    {
      key: 'verified',
      label: t('partners.verified_only'),
      type: 'checkbox' as const,
    },
    {
      key: 'featured',
      label: t('partners.featured_only'),
      type: 'checkbox' as const,
    },
  ];

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
             <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">{t('partners.catalog_label')}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            {t('partners.page_title')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100/60 text-xl font-medium max-w-2xl mx-auto italic mb-12"
          >
            {t('partners.page_subtitle')} \u2022 <span className="text-white font-black">{totalItems} {t('partners.leaders_count')}</span>
          </motion.p>
          
          {/* Barre de Recherche Premium */}
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl p-2 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
              <input
                type="text"
                placeholder={t('partners.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-transparent text-white placeholder-blue-200/40 text-lg font-bold border-none focus:ring-0 focus:outline-none"
              />
            </div>
            
            <div className="flex w-full md:w-auto p-1 gap-2">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Logo Showcase Section - Bande défilante des logos partenaires & exposants */}
      <div className="relative z-30">
        <LogoShowcaseSection type="both" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <span className="text-sm font-black text-blue-900 uppercase tracking-wider">🛡️ Affichage par ordre d'importance</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t('partners.export')}</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <main>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600">
                {t('partners.no_results')}
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('partners.clear_filters')}
              </button>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {paginatedItems.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>

              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={12}
                  onPageChange={goToPage}
                  showFirstLast
                  showItemsCount
                />
              </div>
            </>
          )}
        </main>

        {/* Stats */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-sm text-gray-600">{t('partners.total')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {partners.filter((p) => p.partnerType === 'platinum' || p.partnerType === 'platinum').length}
              </div>
              <div className="text-sm text-gray-600">Platinum</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {partners.filter((p) => p.partnerType === 'gold').length}
              </div>
              <div className="text-sm text-gray-600">Gold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600">
                {partners.filter((p) => p.partnerType === 'silver').length}
              </div>
              <div className="text-sm text-gray-600">Silver</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PartnersPageOptimized;

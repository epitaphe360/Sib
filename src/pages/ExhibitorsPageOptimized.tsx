/**
 * ExhibitorsPage Optimisé - EXEMPLE d'implémentation complète
 * Utilise tous les nouveaux composants pour atteindre 100%
 *
 * Features:
 * - Pagination avec usePagination
 * - Search avancé avec autocomplete
 * - Filtres multiples
 * - Sorting
 * - Export CSV/Excel/PDF
 * - Cards mémoïsées pour performance
 * - Rate limiting
 * - Accessibility WCAG 2.1
 */

import React, { useEffect, useState } from 'react';
import { Download, Grid, List } from 'lucide-react';
import { useOptimizedList } from '../hooks/useOptimizedList';
import { Pagination } from '../components/ui/Pagination';
import { AdvancedSearch } from '../components/search/AdvancedSearch';
import { ExhibitorCard } from '../components/cards/ExhibitorCardMemo';
import { exportService } from '../services/exportService';
import { SkipLinks } from '../components/accessibility/SkipLink';
import { useRateLimit, RATE_LIMITS } from '../middleware/rateLimiter';
import { SupabaseService } from '../services/supabaseService';
import { logger } from '../lib/logger';
import { toast } from 'sonner';
import type { Exhibitor } from '../types';

export const ExhibitorsPageOptimized: React.FC = () => {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');

  // Rate limiting for exports
  const { checkLimit: checkExportLimit, getRemaining } = useRateLimit(
    undefined,
    RATE_LIMITS.EXPORT
  );

  // Optimized list with search, filter, sort, pagination
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
    items: exhibitors,
    itemsPerPage: 12,
    searchFields: ['companyName', 'sector', 'description'],
    initialSortField: 'companyName',
    filterFn: (exhibitor, filters) => {
      if (filters.category && exhibitor.category !== filters.category) return false;
      if (filters.verified && !exhibitor.verified) return false;
      if (filters.featured && !exhibitor.featured) return false;
      return true;
    },
  });

  // Load exhibitors
  useEffect(() => {
    loadExhibitors();
  }, []);

  const loadExhibitors = async () => {
    try {
      setLoading(true);
      logger.info('Loading exhibitors');

      const data = await SupabaseService.getExhibitors();
      setExhibitors(data || []);

      logger.info('Exhibitors loaded', { count: data?.length || 0 });
    } catch (error) {
      logger.error('Failed to load exhibitors', error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Export handler
  const handleExport = async () => {
    if (!checkExportLimit()) {
      const remaining = getRemaining();
      toast.error(`Limite d'export atteinte. ${remaining} exports restants.`);
      return;
    }

    try {
      logger.trackAction('export_exhibitors', undefined, { format: exportFormat });

      await exportService.exportExhibitors(exhibitors, exportFormat);
    } catch (error) {
      logger.error('Export failed', error as Error);
      toast.error('Erreur lors de l\'export');
    }
  };

  // Search with suggestions
  const suggestions = React.useMemo(() => {
    const uniqueSectors = Array.from(new Set(exhibitors.map((e) => e.sector)));
    return uniqueSectors.slice(0, 10);
  }, [exhibitors]);

  // Advanced filters
  const searchFilters = [
    {
      key: 'category',
      label: 'Catégorie',
      type: 'select' as const,
      options: [
        { value: 'institutional', label: 'Institutionnel' },
        { value: 'port-industry', label: 'Industrie Portuaire' },
        { value: 'port-operations', label: 'Opérations Portuaires' },
        { value: 'academic', label: 'Académique' },
      ],
    },
    {
      key: 'verified',
      label: 'Vérifié uniquement',
      type: 'checkbox' as const,
    },
    {
      key: 'featured',
      label: 'En vedette uniquement',
      type: 'checkbox' as const,
    },
  ];

  return (
    <>
      <SkipLinks />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header id="main-navigation" className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Exposants sib 2026
            </h1>
            <p className="text-lg text-gray-600">
              Découvrez les {totalItems} exposants participant au salon
            </p>
          </header>

          {/* Search & Filters */}
          <div id="search" className="mb-6">
            <AdvancedSearch
              placeholder="Rechercher par nom, secteur, description..."
              onSearch={(query, filters) => {
                setSearchQuery(query);
                Object.entries(filters).forEach(([key, value]) => {
                  setFilter(key, value);
                });
              }}
              filters={searchFilters}
              suggestions={suggestions}
              showFilters
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Trier par:</label>
              <select
                value={sortField?.toString() || 'companyName'}
                onChange={(e) => toggleSort(e.target.value as keyof Exhibitor)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                aria-label="Trier par"
              >
                <option value="companyName">Nom</option>
                <option value="sector">Secteur</option>
                <option value="category">Catégorie</option>
              </select>

              <button
                onClick={() => sortField && toggleSort(sortField)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label={`Direction: ${sortDirection === 'asc' ? 'Croissant' : 'Décroissant'}`}
              >
                {sortDirection === 'asc' ? '?' : '?'}
              </button>
            </div>

            {/* View mode & Export */}
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'}`}
                  aria-label="Vue grille"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'}`}
                  aria-label="Vue liste"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Export */}
              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  aria-label="Format d'export"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  aria-label="Exporter"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exporter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main id="main-content">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-gray-600">
                  Aucun exposant trouvé pour votre recherche
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <>
                {/* Grid/List view */}
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                  role="list"
                  aria-label="Liste des exposants"
                >
                  {paginatedItems.map((exhibitor) => (
                    <ExhibitorCard
                      key={exhibitor.id}
                      exhibitor={exhibitor}
                      showActions
                    />
                  ))}
                </div>

                {/* Pagination */}
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

          {/* Footer info */}
          <footer id="footer" className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p>
                {totalItems} exposants · Page {currentPage} sur {totalPages}
              </p>
              <p className="mt-2">
                Recherche: "{searchQuery || 'Aucune'}" · Résultats: {paginatedItems.length}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default ExhibitorsPageOptimized;

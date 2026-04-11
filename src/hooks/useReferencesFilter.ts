import { useMemo, useCallback } from 'react';
import { useFilterStore, type Sector } from '../store/filterStore';

export interface Reference {
  id: string;
  name: string;
  logo: string;
  sector: Sector;
  description: string;
  caseStudyUrl?: string;
  featured?: boolean;
}

interface UseReferencesFilterOptions {
  references: Reference[];
}

/**
 * Hook useReferencesFilter - Filtrage et tri des références
 * 
 * Fournit :
 * - Filtrage par secteur
 * - Recherche textuelle
 * - Tri des résultats
 * - Résultats filtrés et triés
 */
export const useReferencesFilter = ({ references }: UseReferencesFilterOptions) => {
  const {
    selectedSectors,
    searchQuery,
    sortBy,
    toggleSector,
    setSectors,
    clearSectors,
    setSearchQuery,
    setSortBy,
    resetFilters,
  } = useFilterStore();

  // Filtrer et trier les références
  const filteredReferences = useMemo(() => {
    let results = [...references];

    // Filtrer par secteur
    if (selectedSectors.length > 0) {
      results = results.filter((ref) => selectedSectors.includes(ref.sector));
    }

    // Filtrer par recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (ref) =>
          ref.name.toLowerCase().includes(query) ||
          ref.description.toLowerCase().includes(query)
      );
    }

    // Trier les résultats
    switch (sortBy) {
      case 'alphabetical':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
        results.sort((a, b) => {
          // Mettre les références en vedette en premier
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
      case 'recent':
      default:
        // Garder l'ordre original (supposé être récent)
        break;
    }

    return results;
  }, [references, selectedSectors, searchQuery, sortBy]);

  // Obtenir les secteurs disponibles
  const availableSectors = useMemo(() => {
    const sectors = new Set(references.map((ref) => ref.sector));
    return Array.from(sectors).sort();
  }, [references]);

  // Obtenir les statistiques
  const stats = useMemo(() => ({
    total: references.length,
    filtered: filteredReferences.length,
    hasFilters: selectedSectors.length > 0 || searchQuery.length > 0,
  }), [references.length, filteredReferences.length, selectedSectors.length, searchQuery.length]);

  // Callbacks pour les actions
  const handleToggleSector = useCallback(
    (sector: Sector) => {
      toggleSector(sector);
    },
    [toggleSector]
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  const handleSort = useCallback(
    (sort: 'recent' | 'popular' | 'alphabetical') => {
      setSortBy(sort);
    },
    [setSortBy]
  );

  return {
    // Données
    filteredReferences,
    availableSectors,
    stats,

    // État
    selectedSectors,
    searchQuery,
    sortBy,

    // Actions
    toggleSector: handleToggleSector,
    setSectors,
    clearSectors,
    setSearchQuery: handleSearch,
    setSortBy: handleSort,
    resetFilters: handleClearFilters,
  };
};

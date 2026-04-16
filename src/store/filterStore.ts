import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Sector = 'pharma' | 'banking' | 'industry' | 'transport' | 'administration' | 'all';

export interface FilterState {
  // État
  selectedSectors: Sector[];
  searchQuery: string;
  sortBy: 'recent' | 'popular' | 'alphabetical';

  // Actions
  toggleSector: (sector: Sector) => void;
  setSectors: (sectors: Sector[]) => void;
  clearSectors: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'recent' | 'popular' | 'alphabetical') => void;
  resetFilters: () => void;
}

/**
 * Store de filtrage - Gestion centralisée des filtres de références
 *
 * Permet :
 * - Filtrage par secteur
 * - Recherche textuelle
 * - Tri des résultats
 * - Persistance dans localStorage
 */
export const useFilterStore = create<FilterState>()(
  devtools(
    persist(
      (set) => ({
        // État initial
        selectedSectors: [],
        searchQuery: '',
        sortBy: 'recent',

        // Actions
        toggleSector: (sector) =>
          set(
            (state) => ({
              selectedSectors: state.selectedSectors.includes(sector)
                ? state.selectedSectors.filter((s) => s !== sector)
                : [...state.selectedSectors, sector],
            }),
            false,
            'toggleSector'
          ),

        setSectors: (sectors) =>
          set({ selectedSectors: sectors }, false, 'setSectors'),

        clearSectors: () =>
          set({ selectedSectors: [] }, false, 'clearSectors'),

        setSearchQuery: (query) =>
          set({ searchQuery: query }, false, 'setSearchQuery'),

        setSortBy: (sortBy) =>
          set({ sortBy }, false, 'setSortBy'),

        resetFilters: () =>
          set(
            {
              selectedSectors: [],
              searchQuery: '',
              sortBy: 'recent',
            },
            false,
            'resetFilters'
          ),
      }),
      {
        name: 'filter-store',
        version: 1,
      }
    ),
    {
      name: 'FilterStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

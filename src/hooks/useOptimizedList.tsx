/**
 * Hook optimisé pour listes avec pagination, search, sort, filter
 * Utilisé pour remplacer les listes non-paginées
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePagination } from '../components/ui/Pagination';
import { logger } from '../lib/logger';

export interface UseOptimizedListOptions<T> {
  items: T[];
  itemsPerPage?: number;
  initialSortField?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
  searchFields?: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, any>) => boolean;
}

export interface UseOptimizedListReturn<T> {
  // Pagination
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Data
  paginatedItems: T[];
  totalItems: number;
  filteredItems: T[];

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Sort
  sortField: keyof T | null;
  sortDirection: 'asc' | 'desc';
  setSortField: (field: keyof T) => void;
  toggleSort: (field: keyof T) => void;

  // Filter
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;

  // Loading state
  isLoading: boolean;
}

export function useOptimizedList<T extends Record<string, any>>({
  items,
  itemsPerPage = 20,
  initialSortField,
  initialSortDirection = 'asc',
  searchFields = [],
  filterFn,
}: UseOptimizedListOptions<T>): UseOptimizedListReturn<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(initialSortField || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Search + Filter + Sort
  const processedItems = useMemo(() => {
    logger.debug('Processing list items', {
      total: items.length,
      search: searchQuery,
      filters,
      sort: sortField,
    });

    let result = [...items];

    // 1. Apply search
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (value === null || value === undefined) {return false;}
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // 2. Apply custom filter
    if (filterFn && Object.keys(filters).length > 0) {
      result = result.filter((item) => filterFn(item, filters));
    }

    // 3. Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === null || aVal === undefined) {return 1;}
        if (bVal === null || bVal === undefined) {return -1;}

        let comparison = 0;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else if (aVal instanceof Date && bVal instanceof Date) {
          comparison = aVal.getTime() - bVal.getTime();
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [items, searchQuery, searchFields, sortField, sortDirection, filters, filterFn]);

  // Pagination
  const {
    currentPage,
    totalPages,
    offset,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination(processedItems.length, itemsPerPage);

  // Paginated items
  const paginatedItems = useMemo(() => {
    return processedItems.slice(offset, offset + itemsPerPage);
  }, [processedItems, offset, itemsPerPage]);

  // Toggle sort direction
  const toggleSort = useCallback(
    (field: keyof T) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  // Set filter
  const setFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    goToPage(1); // Reset to first page
  }, [goToPage]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    goToPage(1);
  }, [goToPage]);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    goToPage(1);
  }, [searchQuery, filters]);

  return {
    // Pagination
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,

    // Data
    paginatedItems,
    totalItems: processedItems.length,
    filteredItems: processedItems,

    // Search
    searchQuery,
    setSearchQuery,

    // Sort
    sortField,
    sortDirection,
    setSortField,
    toggleSort,

    // Filter
    filters,
    setFilter,
    clearFilters,

    // State
    isLoading,
  };
}


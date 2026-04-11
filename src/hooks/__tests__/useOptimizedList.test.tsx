/**
 * Tests pour useOptimizedList hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimizedList } from '../useOptimizedList';

describe('useOptimizedList', () => {
  const mockItems = [
    { id: 1, name: 'Alice', age: 30, city: 'Paris' },
    { id: 2, name: 'Bob', age: 25, city: 'London' },
    { id: 3, name: 'Charlie', age: 35, city: 'New York' },
    { id: 4, name: 'David', age: 28, city: 'Paris' },
    { id: 5, name: 'Eve', age: 32, city: 'London' },
  ];

  describe('Basic functionality', () => {
    it('should initialize with correct values', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          itemsPerPage: 2,
        })
      );

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.totalItems).toBe(5);
      expect(result.current.paginatedItems).toHaveLength(2);
    });

    it('should paginate items correctly', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          itemsPerPage: 2,
        })
      );

      // Page 1
      expect(result.current.paginatedItems).toEqual([mockItems[0], mockItems[1]]);

      // Go to page 2
      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.paginatedItems).toEqual([mockItems[2], mockItems[3]]);
    });
  });

  describe('Search functionality', () => {
    it('should filter items by search query', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          searchFields: ['name', 'city'],
        })
      );

      act(() => {
        result.current.setSearchQuery('alice');
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].name).toBe('Alice');
    });

    it('should search across multiple fields', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          searchFields: ['name', 'city'],
        })
      );

      act(() => {
        result.current.setSearchQuery('paris');
      });

      expect(result.current.filteredItems).toHaveLength(2);
      expect(result.current.filteredItems.map((i) => i.name)).toContain('Alice');
      expect(result.current.filteredItems.map((i) => i.name)).toContain('David');
    });

    it('should be case-insensitive', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          searchFields: ['name'],
        })
      );

      act(() => {
        result.current.setSearchQuery('ALICE');
      });

      expect(result.current.filteredItems).toHaveLength(1);
    });
  });

  describe('Sorting functionality', () => {
    it('should sort items ascending', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          initialSortField: 'age',
          initialSortDirection: 'asc',
        })
      );

      const ages = result.current.filteredItems.map((i) => i.age);
      expect(ages).toEqual([25, 28, 30, 32, 35]);
    });

    it('should sort items descending', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          initialSortField: 'age',
          initialSortDirection: 'desc',
        })
      );

      const ages = result.current.filteredItems.map((i) => i.age);
      expect(ages).toEqual([35, 32, 30, 28, 25]);
    });

    it('should toggle sort direction', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          initialSortField: 'age',
          initialSortDirection: 'asc',
        })
      );

      const agesAsc = result.current.filteredItems.map((i) => i.age);
      expect(agesAsc).toEqual([25, 28, 30, 32, 35]);

      act(() => {
        result.current.toggleSort('age');
      });

      const agesDesc = result.current.filteredItems.map((i) => i.age);
      expect(agesDesc).toEqual([35, 32, 30, 28, 25]);
    });

    it('should sort strings alphabetically', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          initialSortField: 'name',
          initialSortDirection: 'asc',
        })
      );

      const names = result.current.filteredItems.map((i) => i.name);
      expect(names).toEqual(['Alice', 'Bob', 'Charlie', 'David', 'Eve']);
    });
  });

  describe('Filter functionality', () => {
    it('should apply custom filter function', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          filterFn: (item, filters) => {
            if (filters.minAge && item.age < filters.minAge) return false;
            if (filters.city && item.city !== filters.city) return false;
            return true;
          },
        })
      );

      act(() => {
        result.current.setFilter('minAge', 30);
      });

      expect(result.current.filteredItems).toHaveLength(3);
      expect(result.current.filteredItems.every((i) => i.age >= 30)).toBe(true);
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          searchFields: ['name'],
          filterFn: (item, filters) => {
            if (filters.city && item.city !== filters.city) return false;
            return true;
          },
        })
      );

      act(() => {
        result.current.setSearchQuery('alice');
        result.current.setFilter('city', 'Paris');
      });

      expect(result.current.filteredItems).toHaveLength(1);

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.filters).toEqual({});
      expect(result.current.filteredItems).toHaveLength(5);
    });
  });

  describe('Pagination with search and filter', () => {
    it('should reset to page 1 when search changes', () => {
      const { result } = renderHook(() =>
        useOptimizedList({
          items: mockItems,
          itemsPerPage: 2,
          searchFields: ['name'],
        })
      );

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.setSearchQuery('alice');
      });

      expect(result.current.currentPage).toBe(1);
    });
  });
});

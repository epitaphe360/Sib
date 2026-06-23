import { useState, useMemo } from 'react';

interface FilterSearchOptions<T> {
  data: T[];
  searchKeys: (keyof T)[];
  filterKey?: keyof T;
  initialSearchTerm?: string;
  initialFilterValue?: string;
}

export function useFilterSearch<T>(options: FilterSearchOptions<T>) {
  const { data, searchKeys, filterKey, initialSearchTerm = '', initialFilterValue = '' } = options;

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedFilter, setSelectedFilter] = useState(initialFilterValue);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = searchKeys.some(key =>
        String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilter = filterKey
        ? !selectedFilter || String(item[filterKey]) === selectedFilter
        : true;

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, selectedFilter, searchKeys, filterKey]);

  return {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    setSelectedFilter,
    filteredData,
  };
}


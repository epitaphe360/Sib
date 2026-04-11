import { useState, useMemo } from 'react';

interface TableFiltersOptions<T> {
  data: T[];
  searchKeys: (keyof T)[];
  filterConfigs?: {
    key: keyof T;
    initialValue?: string;
  }[];
  initialSearchTerm?: string;
}

export function useTableFilters<T>(options: TableFiltersOptions<T>) {
  const { 
    data, 
    searchKeys, 
    filterConfigs = [], 
    initialSearchTerm = '' 
  } = options;

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  
  // Créer dynamiquement les états pour chaque filtre
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const initialFilters: Record<string, string> = {};
    filterConfigs.forEach(config => {
      initialFilters[String(config.key)] = config.initialValue || '';
    });
    return initialFilters;
  });

  // Fonction pour mettre à jour un filtre spécifique
  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm('');
    const resetFilters: Record<string, string> = {};
    filterConfigs.forEach(config => {
      resetFilters[String(config.key)] = '';
    });
    setFilters(resetFilters);
  };

  // Filtrer les données
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Vérifier la correspondance de la recherche
      const matchesSearch = searchTerm === '' || searchKeys.some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });

      // Vérifier la correspondance de tous les filtres
      const matchesFilters = filterConfigs.every(config => {
        const filterValue = filters[String(config.key)];
        if (!filterValue) return true; // Pas de filtre appliqué
        
        const itemValue = item[config.key];
        if (itemValue === null || itemValue === undefined) return false;
        
        return String(itemValue) === filterValue;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, filters, searchKeys, filterConfigs]);

  // Obtenir les valeurs uniques pour un champ donné (utile pour les dropdowns)
  const getUniqueValues = (key: keyof T): string[] => {
    const values = data
      .map(item => item[key])
      .filter((value, index, self) => 
        value !== null && 
        value !== undefined && 
        self.indexOf(value) === index
      )
      .map(value => String(value));
    
    return values.sort();
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    resetFilters,
    filteredData,
    getUniqueValues,
    hasActiveFilters: searchTerm !== '' || Object.values(filters).some(v => v !== '')
  };
}


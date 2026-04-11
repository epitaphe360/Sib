/**
 * Composant Search Avancé avec Autocomplete et Filtres
 * Conforme WCAG 2.1
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export interface SearchFilter {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'checkbox';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface AdvancedSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: Record<string, any>) => void;
  filters?: SearchFilter[];
  suggestions?: string[];
  recentSearches?: string[];
  showFilters?: boolean;
  debounceMs?: number;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = 'Rechercher...',
  onSearch,
  filters = [],
  suggestions = [],
  recentSearches = [],
  showFilters = true,
  debounceMs = 300,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (debouncedQuery || Object.keys(activeFilters).length > 0) {
      onSearch(debouncedQuery, activeFilters);
    }
  }, [debouncedQuery, activeFilters, onSearch]);

  // Filter suggestions based on query
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const allSuggestions = query
    ? filteredSuggestions
    : recentSearches.slice(0, 5);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, activeFilters);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setActiveFilters({});
    setShowSuggestions(false);
    inputRef.current?.focus();
    onSearch('', {});
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || allSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(allSuggestions[selectedSuggestionIndex]);
        } else {
          setShowSuggestions(false);
          onSearch(query, activeFilters);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRemoveFilter = (key: string) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className={`relative ${className}`}>
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          aria-label="Recherche"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />

        {/* Actions */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {query && (
            <button
              onClick={handleClear}
              aria-label="Effacer"
              className="p-1.5 hover:bg-gray-100 rounded-full transition"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}

          {showFilters && filters.length > 0 && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              aria-label="Filtres"
              aria-pressed={showFilterPanel}
              className={`p-1.5 rounded-full transition relative ${
                showFilterPanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto"
        >
          {!query && recentSearches.length > 0 && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Recherches récentes
            </div>
          )}

          {allSuggestions.map((suggestion, index) => (
            <button
              key={index}
              role="option"
              aria-selected={index === selectedSuggestionIndex}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition flex items-center gap-2 ${
                index === selectedSuggestionIndex ? 'bg-blue-50' : ''
              }`}
            >
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filter panel */}
      {showFilterPanel && filters.length > 0 && (
        <div className="absolute z-40 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres avancés
            </h3>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>

                {filter.type === 'select' && filter.options && (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'checkbox' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters[filter.key] || false}
                      onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{filter.label}</span>
                  </label>
                )}

                {filter.type === 'range' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      min={filter.min}
                      max={filter.max}
                      value={activeFilters[filter.key]?.min || ''}
                      onChange={(e) =>
                        handleFilterChange(filter.key, {
                          ...activeFilters[filter.key],
                          min: e.target.value,
                        })
                      }
                      className="w-1/2 border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      min={filter.min}
                      max={filter.max}
                      value={activeFilters[filter.key]?.max || ''}
                      onChange={(e) =>
                        handleFilterChange(filter.key, {
                          ...activeFilters[filter.key],
                          max: e.target.value,
                        })
                      }
                      className="w-1/2 border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Filtres actifs ({activeFilterCount})
                </span>
                <button
                  onClick={() => setActiveFilters({})}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tout effacer
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([key, value]) => {
                  const filter = filters.find((f) => f.key === key);
                  if (!filter) return null;

                  return (
                    <button
                      key={key}
                      onClick={() => handleRemoveFilter(key)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition"
                    >
                      <span className="font-medium">{filter.label}:</span>
                      <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                      <X className="h-3 w-3" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

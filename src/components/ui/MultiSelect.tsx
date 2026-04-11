import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Label } from './Label';

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  error?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Sélectionnez...',
  maxSelections = 5,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const availableOptions = options.filter(
    (option) => !selectedValues.includes(option.value)
  );

  const filteredOptions = availableOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value: string) => {
    if (selectedValues.length < maxSelections) {
      onChange([...selectedValues, value]);
      setSearchTerm('');
    }
  };

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value));
  };

  const getSelectedLabel = (value: string) => {
    return options.find((opt) => opt.value === value)?.label || value;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Tags sélectionnés */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
            >
              {getSelectedLabel(value)}
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input de recherche */}
      {selectedValues.length < maxSelections && (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
            <Plus className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Dropdown des options */}
          {isOpen && filteredOptions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm"
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {isOpen && searchTerm && filteredOptions.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
              Aucun résultat trouvé
            </div>
          )}
        </div>
      )}

      {selectedValues.length >= maxSelections && (
        <p className="text-xs text-amber-600">
          Maximum de {maxSelections} sélections atteint
        </p>
      )}

      {selectedValues.length > 0 && selectedValues.length < maxSelections && (
        <p className="text-xs text-gray-500">
          {selectedValues.length} / {maxSelections} sélectionnés
        </p>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

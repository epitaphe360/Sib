import React, { memo } from 'react';
import { Check, X, Edit } from 'lucide-react';
import { Button } from '../../ui/Button';
import { toast } from 'sonner';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  fieldKey: string;
  editingField: string | null;
  editingValue: string;
  onStartEdit: (fieldKey: string, value: string) => void;
  onCancelEdit: () => void;
  onSetEditingValue: (value: string) => void;
}

// OPTIMIZATION: Memoized editable text component
export const EditableText: React.FC<EditableTextProps> = memo(({
  value,
  onChange,
  placeholder,
  multiline = false,
  className = '',
  fieldKey,
  editingField,
  editingValue,
  onStartEdit,
  onCancelEdit,
  onSetEditingValue
}) => {
  const isEditing = editingField === fieldKey;

  if (isEditing) {
    return (
      <div className="relative">
        {multiline ? (
          <textarea
            value={editingValue}
            onChange={(e) => onSetEditingValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none bg-white ${className}`}
            rows={3}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editingValue}
            onChange={(e) => onSetEditingValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none bg-white ${className}`}
            autoFocus
          />
        )}
        <div className="flex space-x-2 mt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              onChange(editingValue);
              onCancelEdit();
              toast.success(`Texte modifié: "${editingValue}"`);
            }}
          >
            <Check className="h-3 w-3 mr-1" />
            Sauver
          </Button>
          <Button variant="outline" size="sm" onClick={onCancelEdit}>
            <X className="h-3 w-3 mr-1" />
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onStartEdit(fieldKey, value)}
      className={`cursor-pointer hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent rounded-lg p-2 transition-colors group ${className}`}
      title="Cliquer pour modifier"
    >
      {value || (
        <span className="text-gray-400 italic">{placeholder || 'Cliquer pour modifier'}</span>
      )}
      <Edit className="h-3 w-3 text-blue-400 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
});

EditableText.displayName = 'EditableText';

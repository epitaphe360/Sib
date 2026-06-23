import { useState, useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  loop?: boolean;
}

export function useKeyboardNavigation<T>({
  items,
  onSelect,
  loop = true
}: UseKeyboardNavigationProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev === items.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev === 0) {
            return loop ? items.length - 1 : 0;
          }
          return prev - 1;
        });
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (items[focusedIndex]) {
          onSelect(items[focusedIndex]);
        }
        break;

      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;

      case 'Escape':
        e.preventDefault();
        setFocusedIndex(0);
        break;
    }
  }, [items, focusedIndex, onSelect, loop]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedIndex, setFocusedIndex };
}

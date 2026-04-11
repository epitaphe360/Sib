/**
 * FocusTrap - Piège le focus dans un élément (pour modals)
 * WCAG 2.1 - Accessible modals
 */

import React, { useEffect, useRef } from 'react';

export interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  onEscape?: () => void;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  initialFocus,
  onEscape,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];

      return Array.from(
        container.querySelectorAll(selectors.join(', '))
      ) as HTMLElement[];
    };

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus initial element or first focusable
    const elementToFocus = initialFocus?.current || firstElement;
    elementToFocus?.focus();

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      // Tab key
      if (e.key !== 'Tab') return;

      const currentElements = getFocusableElements();
      const currentFirst = currentElements[0];
      const currentLast = currentElements[currentElements.length - 1];

      // Shift + Tab
      if (e.shiftKey) {
        if (document.activeElement === currentFirst) {
          e.preventDefault();
          currentLast?.focus();
        }
      }
      // Tab
      else {
        if (document.activeElement === currentLast) {
          e.preventDefault();
          currentFirst?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, initialFocus, onEscape]);

  return (
    <div ref={containerRef} className="focus-trap-container">
      {children}
    </div>
  );
};

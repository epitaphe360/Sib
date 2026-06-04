import React from 'react';

/**
 * Emplacement réservé pour le Haut Patronage — contenu masqué en attendant validation client.
 */
export const HautPatronageBar: React.FC = () => (
  <div
    className="fixed top-0 left-0 right-0 z-[60] bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800"
    aria-hidden="true"
  >
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-center">
      <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500 font-medium">
        Emplacement réservé — Haut Patronage
      </span>
    </div>
  </div>
);

export default HautPatronageBar;

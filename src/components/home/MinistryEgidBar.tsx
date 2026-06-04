import React from 'react';
import { MinistryLogoImage } from './MinistryLogoImage';

/**
 * Bandeau « Sous l'égide du » + logo ministère — centré, image admin ou fichier public.
 */
export const MinistryEgidBar: React.FC = () => (
  <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
    <div className="max-w-container mx-auto px-6 lg:px-8 py-4 sm:py-5">
      <div className="flex w-full flex-col items-center justify-center gap-3 text-center">
        <p className="w-full text-[11px] sm:text-xs uppercase tracking-[0.22em] text-neutral-600 dark:text-neutral-400 font-semibold leading-snug">
          Sous l&apos;égide du
        </p>
        <MinistryLogoImage className="h-12 sm:h-14 md:h-16 w-auto max-w-[min(100%,520px)] object-contain mx-auto block" />
      </div>
    </div>
  </div>
);

export default MinistryEgidBar;

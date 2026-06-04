import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const VisitorFreeRegistration = lazy(() => import('../../pages/visitor/VisitorFreeRegistration'));
const VisitorVIPRegistration = lazy(() => import('../../pages/visitor/VisitorVIPRegistration'));

const FormLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
  </div>
);

interface HeroBadgeFormsProps {
  /** true = section billetterie (fond clair) ; false = hero legacy */
  inTicketSection?: boolean;
}

/**
 * Formulaires badge Gratuit + VIP côte à côte.
 */
export const HeroBadgeForms: React.FC<HeroBadgeFormsProps> = ({ inTicketSection = true }) => (
  <div className="home-form-embed grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
    <div
      className={
        inTicketSection
          ? 'rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-y-auto max-h-[85vh]'
          : 'rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-white/20 shadow-xl max-h-[70vh] overflow-y-auto'
      }
    >
      <Suspense fallback={<FormLoader />}>
        <VisitorFreeRegistration embedded />
      </Suspense>
    </div>
    <div
      className={
        inTicketSection
          ? 'rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-y-auto max-h-[85vh]'
          : 'rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-white/20 shadow-xl max-h-[70vh] overflow-y-auto'
      }
    >
      <Suspense fallback={<FormLoader />}>
        <VisitorVIPRegistration embedded />
      </Suspense>
    </div>
  </div>
);

export default HeroBadgeForms;

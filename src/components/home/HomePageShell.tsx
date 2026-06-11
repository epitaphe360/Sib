import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import type { HomePageVariantId } from '../../config/homeVariants';
import { HOME_PAGE_VARIANTS } from '../../config/homeVariants';
import { useResolvedHomePageVariantId } from '../../contexts/HomePageVariantContext';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { useHomeMenuItems } from '../layout/homeMenu/useHomeMenuItems';
import { Sib2026SalonGridSection } from './sib2026/Sib2026SalonGridSection';
import { Sib2026InternationalSection } from './sib2026/Sib2026InternationalSection';
import { Sib2026ReserveBanner } from './sib2026/Sib2026ReserveBanner';
import { Sib2026Footer } from './sib2026/Sib2026Footer';
import './home-premium.css';

const showPrototypeBar =
  import.meta.env.DEV && import.meta.env.VITE_SHOW_HOME_PROTOTYPE === 'true';

interface HomePageShellProps {
  variantId: HomePageVariantId;
  className?: string;
  children: React.ReactNode;
  /** P8 fournit déjà salon + réserve + footer dans la page */
  fullLayout?: boolean;
}

/** Enveloppe premium commune — P1 à P8 */
export const HomePageShell: React.FC<HomePageShellProps> = ({
  variantId,
  className = '',
  children,
  fullLayout = false,
}) => {
  const { t } = useTranslation();
  const menuItems = useHomeMenuItems();
  const resolvedVariantId = useResolvedHomePageVariantId(variantId);
  const current = HOME_PAGE_VARIANTS.find((v) => v.id === resolvedVariantId)!;
  const showClosing = !fullLayout && resolvedVariantId !== 8 && resolvedVariantId !== 9;

  return (
    <div className={`home-premium min-h-screen ${className}`.trim()}>
      {showPrototypeBar && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-300/80 dark:border-amber-700">
          <div className="max-w-container mx-auto px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-100">
              <Layers className="h-3 w-3" />
              {t('home.prototype.label', { n: resolvedVariantId, name: current.label })}
            </span>
            <Link
              to={ROUTES.DESIGN_HOME_MENU}
              className="font-bold text-primary-800 dark:text-primary-200 hover:underline"
            >
              {t('home.prototype.compare')}
            </Link>
          </div>
        </div>
      )}
      {children}
      {showClosing && (
        <>
          <div id="visiter">
            <Sib2026SalonGridSection items={menuItems} />
          </div>
          <Sib2026InternationalSection />
          <Sib2026ReserveBanner />
          <Sib2026Footer />
        </>
      )}
    </div>
  );
};

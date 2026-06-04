import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import type { HomePageVariantId } from '../../../config/homeVariants';
import { HOME_PAGE_VARIANTS } from '../../../config/homeVariants';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';

interface HomePrototypeBannerProps {
  variantId: HomePageVariantId;
}

export const HomePrototypeBanner: React.FC<HomePrototypeBannerProps> = ({ variantId }) => {
  const { t } = useTranslation();
  const current = HOME_PAGE_VARIANTS.find((v) => v.id === variantId)!;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/50 border-b-2 border-amber-400 dark:border-amber-600">
      <div className="max-w-container mx-auto px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
          <Layers className="h-3.5 w-3.5" />
          {t('home.prototype.label', { n: variantId, name: current.label })}
        </span>
        <span className="text-amber-900/80 dark:text-amber-200/90 hidden sm:inline font-medium">
          {t('home.prototype.inspiration')}: {current.inspiration}
        </span>
        <Link
          to={ROUTES.DESIGN_HOME_MENU}
          className="font-bold text-primary-800 dark:text-primary-200 underline-offset-2 hover:underline"
        >
          {t('home.prototype.compare')}
        </Link>
      </div>
    </div>
  );
};

export default HomePrototypeBanner;

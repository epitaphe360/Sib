import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { formatSalonDatesShort } from '../../../config/salonInfo';

export const HomeHeroMinimal: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
    <section className="home-p5-hero-bg relative pt-10 lg:pt-14 pb-20 lg:pb-24 border-b border-neutral-200/80 dark:border-neutral-800 min-h-[420px] lg:min-h-[480px] flex items-end">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <p className="home-section-kicker mb-8">
          {formatSalonDatesShort()}
        </p>
        <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 dark:text-white tracking-tight leading-[1.05] max-w-4xl mb-6">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mb-10 leading-relaxed">{t('hero.subtitle')}</p>
        <div className="flex flex-wrap gap-6 text-sm font-semibold">
          <Link to={`${ROUTES.HOME_P5}#badges`} className="text-primary-700 dark:text-primary-300 inline-flex items-center gap-2 border-b-2 border-primary-600 pb-1 hover:gap-3 transition-all">
            {t('hero.cta.ticket')} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION} className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 border-b border-transparent hover:border-primary-400 pb-1 transition-colors">
            {t('hero.cta.exhibitor')}
          </Link>
          <Link to={ROUTES.EXHIBITORS} className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 pb-1">
            {t('hero.cta.discover')}
          </Link>
        </div>
      </div>
    </section>
    </>
  );
};

export default HomeHeroMinimal;

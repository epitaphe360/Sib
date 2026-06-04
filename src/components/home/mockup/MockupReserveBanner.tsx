import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { MOCKUP } from './tokens';
import { MOCKUP_ASSETS } from './assets';

export const MockupReserveBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[200px] lg:min-h-[240px] flex items-center overflow-hidden">
      <img src={MOCKUP_ASSETS.reserve} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,26,61,0.92) 0%, rgba(0,26,61,0.5) 50%, rgba(0,26,61,0.3) 100%)' }} />
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12 py-10 w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="mockup-display text-lg lg:text-xl font-extrabold uppercase text-white mb-1">{t('mockup.reserve.title')}</p>
          <p className="text-xs text-white/75 max-w-md">{t('mockup.reserve.desc')}</p>
        </div>
        <Link
          to={ROUTES.EXHIBITOR_SUBSCRIPTION}
          className="mockup-btn-orange inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs shrink-0 self-start lg:self-center"
        >
          {t('mockup.reserve.cta')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

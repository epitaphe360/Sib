import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { MOCKUP } from './tokens';
import { MOCKUP_ASSETS } from './assets';

export const MockupHeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative flex flex-col lg:flex-row min-h-[520px] lg:min-h-[560px] overflow-hidden text-white">
      {/* Photo hall */}
      <div className="relative h-48 sm:h-56 lg:h-auto lg:flex-1 lg:order-2">
        <img src={MOCKUP_ASSETS.heroPhoto} alt="" className="h-full w-full object-cover object-center" loading="eager" />
      </div>

      {/* Texte — fond navy uni */}
      <div
        className="relative z-10 flex flex-1 flex-col justify-center px-6 sm:px-10 lg:px-14 py-10 lg:py-16 lg:order-1 lg:w-[48%] xl:w-[46%] lg:shrink-0"
        style={{ backgroundColor: MOCKUP.navy }}
      >
        <p className="mockup-display text-[36px] sm:text-[44px] lg:text-[52px] font-extrabold leading-none mb-2">
          <span className="text-white">SIB </span>
          <span style={{ color: MOCKUP.orange }}>2026</span>
        </p>
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] mb-4" style={{ color: MOCKUP.orange }}>
          {t('mockup.hero.kicker')}
        </p>
        <h1 className="mockup-display text-base sm:text-lg lg:text-[22px] font-extrabold uppercase leading-[1.25] text-white mb-7 max-w-md">
          {t('mockup.hero.headline')}
        </h1>
        <div className="space-y-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-white mb-8">
          <span className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: MOCKUP.orange }} strokeWidth={2} />
            {t('mockup.hero.date')}
          </span>
          <span className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: MOCKUP.orange }} strokeWidth={2} />
            <span className="leading-snug">{t('mockup.hero.location')}</span>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION} className="mockup-btn-orange inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] sm:text-[11px]">
            {t('mockup.hero.cta_stand')}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
          <Link to={`${ROUTES.HOME_P8}#visiter`} className="mockup-btn-outline inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] sm:text-[11px]">
            {t('mockup.hero.cta_visitor')}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
};

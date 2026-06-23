import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { SALON_START_DAY_NOTE } from '../../../config/salonInfo';
import { SIB2026 } from './tokens';
import { Sib2026HeroBadgeForm } from './Sib2026HeroBadgeForm';
import { useSiteImage } from '../../../hooks/useSiteImage';

export const Sib2026HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { src: heroSrc } = useSiteImage('sib2026_hero');

  return (
    <section className="relative min-h-[600px] sm:min-h-[680px] lg:min-h-[820px] flex items-center overflow-hidden home-hero-media">
      <img
        src={heroSrc}
        alt="SIB 2026 — hall d'exposition"
        className="absolute inset-0 h-full w-full object-cover object-[center_35%] home-hero-photo"
        loading="eager"
        decoding="async"
        sizes="100vw"
      />
      <div className="absolute inset-0 sib2026-hero-gradient" aria-hidden />

      <div className="relative z-10 w-full sib2026-container pb-20 lg:pb-32 pt-44 lg:pt-52">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-10 lg:gap-12 items-start">
          <div className="max-w-[640px] text-white">
            <p className="sib2026-display text-[64px] sm:text-[80px] lg:text-[110px] font-black leading-[0.9] mb-6 tracking-tight">
              <span>SIB </span>
              <span style={{ color: SIB2026.orange }}>2026</span>
            </p>

            <p className="text-xs font-bold uppercase tracking-[0.24em] mb-4" style={{ color: SIB2026.orange }}>
              {t('mockup.hero.kicker')}
            </p>

            <h1 className="sib2026-display text-2xl sm:text-3xl lg:text-[34px] font-black uppercase leading-[1.1] mb-10 tracking-wide whitespace-pre-line">
              {t('mockup.hero.headline')}
            </h1>

            <div className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.08em] mb-10">
              <span className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 shrink-0" style={{ color: SIB2026.orange }} strokeWidth={2} />
                {t('mockup.hero.date')}
              </span>
              <span className="text-[10px] font-medium normal-case tracking-normal text-white/80 pl-6">
                {SALON_START_DAY_NOTE}
              </span>
              <span className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: SIB2026.orange }} strokeWidth={2} />
                <span className="leading-snug normal-case tracking-normal font-medium">
                  {t('mockup.hero.location')}
                </span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={ROUTES.EXHIBITOR_SUBSCRIPTION}
                className="sib2026-btn-orange inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px]"
              >
                {t('mockup.hero.cta_stand')}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <Link
                to={ROUTES.REGISTER_VISITOR}
                className="sib2026-btn-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px]"
              >
                {t('networking.signup_button')}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md lg:max-w-none lg:ml-auto">
            <Sib2026HeroBadgeForm />
          </div>
        </div>
      </div>
    </section>
  );
};

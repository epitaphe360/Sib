import React from 'react';

import { Link } from 'react-router-dom';

import { Calendar, MapPin, ArrowRight } from 'lucide-react';

import { ROUTES } from '../../../lib/routes';

import { useTranslation } from '../../../hooks/useTranslation';

import { SIB2026 } from './tokens';

import { SIB2026_ASSETS } from './assets';

import { Sib2026Picture } from './Sib2026Picture';



export const Sib2026HeroSection: React.FC = () => {

  const { t } = useTranslation();



  return (

    <section className="relative min-h-[600px] sm:min-h-[680px] lg:min-h-[820px] flex items-center overflow-hidden home-hero-media">

      <Sib2026Picture

        asset={SIB2026_ASSETS.hero}

        largeAsset={SIB2026_ASSETS.hero2k}

        alt="SIB 2026 — hall d'exposition"

        className="absolute inset-0 h-full w-full object-cover object-[center_35%] home-hero-photo"

        loading="eager"

        sizes="100vw"

      />

      <div className="absolute inset-0 sib2026-hero-gradient" aria-hidden />



            <div className="relative z-10 w-full sib2026-container pb-20 lg:pb-32 pt-40 lg:pt-48">
        <div className="max-w-[640px] text-white">
          <p className="sib2026-display text-[64px] sm:text-[80px] lg:text-[110px] font-black leading-[0.9] mb-6 tracking-tight">
            <span>SIB </span>
            <span style={{ color: SIB2026.orange }}>2026</span>
          </p>

          <p

            className="text-xs font-bold uppercase tracking-[0.24em] mb-4"

            style={{ color: SIB2026.orange }}

          >

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

              to={`${ROUTES.HOME_P8}#visiter`}

              className="sib2026-btn-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px]"

            >

              {t('mockup.hero.cta_visitor')}

              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />

            </Link>

          </div>

        </div>

      </div>

    </section>

  );

};



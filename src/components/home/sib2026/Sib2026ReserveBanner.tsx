import React from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight } from 'lucide-react';

import { ROUTES } from '../../../lib/routes';

import { useTranslation } from '../../../hooks/useTranslation';

import { SIB2026 } from './tokens';
import { useSiteImage } from '../../../hooks/useSiteImage';



/** Maquette Figma : texte à gauche (fond clair), photo parc à droite */

export const Sib2026ReserveBanner: React.FC = () => {

  const { t } = useTranslation();
  const { src: reserveSrc } = useSiteImage('sib2026_reserve');



  return (

    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[220px] lg:min-h-[280px]">

      <div

        className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 lg:py-14"

        style={{ backgroundColor: SIB2026.sectionGray }}

      >

        <p

          className="sib2026-display text-xl sm:text-2xl lg:text-[28px] font-extrabold uppercase leading-tight mb-4"

          style={{ color: SIB2026.navy }}

        >

          {t('mockup.reserve.title')}

        </p>

        <p className="text-[13px] leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(0,26,61,0.65)' }}>

          {t('mockup.reserve.desc')}

        </p>

        <Link

          to={ROUTES.EXHIBITOR_SUBSCRIPTION}

          className="sib2026-btn-orange inline-flex items-center justify-center gap-2 px-10 py-4 text-[11px] w-fit"

        >

          {t('mockup.reserve.cta')}

          <ArrowRight className="h-4 w-4" />

        </Link>

      </div>



      <div className="relative min-h-[200px] lg:min-h-full overflow-hidden">

        <img
          src={reserveSrc}
          alt="Parc d'Exposition Mohammed VI"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />

      </div>

    </section>

  );

};



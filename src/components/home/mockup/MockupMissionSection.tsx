import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { MOCKUP } from './tokens';
import { MOCKUP_ASSETS } from './assets';

export const MockupMissionSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section style={{ backgroundColor: MOCKUP.navy }}>
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: MOCKUP.orange }}>
              {t('mockup.mission.kicker')}
            </p>
            <h2 className="mockup-display text-xl sm:text-2xl lg:text-[28px] font-extrabold uppercase leading-tight text-white mb-5">
              {t('mockup.mission.title')}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed mb-7" style={{ color: MOCKUP.grayText }}>
              {t('mockup.mission.desc')}
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] text-white border-b border-white/80 pb-1"
            >
              {t('mockup.mission.cta')}
              <ArrowRight className="h-3.5 w-3.5" style={{ color: MOCKUP.orange }} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {MOCKUP_ASSETS.salonCards.slice(0, 4).map((src, i) => (
              <div key={src} className="aspect-[3/4] overflow-hidden bg-[#001530]">
                <img src={src} alt="" className="h-full w-full object-cover object-top" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

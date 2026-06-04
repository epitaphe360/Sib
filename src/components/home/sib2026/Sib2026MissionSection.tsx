import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { SIB2026 } from './tokens';
import { SIB2026_ASSETS } from './assets';
import { Sib2026Picture } from './Sib2026Picture';

export const Sib2026MissionSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section style={{ backgroundColor: SIB2026.navy }} className="overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:min-h-[380px]">
        <div className="lg:w-[40%] xl:w-[38%] flex items-center sib2026-container lg:pl-10 xl:pl-12 py-14 lg:py-16 lg:pr-6">
          <div className="max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-5" style={{ color: SIB2026.orange }}>
              {t('mockup.mission.kicker')}
            </p>
            <h2 className="sib2026-display text-[24px] lg:text-[30px] font-extrabold uppercase leading-[1.1] text-white mb-6">
              {t('mockup.mission.title')}
            </h2>
            <p className="text-[13px] leading-relaxed mb-8 hidden lg:block" style={{ color: SIB2026.grayText }}>
              {t('mockup.mission.desc')}
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white border-b border-white/70 pb-1 hover:opacity-90"
            >
              {t('mockup.mission.cta')}
              <ArrowRight className="h-3.5 w-3.5" style={{ color: SIB2026.orange }} />
            </Link>
          </div>
        </div>

        <div className="lg:flex-1 flex flex-row min-h-[300px] lg:min-h-0">
          {SIB2026_ASSETS.portraits.map((portrait, i) => (
            <div key={i} className="relative flex-1 min-w-0 border-l border-white/10 first:border-l-0">
              <Sib2026Picture
                asset={portrait}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                sizes="15vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

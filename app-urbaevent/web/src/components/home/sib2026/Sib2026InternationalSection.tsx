import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { SIB2026 } from './tokens';
import { SIB2026_ASSETS } from './assets';
import { resolveHomeImage } from '../../../config/sibMaRemoteUrls';

const COUNTRIES = ['TR', 'CN', 'ES', 'IT', 'PT'] as const;
const WORLD_MAP = resolveHomeImage('/mockup/international-map.webp');

function FlagBox({ code }: { code: (typeof COUNTRIES)[number] }) {
  return (
    <div className="flex h-[52px] w-[68px] items-center justify-center overflow-hidden border border-neutral-300 bg-white">
      <img src={SIB2026_ASSETS.flags[code]} alt="" className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

export const Sib2026InternationalSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section style={{ backgroundColor: SIB2026.sectionGray }} className="py-16 lg:py-20">
      <div className="sib2026-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-14 items-center">
          <div className="order-1 lg:order-1">
            <h2
              className="sib2026-display text-xl lg:text-[22px] font-extrabold uppercase leading-tight mb-4"
              style={{ color: SIB2026.navy }}
            >
              {t('mockup.international.title')}
            </h2>
            <p className="text-[13px] leading-relaxed text-neutral-600 mb-5 max-w-sm">
              {t('mockup.international.desc')}
            </p>
            <Link
              to={ROUTES.PAVILIONS}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide hover:opacity-80"
              style={{ color: SIB2026.navy }}
            >
              {t('mockup.international.cta')}
              <ArrowRight className="h-3.5 w-3.5" style={{ color: SIB2026.orange }} />
            </Link>
          </div>

          <div className="order-3 lg:order-2 flex justify-center px-4">
            <div className="relative h-44 w-56 lg:h-52 lg:w-72 rounded-sm overflow-hidden bg-[#e4e4e0]">
              <img
                src={WORLD_MAP}
                alt=""
                className="h-full w-full object-contain object-center mix-blend-multiply opacity-90"
                loading="lazy"
              />
              <div className="sib2026-world-map absolute inset-0 pointer-events-none opacity-40" aria-hidden />
            </div>
          </div>

          <div className="order-2 lg:order-3 flex flex-wrap items-center gap-2 lg:justify-end">
            {COUNTRIES.map((c) => (
              <FlagBox key={c} code={c} />
            ))}
            <div className="flex h-[52px] items-center px-4 border border-neutral-300 bg-white text-[9px] font-bold uppercase tracking-wide text-neutral-600 whitespace-nowrap">
              {t('mockup.international.more')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { MOCKUP } from './tokens';

const FLAGS = ['🇹🇷', '🇨🇳', '🇪🇸', '🇮🇹', '🇵🇹'];

export const MockupInternationalSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-[#ecece8] py-12 lg:py-16">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          <div>
            <h2 className="mockup-display text-lg lg:text-xl font-extrabold uppercase leading-tight mb-3" style={{ color: MOCKUP.navy }}>
              {t('mockup.international.title')}
            </h2>
            <p className="text-xs leading-relaxed text-neutral-600 mb-5">{t('mockup.international.desc')}</p>
            <Link to={ROUTES.PAVILIONS} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: MOCKUP.navy }}>
              {t('mockup.international.cta')}
              <ArrowRight className="h-3.5 w-3.5" style={{ color: MOCKUP.orange }} />
            </Link>
          </div>
          <div className="flex justify-center">
            <div
              className="w-full max-w-xs aspect-[2/1] opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle, ${MOCKUP.navy} 1.5px, transparent 1.5px)`,
                backgroundSize: '10px 10px',
              }}
              aria-hidden
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {FLAGS.map((flag) => (
              <span key={flag} className="text-2xl lg:text-3xl">{flag}</span>
            ))}
            <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-neutral-600 border border-neutral-300 bg-white">
              {t('mockup.international.more')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

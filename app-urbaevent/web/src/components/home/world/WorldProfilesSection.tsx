import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Store } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { SIB2026 } from '../sib2026/tokens';
import { useTranslation } from '../../../hooks/useTranslation';

const VISITOR_PROFILE_KEYS = [
  'home.world.visitor_p1',
  'home.world.visitor_p2',
  'home.world.visitor_p3',
  'home.world.visitor_p4',
] as const;

const EXHIBITOR_PROFILE_KEYS = [
  'home.world.exhibitor_p1',
  'home.world.exhibitor_p2',
  'home.world.exhibitor_p3',
  'home.world.exhibitor_p4',
] as const;

/** Parcours visiteur / exposant — charte Sib2026 (Batimat) */
export const WorldProfilesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="parcours" style={{ backgroundColor: SIB2026.sectionGray }}>
      <div className="sib2026-container py-14 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: SIB2026.orange }}>
            {t('home.world.profiles_kicker')}
          </p>
          <h2 className="sib2026-display text-2xl lg:text-[32px] font-extrabold uppercase leading-tight text-[#001A3D]">
            {t('home.world.profiles_title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-[#001A3D]/10">
          <article className="flex flex-col" style={{ backgroundColor: SIB2026.navy }}>
            <div className="p-8 lg:p-10 flex-1">
              <Eye className="h-9 w-9 mb-5" style={{ color: SIB2026.orange }} strokeWidth={1.25} />
              <h3 className="sib2026-display text-xl lg:text-2xl font-extrabold uppercase text-white mb-3">
                {t('home.world.visit_title')}
              </h3>
              <p className="text-[13px] leading-relaxed mb-6" style={{ color: SIB2026.grayText }}>
                {t('home.world.visit_desc')}
              </p>
              <ul className="space-y-2.5 mb-8">
                {VISITOR_PROFILE_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-[12px] text-white/85">
                    <span className="mt-1.5 h-1 w-4 shrink-0" style={{ backgroundColor: SIB2026.orange }} />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-8 lg:px-10 pb-8 lg:pb-10 flex flex-wrap gap-3">
              <Link to={ROUTES.REGISTER_VISITOR} className="sib2026-btn-orange inline-flex items-center gap-2 px-6 py-3 text-[11px]">
                {t('home.world.visit_cta_badge')}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
              <Link
                to={ROUTES.POURQUOI_VISITER}
                className="sib2026-btn-outline inline-flex items-center gap-2 px-6 py-3 text-[11px]"
              >
                {t('home.world.visit_cta_why')}
              </Link>
            </div>
          </article>

          <article className="flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-[#001A3D]/10">
            <div className="p-8 lg:p-10 flex-1">
              <Store className="h-9 w-9 mb-5" style={{ color: SIB2026.orange }} strokeWidth={1.25} />
              <h3 className="sib2026-display text-xl lg:text-2xl font-extrabold uppercase mb-3" style={{ color: SIB2026.navy }}>
                {t('home.world.exhibit_title')}
              </h3>
              <p className="text-[13px] leading-relaxed text-slate-600 mb-6">
                {t('home.world.exhibit_desc')}
              </p>
              <ul className="space-y-2.5 mb-8">
                {EXHIBITOR_PROFILE_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-[12px] text-slate-700">
                    <span className="mt-1.5 h-1 w-4 shrink-0" style={{ backgroundColor: SIB2026.orange }} />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-8 lg:px-10 pb-8 lg:pb-10 flex flex-wrap gap-3">
              <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION} className="sib2026-btn-orange inline-flex items-center gap-2 px-6 py-3 text-[11px]">
                {t('home.world.exhibit_cta')}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
              <Link to={ROUTES.POURQUOI_EXPOSER} className="sib2026-btn-navy-outline inline-flex items-center gap-2 px-6 py-3 text-[11px]">
                {t('home.world.exhibit_cta_why')}
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

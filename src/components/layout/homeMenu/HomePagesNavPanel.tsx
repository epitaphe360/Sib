import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { HOME_PAGE_VARIANTS, getHomePageVariantFromPath } from '../../../config/homeVariants';
import { useTranslation } from '../../../hooks/useTranslation';
import { SIB2026 } from '../../home/sib2026/tokens';

interface HomePagesNavPanelProps {
  onNavigate?: () => void;
  compact?: boolean;
}

/**
 * Sous-menu Accueil : les 8 pages d’accueil (/accueil/1 … /accueil/8).
 * (La grille « Un salon pensé pour vous » reste sur la page P8, pas dans ce menu.)
 */
export const HomePagesNavPanel: React.FC<HomePagesNavPanelProps> = ({
  onNavigate,
  compact = false,
}) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const currentId = getHomePageVariantFromPath(pathname);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-white/15 shadow-2xl ${
        compact ? 'w-full' : 'w-[min(560px,calc(100vw-2rem))]'
      }`}
      style={{ backgroundColor: SIB2026.navyDeep }}
    >
      <div className="border-b border-white/10 px-4 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          {t('design.home_page.title')}
        </p>
      </div>
      <ul className={compact ? 'divide-y divide-white/8' : 'max-h-[min(70vh,520px)] overflow-y-auto divide-y divide-white/8'}>
        {HOME_PAGE_VARIANTS.map((v) => {
          const Icon = v.icon;
          const active = currentId === v.id;
          return (
            <li key={v.id}>
              <Link
                to={v.route}
                onClick={onNavigate}
                className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.06] ${
                  active ? 'bg-white/[0.08]' : ''
                }`}
              >
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15"
                  style={{ color: active ? SIB2026.orange : 'rgba(255,255,255,0.85)' }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: SIB2026.orange }}
                    >
                      P{v.id}
                    </span>
                    {active && (
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: SIB2026.orange }} aria-hidden />
                    )}
                  </span>
                  <span className="block text-sm font-semibold leading-snug text-white">
                    {t(v.titleKey)}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-white/55">{t(v.descKey)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default HomePagesNavPanel;

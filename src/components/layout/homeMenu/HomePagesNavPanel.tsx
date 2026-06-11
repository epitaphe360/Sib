import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, LayoutGrid } from 'lucide-react';
import {
  HOME_PAGES_CURATED,
  getHomePageVariantFromPath,
  type CuratedHomePageEntry,
} from '../../../config/homePagesRegistry';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { SIB2026 } from '../../home/sib2026/tokens';

interface HomePagesNavPanelProps {
  onNavigate?: () => void;
  compact?: boolean;
}

function PageRow({
  entry,
  active,
  onNavigate,
}: {
  entry: CuratedHomePageEntry;
  active: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const Icon = entry.icon;
  return (
    <li>
      <Link
        to={entry.route}
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
          <span className="mb-0.5 flex items-center gap-2 flex-wrap">
            {entry.tagKey && (
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: SIB2026.orange }}>
                {t(entry.tagKey)}
              </span>
            )}
            {entry.badgeKey && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300/90">{t(entry.badgeKey)}</span>
            )}
            {active && (
              <Check className="h-3.5 w-3.5 shrink-0" style={{ color: SIB2026.orange }} aria-hidden />
            )}
          </span>
          <span className="block text-sm font-semibold leading-snug text-white">{t(entry.titleKey)}</span>
          <span className="mt-0.5 block text-xs leading-snug text-white/55">{t(entry.descKey)}</span>
        </span>
      </Link>
    </li>
  );
}

/** Sous-menu ACCUEIL — 10 propositions distinctes */
export const HomePagesNavPanel: React.FC<HomePagesNavPanelProps> = ({ onNavigate, compact = false }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const currentId = getHomePageVariantFromPath(pathname);

  const listClass = compact
    ? 'divide-y divide-white/8'
    : 'max-h-[min(70vh,520px)] overflow-y-auto divide-y divide-white/8';

  const isActive = (entry: CuratedHomePageEntry) =>
    pathname === entry.route || (entry.variantId != null && currentId === entry.variantId);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-white/15 shadow-2xl ${
        compact ? 'w-full' : 'w-[min(600px,calc(100vw-2rem))]'
      }`}
      style={{ backgroundColor: SIB2026.navyDeep }}
    >
      <div className="border-b border-white/10 px-4 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          {t('nav.accueil.menu_title')}
        </p>
        <p className="mt-1 text-[9px] text-white/40">{t('nav.accueil.menu_subtitle')}</p>
      </div>

      <ul className={listClass}>
        {HOME_PAGES_CURATED.map((entry) => (
          <PageRow key={entry.slug} entry={entry} active={isActive(entry)} onNavigate={onNavigate} />
        ))}
      </ul>
    </div>
  );
};

export default HomePagesNavPanel;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, LayoutGrid } from 'lucide-react';
import {
  HOME_PAGES_CURATED,
  getHomePageVariantFromPath,
  type CuratedHomePageEntry,
} from '../../../config/homePagesRegistry';
import { useTranslation } from '../../../hooks/useTranslation';

interface HomeAccueilNavPanelProps {
  onNavigate?: () => void;
  compact?: boolean;
}

const ACCENT: Record<NonNullable<CuratedHomePageEntry['accent']>, { border: string; bg: string; active: string; tag: string }> = {
  orange: { border: 'border-orange-500', bg: 'bg-orange-50/40', active: 'bg-orange-50/80', tag: 'text-orange-600' },
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-50/40', active: 'bg-emerald-50/80', tag: 'text-emerald-700' },
  navy: { border: 'border-[#f37021]', bg: 'bg-orange-50/30', active: 'bg-orange-50/80', tag: 'text-[#f37021]' },
};

function CuratedRow({
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
  const accent = entry.accent ? ACCENT[entry.accent] : null;

  return (
    <li>
      <Link
        to={entry.route}
        onClick={onNavigate}
        className={`flex items-start gap-3 px-4 py-3 hover:bg-orange-50 transition-colors ${
          accent ? `border-l-4 ${accent.border} ${active ? accent.active : accent.bg}` : active ? 'bg-orange-50/80' : ''
        }`}
      >
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
            entry.accent === 'navy'
              ? 'bg-[#0b1c3f] text-white'
              : entry.accent === 'emerald'
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 bg-white text-orange-500'
          }`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-0.5 flex items-center gap-2 flex-wrap">
            {entry.tagKey && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                {t(entry.tagKey)}
              </span>
            )}
            {entry.badgeKey && (
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  entry.accent === 'emerald'
                    ? 'text-emerald-700 bg-emerald-50'
                    : entry.accent === 'navy'
                      ? 'text-[#f37021] bg-orange-50'
                      : 'text-emerald-700 bg-emerald-50'
                }`}
              >
                {t(entry.badgeKey)}
              </span>
            )}
            {active && <Check className="h-3.5 w-3.5 shrink-0 text-orange-500" aria-hidden />}
          </span>
          <span className="block text-sm font-semibold text-slate-900">{t(entry.titleKey)}</span>
          <span className="block text-xs text-slate-500 mt-0.5">{t(entry.descKey)}</span>
        </span>
      </Link>
    </li>
  );
}

export const HomeAccueilNavPanel: React.FC<HomeAccueilNavPanelProps> = ({
  onNavigate,
  compact = false,
}) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const currentPageId = getHomePageVariantFromPath(pathname);

  const panelClass = compact
    ? 'w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden'
    : 'w-[min(480px,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white shadow-2xl overflow-hidden';

  const listClass = compact
    ? 'divide-y divide-slate-100'
    : 'max-h-[min(70vh,520px)] overflow-y-auto divide-y divide-slate-100';

  const isActive = (entry: CuratedHomePageEntry) =>
    pathname === entry.route ||
    (entry.variantId != null && currentPageId === entry.variantId);

  return (
    <div className={panelClass}>
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          <LayoutGrid className="h-3.5 w-3.5" />
          {t('nav.accueil.menu_title')}
        </p>
        <p className="mt-1 text-[9px] text-slate-400">{t('nav.accueil.menu_subtitle')}</p>
      </div>

      <ul className={listClass}>
        {HOME_PAGES_CURATED.map((entry) => (
          <CuratedRow
            key={entry.slug}
            entry={entry}
            active={isActive(entry)}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
};

export default HomeAccueilNavPanel;

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { formatSalonDatesShort, DEFAULT_SALON_CONFIG } from '../../../../config/salonInfo';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { HomeMenuPanelProps } from '../types';

/** P4 — Split Navy : colonne éditoriale + liens */
export const HomeMenuVariant4: React.FC<HomeMenuPanelProps> = ({ items, onNavigate }) => {
  const { t } = useTranslation();
  return (
    <div className="flex w-[min(560px,calc(100vw-2rem))] rounded-xl shadow-xl border border-primary-800 overflow-hidden">
      <div className="w-[200px] shrink-0 bg-primary-900 p-5 flex flex-col justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary-300 font-bold mb-3">SIB 2026</p>
          <p className="text-white font-bold text-base leading-tight mb-4">{t('hero.edition')}</p>
          <div className="space-y-2 text-xs text-white/75">
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary-400" />
              {formatSalonDatesShort()}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary-400" />
              {DEFAULT_SALON_CONFIG.location.city}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-primary-400/80 leading-relaxed mt-6">{t('nav.home_menu.split_footer')}</p>
      </div>
      <div className="flex-1 bg-white dark:bg-neutral-900 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
            >
              <Icon className="h-4 w-4 text-primary-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{item.title}</div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HomeMenuVariant4;

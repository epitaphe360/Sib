import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Ticket } from 'lucide-react';
import { formatSalonDatesShort, DEFAULT_SALON_CONFIG } from '../../../../config/salonInfo';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { HomeMenuPanelProps } from '../types';

/** P2 — BIG5 Mega : bandeau dates + grille 2×3 + CTA billetterie */
export const HomeMenuVariant2: React.FC<HomeMenuPanelProps> = ({ items, onNavigate }) => {
  const { t } = useTranslation();
  return (
    <div className="w-[min(720px,calc(100vw-2rem))] bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="bg-primary-900 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary-300 font-bold mb-1">SIB 2026</p>
          <p className="text-white font-bold text-lg tracking-tight">{t('nav.home_menu.mega_tagline')}</p>
        </div>
        <div className="flex flex-col gap-1 text-xs text-white/80">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary-300" />
            {formatSalonDatesShort()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary-300" />
            {DEFAULT_SALON_CONFIG.location.city}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-100 dark:bg-neutral-800 p-px">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.href}
              onClick={onNavigate}
              className="flex flex-col gap-2 p-4 bg-white dark:bg-neutral-900 hover:bg-primary-50 dark:hover:bg-primary-900/25 transition-colors group"
            >
              <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="font-semibold text-sm text-neutral-900 dark:text-white group-hover:text-primary-700">
                {item.title}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug line-clamp-2">
                {item.description}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-primary-50/50 dark:bg-primary-900/20">
        <Link
          to={items[1]?.href ?? `${'/accueil/2'}#visiter`}
          onClick={onNavigate}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300 hover:text-primary-900"
        >
          <Ticket className="h-4 w-4" />
          {t('nav.home_menu.cta_badge')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default HomeMenuVariant2;

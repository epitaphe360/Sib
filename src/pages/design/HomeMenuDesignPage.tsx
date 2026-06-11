import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { HOME_PAGES_MENU, getDefaultHomePageVariant } from '../../config/homePagesRegistry';
import { useTranslation } from '../../hooks/useTranslation';

export default function HomeMenuDesignPage() {
  const { t } = useTranslation();
  const active = getDefaultHomePageVariant();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-8 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('design.home_menu.back')}
        </Link>

        <header className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-3">{t('design.home_menu.kicker')}</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            {t('design.home_page.title')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            9 mises en page réellement différentes. P10–P17 étaient des doublons — supprimés du menu.
          </p>
          <p className="mt-4 text-sm text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-lg inline-block">
            {t('design.home_page.default')}: P{active} — <code>VITE_HOME_PAGE_VARIANT={active}</code>
          </p>
        </header>

        <div className="space-y-4">
          {HOME_PAGES_MENU.map((v) => (
            <Link
              key={v.id}
              to={v.route}
              className="group flex items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg transition-all"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
                  P{v.id}{v.id === 8 ? ' · Recommandée' : v.id === 9 ? ' · Optimisée' : ''}
                </p>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">{v.label}</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t(v.descKey)}</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-primary-700 dark:text-primary-300 shrink-0">
                {t('design.home_page.open')}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-neutral-500 flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          {t('design.home_page.menu_hint')}
        </p>
      </div>
    </div>
  );
}

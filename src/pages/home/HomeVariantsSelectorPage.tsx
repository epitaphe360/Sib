import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HOME_PAGES_CURATED } from '../../config/homePagesRegistry';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

/** Sélecteur des 10 pages accueil — /home/variants */
export default function HomeVariantsSelectorPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-neutral-50 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link
          to={ROUTES.HOME_P8}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 mb-8 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('design.variants.back_official')}
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t('design.variants.title')}</h1>
          <p className="text-neutral-600">{t('design.variants.subtitle')}</p>
        </header>

        <div className="space-y-2">
          {HOME_PAGES_CURATED.map((p, index) => (
            <Link
              key={p.slug}
              to={p.route}
              className="flex items-start gap-4 p-4 rounded-xl bg-white border border-neutral-200 hover:border-primary-400 transition-colors"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 text-sm font-bold">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-neutral-900 block">{t(p.titleKey)}</span>
                <span className="text-xs text-neutral-500 mt-0.5 block">{t(p.descKey)}</span>
                <span className="text-[10px] text-primary-600 mt-1 block">{p.route}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

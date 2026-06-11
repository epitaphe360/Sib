import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { HOME_HERO_DESIGNS } from '../../config/homeHeroDesignsRegistry';
import { ROUTES } from '../../lib/routes';

/** Comparateur des 16 designs hero — /home/demo */
export default function HomeDemoComparatorPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 mb-8 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </Link>

        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-3">
            Hero designs
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-3">
            Comparateur de designs
          </h1>
          <p className="text-neutral-600 max-w-2xl">
            16 propositions de hero pour la page d&apos;accueil SIB 2026. Cliquez pour ouvrir
            chaque design en pleine page.
          </p>
          <Link
            to={ROUTES.HOME_VARIANTS}
            className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-primary-700 hover:underline"
          >
            Sélecteur de variants (P1–P17)
            <ExternalLink className="h-4 w-4" />
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOME_HERO_DESIGNS.map((d) => {
            const Icon = d.icon;
            return (
              <Link
                key={d.slug}
                to={d.route}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-primary-400 hover:shadow-lg transition-all"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {d.title}
                  </h2>
                  <p className="text-sm text-neutral-500 mt-0.5">{d.description}</p>
                  <p className="text-xs text-primary-600 mt-2 font-mono">{d.route}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

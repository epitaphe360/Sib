import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getHomeHeroDesign } from '../../config/homeHeroDesignsRegistry';
import HomeHeroDesignPage from './HomeHeroDesignPage';
import { ROUTES } from '../../lib/routes';

/** Route dynamique /home/:slug — charge le design hero correspondant */
export default function HomeDemoRouter() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to={ROUTES.HOME_DEMO} replace />;
  }

  const design = getHomeHeroDesign(slug);
  if (!design) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 pt-24">
        <p className="text-neutral-600">Design hero introuvable : /home/{slug}</p>
        <Link to={ROUTES.HOME_DEMO} className="text-primary-600 font-semibold hover:underline">
          Voir le comparateur
        </Link>
      </div>
    );
  }

  return <HomeHeroDesignPage design={design} />;
}

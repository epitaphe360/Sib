import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import type { HomeHeroDesignEntry } from '../../config/homeHeroDesignsRegistry';
import { StatsSection } from '../../components/home/StatsSection';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';
import { HERO_DESIGN_LOADERS } from '../../components/home/designs/HeroDesignLoaders';
import { ROUTES } from '../../lib/routes';

interface HomeHeroDesignPageProps {
  design: HomeHeroDesignEntry;
}

function HeroFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-[#001A3D]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F39200] border-t-transparent" />
    </div>
  );
}

/** Page complète pour un design hero /home/:slug */
export default function HomeHeroDesignPage({ design }: HomeHeroDesignPageProps) {
  const Hero = HERO_DESIGN_LOADERS[design.componentKey];

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-16 z-40 bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-amber-950">
          Hero design : <strong>{design.title}</strong> — {design.description}
        </span>
        <div className="flex gap-3">
          <Link to={ROUTES.HOME_DEMO} className="font-bold text-primary-700 hover:underline">
            Comparateur
          </Link>
          <Link to={ROUTES.HOME_VARIANTS} className="font-bold text-primary-700 hover:underline">
            Variants
          </Link>
        </div>
      </div>

      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>

      <StatsSection />
      <HomeFigmaCoreSections />
    </div>
  );
}

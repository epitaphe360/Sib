import React, { Suspense, lazy } from 'react';
import type { HomePageComponentKey, HomePageVariantId } from '../../config/homePagesRegistry';
import { getHomePageEntry } from '../../config/homePagesRegistry';
import { HomePageVariantProvider } from '../../contexts/HomePageVariantContext';

const LOADERS: Record<HomePageComponentKey, React.LazyExoticComponent<React.FC>> = {
  variant1: lazy(() => import('./HomeVariant1')),
  variant2: lazy(() => import('./HomeVariant2')),
  variant3: lazy(() => import('./HomeVariant3')),
  variant4: lazy(() => import('./HomeVariant4')),
  variant5: lazy(() => import('./HomeVariant5')),
  variant6: lazy(() => import('./HomeVariant6')),
  variant7: lazy(() => import('./HomeVariant7')),
  sib2026: lazy(() => import('./Sib2026HomePage')),
  optimized: lazy(() => import('./Sib2026OptimizedPage')),
};

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-neutral-50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#001A3D] border-t-transparent" />
    </div>
  );
}

interface HomePageRouterProps {
  pageId: HomePageVariantId;
}

/** Route dynamique /accueil/:id — charge le bon template */
export default function HomePageRouter({ pageId }: HomePageRouterProps) {
  const entry = getHomePageEntry(pageId);
  if (!entry) {
    return (
      <div className="p-12 text-center text-neutral-600">
        Page d&apos;accueil introuvable (P{pageId})
      </div>
    );
  }
  const Page = LOADERS[entry.component];
  return (
    <HomePageVariantProvider pageId={pageId}>
      <Suspense fallback={<PageFallback />}>
        <Page />
      </Suspense>
    </HomePageVariantProvider>
  );
}

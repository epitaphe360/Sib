/**
 * Routeur des pages accueil curated — chaque URL retrouve son contenu propre.
 * La couche dm-home applique le polish Design Master (CSS global).
 */
import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { lazyRetry } from '../../utils/lazyRetry';
import '../../components/home/master/design-master.css';

const Sib2026HomePage = lazyRetry(() => import('./Sib2026HomePage'));
const Sib40HomePage = lazyRetry(() => import('./Sib40HomePage'));
const WorldClassHomePage = lazyRetry(() => import('./WorldClassHomePage'));
const Sib2026OptimizedPage = lazyRetry(() => import('./Sib2026OptimizedPage'));
const HomeVariant7 = lazyRetry(() => import('./HomeVariant7'));
const HomeVariant2 = lazyRetry(() => import('./HomeVariant2'));
const HomeVariant4 = lazyRetry(() => import('./HomeVariant4'));
const HomeVariant1 = lazyRetry(() => import('./HomeVariant1'));
const HomeVariant3 = lazyRetry(() => import('./HomeVariant3'));
const HomeVariant6 = lazyRetry(() => import('./HomeVariant6'));

type CuratedPage = React.LazyExoticComponent<React.ComponentType<object>>;

const PAGE_BY_PATH: Record<string, CuratedPage> = {
  '/': Sib2026HomePage,
  [ROUTES.HOME_P8]: Sib2026HomePage,
  [ROUTES.HOME_40ANS]: Sib40HomePage,
  [ROUTES.HOME_WORLD]: WorldClassHomePage,
  [ROUTES.HOME_P9]: Sib2026OptimizedPage,
  [ROUTES.HOME_P7]: HomeVariant7,
  [ROUTES.HOME_P2]: HomeVariant2,
  [ROUTES.HOME_P4]: HomeVariant4,
  [ROUTES.HOME_P1]: HomeVariant1,
  [ROUTES.HOME_P3]: HomeVariant3,
  [ROUTES.HOME_P6]: HomeVariant6,
};

function HomePageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#001A3D]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F39200] border-t-transparent" />
    </div>
  );
}

export default function CuratedHomeRouter() {
  const { pathname } = useLocation();
  const Page = PAGE_BY_PATH[pathname] ?? Sib2026HomePage;

  return (
    <div className="dm-home min-h-screen">
      <Suspense fallback={<HomePageFallback />}>
        <Page />
      </Suspense>
    </div>
  );
}

import React, { createContext, useContext } from 'react';
import type { HomePageVariantId } from '../config/homePagesRegistry';

const HomePageVariantContext = createContext<HomePageVariantId | null>(null);

export function HomePageVariantProvider({
  pageId,
  children,
}: {
  pageId: HomePageVariantId;
  children: React.ReactNode;
}) {
  return (
    <HomePageVariantContext.Provider value={pageId}>{children}</HomePageVariantContext.Provider>
  );
}

/** Identifiant effectif de la page /accueil/:id (contexte route ou prop composant). */
export function useResolvedHomePageVariantId(fallback: HomePageVariantId): HomePageVariantId {
  const fromRoute = useContext(HomePageVariantContext);
  return fromRoute ?? fallback;
}

/** Variantes hero Design Master — 10 pages curated */
export type MasterHeroVariant =
  | 'official'
  | 'manus'
  | 'world'
  | 'optimized'
  | 'worldclass'
  | 'mega'
  | 'split'
  | 'classic'
  | 'bento'
  | 'glass';

export interface MasterVariantMeta {
  id: MasterHeroVariant;
  label: string;
  show3D: boolean;
  accent: 'orange' | 'emerald' | 'navy';
}

export const MASTER_VARIANT_META: Record<MasterHeroVariant, MasterVariantMeta> = {
  official: { id: 'official', label: 'P8 — Officielle', show3D: true, accent: 'orange' },
  manus: { id: 'manus', label: 'SIB 40 ans', show3D: true, accent: 'navy' },
  world: { id: 'world', label: 'Premium World', show3D: true, accent: 'emerald' },
  optimized: { id: 'optimized', label: 'P9 — Optimisée', show3D: true, accent: 'orange' },
  worldclass: { id: 'worldclass', label: 'P7 — World Class', show3D: true, accent: 'orange' },
  mega: { id: 'mega', label: 'P2 — BIG5 Mega', show3D: true, accent: 'orange' },
  split: { id: 'split', label: 'P4 — Split Navy', show3D: true, accent: 'navy' },
  classic: { id: 'classic', label: 'P1 — Batimat', show3D: true, accent: 'orange' },
  bento: { id: 'bento', label: 'P3 — Bento Grid', show3D: true, accent: 'orange' },
  glass: { id: 'glass', label: 'P6 — Glass Light', show3D: true, accent: 'navy' },
};

const PATH_TO_VARIANT: Record<string, MasterHeroVariant> = {
  '/': 'official',
  '/accueil/8': 'official',
  '/accueil/40ans': 'manus',
  '/accueil/world': 'world',
  '/accueil/9': 'optimized',
  '/accueil/7': 'worldclass',
  '/accueil/2': 'mega',
  '/accueil/4': 'split',
  '/accueil/1': 'classic',
  '/accueil/3': 'bento',
  '/accueil/6': 'glass',
};

export function getMasterVariantFromPath(pathname: string): MasterHeroVariant {
  return PATH_TO_VARIANT[pathname] ?? 'official';
}

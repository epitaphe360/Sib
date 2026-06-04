import React from 'react';
import type { HomeMenuPanelProps } from '../types';
import { HomeMenuSalonGridPanel } from '../HomeMenuSalonGridPanel';

/** SIB 2026 — Grille « UN SALON PENSÉ POUR VOUS » (maquette officielle) */
export const HomeMenuVariant1: React.FC<HomeMenuPanelProps> = (props) => (
  <HomeMenuSalonGridPanel {...props} />
);

export default HomeMenuVariant1;

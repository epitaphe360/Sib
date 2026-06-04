import React from 'react';
import type { HomeMenuPanelProps } from '../types';
import { HomePagesNavPanel } from '../HomePagesNavPanel';

/** Accueil — sélecteur des 8 pages d’accueil */
export const HomeMenuVariant1: React.FC<HomeMenuPanelProps> = ({ onNavigate }) => (
  <HomePagesNavPanel onNavigate={onNavigate} />
);

export default HomeMenuVariant1;

import React from 'react';

import type { HomeMenuPanelProps } from './types';

import { Sib2026SalonGridSection } from '../../home/sib2026/Sib2026SalonGridSection';

/** SIB 2026 — Grille Figma « Un salon pensé pour vous » */
export const HomeMenuSalonGridPanel: React.FC<HomeMenuPanelProps & { compact?: boolean }> = ({
  items,
  onNavigate,
  compact = false,
}) => (
  <Sib2026SalonGridSection items={items} onNavigate={onNavigate} compact={compact} dropdown={!compact} />
);

export { Sib2026SalonGridSection as HomeSalonPenseSection } from '../../home/sib2026/Sib2026SalonGridSection';

export default HomeMenuSalonGridPanel;

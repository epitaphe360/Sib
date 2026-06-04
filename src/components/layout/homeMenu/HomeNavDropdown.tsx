import React from 'react';
import type { HomeMenuVariantId } from '../../../config/homeNavMenu';
import {
  getActiveHomeMenuVariant,
} from '../../../config/homeNavMenu';
import type { HomeMenuPanelProps } from './types';
import { HomePagesNavPanel } from './HomePagesNavPanel';
import { HomeMenuVariant2 } from './variants/HomeMenuVariant2';
import { HomeMenuVariant3 } from './variants/HomeMenuVariant3';
import { HomeMenuVariant4 } from './variants/HomeMenuVariant4';
import { HomeMenuVariant5 } from './variants/HomeMenuVariant5';
import { HomeMenuVariant6 } from './variants/HomeMenuVariant6';

/** Variantes legacy (page design uniquement) */
const DESIGN_VARIANTS: Partial<Record<HomeMenuVariantId, React.FC<HomeMenuPanelProps>>> = {
  2: HomeMenuVariant2,
  3: HomeMenuVariant3,
  4: HomeMenuVariant4,
  5: HomeMenuVariant5,
  6: HomeMenuVariant6,
};

interface HomeNavDropdownProps extends HomeMenuPanelProps {
  /** Force une variante (page design /demo menu) */
  variant?: HomeMenuVariantId;
}

/** Accueil : liste P1–P9 par défaut ; variantes 2–6 sur la page design */
export const HomeNavDropdown: React.FC<HomeNavDropdownProps> = ({
  variant: variantProp,
  onNavigate,
  ...props
}) => {
  const variant = variantProp ?? getActiveHomeMenuVariant();
  const DesignPanel = DESIGN_VARIANTS[variant];
  if (DesignPanel) {
    return <DesignPanel items={props.items} onNavigate={onNavigate} />;
  }
  return <HomePagesNavPanel onNavigate={onNavigate} />;
};

export default HomeNavDropdown;

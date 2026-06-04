import React from 'react';
import {
  getActiveHomeMenuVariant,
  type HomeMenuVariantId,
} from '../../../config/homeNavMenu';
import type { HomeMenuPanelProps } from './types';
import { HomeMenuVariant1 } from './variants/HomeMenuVariant1';
import { HomeMenuVariant2 } from './variants/HomeMenuVariant2';
import { HomeMenuVariant3 } from './variants/HomeMenuVariant3';
import { HomeMenuVariant4 } from './variants/HomeMenuVariant4';
import { HomeMenuVariant5 } from './variants/HomeMenuVariant5';
import { HomeMenuVariant6 } from './variants/HomeMenuVariant6';

const VARIANTS: Record<HomeMenuVariantId, React.FC<HomeMenuPanelProps>> = {
  1: HomeMenuVariant1,
  2: HomeMenuVariant2,
  3: HomeMenuVariant3,
  4: HomeMenuVariant4,
  5: HomeMenuVariant5,
  6: HomeMenuVariant6,
};

interface HomeNavDropdownProps extends HomeMenuPanelProps {
  /** Force une variante (page design) */
  variant?: HomeMenuVariantId;
}

export const HomeNavDropdown: React.FC<HomeNavDropdownProps> = ({
  variant: variantProp,
  ...props
}) => {
  const variant = variantProp ?? getActiveHomeMenuVariant();
  const Panel = VARIANTS[variant];
  return <Panel {...props} />;
};

export { VARIANTS as HOME_MENU_VARIANT_COMPONENTS };

export default HomeNavDropdown;

import React from 'react';
import { LogoShowcaseSection } from './LogoShowcaseSection';

/**
 * Bandeau logos défilants — annuaire public = exposants uniquement.
 */
export const HomeLogoMarqueeSection: React.FC = () => (
  <LogoShowcaseSection type="exhibitors" />
);

export default HomeLogoMarqueeSection;

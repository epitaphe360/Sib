import React from 'react';
import { LogoShowcaseSection } from './LogoShowcaseSection';

/**
 * Bandeau logos défilants — présent sur toutes les propositions d'accueil.
 */
/** Logos partenaires uniquement — les exposants sont dans l'annuaire */
export const HomeLogoMarqueeSection: React.FC = () => (
  <LogoShowcaseSection type="partners" />
);

export default HomeLogoMarqueeSection;

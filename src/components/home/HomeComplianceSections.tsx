import React from 'react';
import { SponsorSpotlight } from './SponsorSpotlight';
import { UrbaEventBanner } from './UrbaEventBanner';
import { HomeLogoMarqueeSection } from './HomeLogoMarqueeSection';
import { MasterScrollReveal } from './master/MasterScrollReveal';

/** Sections conformité client — LAP, bannière URBAEVENT, logos cliquables */
export const HomeComplianceSections: React.FC<{
  showSponsor?: boolean;
  showBanner?: boolean;
  showLogos?: boolean;
}> = ({ showSponsor = true, showBanner = true, showLogos = true }) => (
  <>
    {showSponsor && (
      <MasterScrollReveal y={20}>
        <SponsorSpotlight />
      </MasterScrollReveal>
    )}
    {showLogos && (
      <MasterScrollReveal y={24} delay={0.03}>
        <HomeLogoMarqueeSection />
      </MasterScrollReveal>
    )}
    {showBanner && (
      <MasterScrollReveal y={24} delay={0.03}>
        <UrbaEventBanner />
      </MasterScrollReveal>
    )}
  </>
);

export default HomeComplianceSections;

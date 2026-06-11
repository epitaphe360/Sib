import React from 'react';
import { UrbaEventBanner } from './UrbaEventBanner';
import { MasterScrollReveal } from './master/MasterScrollReveal';

/** Sections conformité client — bannière URBAEVENT uniquement */
export const HomeComplianceSections: React.FC<{
  showBanner?: boolean;
}> = ({ showBanner = true }) => (
  <>
    {showBanner && (
      <MasterScrollReveal y={24} delay={0.03}>
        <UrbaEventBanner />
      </MasterScrollReveal>
    )}
  </>
);

export default HomeComplianceSections;

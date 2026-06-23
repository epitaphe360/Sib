import React from 'react';
import { Sib2026MissionSection } from './sib2026/Sib2026MissionSection';
import { Sib2026TimelineSection } from './sib2026/Sib2026TimelineSection';

/** Blocs Figma communs — mission 4 portraits + frise chronologique */
export const HomeFigmaCoreSections: React.FC = () => (
  <>
    <Sib2026MissionSection />
    <Sib2026TimelineSection />
  </>
);

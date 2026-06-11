import React from 'react';
import { useLocation } from 'react-router-dom';
import { getMasterVariantFromPath } from '../../config/masterHomeConfig';
import { useHomeMenuItems } from '../../components/layout/homeMenu/useHomeMenuItems';
import { MasterHeroSection } from '../../components/home/master/MasterHeroSection';
import { MasterStatsBento } from '../../components/home/master/MasterStatsBento';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';
import { Sib2026MissionSection } from '../../components/home/sib2026/Sib2026MissionSection';
import { Sib2026TimelineSection } from '../../components/home/sib2026/Sib2026TimelineSection';
import { Sib2026SalonGridSection } from '../../components/home/sib2026/Sib2026SalonGridSection';
import { Sib2026InternationalSection } from '../../components/home/sib2026/Sib2026InternationalSection';
import { Sib2026ReserveBanner } from '../../components/home/sib2026/Sib2026ReserveBanner';
import { Sib2026Footer } from '../../components/home/sib2026/Sib2026Footer';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import '../../components/home/master/design-master.css';
import '../../components/home/sib2026/sib2026.css';

/** Page d'accueil Design Master — 10/10, 10 variantes hero, corps premium unifié */
export default function DesignMasterHomePage() {
  const { pathname } = useLocation();
  const variant = getMasterVariantFromPath(pathname);
  const menuItems = useHomeMenuItems();

  return (
    <div className="dm-home sib2026-page min-h-screen bg-white">
      <MasterHeroSection variant={variant} />
      <MasterStatsBento variant={variant} />
      <MasterScrollReveal>
        <Sib2026MissionSection />
      </MasterScrollReveal>
      <MasterScrollReveal delay={0.1}>
        <Sib2026TimelineSection />
      </MasterScrollReveal>
      <MasterScrollReveal delay={0.05}>
        <div id="visiter">
          <Sib2026SalonGridSection items={menuItems} />
        </div>
      </MasterScrollReveal>
      <MasterScrollReveal>
        <div id="badges" className="scroll-mt-28">
          <HomeBadgeSection />
        </div>
      </MasterScrollReveal>
      <MasterScrollReveal>
        <Sib2026InternationalSection />
      </MasterScrollReveal>
      <MasterScrollReveal>
        <Sib2026ReserveBanner />
      </MasterScrollReveal>
      <Sib2026Footer />
    </div>
  );
}

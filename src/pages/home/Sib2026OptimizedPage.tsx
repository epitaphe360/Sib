import React from 'react';
import { HomePageShell } from '../../components/home/HomePageShell';
import { Sib2026MissionSection } from '../../components/home/sib2026/Sib2026MissionSection';
import { Sib2026TimelineSection } from '../../components/home/sib2026/Sib2026TimelineSection';
import { Sib2026SalonGridSection } from '../../components/home/sib2026/Sib2026SalonGridSection';
import { Sib2026InternationalSection } from '../../components/home/sib2026/Sib2026InternationalSection';
import { Sib2026ReserveBanner } from '../../components/home/sib2026/Sib2026ReserveBanner';
import { Sib2026Footer } from '../../components/home/sib2026/Sib2026Footer';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { HomeComplianceSections } from '../../components/home/HomeComplianceSections';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';
import { useHomeMenuItems } from '../../components/layout/homeMenu/useHomeMenuItems';
import { PremiumHomeHero } from '../../components/home/master/PremiumHomeHero';
import { MasterStatsBento } from '../../components/home/master/MasterStatsBento';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { NetworkingSection } from '../../components/home/NetworkingSection';
import { P9MultiProfileSection } from '../../components/home/variants/P9MultiProfileSection';

/** P9 — Ossature P8 + scroll reveals + engagement en fin de page */
export default function Sib2026OptimizedPage() {
  const menuItems = useHomeMenuItems();

  return (
    <HomePageShell variantId={9} className="sib2026-page bg-white" fullLayout>
      <PremiumHomeHero variant="optimized" />
      <MasterScrollReveal y={20}>
        <MasterStatsBento variant="optimized" />
      </MasterScrollReveal>
      <HomeComplianceSections />
      <MasterScrollReveal y={40} delay={0.05}>
        <Sib2026MissionSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={40} delay={0.05}>
        <Sib2026TimelineSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={30} delay={0.04}>
        <div id="visiter">
          <Sib2026SalonGridSection items={menuItems} />
        </div>
      </MasterScrollReveal>
      <MasterScrollReveal y={24} delay={0.03}>
        <HomeBadgeSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={40} delay={0.05}>
        <Sib2026InternationalSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={20}>
        <Sib2026ReserveBanner />
      </MasterScrollReveal>
      <MasterScrollReveal y={30} delay={0.04}>
        <P9MultiProfileSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={24} delay={0.03}>
        <HomeHighlightsSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={24} delay={0.03}>
        <LatestNewsSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={24} delay={0.03}>
        <NetworkingSection />
      </MasterScrollReveal>
      <Sib2026Footer />
    </HomePageShell>
  );
}

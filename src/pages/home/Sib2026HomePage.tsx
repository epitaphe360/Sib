import React from 'react';
import { Sib2026HeroSection } from '../../components/home/sib2026/Sib2026HeroSection';
import { Sib2026StatsBar } from '../../components/home/sib2026/Sib2026StatsBar';
import { Sib2026MissionSection } from '../../components/home/sib2026/Sib2026MissionSection';
import { Sib2026TimelineSection } from '../../components/home/sib2026/Sib2026TimelineSection';
import { Sib2026SalonGridSection } from '../../components/home/sib2026/Sib2026SalonGridSection';
import { Sib2026InternationalSection } from '../../components/home/sib2026/Sib2026InternationalSection';
import { Sib2026ReserveBanner } from '../../components/home/sib2026/Sib2026ReserveBanner';
import { Sib2026Footer } from '../../components/home/sib2026/Sib2026Footer';
import { SponsorSpotlight } from '../../components/home/SponsorSpotlight';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { LogoShowcaseSection } from '../../components/home/LogoShowcaseSection';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';
import { useHomeMenuItems } from '../../components/layout/homeMenu/useHomeMenuItems';
import { HomePageShell } from '../../components/home/HomePageShell';
import '../../components/home/sib2026/sib2026.css';

/** P8 — Page officielle SIB 2026 (conformité retours client) */
export default function Sib2026HomePage() {
  const menuItems = useHomeMenuItems();

  return (
    <HomePageShell variantId={8} className="sib2026-page bg-white" fullLayout>
      <Sib2026HeroSection />
      <MasterScrollReveal y={20}>
        <Sib2026StatsBar />
      </MasterScrollReveal>
      <MasterScrollReveal y={24} delay={0.03}>
        <SponsorSpotlight />
      </MasterScrollReveal>
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
        <UrbaEventBanner />
      </MasterScrollReveal>
      <MasterScrollReveal y={24} delay={0.03}>
        <LogoShowcaseSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={40} delay={0.05}>
        <Sib2026InternationalSection />
      </MasterScrollReveal>
      <MasterScrollReveal y={20}>
        <Sib2026ReserveBanner />
      </MasterScrollReveal>
      <Sib2026Footer />
    </HomePageShell>
  );
}

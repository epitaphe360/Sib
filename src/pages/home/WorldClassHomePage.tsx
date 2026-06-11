/**
 * Proposition premium SIB 2026 — hero cinématique + Design Master.
 * /accueil/world
 */
import { PremiumHomeHero } from '../../components/home/master/PremiumHomeHero';
import { MasterStatsBento } from '../../components/home/master/MasterStatsBento';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';
import { Sib2026MissionSection } from '../../components/home/sib2026/Sib2026MissionSection';
import { Sib2026TimelineSection } from '../../components/home/sib2026/Sib2026TimelineSection';
import { Sib2026SalonGridSection } from '../../components/home/sib2026/Sib2026SalonGridSection';
import { Sib2026InternationalSection } from '../../components/home/sib2026/Sib2026InternationalSection';
import { Sib2026ReserveBanner } from '../../components/home/sib2026/Sib2026ReserveBanner';
import { Sib2026Footer } from '../../components/home/sib2026/Sib2026Footer';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { HomeComplianceSections } from '../../components/home/HomeComplianceSections';
import { WorldProfilesSection } from '../../components/home/world/WorldProfilesSection';
import { WorldMobileStickyBar } from '../../components/home/world/WorldMobileStickyBar';
import { useHomeMenuItems } from '../../components/layout/homeMenu/useHomeMenuItems';
import '../../components/home/sib2026/sib2026.css';
import '../../components/home/home-premium.css';

export default function WorldClassHomePage() {
  const menuItems = useHomeMenuItems();

  return (
    <div className="sib2026-page home-premium min-h-screen bg-white pb-16 lg:pb-0">
      <PremiumHomeHero variant="world" />
      <MasterStatsBento variant="world" />
      <HomeComplianceSections />
      <MasterScrollReveal>
        <Sib2026MissionSection />
      </MasterScrollReveal>
      <WorldProfilesSection />
      <MasterScrollReveal delay={0.08}>
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
      <Sib2026Footer />
      <WorldMobileStickyBar />
    </div>
  );
}

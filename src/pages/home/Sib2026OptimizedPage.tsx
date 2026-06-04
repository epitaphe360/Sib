import React from 'react';
import { HomePageShell } from '../../components/home/HomePageShell';
import { Sib2026HeroSection } from '../../components/home/sib2026/Sib2026HeroSection';
import { Sib2026StatsBar } from '../../components/home/sib2026/Sib2026StatsBar';
import { Sib2026MissionSection } from '../../components/home/sib2026/Sib2026MissionSection';
import { Sib2026TimelineSection } from '../../components/home/sib2026/Sib2026TimelineSection';
import { Sib2026SalonGridSection } from '../../components/home/sib2026/Sib2026SalonGridSection';
import { Sib2026InternationalSection } from '../../components/home/sib2026/Sib2026InternationalSection';
import { Sib2026ReserveBanner } from '../../components/home/sib2026/Sib2026ReserveBanner';
import { Sib2026Footer } from '../../components/home/sib2026/Sib2026Footer';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { useHomeMenuItems } from '../../components/layout/homeMenu/useHomeMenuItems';
import { HomeHeroWorldClass } from '../../components/home/variants/HomeHeroWorldClass';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { NetworkingSection } from '../../components/home/NetworkingSection';
import { P9MultiProfileSection } from '../../components/home/variants/P9MultiProfileSection';

/** Page d'accueil SIB 2026 Optimisée (P9) — Engagement Complet */
export default function Sib2026OptimizedPage() {
  const menuItems = useHomeMenuItems();

  return (
    <HomePageShell variantId={9} className="sib2026-page bg-white" fullLayout>
      {/* Fusion du Hero cinématique de P7 et de la structure de P8 */}
      <HomeHeroWorldClass />

      {/* Sections de P8 pour la structure et les données */}
      <Sib2026StatsBar />
      <Sib2026MissionSection />
      <Sib2026TimelineSection />

      {/* Section Multi-Profils pour l'engagement */}
      <P9MultiProfileSection />

      {/* Sections clés pour la narration et la conversion */}
      <HomeHighlightsSection />
      <LatestNewsSection />
      <NetworkingSection />

      {/* Sections de fermeture unifiées */}
      <div id="visiter">
        <Sib2026SalonGridSection items={menuItems} />
      </div>
      <div id="badges" className="scroll-mt-28">
        <HomeBadgeSection />
      </div>
      <Sib2026InternationalSection />
      <Sib2026ReserveBanner />
      <Sib2026Footer />
    </HomePageShell>
  );
}

import React from 'react';
import { Sib2026HeroSection } from '../../components/home/sib2026/Sib2026HeroSection';
import { Sib2026StatsBar } from '../../components/home/sib2026/Sib2026StatsBar';
import { Sib2026MissionSection } from '../../components/home/sib2026/Sib2026MissionSection';
import { Sib2026TimelineSection } from '../../components/home/sib2026/Sib2026TimelineSection';
import { Sib2026SalonGridSection } from '../../components/home/sib2026/Sib2026SalonGridSection';
import { Sib2026InternationalSection } from '../../components/home/sib2026/Sib2026InternationalSection';
import { Sib2026ReserveBanner } from '../../components/home/sib2026/Sib2026ReserveBanner';
import { Sib2026Footer } from '../../components/home/sib2026/Sib2026Footer';
import { useHomeMenuItems } from '../../components/layout/homeMenu/useHomeMenuItems';
import { HomePageShell } from '../../components/home/HomePageShell';
import '../../components/home/sib2026/sib2026.css';

/** Page d'accueil SIB 2026 — composants React fidèles à la maquette Figma */
export default function Sib2026HomePage() {
  const menuItems = useHomeMenuItems();

  return (
    <HomePageShell variantId={8} className="sib2026-page bg-white" fullLayout>
      <Sib2026HeroSection />
      <Sib2026StatsBar />
      <Sib2026MissionSection />
      <Sib2026TimelineSection />
      <div id="visiter">
        <Sib2026SalonGridSection items={menuItems} />
      </div>
      <Sib2026InternationalSection />
      <Sib2026ReserveBanner />
      <Sib2026Footer />
    </HomePageShell>
  );
}

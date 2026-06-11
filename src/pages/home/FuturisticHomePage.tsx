/**
 * P10 — Page Futuriste 3D SIB 2026
 * Stack: Three.js/React Three Fiber · GSAP ScrollTrigger · Framer Motion · Tailwind Glassmorphism
 * Route: /accueil/10
 */
import React, { Suspense, Component, type ReactNode } from 'react';
import { FuturisticHeroSection } from '../../components/home/futuristic/FuturisticHeroSection';
import { FuturisticStatsSection } from '../../components/home/futuristic/FuturisticStatsSection';
import { FuturisticMissionSection, FuturisticCTABanner } from '../../components/home/futuristic/FuturisticMissionSection';
import { FuturisticFeaturesSection } from '../../components/home/futuristic/FuturisticFeaturesSection';
import { Sib2026SalonGridSection } from '../../components/home/sib2026/Sib2026SalonGridSection';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { Sib2026InternationalSection } from '../../components/home/sib2026/Sib2026InternationalSection';
import { Sib2026Footer } from '../../components/home/sib2026/Sib2026Footer';
import { useHomeMenuItems } from '../../components/layout/homeMenu/useHomeMenuItems';
import '../../components/home/futuristic/futuristic.css';
import '../../components/home/sib2026/sib2026.css';

/* ── Fallback for lazy 3D section ── */
function Loading3D() {
  return (
    <div className="min-h-screen bg-[#000912] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        <p className="text-[#00D4FF]/60 text-sm font-bold tracking-[0.1em] uppercase">
          Chargement de la scène 3D…
        </p>
      </div>
    </div>
  );
}

/* ── Error boundary for section failures ── */
class SectionErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

/* ── Salon grid with dark futuristic wrapper ── */
function FuturisticSalonGrid() {
  const menuItems = useHomeMenuItems();
  return (
    <div className="futuristic-page bg-[#000D24] py-4" id="visiter">
      <Sib2026SalonGridSection items={menuItems} />
    </div>
  );
}

/* ── Main page ── */
export default function FuturisticHomePage() {
  return (
    <div className="futuristic-page min-h-screen bg-[#000912]">
      {/* 1 — Cinematic 3D hero */}
      <SectionErrorBoundary
        fallback={
          <div className="min-h-screen bg-gradient-to-b from-[#000912] to-[#001A3D] flex items-center justify-center">
            <div className="text-center">
              <h1 className="font-display text-7xl font-black text-white mb-4">SIB 2026</h1>
              <p className="text-[#8BB8D8]">Salon International du Bâtiment · Casablanca</p>
            </div>
          </div>
        }
      >
        <Suspense fallback={<Loading3D />}>
          <FuturisticHeroSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* 2 — Key figures (Framer Motion animated counters) */}
      <FuturisticStatsSection />

      {/* 3 — Mission + info panel (GSAP ScrollTrigger) */}
      <FuturisticMissionSection />

      {/* 4 — Features grid (Framer Motion + GSAP marquee) */}
      <FuturisticFeaturesSection />

      {/* 5 — Salon navigation grid (reused component) */}
      <FuturisticSalonGrid />

      {/* 6 — Badge section */}
      <div className="bg-[#000912]">
        <HomeBadgeSection />
      </div>

      {/* 7 — International section */}
      <div className="bg-[#000D24]">
        <Sib2026InternationalSection />
      </div>

      {/* 8 — Full-width CTA banner */}
      <FuturisticCTABanner />

      {/* 9 — Footer */}
      <div className="bg-[#000912]">
        <Sib2026Footer />
      </div>
    </div>
  );
}

import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { EditionSection } from '../components/home/EditionSection';
import { ThemesSection } from '../components/home/ThemesSection';
import { AboutSalonSection } from '../components/home/AboutSalonSection';
import { OrganizersSection } from '../components/home/OrganizersSection';
import { FeaturedPartners } from '../components/home/FeaturedPartners';
import { FeaturedExhibitors } from '../components/home/FeaturedExhibitors';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';
import { NetworkingSection } from '../components/home/NetworkingSection';
import { ServicesSection } from '../components/home/ServicesSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* 1. Hero cinématique — fond sombre, badge 20ème/40ans, countdown premium */}
      <HeroSection />

      {/* 2. Stats — chiffres réels SIB 2024 animés (200 000+ visiteurs, 500+ exposants) */}
      <StatsSection />

      {/* 3. 40 Ans d'Excellence — célébration anniversaire, timeline 1986→2026 */}
      <EditionSection />

      {/* 4. Filières officielles — 6 secteurs SIB (Gros Œuvre, Menuiserie, etc.) */}
      <ThemesSection />

      {/* 5. À propos — description officielle, organisateurs, données réelles */}
      <AboutSalonSection />

      {/* 6. Organisateurs & Partenaires institutionnels — MHPV, AMDIE, FMC, FNBTP, URBACOM */}
      <OrganizersSection />

      {/* 7. Partenaires à la Une */}
      <FeaturedPartners />

      {/* 8. Exposants à la une */}
      <FeaturedExhibitors />

      {/* 9. Logo Showcase Exposants */}
      <LogoShowcaseSection type="exhibitors" />

      {/* 10. Networking B2B */}
      <NetworkingSection />

      {/* 11. Services */}
      <ServicesSection />
    </div>
  );
}

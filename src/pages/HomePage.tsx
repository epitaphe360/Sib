import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { EditionSection } from '../components/home/EditionSection';
import { ThemesSection } from '../components/home/ThemesSection';
import { AboutSalonSection } from '../components/home/AboutSalonSection';
import { FeaturedPartners } from '../components/home/FeaturedPartners';
import { FeaturedExhibitors } from '../components/home/FeaturedExhibitors';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';
import { NetworkingSection } from '../components/home/NetworkingSection';
import { ServicesSection } from '../components/home/ServicesSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* 1. Hero cinématique — fond sombre, badge 40ème, countdown premium */}
      <HeroSection />

      {/* 2. Stats — chiffres clés animés sur fond blanc */}
      <StatsSection />

      {/* 3. 40ème Édition — célébration anniversaire, timeline */}
      <EditionSection />

      {/* 4. Filières — 6 univers du salon bâtiment */}
      <ThemesSection />

      {/* 5. À propos du salon */}
      <AboutSalonSection />

      {/* 6. Partenaires à la Une */}
      <FeaturedPartners />

      {/* 7. Exposants à la une */}
      <FeaturedExhibitors />

      {/* 8. Logo Showcase Exposants */}
      <LogoShowcaseSection type="exhibitors" />

      {/* 9. Networking B2B */}
      <NetworkingSection />

      {/* 10. Services */}
      <ServicesSection />
    </div>
  );
}

import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { AboutSalonSection } from '../components/home/AboutSalonSection';
import { FeaturedPartners } from '../components/home/FeaturedPartners';
import { AppBanner } from '../components/home/AppBanner';
import { FeaturedExhibitors } from '../components/home/FeaturedExhibitors';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';
import { NetworkingSection } from '../components/home/NetworkingSection';
import { ServicesSection } from '../components/home/ServicesSection';
import { RentalBanner } from '../components/common/RentalBanner';
import { useTranslation } from '../hooks/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Section Hero */}
      <HeroSection />

      {/* Section Stats */}
      <StatsSection />

      {/* À propos de SIB */}
      <AboutSalonSection />

      {/* Sponsors à la Une - Titre + Bande défilante + 3 Fiches */}
      <FeaturedPartners />

      {/* Bannière UrbaEvent App */}
      <AppBanner />

      {/* Exposants à la une */}
      <FeaturedExhibitors />

      {/* Logo Showcase Exposants */}
      <LogoShowcaseSection type="exhibitors" />

      {/* Bannière Location Matériel */}
      <RentalBanner variant="hero" />

      {/* Section Networking */}
      <NetworkingSection />

      {/* Section Services */}
      <ServicesSection />
    </div>
  );
}

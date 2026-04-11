import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { AboutSalonSection } from '../components/home/AboutSalonSection';
import { FeaturedPartners } from '../components/home/FeaturedPartners';
import { FeaturedExhibitors } from '../components/home/FeaturedExhibitors';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';
import { NetworkingSection } from '../components/home/NetworkingSection';
import { ServicesSection } from '../components/home/ServicesSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Section Hero */}
      <HeroSection />
      
      {/* Section Stats */}
      <StatsSection />
      
      {/* À propos de SIB */}
      <AboutSalonSection />
      
      {/* Partenaires à la Une - Titre + Bande défilante + 3 Fiches */}
      <FeaturedPartners />
      
      {/* Exposants à la une */}
      <FeaturedExhibitors />
      
      {/* Logo Showcase Exposants */}
      <LogoShowcaseSection type="exhibitors" />
      
      {/* Section Networking */}
      <NetworkingSection />
      
      {/* Section Services */}
      <ServicesSection />
    </div>
  );
}

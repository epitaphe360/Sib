/** P1 — Lead Magnet — Design Master */
import { ThemesSection } from '../../components/home/ThemesSection';
import { AboutSalonSection } from '../../components/home/AboutSalonSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { NetworkingSection } from '../../components/home/NetworkingSection';
import { ServicesSection } from '../../components/home/ServicesSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';
import { P1LeadMagnetSection } from '../../components/home/variants/P1LeadMagnetSection';
import { P1TestimonialsSection } from '../../components/home/variants/P1TestimonialsSection';
import { MasterHeroSection } from '../../components/home/master/MasterHeroSection';
import { MasterStatsBento } from '../../components/home/master/MasterStatsBento';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';

export default function HomeVariant1() {
  return (
    <HomePageShell variantId={1} className="bg-[var(--color-bg)]">
      <MasterHeroSection variant="classic" />
      <MasterStatsBento variant="classic" />
      <HomeFigmaCoreSections />
      <MasterScrollReveal>
        <ThemesSection />
      </MasterScrollReveal>
      <HomeVisitorExhibitSection />
      <AboutSalonSection />
      <HomeHighlightsSection />
      <UrbaEventBanner />
      <P1LeadMagnetSection />
      <P1TestimonialsSection />
      <HomeBadgeSection />
      <LatestNewsSection />
      <NetworkingSection />
      <ServicesSection />
    </HomePageShell>
  );
}

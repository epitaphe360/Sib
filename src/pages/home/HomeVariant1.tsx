/** P1 — BATIMAT Classic : parcours salon complet, sections alternées */
import { HeroSection } from '../../components/home/HeroSection';
import { StatsSection } from '../../components/home/StatsSection';
import { ThemesSection } from '../../components/home/ThemesSection';
import { AboutSalonSection } from '../../components/home/AboutSalonSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { SponsorSpotlight } from '../../components/home/SponsorSpotlight';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { NetworkingSection } from '../../components/home/NetworkingSection';
import { ServicesSection } from '../../components/home/ServicesSection';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';

export default function HomeVariant1() {
  return (
    <HomePageShell variantId={1} className="bg-[var(--color-bg)]">
      <HeroSection />
      <StatsSection />
      <HomeFigmaCoreSections />
      <ThemesSection />
      <HomeVisitorExhibitSection />
      <AboutSalonSection />
      <HomeHighlightsSection />
      <SponsorSpotlight />
      <HomeLogoMarqueeSection />
      <UrbaEventBanner />
      <div id="badges" className="scroll-mt-28">
        <HomeBadgeSection />
      </div>
      <LatestNewsSection />
      <NetworkingSection />
      <ServicesSection />
    </HomePageShell>
  );
}

/** P4 — Split Navy — Design Master */
import { ThemesSection } from '../../components/home/ThemesSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { SponsorSpotlight } from '../../components/home/SponsorSpotlight';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';
import { MasterHeroSection } from '../../components/home/master/MasterHeroSection';
import { MasterStatsBento } from '../../components/home/master/MasterStatsBento';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';

export default function HomeVariant4() {
  return (
    <HomePageShell variantId={4} className="bg-[var(--color-bg)]">
      <MasterHeroSection variant="split" />
      <MasterStatsBento variant="split" />
      <HomeFigmaCoreSections />
      <MasterScrollReveal>
        <ThemesSection />
      </MasterScrollReveal>
      <HomeVisitorExhibitSection />
      <HomeHighlightsSection />
      <SponsorSpotlight />
      <HomeLogoMarqueeSection />
      <UrbaEventBanner />
      <HomeBadgeSection />
      <LatestNewsSection />
    </HomePageShell>
  );
}

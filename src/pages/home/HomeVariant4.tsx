/** P4 — Split Navy : hero 50/50, parcours condensé haut de gamme */
import { StatsSection } from '../../components/home/StatsSection';
import { ThemesSection } from '../../components/home/ThemesSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { SponsorSpotlight } from '../../components/home/SponsorSpotlight';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { HomeHeroSplitNavy } from '../../components/home/variants/HomeHeroSplitNavy';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';

export default function HomeVariant4() {
  return (
    <HomePageShell variantId={4} className="bg-[var(--color-bg)]">
      <HomeHeroSplitNavy />
      <StatsSection />
      <HomeFigmaCoreSections />
      <ThemesSection />
      <HomeVisitorExhibitSection />
      <HomeHighlightsSection />
      <SponsorSpotlight />
      <HomeLogoMarqueeSection />
      <UrbaEventBanner />
      <div id="badges" className="scroll-mt-28">
        <HomeBadgeSection />
      </div>
      <LatestNewsSection />
    </HomePageShell>
  );
}

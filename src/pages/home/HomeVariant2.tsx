/** P2 — BIG5 Mega : hero massif + chiffres + filières + billetterie */
import { StatsSection } from '../../components/home/StatsSection';
import { ThemesSection } from '../../components/home/ThemesSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { SponsorSpotlight } from '../../components/home/SponsorSpotlight';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { HomeHeroBig5 } from '../../components/home/variants/HomeHeroBig5';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';

export default function HomeVariant2() {
  return (
    <HomePageShell variantId={2} className="bg-white dark:bg-neutral-950">
      <HomeHeroBig5 />
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

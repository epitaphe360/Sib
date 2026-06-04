/** P7 — World Class : hero éditorial, parcours épuré, contenu riche */
import { ThemesSection } from '../../components/home/ThemesSection';
import { FeaturedPartners } from '../../components/home/FeaturedPartners';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { NetworkingSection } from '../../components/home/NetworkingSection';
import { HomeHeroWorldClass } from '../../components/home/variants/HomeHeroWorldClass';
import { HomeWorldClassPillars } from '../../components/home/variants/HomeWorldClassPillars';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';
import { StatsSection } from '../../components/home/StatsSection';

export default function HomeVariant7() {
  return (
    <HomePageShell variantId={7} className="bg-neutral-50 dark:bg-neutral-950">
      <HomeHeroWorldClass />
      <StatsSection />
      <HomeWorldClassPillars />
      <ThemesSection />
      <HomeVisitorExhibitSection />
      <FeaturedPartners />
      <HomeLogoMarqueeSection />
      <UrbaEventBanner />
      <div id="badges" className="scroll-mt-28">
        <HomeBadgeSection />
      </div>
      <LatestNewsSection />
      <NetworkingSection />
    </HomePageShell>
  );
}

/** P5 — Minimal Line : peu de blocs, typographie aérée */
import { StatsSection } from '../../components/home/StatsSection';
import { ThemesSection } from '../../components/home/ThemesSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { HomeHeroMinimal } from '../../components/home/variants/HomeHeroMinimal';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';

export default function HomeVariant5() {
  return (
    <HomePageShell variantId={5} className="bg-white dark:bg-neutral-950">
      <HomeHeroMinimal />
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#F39200]/40 to-transparent my-4" />
      </div>
      <StatsSection />
      <HomeFigmaCoreSections />
      <ThemesSection />
      <HomeVisitorExhibitSection />
      <HomeHighlightsSection />
      <HomeLogoMarqueeSection />
      <UrbaEventBanner />
      <div id="badges" className="scroll-mt-28 border-t border-neutral-200 dark:border-neutral-800 mt-8">
        <HomeBadgeSection />
      </div>
    </HomePageShell>
  );
}

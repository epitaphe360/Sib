/** P3 — CONSTRUMAT Grid : cartes pour contenu clair, bandeaux sombres pleine largeur */
import { HeroSection } from '../../components/home/HeroSection';
import { StatsSection } from '../../components/home/StatsSection';
import { ThemesSection } from '../../components/home/ThemesSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';

const lightCard =
  'home-card-lift rounded-2xl overflow-hidden border border-neutral-200/90 dark:border-neutral-700 shadow-lg bg-white dark:bg-neutral-950';

export default function HomeVariant3() {
  return (
    <HomePageShell variantId={3} className="bg-neutral-100/90 dark:bg-neutral-900">
      <HeroSection />
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="home-card-lift rounded-2xl overflow-hidden shadow-xl ring-1 ring-neutral-300/50 dark:ring-neutral-600">
          <StatsSection />
        </div>
      </div>
      <HomeFigmaCoreSections />
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className={lightCard}>
          <ThemesSection />
        </div>
        <div className={lightCard}>
          <HomeVisitorExhibitSection />
        </div>
        <div className="home-card-lift rounded-2xl overflow-hidden shadow-xl ring-1 ring-primary-700/25">
          <HomeHighlightsSection />
        </div>
        <HomeLogoMarqueeSection />
        <div className={lightCard}>
          <UrbaEventBanner />
        </div>
        <div id="badges" className={`scroll-mt-28 ${lightCard}`}>
          <HomeBadgeSection />
        </div>
      </div>
    </HomePageShell>
  );
}

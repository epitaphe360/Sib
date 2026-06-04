/** P6 — Glass Light : verre dépoli sur sections claires */
import { HeroSection } from '../../components/home/HeroSection';
import { StatsSection } from '../../components/home/StatsSection';
import { ThemesSection } from '../../components/home/ThemesSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { GlassSection } from '../../components/home/variants/GlassSection';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';

export default function HomeVariant6() {
  return (
    <HomePageShell
      variantId={6}
      className="bg-gradient-to-b from-sky-50/80 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950"
    >
      <HeroSection />
      <StatsSection />
      <HomeFigmaCoreSections />
      <GlassSection>
        <ThemesSection />
      </GlassSection>
      <GlassSection>
        <HomeVisitorExhibitSection />
      </GlassSection>
      <HomeHighlightsSection />
      <HomeLogoMarqueeSection />
      <GlassSection>
        <UrbaEventBanner />
      </GlassSection>
      <GlassSection>
        <div id="badges" className="scroll-mt-28">
          <HomeBadgeSection />
        </div>
      </GlassSection>
    </HomePageShell>
  );
}

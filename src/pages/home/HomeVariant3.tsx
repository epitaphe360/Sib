/** P3 — Bento Grid — Design Master */
import { ThemesSection } from '../../components/home/ThemesSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';
import { MasterHeroSection } from '../../components/home/master/MasterHeroSection';
import { MasterStatsBento } from '../../components/home/master/MasterStatsBento';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';
import { MasterGlassCard } from '../../components/home/master/MasterGlassCard';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';

export default function HomeVariant3() {
  return (
    <HomePageShell variantId={3} className="bg-[#ECECE8]">
      <MasterHeroSection variant="bento" />
      <MasterStatsBento variant="bento" />
      <HomeFigmaCoreSections />
      <div className="max-w-container mx-auto px-6 lg:px-8 py-8 space-y-10">
        <MasterScrollReveal>
          <MasterGlassCard light className="overflow-hidden">
            <ThemesSection />
          </MasterGlassCard>
        </MasterScrollReveal>
        <MasterScrollReveal delay={0.06}>
          <MasterGlassCard light className="overflow-hidden">
            <HomeVisitorExhibitSection />
          </MasterGlassCard>
        </MasterScrollReveal>
      </div>
      <div className="max-w-container mx-auto px-6 lg:px-8 py-4">
        <MasterScrollReveal delay={0.06}>
          <MasterGlassCard light className="overflow-hidden">
            <HomeHighlightsSection />
          </MasterGlassCard>
        </MasterScrollReveal>
      </div>
      <div className="max-w-container mx-auto px-6 lg:px-8 pb-12">
        <MasterScrollReveal delay={0.04}>
          <MasterGlassCard light className="overflow-hidden mb-10">
            <UrbaEventBanner />
          </MasterGlassCard>
        </MasterScrollReveal>
        <HomeBadgeSection />
      </div>
    </HomePageShell>
  );
}

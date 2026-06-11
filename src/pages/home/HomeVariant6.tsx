/** P6 — Glass Light — Design Master */
import { ThemesSection } from '../../components/home/ThemesSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { HomeComplianceSections } from '../../components/home/HomeComplianceSections';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';
import { MasterHeroSection } from '../../components/home/master/MasterHeroSection';
import { MasterStatsBento } from '../../components/home/master/MasterStatsBento';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';
import { MasterGlassCard } from '../../components/home/master/MasterGlassCard';

export default function HomeVariant6() {
  return (
    <HomePageShell
      variantId={6}
      className="bg-gradient-to-b from-sky-50/80 via-white to-[#ECECE8]"
    >
      <MasterHeroSection variant="glass" />
      <MasterStatsBento variant="glass" />
      <HomeFigmaCoreSections />
      <div className="max-w-container mx-auto px-6 lg:px-8 space-y-10 py-4">
        <MasterScrollReveal>
          <MasterGlassCard light>
            <ThemesSection />
          </MasterGlassCard>
        </MasterScrollReveal>
        <MasterScrollReveal delay={0.06}>
          <MasterGlassCard light>
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
      <HomeComplianceSections />
      <div className="max-w-container mx-auto px-6 lg:px-8 pb-12 space-y-10">
        <HomeBadgeSection />
      </div>
    </HomePageShell>
  );
}

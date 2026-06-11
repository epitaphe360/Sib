/** P7 — World Class + urgence FOMO — Design Master */
import { ThemesSection } from '../../components/home/ThemesSection';
import { SponsorSpotlight } from '../../components/home/SponsorSpotlight';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { NetworkingSection } from '../../components/home/NetworkingSection';
import { PremiumHomeHero } from '../../components/home/master/PremiumHomeHero';
import { MasterStatsBento } from '../../components/home/master/MasterStatsBento';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';
import { HomeWorldClassPillars } from '../../components/home/variants/HomeWorldClassPillars';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';
import { P7UrgencySection } from '../../components/home/variants/P7UrgencySection';

export default function HomeVariant7() {
  return (
    <HomePageShell variantId={7} className="bg-neutral-50 dark:bg-neutral-950">
      <PremiumHomeHero variant="worldclass" />
      <MasterStatsBento variant="worldclass" />
      <HomeWorldClassPillars />
      <P7UrgencySection />
      <MasterScrollReveal>
        <ThemesSection />
      </MasterScrollReveal>
      <HomeVisitorExhibitSection />
      <SponsorSpotlight />
      <HomeLogoMarqueeSection />
      <UrbaEventBanner />
      <HomeBadgeSection />
      <LatestNewsSection />
      <NetworkingSection />
    </HomePageShell>
  );
}

/**
 * Page d'accueil SIB 40 ans — maquette Manus HTML intégrée en React.
 * /accueil/40ans
 */
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { HomeComplianceSections } from '../../components/home/HomeComplianceSections';
import { MasterScrollReveal } from '../../components/home/master/MasterScrollReveal';
import {
  Sib40CtaBanner,
  Sib40Footer,
  Sib40HeroSection,
  Sib40InternationalSection,
  Sib40MissionSection,
  Sib40ServicesGrid,
  Sib40StatsBar,
  Sib40TimelineSection,
} from '../../components/home/sib40/Sib40Sections';
import '../../components/home/sib40/sib40.css';

export default function Sib40HomePage() {
  return (
    <div className="dm-home sib40-page min-h-screen overflow-x-hidden">
      <Sib40HeroSection />
      <Sib40StatsBar />
      <HomeComplianceSections />
      <MasterScrollReveal>
        <Sib40MissionSection />
      </MasterScrollReveal>
      <MasterScrollReveal delay={0.08}>
        <Sib40TimelineSection />
      </MasterScrollReveal>
      <Sib40ServicesGrid />
      <HomeBadgeSection />
      <Sib40InternationalSection />
      <Sib40CtaBanner />
      <Sib40Footer />
    </div>
  );
}

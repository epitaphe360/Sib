/** P1 — Lead Magnet : capture de leads optimisée avec formulaire et témoignages */
import { HeroSection } from '../../components/home/HeroSection';
import { StatsSection } from '../../components/home/StatsSection';
import { ThemesSection } from '../../components/home/ThemesSection';
import { AboutSalonSection } from '../../components/home/AboutSalonSection';
import { HomeVisitorExhibitSection } from '../../components/home/HomeVisitorExhibitSection';
import { HomeHighlightsSection } from '../../components/home/HomeHighlightsSection';
import { SponsorSpotlight } from '../../components/home/SponsorSpotlight';
import { UrbaEventBanner } from '../../components/home/UrbaEventBanner';
import { HomeBadgeSection } from '../../components/home/HomeBadgeSection';
import { LatestNewsSection } from '../../components/home/LatestNewsSection';
import { NetworkingSection } from '../../components/home/NetworkingSection';
import { ServicesSection } from '../../components/home/ServicesSection';
import { HomeLogoMarqueeSection } from '../../components/home/HomeLogoMarqueeSection';
import { HomePageShell } from '../../components/home/HomePageShell';
import { HomeFigmaCoreSections } from '../../components/home/HomeFigmaCoreSections';
import { P1LeadMagnetForm } from '../../components/home/variants/P1LeadMagnetForm';
import { P1TestimonialsSection } from '../../components/home/variants/P1TestimonialsSection';

export default function HomeVariant1() {
  return (
    <HomePageShell variantId={1} className="bg-[var(--color-bg)]">
      <HeroSection />
      <StatsSection />
      <HomeFigmaCoreSections />
      <ThemesSection />
      <HomeVisitorExhibitSection />
      <AboutSalonSection />
      <HomeHighlightsSection />
      <SponsorSpotlight />
      <HomeLogoMarqueeSection />
      <UrbaEventBanner />

      {/* P1 Lead Magnet Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="max-w-container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Guide complet du SIB 2026
              </h2>
              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                Téléchargez notre guide exclusif et recevez les dernières actualités du salon. Accédez aux informations essentielles pour préparer votre visite ou votre participation.
              </p>
              <ul className="space-y-3">
                {[
                  'Présentation des pavillons et exposants',
                  'Programme complet des conférences',
                  'Guide pratique et infos déplacements',
                  'Opportunités de networking B2B',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-accent-400"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <P1LeadMagnetForm />
            </div>
          </div>
        </div>
      </section>

      <P1TestimonialsSection />

      <div id="badges" className="scroll-mt-28">
        <HomeBadgeSection />
      </div>
      <LatestNewsSection />
      <NetworkingSection />
      <ServicesSection />
    </HomePageShell>
  );
}

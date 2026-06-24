import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Globe, Ruler, Calendar, MapPin, Clock, Download, Award } from 'lucide-react';
import PublicPageLayout from '../../components/layout/PublicPageLayout';
import { SibPublicHero } from '../../components/ui/SibPublicHero';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard,
  AnimatedCounter, fadeUp, fadeLeft, fadeRight, scaleUp,
} from '../../components/ui/motion';
import { useTranslation } from '../../hooks/useTranslation';
import { resolveHomeImage } from '../../config/sibMaRemoteUrls';
import { IMAGES, img } from '../../lib/images';

const PRESENTATION_VENUE_IMAGE = resolveHomeImage('/sib-ma/static/hero.jpg');
const PRESENTATION_VENUE_FALLBACK = img(IMAGES.morocco.eljadida, 1200, 800);

const defaultOrganisateurs = [
  { name: 'Ministère MUAT', role: 'Organisateur', desc: "Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville" },
  { name: 'AMDIE', role: 'Organisateur', desc: "Agence Marocaine de Développement des Investissements et des Exportations" },
  { name: 'FMC', role: 'Co-organisateur', desc: "Fédération des Industries des Matériaux de Construction" },
  { name: 'FNBTP', role: 'Co-organisateur', desc: 'Fédération Nationale du Bâtiment et des Travaux Publics' },
  { name: 'URBACOM', role: 'Organisateur délégué', desc: "1ʳᵉ agence conseil en communication et événementiel, gestion déléguée depuis 2006" },
  { name: 'LAP', role: 'Sponsor officiel (exposant)', desc: "La qualité de l'appareillage — exposant et sponsor officiel du SIB 2026" },
];

export default function PresentationPage() {
  const [showMore, setShowMore] = React.useState(false);
  const [videoPlaying, setVideoPlaying] = React.useState(false);
  const cms = usePageContent('presentation');
  const { t } = useTranslation();

  const getCms = (key: string, fallback: string) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const organisateurs = defaultOrganisateurs.map((org, idx) => ({
    name: getCms(`org_${idx + 1}_name`, org.name),
    role: getCms(`org_${idx + 1}_role`, org.role),
    desc: getCms(`org_${idx + 1}_desc`, org.desc),
  }));

  const stats = [
    {
      icon: Building2,
      value: getCms('stat_exposants', '600'),
      label: getCms('stat_exposants_label', 'Exposants'),
      sub: getCms('stat_exposants_sub', '1 500 marques représentées'),
    },
    {
      icon: Users,
      value: getCms('stat_visiteurs', '200 000'),
      label: getCms('stat_visiteurs_label', 'Visiteurs'),
      sub: getCms('stat_visiteurs_sub', 'professionnels & grand public'),
    },
    {
      icon: Globe,
      value: getCms('stat_pays', '50'),
      label: getCms('stat_pays_label', 'Pays'),
      sub: getCms('stat_pays_sub', 'représentés'),
    },
    {
      icon: Ruler,
      value: getCms('stat_surface', '35 000 m²'),
      label: getCms('stat_surface_label', 'Surface'),
      sub: getCms('stat_surface_sub', "d'exposition"),
    },
  ];

  const defaultAboutParagraphs = [
    "Le Salon International du Bâtiment – SIB revient pour sa 20e édition, célébrant ainsi ses 40 années d'existence. Ce salon incontournable se déroulera du 25 au 29 novembre 2026 au Parc d'Exposition Mohammed VI d'El Jadida.",
    "Fondé en 1986, le SIB s'est imposé comme le rendez-vous biennal de référence du secteur du bâtiment au Maroc et en Afrique. Il réunit 600 exposants et 1 500 marques internationales autour d'un même objectif : construire l'avenir. Avec 200 000 visiteurs professionnels, 50 pays représentés, 300 rencontres B2B planifiées via URBA EVENT et 35 000 m² d'exposition, le SIB s'impose comme le hub africain de la construction et de l'innovation.",
    "Organisé par le Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville et l'Agence Marocaine de Développement des Investissements et des Exportations – AMDIE, et co-organisé par la Fédération des Industries des Matériaux de Construction – FMC et la Fédération Nationale du Bâtiment et des Travaux Publics – FNBTP, URBACOM en assure la gestion déléguée depuis 2006, garantissant la continuité, la qualité et la modernisation du salon à travers les années.",
    "Au-delà de sa portée nationale, le SIB s'impose aujourd'hui comme le grand rendez-vous africain du bâtiment et des matériaux de construction, un espace où convergent les expertises du continent. Le salon propose 2 espaces de démonstration, 30 applications techniques, 20 conférences animées par des experts marocains et internationaux, ainsi que des espaces thématiques : SIB Academy, SIB Recrutement, SIB TV, Espace B2B et Espace Démonstration.",
  ];

  const cmsParagraphs = (cms.about_text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const aboutParagraphs = cmsParagraphs.length >= 2 ? cmsParagraphs : defaultAboutParagraphs;
  const previewParagraphs = aboutParagraphs.slice(0, 2);
  const extraParagraphs = aboutParagraphs.slice(2);

  return (
    <PublicPageLayout>
      <SibPublicHero
        eyebrow={t('presentation.badge') || 'SIB 2026'}
        align="left"
        title={cms.hero_title || 'Salon International du Bâtiment'}
        subtitle={
          cms.hero_subtitle ||
          "Depuis 1986, le SIB s'impose comme le rendez-vous incontournable du bâtiment, des matériaux et de la construction en Afrique. Pour sa 20ème édition, le SIB 2026 célèbre 40 ans d'histoire, d'innovation et de rencontres."
        }
      >
        <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sib-orange" />
            {getCms('hero_date', '25 - 29 Novembre 2026')}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sib-orange" />
            {getCms('hero_location', "Parc d'Exposition Mohammed VI, El Jadida")}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sib-orange" />
            {getCms('hero_hours', '9h00 - 19h00')}
          </span>
        </div>
      </SibPublicHero>

      {/* Chiffres clés */}
      <div className="sib-v4-container -mt-14 md:-mt-16 relative z-20 mb-4">
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <HoverCard className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 h-full">
                <s.icon className="w-8 h-8 text-sib-orange mx-auto mb-3" />
                <AnimatedCounter value={s.value} className="text-3xl font-bold text-sib-navy block" />
                <div className="text-sm font-semibold text-gray-900 mt-1">{s.label}</div>
                <div className="text-xs text-gray-500">{s.sub}</div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Présentation */}
      <div className="sib-v4-container py-16 md:py-20">
        <ScrollReveal variant={fadeLeft}>
          <h2 className="sib-v4-section-title mb-10">
            {getCms('about_title', 'Le Salon International du Bâtiment')}
          </h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8 lg:items-stretch">
          <ScrollReveal variant={fadeRight}>
            <div className="relative h-full min-h-[420px] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              {videoPlaying ? (
                <iframe
                  src="https://www.youtube.com/embed/Q5WupuWDju0?autoplay=1&rel=0&modestbranding=1"
                  title="SIB 2026 ? Présentation officielle"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                />
              ) : (
                <>
                  <img
                    src={getCms('about_image', PRESENTATION_VENUE_IMAGE)}
                    alt="Parc d'Exposition Mohammed VI - El Jadida"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== PRESENTATION_VENUE_FALLBACK) {
                        target.src = PRESENTATION_VENUE_FALLBACK;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sib-navy/80 via-sib-navy/20 to-transparent" />

                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                    aria-label={t('presentation.play_video')}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 shadow-xl">
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                </>
              )}

              <div className="absolute top-5 left-5 z-10 rounded-full bg-sib-orange text-white px-4 py-1.5 text-sm font-semibold shadow-lg pointer-events-none">
                {getCms('image_badge_date', '25-29 Novembre 2026')}
              </div>

              {!videoPlaying && (
                <div className="absolute bottom-5 left-5 right-5 z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 pointer-events-none">
                  <div className="bg-white/95 rounded-xl px-3 py-2 shadow">
                    <div className="flex items-center gap-2 text-sib-navy font-semibold text-sm">
                      <MapPin className="w-4 h-4 text-sib-orange" />
                      {getCms('image_location_label', 'Emplacement')}
                    </div>
                    <p className="text-xs text-gray-600">
                      {getCms('image_location_value', "Parc d'Exposition Mohammed VI - EL JADIDA")}
                    </p>
                  </div>
                  <div className="bg-white/95 rounded-xl px-3 py-2 shadow">
                    <div className="flex items-center gap-2 text-sib-navy font-semibold text-sm">
                      <Calendar className="w-4 h-4 text-sib-orange" />
                      {getCms('image_date_label', 'Date')}
                    </div>
                    <p className="text-xs text-gray-600">
                      {getCms('image_date_value', 'Du 25 au 29 Novembre 2026')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-gray-700 space-y-5 h-full">
              {previewParagraphs.map((paragraph, idx) => (
                <p key={`preview-${idx}`} className="leading-relaxed">{paragraph}</p>
              ))}

              {showMore && extraParagraphs.map((paragraph, idx) => (
                <p key={`extra-${idx}`} className="leading-relaxed">{paragraph}</p>
              ))}

              {extraParagraphs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowMore((prev) => !prev)}
                  className="inline-flex items-center rounded-full border border-sib-orange/30 px-4 py-2 text-sm font-semibold text-sib-navy hover:bg-sib-orange/5 transition-colors"
                >
                  {showMore ? getCms('about_read_less', 'Réduire') : getCms('about_read_more', 'Savoir plus')}
                </button>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Entrée gratuite */}
      <div className="bg-sib-navy py-14">
        <div className="sib-v4-container text-center">
          <ScrollReveal variant={scaleUp}>
            <Award className="w-12 h-12 text-sib-orange mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2 font-display">
              {getCms('free_entry_title', 'Entrée Gratuite')}
            </h3>
            <p className="text-white/75 max-w-xl mx-auto">
              {getCms(
                'free_entry_text',
                "L'accès au salon est entièrement gratuit. Un badge électronique est requis et peut être obtenu en ligne ou sur place."
              )}
            </p>
            <Link to={ROUTES.VISITOR_FREE_REGISTRATION} className="sib-v4-btn-orange mt-6 shadow-lg">
              {getCms('free_entry_cta', 'Obtenez votre badge')}
            </Link>
          </ScrollReveal>
        </div>
      </div>

      {/* Organisateurs */}
      <div className="sib-v4-container py-16 md:py-20">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-sib-navy mb-10 text-center font-display">
            {getCms('organizers_title', 'Organisateurs')}
          </h2>
        </ScrollReveal>
        <StaggerReveal className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {organisateurs.map((org) => (
            <StaggerItem key={org.name}>
              <HoverCard className="relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1 bg-sib-orange" />

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sib-navy text-white font-bold">
                  {org.name.slice(0, 2)}
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-sib-orange/10 text-sib-navy text-xs font-semibold mb-3 border border-sib-orange/20">
                  {org.role}
                </span>

                <h4 className="font-bold text-gray-900 mb-2 tracking-tight">{org.name}</h4>
                <p className="text-xs leading-relaxed text-gray-600">{org.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Brochure */}
      <div className="bg-sib-orange py-14">
        <div className="sib-v4-container text-center">
          <ScrollReveal variant={fadeUp}>
            <h3 className="text-2xl font-bold mb-4 font-display text-white">
              {getCms('brochure_title', 'Téléchargez la brochure SIB 2026')}
            </h3>
            <p className="text-white/85 mb-6 max-w-xl mx-auto">
              {getCms(
                'brochure_text',
                'Retrouvez toutes les informations essentielles sur le salon, le programme et les modalités de participation.'
              )}
            </p>
            <a
              href={getCms('brochure_url', 'https://sib.ma/backend/uploads/Brochure_SIB_2026_F_3175004ace.pdf')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sib-navy text-white rounded-lg font-semibold hover:bg-sib-navy/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              {getCms('brochure_cta', 'Brochure SIB 2026 (PDF)')}
            </a>
          </ScrollReveal>
        </div>
      </div>
    </PublicPageLayout>
  );
}

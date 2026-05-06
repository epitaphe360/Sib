import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Globe, Ruler, Calendar, MapPin, Clock, Download, Award } from 'lucide-react';
import { PageHero } from '../../components/ui/PageHero';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard,
  AnimatedCounter, fadeUp, fadeLeft, fadeRight, scaleUp,
} from '../../components/ui/motion';
import { useTranslation } from '../../hooks/useTranslation';

const defaultOrganisateurs = [
  { name: 'Minist�re MUAT', role: 'Organisateur', desc: "Minist�re de l'Am�nagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville" },
  { name: 'AMDIE', role: 'Organisateur', desc: "Agence Marocaine de D�veloppement des Investissements et des Exportations" },
  { name: 'FMC', role: 'Co-organisateur', desc: "F�d�ration des Industries des Mat�riaux de Construction" },
  { name: 'FNBTP', role: 'Co-organisateur', desc: 'F�d�ration Nationale du B�timent et des Travaux Publics' },
  { name: 'URBACOM', role: 'Organisateur d�l�gu�', desc: '1?? agence conseil en communication et �v�nementiel, gestion d�l�gu�e depuis 2006' },
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
      sub: getCms('stat_exposants_sub', '1 500 marques repr�sent�es')
    },
    {
      icon: Users,
      value: getCms('stat_visiteurs', '200 000'),
      label: getCms('stat_visiteurs_label', 'Visiteurs'),
      sub: getCms('stat_visiteurs_sub', 'professionnels & grand public')
    },
    {
      icon: Globe,
      value: getCms('stat_pays', '50'),
      label: getCms('stat_pays_label', 'Pays'),
      sub: getCms('stat_pays_sub', 'repr�sent�s')
    },
    {
      icon: Ruler,
      value: getCms('stat_surface', '35 000 m�'),
      label: getCms('stat_surface_label', 'Surface'),
      sub: getCms('stat_surface_sub', "d'exposition")
    },
  ];

  const defaultAboutParagraphs = [
    "Le Salon International du B�timent � SIB revient pour sa 20? �dition, c�l�brant ainsi ses 40 ann�es d'existence. Ce salon incontournable se d�roulera du 25 au 29 novembre 2026 au Parc d'Exposition Mohammed VI d'El Jadida.",
    "Fond� en 1986, le SIB s'est impos� comme le rendez-vous biennal de r�f�rence du secteur du b�timent au Maroc et en Afrique. Il r�unit 600 exposants et 1 500 marques internationales autour d'un m�me objectif : construire l'avenir. Avec 200 000 visiteurs professionnels, 50 pays repr�sent�s, 300 rencontres B2B planifi�es via URBA EVENT et 35 000 m� d'exposition, le SIB s'impose comme le hub africain de la construction et de l'innovation.",
    "Organis� par le Minist�re de l'Am�nagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville et l'Agence Marocaine de D�veloppement des Investissements et des Exportations � AMDIE, et co-organis� par la F�d�ration des Industries des Mat�riaux de Construction � FMC et la F�d�ration Nationale du B�timent et des Travaux Publics � FNBTP, URBACOM en assure la gestion d�l�gu�e depuis 2006, garantissant la continuit�, la qualit� et la modernisation du salon � travers les ann�es.",
    "Au-del� de sa port�e nationale, le SIB s'impose aujourd'hui comme le grand rendez-vous africain du b�timent et des mat�riaux de construction, un espace o� convergent les expertises du continent. Le salon propose 2 espaces de d�monstration, 30 applications techniques, 20 conf�rences anim�es par des experts marocains et internationaux, ainsi que des espaces th�matiques : SIB Academy, SIB Recrutement, SIB TV, Espace B2B et Espace D�monstration.",
  ];

  const cmsParagraphs = (cms.about_text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // N'utiliser le contenu CMS que s'il contient au moins 2 paragraphes complets (�vite d'afficher un placeholder tronqu�)
  const aboutParagraphs = cmsParagraphs.length >= 2 ? cmsParagraphs : defaultAboutParagraphs;
  const previewParagraphs = aboutParagraphs.slice(0, 2);
  const extraParagraphs = aboutParagraphs.slice(2);
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <PageHero
        badge={<><Building2 className="w-4 h-4 text-yellow-300" /><span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">{t('presentation.badge')}</span></>}
        title={cms.hero_title || 'Salon International du Bâtiment'}
        subtitle={cms.hero_subtitle || "Depuis 1986, le SIB s'impose comme le rendez-vous incontournable du bâtiment, des matériaux et de la construction en Afrique. Pour sa 20ème édition, le SIB 2026 célèbre 40 ans d'histoire, d'innovation et de rencontres."}
        actions={
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-yellow-300" />{getCms('hero_date', '25 - 29 Novembre 2026')}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-yellow-300" />{getCms('hero_location', "Parc d'Exposition Mohammed VI, El Jadida")}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-300" />{getCms('hero_hours', '9h00 - 19h00')}</span>
          </div>
        }
        py="py-16 md:py-24"
      />
{/* Chiffres cl�s */}
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <HoverCard className="bg-white rounded-xl shadow-lg p-6 text-center border border-slate-200 h-full">
                <s.icon className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <AnimatedCounter value={s.value} className="text-3xl font-bold text-indigo-800 block" />
                <div className="text-sm font-semibold text-slate-900 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500">{s.sub}</div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Pr�sentation */}
      <div className="relative container mx-auto px-4 py-20 bg-gradient-to-b from-indigo-900 to-slate-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant={fadeLeft}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 font-display text-center lg:text-left">{getCms('about_title', 'Le Salon International du B�timent')}</h2>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8 lg:items-stretch">
            <ScrollReveal variant={fadeRight}>
              <div className="relative h-full min-h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                {videoPlaying ? (
                  <iframe
                    src="https://www.youtube.com/embed/Q5WupuWDju0?autoplay=1&rel=0&modestbranding=1"
                    title="SIB 2026 � Pr�sentation officielle"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  />
                ) : (
                  <>
                    <img
                      src="/parc-exposition-eljadida.jpg"
                      alt="Parc d'Exposition Mohammed VI - El Jadida"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-indigo-900/20 to-transparent" />

                    {/* Bouton play */}
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

                <div className="absolute top-5 left-5 z-10 rounded-full bg-yellow-400/90 text-indigo-800 px-4 py-1.5 text-sm font-semibold shadow-lg pointer-events-none">
                  {getCms('image_badge_date', '25-29 Novembre 2026')}
                </div>

                {!videoPlaying && (
                  <div className="absolute bottom-5 left-5 right-5 z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 pointer-events-none">
                    <div className="bg-white/90 rounded-xl px-3 py-2 shadow">
                      <div className="flex items-center gap-2 text-indigo-800 font-semibold text-sm">
                        <MapPin className="w-4 h-4 text-yellow-500" />
                        {getCms('image_location_label', 'Emplacement')}
                      </div>
                      <p className="text-xs text-slate-600">{getCms('image_location_value', "Parc d'Exposition Mohammed VI - EL JADIDA")}</p>
                    </div>
                    <div className="bg-white/90 rounded-xl px-3 py-2 shadow">
                      <div className="flex items-center gap-2 text-indigo-800 font-semibold text-sm">
                        <Calendar className="w-4 h-4 text-yellow-500" />
                        {getCms('image_date_label', 'Date')}
                      </div>
                      <p className="text-xs text-slate-600">{getCms('image_date_value', 'Du 25 au 29 Novembre 2026')}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-gray-700 space-y-5">
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
                    className="inline-flex items-center rounded-full border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    {showMore ? getCms('about_read_less', 'R�duire') : getCms('about_read_more', 'Savoir plus')}
                  </button>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Entr�e gratuite */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 py-14">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal variant={scaleUp}>
            <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{getCms('free_entry_title', 'Entr�e Gratuite')}</h3>
            <p className="text-indigo-100 max-w-xl mx-auto">
              {getCms('free_entry_text', "L'acc�s au salon est enti�rement gratuit. Un badge �lectronique est requis et peut �tre obtenu en ligne ou sur place.")}
          </p>
          <Link
            to={ROUTES.BADGE}
            className="inline-block mt-6 px-6 py-3 bg-yellow-400 text-white rounded-lg font-semibold hover:bg-yellow-400/90 transition-colors"
          >
            {getCms('free_entry_cta', 'Obtenez votre badge')}
          </Link>
          </ScrollReveal>
        </div>
      </div>

      {/* Organisateurs */}
      <div className="container mx-auto px-4 py-20">
        <ScrollReveal><h2 className="text-3xl font-bold text-indigo-800 mb-8 font-display text-center">{getCms('organizers_title', 'Organisateurs')}</h2></ScrollReveal>
        <StaggerReveal className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {organisateurs.map((org, index) => (
            <StaggerItem key={org.name}>
              <HoverCard className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 via-yellow-400 to-indigo-700" />

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold shadow-lg shadow-blue-900/20">
                  {org.name.slice(0, 2)}
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-yellow-400/15 text-indigo-800 text-xs font-semibold mb-3 border border-yellow-400/30">
                  {org.role}
                </span>

                <h4 className="font-bold text-slate-900 mb-2 tracking-tight">{org.name}</h4>
                <p className="text-xs leading-relaxed text-slate-600">{org.desc}</p>

                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-yellow-400"
                    style={{ width: `${60 + (index % 5) * 8}%` }}
                  />
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Brochure */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-indigo-950 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal variant={fadeUp}>
            <h3 className="text-2xl font-bold mb-4 font-display">{getCms('brochure_title', 'T�l�chargez la brochure SIB 2026')}</h3>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              {getCms('brochure_text', 'Retrouvez toutes les informations essentielles sur le salon, le programme et les modalit�s de participation.')}
            </p>
            <a
              href={getCms('brochure_url', 'https://sib.ma/backend/uploads/Brochure_SIB_2026_F_3175004ace.pdf')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-indigo-800 rounded-lg font-semibold hover:bg-yellow-400/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              {getCms('brochure_cta', 'Brochure SIB 2026 (PDF)')}
            </a>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}


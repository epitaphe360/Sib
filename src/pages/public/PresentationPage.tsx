import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Globe, Ruler, Calendar, MapPin, Clock, Download, Award } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard,
  AnimatedCounter, HeroReveal, fadeUp, fadeLeft, fadeRight, scaleUp,
} from '../../components/ui/motion';

const organisateurs = [
  { name: 'Ministère MUAT', role: 'Organisateur', desc: "Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville" },
  { name: 'AMDIE', role: 'Organisateur', desc: "Agence Marocaine de Développement des Investissements et des Exportations" },
  { name: 'FMC', role: 'Co-organisateur', desc: "Fédération des Industries des Matériaux de Construction" },
  { name: 'FNBTP', role: 'Co-organisateur', desc: 'Fédération Nationale du Bâtiment et des Travaux Publics' },
  { name: 'URBACOM', role: 'Organisateur délégué', desc: '1ʳᵉ agence conseil en communication et événementiel, gestion déléguée depuis 2006' },
];

export default function PresentationPage() {
  const cms = usePageContent('presentation');
  const stats = [
    { icon: Building2, value: cms.stat_exposants || '600', label: 'Exposants', sub: '1 500 marques représentées' },
    { icon: Users, value: cms.stat_visiteurs || '200 000', label: 'Visiteurs', sub: 'professionnels & grand public' },
    { icon: Globe, value: cms.stat_pays || '50', label: 'Pays', sub: 'représentés' },
    { icon: Ruler, value: cms.stat_surface || '35 000 m²', label: 'Surface', sub: "d'exposition" },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sib-navy via-sib-navy/95 to-sib-navy/90 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <HeroReveal>
            <span className="inline-block px-4 py-1.5 rounded-full bg-sib-gold/20 text-sib-gold text-sm font-semibold mb-6">
              20ème Édition — 40 ans d'excellence
            </span>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              {cms.hero_title || 'Salon International du Bâtiment'}
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.3}>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              {cms.hero_subtitle || "Depuis 1986, le SIB s'impose comme le rendez-vous incontournable du bâtiment, des matériaux et de la construction en Afrique. Pour sa 20ᵉ édition, le SIB 2026 célèbre 40 ans d'histoire, d'innovation et de rencontres."}
            </p>
          </HeroReveal>
          <HeroReveal delay={0.45}>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sib-gold" /> 25 – 29 Novembre 2026</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sib-gold" /> Parc d'Exposition Mohammed VI, El Jadida</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-sib-gold" /> 9h00 – 19h00</span>
            </div>
          </HeroReveal>
        </div>
      </div>

      {/* Chiffres clés */}
      <div className="container mx-auto px-4 -mt-10">
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <HoverCard className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 h-full">
                <s.icon className="w-8 h-8 text-sib-gold mx-auto mb-3" />
                <AnimatedCounter value={s.value} className="text-3xl font-bold text-sib-navy block" />
                <div className="text-sm font-semibold text-gray-800 mt-1">{s.label}</div>
                <div className="text-xs text-gray-500">{s.sub}</div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Présentation */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant={fadeLeft}>
            <h2 className="text-3xl font-bold text-sib-navy mb-6 font-display">Le Salon International du Bâtiment</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="prose prose-lg text-gray-700 space-y-4">
            {cms.about_text ? (
              <p>{cms.about_text}</p>
            ) : (
              <>
            <p>
              Le <strong>Salon International du Bâtiment – SIB</strong> revient pour sa <strong>20ᵉ édition</strong>, célébrant
              ainsi ses <strong>40 années d'existence</strong>. Ce salon incontournable se déroulera du 25 au 29 novembre 2026
              au Parc d'Exposition Mohammed VI d'El Jadida.
            </p>
            <p>
              Fondé en 1986, le SIB s'est imposé comme le rendez-vous biennal de référence du secteur du bâtiment au Maroc
              et en Afrique. Il réunit <strong>600 exposants</strong> et <strong>1 500 marques</strong> internationales autour d'un
              même objectif : construire l'avenir. Avec <strong>200 000 visiteurs professionnels</strong>, <strong>50 pays représentés</strong>,
              <strong>300 rencontres B2B</strong> planifiées via <strong>URBA EVENT</strong> et <strong>35 000 m² d'exposition</strong>,
              le SIB s'impose comme le hub africain de la construction et de l'innovation.
            </p>
            <p>
              Organisé par le <strong>Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat
              et de la Politique de la Ville</strong> et l'<strong>Agence Marocaine de Développement des Investissements
              et des Exportations – AMDIE</strong>, et co-organisé par la <strong>Fédération des Industries des Matériaux
              de Construction – FMC</strong> et la <strong>Fédération Nationale du Bâtiment et des Travaux Publics – FNBTP</strong>,
              URBACOM en assure la gestion déléguée depuis 2006, garantissant la continuité, la qualité et la modernisation
              du salon à travers les années.
            </p>
            <p>
              Au-delà de sa portée nationale, le SIB s'impose aujourd'hui comme le grand rendez-vous africain du bâtiment et
              des matériaux de construction, un espace où convergent les expertises du continent. Le salon propose <strong>2
              espaces de démonstration</strong>, <strong>30 applications techniques</strong>, <strong>20 conférences</strong> animées
              par des experts marocains et internationaux, ainsi que des espaces thématiques : SIB Academy, SIB Recrutement,
              SIB TV, Espace B2B et Espace Démonstration.
            </p>
            </>
            )}
          </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Entrée gratuite */}
      <div className="bg-sib-gold/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal variant={scaleUp}>
            <Award className="w-12 h-12 text-sib-gold mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-sib-navy mb-2">Entrée Gratuite</h3>
            <p className="text-gray-600 max-w-xl mx-auto">
              L'accès au salon est entièrement gratuit. Un badge électronique est requis
              et peut être obtenu en ligne ou sur place.
          </p>
          <Link
            to={ROUTES.BADGE}
            className="inline-block mt-6 px-6 py-3 bg-sib-navy text-white rounded-lg font-semibold hover:bg-sib-navy/90 transition-colors"
          >
            Obtenez votre badge
          </Link>
          </ScrollReveal>
        </div>
      </div>

      {/* Organisateurs */}
      <div className="container mx-auto px-4 py-16">
        <ScrollReveal><h2 className="text-3xl font-bold text-sib-navy mb-8 font-display text-center">Organisateurs</h2></ScrollReveal>
        <StaggerReveal className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {organisateurs.map((org) => (
            <StaggerItem key={org.name}>
              <HoverCard className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center h-full">
                <span className="inline-block px-3 py-1 rounded-full bg-sib-navy/10 text-sib-navy text-xs font-semibold mb-3">
                  {org.role}
                </span>
                <h4 className="font-bold text-gray-900 mb-2">{org.name}</h4>
                <p className="text-xs text-gray-500">{org.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Brochure */}
      <div className="bg-sib-navy text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal variant={fadeUp}>
            <h3 className="text-2xl font-bold mb-4 font-display">Téléchargez la brochure SIB 2026</h3>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Retrouvez toutes les informations essentielles sur le salon, le programme et les modalités de participation.
            </p>
            <a
              href="https://sib.ma/backend/uploads/Brochure_SIB_2026_F_3175004ace.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sib-gold text-sib-navy rounded-lg font-semibold hover:bg-sib-gold/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              Brochure SIB 2026 (PDF)
            </a>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

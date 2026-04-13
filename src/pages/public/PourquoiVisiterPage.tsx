import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Network, GraduationCap, Gift, TrendingUp, Globe, MapPin, Calendar, Clock, Train, Car, Plane } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard,
  HeroReveal, fadeUp, fadeLeft, scaleUp,
} from '../../components/ui/motion';

const arguments_visiter = [
  { icon: Lightbulb, title: 'Découvrir les innovations', desc: 'Le salon offre une réponse complète aux besoins des particuliers et des professionnels dans un espace et un temps maîtrisé.' },
  { icon: Network, title: 'Networking & B2B', desc: '300 rencontres B2B planifiées via URBA EVENT. Rencontrez fournisseurs, fabricants et professionnels de votre secteur.' },
  { icon: GraduationCap, title: '20 conférences & SIB Academy', desc: 'Programme scientifique riche animé par des experts marocains et internationaux. Pôle formation avec académies et centres professionnels.' },
  { icon: Gift, title: 'Entrée gratuite', desc: 'L\'accès au salon est entièrement gratuit sur présentation d\'un badge électronique, d\'une invitation ou d\'une carte de visite professionnelle.' },
  { icon: TrendingUp, title: 'Faire son choix & concrétiser', desc: 'La meilleure manière de s\'informer, de faire son choix et de concrétiser dans les meilleures conditions tout investissement du secteur du BTP.' },
  { icon: Globe, title: '600 exposants, 50 pays', desc: 'Découvrez 1 500 marques venues de 50 pays avec 600 exposants, répartis sur 35 000 m².' },
];

const infos_pratiques = [
  { icon: Calendar, label: 'Dates', value: '25 – 29 Novembre 2026' },
  { icon: Clock, label: 'Horaires', value: '9h00 – 19h00' },
  { icon: MapPin, label: 'Lieu', value: 'Parc d\'Exposition Mohammed VI, El Jadida' },
  { icon: Gift, label: 'Entrée', value: 'Gratuite (badge requis)' },
];

const transports = [
  { icon: Train, title: 'Navettes gratuites SIB', desc: 'Navettes gratuites Casablanca ↔ Parc d\'Exposition Mohammed VI. Les points de pick-up seront confirmés ultérieurement.' },
  { icon: Train, title: 'Train ONCF', desc: 'Gare Azemmour — Parc d\'Expositions Mohammed VI (PEM6). Réduction de 30% sur tous les trains durant la période du salon.' },
  { icon: Car, title: 'En voiture', desc: '50 min depuis Casablanca via l\'autoroute Casa–El Jadida (sortie Azemmour) ou route nationale Azemmour–El Jadida. Parking 2 500 places.' },
  { icon: Plane, title: 'En avion', desc: '1h de route depuis l\'aéroport Mohammed V de Casablanca.' },
];

export default function PourquoiVisiterPage() {
  const cms = usePageContent('pourquoi-visiter');
  const arguments_visiter = [
    { icon: Lightbulb, title: cms.arg_1_title || 'Découvrir les innovations', desc: cms.arg_1_desc || "Le salon offre une réponse complète aux besoins des particuliers et des professionnels dans un espace et un temps maîtrisé." },
    { icon: Network, title: cms.arg_2_title || 'Networking & B2B', desc: cms.arg_2_desc || "300 rencontres B2B planifiées via URBA EVENT. Rencontrez fournisseurs, fabricants et professionnels de votre secteur." },
    { icon: GraduationCap, title: cms.arg_3_title || '20 conférences & SIB Academy', desc: cms.arg_3_desc || 'Un programme scientifique riche animé par des experts marocains et internationaux. Pôle formation avec académies, instituts et centres professionnels.' },
    { icon: Gift, title: cms.arg_4_title || 'Entrée gratuite', desc: cms.arg_4_desc || "L'accès au salon est entièrement gratuit sur présentation d'un badge électronique, d'une invitation ou d'une carte de visite professionnelle." },
    { icon: TrendingUp, title: cms.arg_5_title || 'Faire son choix & concrétiser', desc: cms.arg_5_desc || "La meilleure manière de s'informer, de faire son choix et de concrétiser dans les meilleures conditions tout investissement du secteur du BTP." },
    { icon: Globe, title: cms.arg_6_title || '600 exposants, 50 pays', desc: cms.arg_6_desc || 'Découvrez 1 500 marques venues de 50 pays avec 600 exposants, répartis sur 35 000 m².' },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sib-navy to-sib-navy/90 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <HeroReveal>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{cms.hero_title || 'Pourquoi Visiter le SIB ?'}</h1>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              {cms.hero_subtitle || '5 jours pour découvrir, apprendre et connecter avec les acteurs majeurs du bâtiment au Maroc et en Afrique.'}
            </p>
          </HeroReveal>
          <HeroReveal delay={0.3}>
            <Link
              to={ROUTES.BADGE}
              className="inline-flex items-center gap-2 px-8 py-4 bg-sib-gold text-sib-navy rounded-lg font-bold text-lg hover:bg-sib-gold/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              Obtenez votre badge gratuit
            </Link>
          </HeroReveal>
        </div>
      </div>

      {/* Arguments */}
      <div className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-sib-navy mb-10 text-center font-display">
            6 bonnes raisons de visiter
          </h2>
        </ScrollReveal>
        <StaggerReveal slow className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {arguments_visiter.map((arg, i) => (
            <StaggerItem key={i}>
              <HoverCard className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="w-14 h-14 rounded-xl bg-sib-navy/10 flex items-center justify-center mb-5">
                  <arg.icon className="w-7 h-7 text-sib-navy" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{arg.title}</h3>
                <p className="text-gray-600 leading-relaxed">{arg.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Infos pratiques */}
      <div className="bg-sib-gold/10 py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-sib-navy mb-8 text-center font-display">
              Infos Pratiques
            </h2>
          </ScrollReveal>
          <StaggerReveal className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {infos_pratiques.map((info) => (
              <StaggerItem key={info.label}>
                <HoverCard className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 h-full">
                  <info.icon className="w-8 h-8 text-sib-gold mx-auto mb-3" />
                  <div className="text-sm font-semibold text-gray-500 mb-1">{info.label}</div>
                  <div className="font-bold text-gray-900">{info.value}</div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>

      {/* Transport */}
      <div className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-sib-navy mb-8 text-center font-display">
            Comment s'y rendre ?
          </h2>
        </ScrollReveal>
        <StaggerReveal className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {transports.map((t, i) => (
            <StaggerItem key={i}>
              <HoverCard className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
                <t.icon className="w-8 h-8 text-sib-navy mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">{t.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{t.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* CTA */}
      <div className="bg-sib-navy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal variant={scaleUp}>
            <h3 className="text-3xl font-bold mb-4 font-display">Prêt à visiter ?</h3>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              L'entrée est gratuite. Inscrivez-vous dès maintenant pour obtenir votre badge électronique.
            </p>
            <Link
              to={ROUTES.BADGE}
              className="inline-flex items-center gap-2 px-8 py-4 bg-sib-gold text-sib-navy rounded-lg font-bold text-lg hover:bg-sib-gold/90 transition-all duration-300 hover:scale-105 transform"
            >
              S'inscrire gratuitement
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

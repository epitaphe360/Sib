import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Ticket, Bus, Train, Car, Plane, Hotel, Calendar } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard, HeroReveal,
  fadeUp, fadeLeft, fadeRight, scaleUp,
} from '../../components/ui/motion';

const horaires = [
  { jour: 'Mardi 25 Novembre', heures: '9h00 – 19h00' },
  { jour: 'Mercredi 26 Novembre', heures: '9h00 – 19h00' },
  { jour: 'Jeudi 27 Novembre', heures: '9h00 – 19h00' },
  { jour: 'Vendredi 28 Novembre', heures: '9h00 – 19h00' },
  { jour: 'Samedi 29 Novembre', heures: '9h00 – 19h00' },
];

export default function InfosPratiquesPage() {
  const cms = usePageContent('infos-pratiques');
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sib-navy to-sib-navy/90 text-white py-16 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <HeroReveal>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{cms.hero_title || 'Infos Pratiques'}</h1>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {cms.hero_subtitle || "Tout ce qu'il faut savoir pour préparer votre visite au SIB 2026."}
            </p>
          </HeroReveal>
        </div>
      </div>

      {/* Lieu */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">          <ScrollReveal variant={fadeLeft}>          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <MapPin className="w-8 h-8 text-sib-gold flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-sib-navy font-display">Parc d'Exposition Mohammed VI</h2>
                <p className="text-gray-600 mt-2">
                  {cms.lieu_adresse || 'Adresse : Route Nationale 1 vers Azemmour, Région Casablanca - Settat, 24000 — EL JADIDA'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Implanté au cœur du Pôle urbain Mazagan (PUMA), le Parc d'Exposition Mohammed VI
                  se voit efficacement desservi et stratégiquement connecté aux autres villes du royaume.
                </p>
              </div>
            </div>
          </div>
          </ScrollReveal>

          {/* Horaires */}
          <ScrollReveal variant={fadeRight} delay={0.1}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-7 h-7 text-sib-gold" />
              <h2 className="text-2xl font-bold text-sib-navy font-display">Horaires</h2>
            </div>
            <div className="grid gap-3">
              {horaires.map((h) => (
                <div key={h.jour} className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sib-navy" />
                    {h.jour}
                  </span>
                  <span className="text-sib-navy font-bold">{h.heures}</span>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>

          {/* Tarifs */}
          <ScrollReveal variant={scaleUp} delay={0.15}>
          <div className="bg-sib-gold/10 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Ticket className="w-7 h-7 text-sib-gold" />
              <h2 className="text-2xl font-bold text-sib-navy font-display">Tarifs</h2>
            </div>
            <p className="text-gray-700 mb-4">
              {cms.tarifs_intro || "L'entrée est"} <strong>gratuite</strong>{!cms.tarifs_intro && ' tout au long des 5 jours d\'exposition. Toutefois, l\'accès au salon sera conditionné par la présentation :'}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sib-gold mt-2 flex-shrink-0" />
                D'un <strong>badge électronique</strong> téléchargeable sur le site ou à l'accueil du salon
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sib-gold mt-2 flex-shrink-0" />
                D'une <strong>invitation</strong> dûment remplie
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sib-gold mt-2 flex-shrink-0" />
                D'une <strong>carte de visite professionnelle</strong>
              </li>
            </ul>
            <Link
              to={ROUTES.BADGE}
              className="inline-block mt-6 px-6 py-3 bg-sib-navy text-white rounded-lg font-semibold hover:bg-sib-navy/90 transition-colors"
            >
              Obtenir mon badge gratuit
            </Link>
          </div>
          </ScrollReveal>

          {/* Comment venir */}
          <ScrollReveal variant={fadeUp} delay={0.2}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-sib-navy mb-8 font-display">Comment venir ?</h2>

            <div className="space-y-8">
              {/* Navettes */}
              <div className="border-l-4 border-sib-gold pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Bus className="w-6 h-6 text-sib-navy" />
                  <h3 className="text-lg font-bold text-gray-900">Par Navettes SIB</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Des navettes seront mises gratuitement à disposition des visiteurs du Parc d'Exposition
                  à destination ou en provenance de Casablanca.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <p className="text-gray-500 italic">Les points de pick-up seront confirmés ultérieurement.</p>
                </div>
              </div>

              {/* Voiture */}
              <div className="border-l-4 border-gray-200 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Car className="w-6 h-6 text-sib-navy" />
                  <h3 className="text-lg font-bold text-gray-900">Par voiture</h3>
                </div>
                <p className="text-gray-600 mb-2">
                  Accès rapide par l'autoroute Casablanca–El Jadida (sortie Azemmour) ou depuis la route
                  nationale Azemmour–El Jadida. Trajet depuis Casablanca : <strong>50 minutes</strong>.
                </p>
                <p className="text-gray-500 text-sm italic">
                  « Afin d'accompagner la transition écologique, nous invitons nos visiteurs à privilégier le covoiturage. »
                </p>
                <p className="text-gray-600 mt-2 text-sm">Parking : <strong>2 500 places</strong> + parking VIP 52 places + parking autocars 50 places.</p>
              </div>

              {/* Train */}
              <div className="border-l-4 border-gray-200 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Train className="w-6 h-6 text-sib-navy" />
                  <h3 className="text-lg font-bold text-gray-900">Par train</h3>
                </div>
                <p className="text-gray-600 mb-2">
                  Accès facile depuis la gare d'Azemmour — Parc d'Expositions Mohammed VI (PEM6).
                </p>
                <div className="bg-sib-gold/10 rounded-lg p-3 text-sm">
                  <p className="text-gray-700">
                    L'<strong>ONCF</strong>, partenaire Transport et Logistique du SIB, propose une <strong>réduction
                    de 30%</strong> à bord de tous les trains en provenance ou en direction de la gare PEM6
                    durant la période du salon.
                  </p>
                </div>
              </div>

              {/* Avion */}
              <div className="border-l-4 border-gray-200 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Plane className="w-6 h-6 text-sib-navy" />
                  <h3 className="text-lg font-bold text-gray-900">Par avion</h3>
                </div>
                <p className="text-gray-600">
                  Le parc se situe à seulement <strong>1h de route</strong> depuis l'aéroport Mohammed V.
                </p>
              </div>
            </div>
          </div>
          </ScrollReveal>

          {/* Hébergement */}
          <ScrollReveal variant={fadeLeft} delay={0.25}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Hotel className="w-7 h-7 text-sib-gold" />
              <h2 className="text-2xl font-bold text-sib-navy font-display">Hébergement</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Les exposants et visiteurs disposent d'une multitude de choix pour séjourner à proximité du parc.
              La ville d'El Jadida propose un choix varié d'hôtels dont les prix peuvent s'adapter à toutes les bourses.
            </p>
            <Link
              to={ROUTES.ACCOMMODATION}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sib-gold text-sib-navy rounded-lg font-semibold hover:bg-sib-gold/90 transition-colors"
            >
              Voir les hébergements
            </Link>
          </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Network, GraduationCap, Gift, TrendingUp, Globe, MapPin, Calendar, Clock, Train, Car, Plane, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { PageHero } from '../../components/ui/PageHero';

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
  const { t } = useTranslation();

  const getCms = (key: string, fallback: string) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const infos_pratiques = (() => {
    const raw = cms.infos_json;
    if (!raw) {
      return [
        { icon: Calendar, label: 'Dates', value: '25 – 29 Novembre 2026' },
        { icon: Clock, label: 'Horaires', value: '9h00 – 19h00' },
        { icon: MapPin, label: 'Lieu', value: "Parc d'Exposition Mohammed VI, El Jadida" },
        { icon: Gift, label: 'Entrée', value: 'Gratuite (badge requis)' },
      ];
    }
    try {
      const parsed = JSON.parse(raw);
      const icons = [Calendar, Clock, MapPin, Gift];
      return Array.isArray(parsed)
        ? parsed.map((item: any, idx: number) => ({
            icon: icons[idx % icons.length],
            label: String(item?.label ?? ''),
            value: String(item?.value ?? ''),
          })).filter((i: any) => i.label)
        : [];
    } catch {
      return [
        { icon: Calendar, label: 'Dates', value: '25 – 29 Novembre 2026' },
        { icon: Clock, label: 'Horaires', value: '9h00 – 19h00' },
        { icon: MapPin, label: 'Lieu', value: "Parc d'Exposition Mohammed VI, El Jadida" },
        { icon: Gift, label: 'Entrée', value: 'Gratuite (badge requis)' },
      ];
    }
  })();

  const transports = (() => {
    const raw = cms.transport_json;
    if (!raw) {
      return [
        { icon: Train, title: 'Navettes gratuites SIB', desc: "Navettes gratuites Casablanca ↔ Parc d'Exposition Mohammed VI. Les points de pick-up seront confirmés ultérieurement." },
        { icon: Train, title: 'Train ONCF', desc: "Gare Azemmour — Parc d'Expositions Mohammed VI (PEM6). Réduction de 30% sur tous les trains durant la période du salon." },
        { icon: Car, title: 'En voiture', desc: "50 min depuis Casablanca via l'autoroute Casa–El Jadida (sortie Azemmour) ou route nationale Azemmour–El Jadida. Parking 2 500 places." },
        { icon: Plane, title: 'En avion', desc: "1h de route depuis l'aéroport Mohammed V de Casablanca." },
      ];
    }
    try {
      const parsed = JSON.parse(raw);
      const icons = [Train, Train, Car, Plane];
      return Array.isArray(parsed)
        ? parsed.map((item: any, idx: number) => ({
            icon: icons[idx % icons.length],
            title: String(item?.title ?? ''),
            desc: String(item?.desc ?? ''),
          })).filter((t: any) => t.title)
        : [];
    } catch {
      return [
        { icon: Train, title: 'Navettes gratuites SIB', desc: "Navettes gratuites Casablanca ↔ Parc d'Exposition Mohammed VI. Les points de pick-up seront confirmés ultérieurement." },
        { icon: Train, title: 'Train ONCF', desc: "Gare Azemmour — Parc d'Expositions Mohammed VI (PEM6). Réduction de 30% sur tous les trains durant la période du salon." },
        { icon: Car, title: 'En voiture', desc: "50 min depuis Casablanca via l'autoroute Casa–El Jadida (sortie Azemmour) ou route nationale Azemmour–El Jadida. Parking 2 500 places." },
        { icon: Plane, title: 'En avion', desc: "1h de route depuis l'aéroport Mohammed V de Casablanca." },
      ];
    }
  })();

  const arguments_visiter = [
    { icon: Lightbulb, title: cms.arg_1_title || 'Découvrir les innovations', desc: cms.arg_1_desc || "Le salon offre une réponse complète aux besoins des particuliers et des professionnels dans un espace et un temps maîtrisé." },
    { icon: Network, title: cms.arg_2_title || 'Networking & B2B', desc: cms.arg_2_desc || "300 rencontres B2B planifiées via URBA EVENT. Rencontrez fournisseurs, fabricants et professionnels de votre secteur." },
    { icon: GraduationCap, title: cms.arg_3_title || '20 conférences & SIB Academy', desc: cms.arg_3_desc || 'Un programme scientifique riche animé par des experts marocains et internationaux. Pôle formation avec académies, instituts et centres professionnels.' },
    { icon: Gift, title: cms.arg_4_title || 'Entrée gratuite', desc: cms.arg_4_desc || "L'accès au salon est entièrement gratuit sur présentation d'un badge électronique, d'une invitation ou d'une carte de visite professionnelle." },
    { icon: TrendingUp, title: cms.arg_5_title || 'Faire son choix & concrétiser', desc: cms.arg_5_desc || "La meilleure manière de s'informer, de faire son choix et de concrétiser dans les meilleures conditions tout investissement du secteur du BTP." },
    { icon: Globe, title: cms.arg_6_title || '600 exposants, 50 pays', desc: cms.arg_6_desc || 'Découvrez 1 500 marques venues de 50 pays avec 600 exposants, répartis sur 35 000 m².' },
  ];
  // Couleurs SIB par carte
  const argColors = ['bg-[#00AEEF]', 'bg-[#52B847]', 'bg-[#00AEEF]', 'bg-[#52B847]', 'bg-[#E63329]', 'bg-[#00AEEF]'];
  const transportColors = ['bg-[#52B847]', 'bg-[#00AEEF]', 'bg-[#00AEEF]', 'bg-[#E63329]'];
  const infoColors = ['bg-[#00AEEF]', 'bg-[#52B847]', 'bg-[#E63329]', 'bg-[#52B847]'];
  const infoTextColors = ['text-[#00AEEF]', 'text-[#52B847]', 'text-[#E63329]', 'text-[#52B847]'];

  return (
    <div className="min-h-screen bg-slate-50">

      <PageHero
        badge={<><span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">🎫 {t('visiter.hero_badge')}</span></>}
        title={<>{cms.hero_title || t('visiter.hero_title')}</>}
        subtitle={cms.hero_subtitle || t('visiter.hero_subtitle')}
        py="py-16 md:py-20"
        actions={
          <Link
            to={ROUTES.BADGE}
            className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-indigo-900 rounded-xl font-bold text-base hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {getCms('hero_cta', t('visiter.hero_cta'))}
            <ArrowRight className="h-5 w-5" />
          </Link>
        }
      />

      {/* ── 6 RAISONS ── */}
      <section className="py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(0,174,239,0.05),_transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {getCms('reasons_title', t('visiter.reasons_title'))}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('visiter.reasons_subtitle')}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {arguments_visiter.map((arg, i) => (
              <motion.div
                key={arg.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className={`h-1.5 w-full ${argColors[i]}`} />
                <div className="p-6">
                  <div className={`${argColors[i]} p-3 rounded-xl inline-flex mb-4`}>
                    <arg.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{arg.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{arg.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFOS PRATIQUES ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {getCms('infos_title', t('visiter.infos_title'))}
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {infos_pratiques.map((info, i) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className={`h-1.5 w-full ${infoColors[i]}`} />
                <div className="p-6 text-center">
                  <div className={`${infoColors[i]} p-3 rounded-xl inline-flex mb-4`}>
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{info.label}</div>
                  <div className={`font-bold text-sm ${infoTextColors[i]}`}>{info.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSPORT ── */}
      <section className="py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,_rgba(82,184,71,0.05),_transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {getCms('transport_title', t('visiter.transport_title'))}
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {transports.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className={`h-1.5 w-full ${transportColors[i]}`} />
                <div className="p-6">
                  <div className={`${transportColors[i]} p-3 rounded-xl inline-flex mb-4`}>
                    <t.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{t.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-3xl font-bold mb-4">{getCms('cta_title', t('visiter.cta_title'))}</h3>
            <p className="text-white/75 max-w-xl mx-auto mb-8">
              {getCms('cta_text', t('visiter.cta_text'))}
            </p>
            <Link
              to={ROUTES.BADGE}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#52B847] text-white rounded-xl font-bold text-base hover:bg-[#3D9B35] transition-all duration-300 shadow-lg hover:scale-105"
            >
              {getCms('cta_button', t('auth.register_free'))}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Globe, Target, BarChart3, Handshake, Eye, Award, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import { motion } from 'framer-motion';
import { MoroccanPattern } from '../../components/ui/MoroccanDecor';

const ARGS_META = [
  { icon: Users,     accent: '#00AEEF', bg: 'bg-[#00AEEF]/10', text: 'text-[#00AEEF]' },
  { icon: Globe,     accent: '#52B847', bg: 'bg-[#52B847]/10', text: 'text-[#52B847]' },
  { icon: Target,    accent: '#E63329', bg: 'bg-[#E63329]/10', text: 'text-[#E63329]' },
  { icon: BarChart3, accent: '#00AEEF', bg: 'bg-[#00AEEF]/10', text: 'text-[#00AEEF]' },
  { icon: Handshake, accent: '#52B847', bg: 'bg-[#52B847]/10', text: 'text-[#52B847]' },
  { icon: Award,     accent: '#E63329', bg: 'bg-[#E63329]/10', text: 'text-[#E63329]' },
];

const DEFAULT_STATS = [
  { value: '600+',       label: 'Exposants' },
  { value: '200 000+',   label: 'Visiteurs' },
  { value: '35 000 m²',  label: 'Surface' },
  { value: '50',         label: 'Pays' },
  { value: '5',          label: 'Jours' },
  { value: '10',         label: 'Secteurs' },
];

const DEFAULT_SECTORS = [
  'Gros Œuvre & Structure', 'Menuiserie & Fermeture', 'Décoration & Aménagement',
  'Climatisation & Sanitaire', 'Équipements Électriques', 'Matériels & Machines',
  'Environnement Durable', 'Formation & Institutions', 'Immobilier & Financement',
  'Technologies Numériques',
];

const STAT_COLORS = ['#00AEEF', '#52B847', '#E63329', '#00AEEF', '#52B847', '#E63329'];

export default function PourquoiExposerPage() {
  const cms = usePageContent('pourquoi-exposer');

  const getCms = (key: string, fallback: React.ReactNode) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const chiffres = (() => {
    const raw = cms.stats_json;
    if (!raw) { return DEFAULT_STATS; }
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as { value?: string; label?: string }[]).map(s => ({ value: s?.value ?? '', label: s?.label ?? '' })) : DEFAULT_STATS;
    } catch { return DEFAULT_STATS; }
  })();

  const secteurs = (() => {
    const raw = cms.sectors_json;
    if (!raw) { return DEFAULT_SECTORS; }
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as unknown[]).map(String) : DEFAULT_SECTORS;
    } catch { return DEFAULT_SECTORS; }
  })();

  const arguments_exposer = [
    { title: cms.arg_1_title || '200 000+ visiteurs', desc: cms.arg_1_desc || "Architectes, ingénieurs, promoteurs, décideurs publics et privés venus du Maroc, d'Afrique et du monde entier." },
    { title: cms.arg_2_title || '50 pays représentés', desc: cms.arg_2_desc || "600 exposants et 1 500 marques internationales réunis sur 35 000 m² de surface d'exposition." },
    { title: cms.arg_3_title || 'Visibilité renforcée', desc: cms.arg_3_desc || 'Plan média international, présence digitale soutenue, couverture presse et vidéos diffusées sur SIB TV.' },
    { title: cms.arg_4_title || '300 rencontres B2B', desc: cms.arg_4_desc || 'Échanges ciblés organisés via URBA EVENT, la plateforme digitale connectée du salon.' },
    { title: cms.arg_5_title || '80% de reconduction', desc: cms.arg_5_desc || "Un taux de fidélisation exceptionnel, reflet de la confiance des exposants et de la qualité du salon." },
    { title: cms.arg_6_title || 'Édition anniversaire 40 ans', desc: cms.arg_6_desc || "Plus d'espace, plus d'exposants, des zones thématiques repensées et des espaces de démonstration interactifs." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-[#00AEEF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#52B847]/10 rounded-full blur-3xl pointer-events-none" />
        <MoroccanPattern className="opacity-[0.05] text-white" scale={1.5} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold border border-white/25 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#52B847] animate-pulse" />
              {getCms('hero_badge', 'SIB 2026 — El Jadida')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            {getCms('hero_title', <>Pourquoi <span style={{ color: '#52B847' }}>Exposer</span> au SIB ?</>)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/80 text-lg max-w-2xl mx-auto mb-8"
          >
            {getCms('hero_subtitle', "Le rendez-vous incontournable du bâtiment en Afrique. Participez à l'édition anniversaire des 40 ans aux côtés de 600 exposants et 200 000 visiteurs professionnels.")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Link
              to={ROUTES.EXHIBITOR_SUBSCRIPTION}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              {getCms('hero_cta', 'Réservez votre stand')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS ── */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {chiffres.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="text-center p-4 rounded-xl border border-gray-100 bg-gray-50"
              >
                <div className="text-2xl font-bold" style={{ color: STAT_COLORS[i % 6] }}>{c.value}</div>
                <div className="text-xs text-gray-500 mt-1">{c.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARGUMENTS ── */}
      <section className="py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(0,174,239,0.05),_transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {getCms('reasons_title', <><span style={{ color: '#00AEEF' }}>6 raisons</span> d&apos;exposer</>)}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {getCms('reasons_subtitle', 'Le SIB offre une plateforme unique pour booster votre visibilité et développer vos affaires.')}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arguments_exposer.map((arg, i) => {
              const meta = ARGS_META[i];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={arg.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="h-1" style={{ backgroundColor: meta.accent }} />
                  <div className="p-7">
                    <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${meta.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{arg.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{arg.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTEURS ── */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {getCms('sectors_title', 'Secteurs représentés')}
            </h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {secteurs.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="inline-block px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-default"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.3),_transparent_60%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Eye className="w-12 h-12 text-white/60 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {getCms('cta_title', 'Prêt à exposer ?')}
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              {getCms('cta_text', 'Réservez votre stand dès maintenant et bénéficiez des meilleurs emplacements pour la 20ème édition du SIB.')}
            </p>
            <Link
              to={ROUTES.EXHIBITOR_SUBSCRIPTION}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors"
            >
              {getCms('cta_button', 'Demander un devis')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

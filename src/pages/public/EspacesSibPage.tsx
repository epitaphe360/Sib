import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, GraduationCap, Briefcase, Tv, Handshake, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import { motion } from 'framer-motion';
import { MoroccanPattern } from '../../components/ui/MoroccanDecor';

const ESPACES_META = [
  { icon: Wrench,        accent: '#00AEEF', bg: 'bg-[#00AEEF]/10', text: 'text-[#00AEEF]' },
  { icon: GraduationCap, accent: '#52B847', bg: 'bg-[#52B847]/10', text: 'text-[#52B847]' },
  { icon: Briefcase,     accent: '#E63329', bg: 'bg-[#E63329]/10', text: 'text-[#E63329]' },
  { icon: Tv,            accent: '#00AEEF', bg: 'bg-[#00AEEF]/10', text: 'text-[#00AEEF]' },
  { icon: Handshake,     accent: '#52B847', bg: 'bg-[#52B847]/10', text: 'text-[#52B847]' },
];

const DEFAULT_ESPACES = [
  {
    title: '2 Espaces de Démonstration',
    description: "Le SIB 2026 dispose de 2 espaces de démonstration conçus pour permettre aux professionnels du bâtiment de présenter leurs innovations en direct. Ces plateformes offrent une opportunité unique d'interagir avec les visiteurs, de valoriser les pratiques exemplaires et de démontrer concrètement la performance des matériaux, solutions et applications techniques.",
  },
  {
    title: 'Espace Formation — SIB Academy',
    description: "SIB Academy est le pôle formation du Salon. Cet espace regroupe les stands des Académies, Instituts, Universités, Écoles Privées et Centres Professionnels proposant des formations liées aux secteurs du Bâtiment, de l'Urbanisme et de l'Architecture. Plus de 20 conférences sont prévues avec des experts marocains et internationaux.",
  },
  {
    title: 'Espace Recrutement',
    description: "En partenariat avec l'Anapec, le SIB met à disposition des visiteurs un espace où il est permis de déposer son CV, de passer des entretiens et de rencontrer ses futurs employeurs directement pendant le salon.",
  },
  {
    title: 'SIB TV',
    description: "SIB TV est la chaîne web officielle du salon. Avec ses plateaux TV, elle assure une couverture médiatique complète de l'événement. Interviews, débats et reportages sont diffusés en continu pendant les 5 jours du salon, offrant une visibilité maximale aux exposants et sponsors.",
  },
  {
    title: 'URBA EVENT — B2B',
    description: "URBA EVENT est le programme de rencontres d'affaires B2B du SIB. Pour l'édition 2026, 300 rencontres qualifiées sont planifiées entre exposants nationaux et internationaux. L'objectif : faciliter les partenariats stratégiques et la signature de contrats pendant les 5 jours du salon.",
  },
];

export default function EspacesSibPage() {
  const cms = usePageContent('espaces-sib');

  const getCms = (key: string, fallback: React.ReactNode) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const espaces = (() => {
    const raw = cms.espaces_json;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const result = (parsed as { title?: string; description?: string }[])
            .map(item => ({ title: item?.title ?? '', description: item?.description ?? '' }))
            .filter(e => e.title);
          if (result.length > 0) { return result; }
        }
      } catch { /* fall through to individual keys */ }
    }
    // Lire les clés individuelles depuis le CMS avec fallback sur DEFAULT_ESPACES
    return DEFAULT_ESPACES.map((def, idx) => ({
      title: (cms[`espace_${idx + 1}_title`] as string || '').trim() || def.title,
      description: (cms[`espace_${idx + 1}_desc`] as string || '').trim() || def.description,
    }));
  })();

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
            {getCms('hero_title', <><span style={{ color: '#52B847' }}>Espaces</span> SIB</>)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/80 text-lg max-w-2xl mx-auto mb-8"
          >
            {getCms('hero_subtitle', "Parce que le SIB ne se résume pas qu'aux stands d'exposition, plusieurs espaces sont également mis en avant.")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Link
              to={ROUTES.BADGE}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors"
            >
              {getCms('hero_cta', 'Obtenez votre badge gratuit')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── ESPACES ── */}
      <section className="py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(0,174,239,0.05),_transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {getCms('section_title', <><span style={{ color: '#00AEEF' }}>5 espaces</span> dédiés</>)}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {getCms('section_subtitle', 'Des espaces conçus pour enrichir votre expérience au SIB.')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {espaces.map((espace, i) => {
              const meta = ESPACES_META[i % ESPACES_META.length];
              const Icon = meta.icon;
              return (
                <motion.article
                  key={espace.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 2) * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="h-1" style={{ backgroundColor: meta.accent }} />
                  <div className="p-7">
                    <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${meta.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{espace.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{espace.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.3),_transparent_60%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {getCms('cta_title', 'Intéressé par un espace ?')}
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              {getCms('cta_text', 'Contactez-nous pour en savoir plus sur les modalités de participation et de réservation.')}
            </p>
            <Link
              to={getCms('cta_url', '/contact') as string}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors"
            >
              {getCms('cta_button', 'Contactez-nous')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

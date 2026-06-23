import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Layers, Zap, Globe2, Network, ShieldCheck, BarChart3,
  Building2, Handshake, Cpu
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
 * Feature item types
 * ========================================================= */
interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  tag: string;
}

/* Palette logo SIB uniquement (sans rouge) */
const FEATURES: Feature[] = [
  {
    icon: Building2,
    title: 'Architecture & Construction',
    description: 'Découvrez les dernières innovations en matière de construction durable, matériaux de demain et solutions d\'ingénierie de pointe.',
    color: '#5E8FBE',
    tag: '3D BIM',
  },
  {
    icon: Zap,
    title: 'Énergie & Smart Building',
    description: 'Explorez les technologies de bâtiments intelligents, d\'efficacité énergétique et d\'automatisation du futur.',
    color: '#2E5984',
    tag: 'IoT',
  },
  {
    icon: Globe2,
    title: 'Rayonnement International',
    description: '40+ pays représentés, des délégations officielles et un réseau mondial de professionnels du secteur.',
    color: '#F39200',
    tag: '40+ pays',
  },
  {
    icon: Network,
    title: 'Networking B2B',
    description: 'Connectez-vous avec les décideurs de l\'industrie grâce à notre plateforme de matchmaking IA avancée.',
    color: '#2E5984',
    tag: 'IA Match',
  },
  {
    icon: Layers,
    title: 'Espaces d\'Exposition',
    description: 'Plus de 50 000 m² d\'espaces thématiques dédiés aux secteurs de la construction, du design et de la technologie.',
    color: '#5E8FBE',
    tag: '50k m²',
  },
  {
    icon: BarChart3,
    title: 'Conférences & Forums',
    description: 'Programme riche de conférences, workshops et tables rondes animés par des experts de renommée internationale.',
    color: '#F39200',
    tag: '100+ talks',
  },
  {
    icon: ShieldCheck,
    title: 'Certifications & Labels',
    description: 'Retrouvez les organismes de certification, labels de qualité et normes internationales pour votre activité.',
    color: '#2E5984',
    tag: 'ISO / HQE',
  },
  {
    icon: Handshake,
    title: 'Partenariats Stratégiques',
    description: 'Un cadre privilégié pour nouer des partenariats durables et explorer de nouveaux marchés à l\'international.',
    color: '#5E8FBE',
    tag: 'Partnerships',
  },
  {
    icon: Cpu,
    title: 'Innovation & Startups',
    description: 'Espace dédié aux startups et entreprises innovantes qui façonnent le futur de la construction.',
    color: '#F39200',
    tag: 'Startups',
  },
];

/* =========================================================
 * Single feature card
 * ========================================================= */
function FeatureCard({ item, index }: { item: Feature; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.65,
        delay: (index % 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="feature-card-futuristic p-6 group"
    >
      {/* Tag */}
      <div
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6rem] font-black tracking-[0.12em] uppercase mb-5"
        style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}
      >
        {item.tag}
      </div>

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}
      >
        <Icon className="w-6 h-6" style={{ color: item.color }} />
      </div>

      {/* Content */}
      <h3 className="text-white font-bold text-base mb-2 leading-tight">{item.title}</h3>
      <p className="text-[#8BB8D8]/70 text-sm leading-relaxed">{item.description}</p>

      {/* Glow corner */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${item.color}15 0%, transparent 70%)`,
          transform: 'translate(40%, -40%)',
        }}
      />
    </motion.div>
  );
}

/* =========================================================
 * GSAP Marquee strip
 * ========================================================= */
const MARQUEE_ITEMS = [
  'Architecture', 'Construction', 'Innovation', 'Smart Building',
  'BIM', 'Énergie Durable', 'Design', 'Ingénierie', 'Networking',
  'Excellence', 'International', 'Technologie',
];

function MarqueeStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const clone = el.cloneNode(true) as HTMLDivElement;
    el.parentElement?.appendChild(clone);

    const tl = gsap.to([el, clone], {
      xPercent: -100,
      repeat: -1,
      duration: 30,
      ease: 'none',
    });
    return () => { tl.kill(); clone.remove(); };
  }, []);

  return (
    <div className="relative overflow-hidden py-5 border-y border-[#00D4FF]/10 bg-[#000912]">
      <div className="flex whitespace-nowrap">
        <div ref={trackRef} className="flex items-center gap-12 pr-12">
          {MARQUEE_ITEMS.map((item, i) => (
            <React.Fragment key={i}>
              <span className="text-[#8BB8D8]/40 text-sm font-bold tracking-[0.08em] uppercase">
                {item}
              </span>
              <span className="text-[#00D4FF]/30 text-base">◆</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Exported section
 * ========================================================= */
export function FuturisticFeaturesSection() {
  return (
    <section className="futuristic-page relative bg-[#000912]">
      <MarqueeStrip />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="section-label-futuristic mb-5">Pourquoi SIB 2026</p>
          <h2 className="font-display text-3xl md:text-5xl font-black text-white leading-tight">
            L'écosystème complet du{' '}
            <span className="holo-text">bâtiment de demain</span>
          </h2>
          <p className="text-[#8BB8D8]/70 text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
            Tout ce dont vous avez besoin pour rester à la pointe de l'industrie,
            en un seul lieu, pendant 4 jours.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((item, i) => (
            <FeatureCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

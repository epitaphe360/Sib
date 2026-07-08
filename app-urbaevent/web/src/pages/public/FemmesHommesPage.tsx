/**
 * Les Femmes et les Hommes qui Construisent le Maroc
 * Page dédiée — /salon/femmes-et-hommes
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  HardHat,
  Compass,
  Layers,
  Cpu,
  Building2,
  Users,
  Quote,
  ChevronLeft,
  ChevronRight,
  Award,
  Globe,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { SIB_PHOTOS_CDN, sibMaUpload } from '../../config/sibMaRemoteUrls';
import { useSiteImage } from '../../hooks/useSiteImage';
import { usePageContent } from '../../hooks/usePageContent';
import { cmsJsonArray, cmsParagraphs, cmsValue } from '../../lib/cmsHelpers';
import PublicPageLayout from '../../components/layout/PublicPageLayout';
import { SibPublicHero } from '../../components/ui/SibPublicHero';

/* ─────────────────────────────────────────────────────────── */
/*  DATA                                                        */
/* ─────────────────────────────────────────────────────────── */

const PORTRAITS = [
  sibMaUpload('ALW_3369_067b43b2aa_16e46cc9e8.jpg'),
  sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),
  sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),
  sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),
];

const PROFILES = [
  {
    name: 'Fatima Zahra Benali',
    role: 'Architecte \u2014 Casablanca',
    quote: `\u00ab\u00a0Le SIB est l\u2019endroit o\u00f9 les id\u00e9es rencontrent les mat\u00e9riaux. Chaque \u00e9dition m\u2019inspire de nouveaux projets.\u00a0\u00bb`,
    photo: PORTRAITS[0],
    sector: 'Architecture',
  },
  {
    name: 'Karim El Mansouri',
    role: 'Ing\u00e9nieur BTP \u2014 Rabat',
    quote: `\u00ab\u00a0En 20 ans de carri\u00e8re, c\u2019est ici que j\u2019ai nou\u00e9 les partenariats les plus solides pour mes chantiers.\u00a0\u00bb`,
    photo: PORTRAITS[1],
    sector: 'Gros \u0152uvre',
  },
  {
    name: 'Nadia Chraibi',
    role: 'Designer d\u2019int\u00e9rieur \u2014 Marrakech',
    quote: `\u00ab\u00a0Le SIB me connecte aux derni\u00e8res innovations mondiales, tout en valorisant l\u2019artisanat marocain.\u00a0\u00bb`,
    photo: PORTRAITS[2],
    sector: 'D\u00e9coration',
  },
  {
    name: 'Youssef Tazi',
    role: 'Chef de chantier \u2014 El Jadida',
    quote: `\u00ab\u00a0Ce salon, c\u2019est la fiert\u00e9 de notre m\u00e9tier. 40 ans \u00e0 construire ensemble le Maroc de demain.\u00a0\u00bb`,
    photo: PORTRAITS[3],
    sector: 'Construction',
  },
];

const METIERS = [
  { icon: HardHat,   label: 'Gros Œuvre',                  count: '180+ exposants' },
  { icon: Compass,   label: 'Architecture & Design',        count: '90+ exposants' },
  { icon: Layers,    label: 'Menuiserie & Fermeture',       count: '120+ exposants' },
  { icon: Cpu,       label: 'Construction Durable',         count: '60+ exposants' },
  { icon: Building2, label: 'Décoration & Aménagement',     count: '100+ exposants' },
  { icon: Globe,     label: 'International',                count: '30+ pays' },
];

const DEFAULT_MISSION_PARAS = [
  "Depuis 40 ans, le SIB est bien plus qu'un salon professionnel. C'est un lieu de reconnaissance, où architectes, ingénieurs, artisans, décorateurs et chefs de chantier font valoir leur savoir-faire devant 200 000 visiteurs venus du monde entier.",
  "Ces professionnels sont l'âme du secteur. Chaque édition du SIB leur offre une tribune unique pour présenter leurs innovations, partager leurs expériences et tisser les partenariats qui construiront le Maroc de demain.",
  "En 2026, pour notre 20ème édition et notre 40ème anniversaire, nous leur rendons hommage à travers une programmation dédiée : conférences, témoignages, remises de prix et espace « SIB Academy ».",
];

const DEFAULT_MISSION_BULLETS = [
  'Fédère plus de 600 entreprises partenaires',
  'Accueille plus de 200 000 visiteurs professionnels',
  'Rayonne sur +30 pays à travers le monde',
];

type CmsProfile = { name: string; role: string; quote: string; sector: string };
type CmsMetier = { label: string; count: string };
type CmsStat = { value: string; label: string; sub: string };

const STATS: CmsStat[] = [
  { value: '600+', label: 'Professionnels exposants', sub: 'issus de toutes les filières' },
  { value: '200 000+', label: 'Visiteurs professionnels', sub: 'sur 5 jours' },
  { value: '40 ans', label: "D'histoire partagée", sub: 'depuis 1986' },
  { value: '+30', label: 'Pays représentés', sub: 'présence internationale' },
];

/* ─────────────────────────────────────────────────────────── */
/*  COMPOSANTS INTERNES                                         */
/* ─────────────────────────────────────────────────────────── */

function ProfileCard({
  profile,
  index,
}: {
  profile: (typeof PROFILES)[number];
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="relative cursor-pointer group"
      onClick={() => setFlipped((p) => !p)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* Photo */}
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07182C] via-[#07182C]/60 to-transparent" />

        {/* Sector tag */}
        <span className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-widest bg-[#F39200] text-white px-3 py-1">
          {profile.sector}
        </span>

        {/* Identity block */}
        <div className="absolute bottom-0 inset-x-0 p-6">
          <p className="text-white font-extrabold text-lg leading-tight">{profile.name}</p>
          <p className="text-[#BAD2E8] text-xs font-semibold mt-1">{profile.role}</p>

          {/* Quote (visible on hover / tap) */}
          <AnimatePresence>
            {flipped && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-white/80 text-xs italic leading-relaxed mt-3 border-l-2 border-[#F39200] pl-3">
                  {profile.quote}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button className="mt-4 text-[#F39200] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            {flipped ? 'Réduire' : 'Lire le témoignage'}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  PAGE                                                        */
/* ─────────────────────────────────────────────────────────── */

export default function FemmesHommesPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const cms = usePageContent('femmes-hommes');
  const get = (key: string, fallback: string) => cmsValue(cms, key, fallback);

  const stats = cmsJsonArray<CmsStat>(cms, 'stats_json', STATS);
  const profilesBase = cmsJsonArray<CmsProfile>(
    cms,
    'profiles_json',
    PROFILES.map(({ name, role, quote, sector }) => ({ name, role, quote, sector })),
  );
  const metiersData = cmsJsonArray<CmsMetier>(
    cms,
    'metiers_json',
    METIERS.map(({ label, count }) => ({ label, count })),
  );
  const metiers = metiersData.map((m, i) => ({
    ...m,
    icon: METIERS[i]?.icon ?? HardHat,
  }));
  const missionParas = cmsParagraphs(cms, 'mission_text', DEFAULT_MISSION_PARAS);
  const missionBullets = cmsJsonArray<string>(cms, 'mission_bullets_json', DEFAULT_MISSION_BULLETS);

  // Images dynamiques depuis Supabase (fallback CDN)
  const { src: heroImg }    = useSiteImage('home_hero_hall');
  const { src: portrait0 }  = useSiteImage('builders_portrait_0');
  const { src: portrait1 }  = useSiteImage('builders_portrait_1');
  const { src: portrait2 }  = useSiteImage('builders_portrait_2');
  const { src: portrait3 }  = useSiteImage('builders_portrait_3');
  const dynamicPortraits    = [portrait0, portrait1, portrait2, portrait3];

  // Injecter les photos dynamiques dans les profils
  const profiles = profilesBase.map((p, i) => ({
    ...p,
    photo: dynamicPortraits[i] ?? PROFILES[i]?.photo ?? PORTRAITS[i],
  }));
  const testimonial = profiles[activeTestimonial];

  return (
    <PublicPageLayout>

      <SibPublicHero
        image={heroImg}
        eyebrow={get('hero_eyebrow', 'Salon International du Bâtiment · SIB 2026')}
        title={
          <>
            {get('hero_title', 'Les Femmes et les Hommes')}{' '}
            <span className="text-sib-orange">{get('hero_title_accent', 'qui Construisent le Maroc')}</span>
          </>
        }
        subtitle={get('hero_subtitle', "Le SIB valorise les métiers, les compétences et les expertises qui bâtissent aujourd'hui le Maroc de demain.")}
      >
        <div className="flex flex-wrap gap-4">
          <Link
            to={ROUTES.EXHIBITOR_SUBSCRIPTION}
            className="inline-flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-widest text-sib-navy bg-sib-orange hover:brightness-90 transition-all"
          >
            {get('cta_exhibitor', 'Exposer au SIB 2026')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={ROUTES.REGISTER_VISITOR}
            className="inline-flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white border border-white/40 hover:border-white/80 transition-all"
          >
            {get('cta_visitor', 'Je suis visiteur')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </SibPublicHero>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#07182C' }} className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label, sub }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-white font-extrabold text-3xl lg:text-4xl tabular-nums leading-none">{value}</p>
              <p className="text-[#F39200] text-[10px] font-bold uppercase tracking-widest mt-2">{label}</p>
              <p className="text-white/40 text-[9px] mt-1">{sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p style={{ color: '#F39200' }} className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4 flex items-center gap-3">
                <span className="inline-block w-6 h-px bg-[#F39200]" />
                {get('mission_kicker', 'Au cœur de notre mission')}
              </p>
              <h2 className="font-extrabold uppercase leading-tight mb-6"
                style={{ color: '#07182C', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
                {get('mission_title', 'Des Talents\nau Service\ndu Bâtiment').split('\n').map((line, i, arr) => (
                  <React.Fragment key={line}>
                    {line}
                    {i < arr.length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </h2>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                {missionParas.map((para) => (
                  <p key={para.slice(0, 40)}>{para}</p>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {missionBullets.map((stat) => (
                  <div key={stat} className="flex items-center gap-4">
                    <div className="w-6 h-px flex-shrink-0" style={{ backgroundColor: '#F39200' }} />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat}</p>
                  </div>
                ))}
              </div>

              <Link
                to={ROUTES.PRESENTATION}
                style={{ color: '#F39200' }}
                className="inline-flex items-center gap-2 mt-8 text-xs font-bold uppercase tracking-widest hover:translate-x-1 transition-transform"
              >
                Découvrir le salon <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Portrait grid */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3"
            >
              {PORTRAITS.map((src, i) => (
                <div key={i} className={`relative overflow-hidden ${i === 0 ? 'row-span-2' : ''}`}>
                  <img
                    src={src}
                    alt="Professionnel du bâtiment — SIB 2026"
                    className="w-full h-full object-cover object-top aspect-[3/4]"
                    style={{ minHeight: i === 0 ? 420 : 200 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07182C]/60 to-transparent" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROFILS ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#f4f6f8' }} className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p style={{ color: '#F39200' }} className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 flex items-center gap-3">
              <span className="inline-block w-6 h-px bg-[#F39200]" />
              Leurs histoires
            </p>
            <h2 className="font-extrabold uppercase"
              style={{ color: '#07182C', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              Portraits de Bâtisseurs
            </h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl">
              Portraits représentatifs des métiers du bâtiment. Cliquez sur un portrait pour lire le témoignage.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profiles.map((profile, i) => (
              <ProfileCard key={profile.name} profile={profile} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── MÉTIERS ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#07182C' }} className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p style={{ color: '#F39200' }} className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 flex items-center gap-3">
              <span className="inline-block w-6 h-px bg-[#F39200]" />
              Toutes les filières
            </p>
            <h2 className="text-white font-extrabold uppercase"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              Les Métiers du SIB 2026
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metiers.map(({ icon: Icon, label, count }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="border border-white/10 p-6 hover:border-[#F39200]/50 transition-colors group"
              >
                <Icon className="h-7 w-7 mb-4 transition-colors" style={{ color: '#F39200' }} />
                <h3 className="text-white font-bold text-base mb-1">{label}</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">{count}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              to={ROUTES.SECTEURS}
              className="inline-flex items-center gap-2 border border-white/30 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:border-[#F39200] hover:text-[#F39200] transition-all"
            >
              Explorer tous les secteurs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TÉMOIGNAGE CENTRAL ───────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Award className="h-10 w-10 mx-auto mb-6" style={{ color: '#F39200' }} />
            <p style={{ color: '#07182C' }} className="text-[10px] font-bold uppercase tracking-[0.22em] mb-8">
              Ils parlent du SIB
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Quote className="h-8 w-8 mx-auto mb-6 opacity-20" style={{ color: '#07182C' }} />
              <p className="font-bold italic leading-relaxed mb-8 text-gray-700"
                style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
                {testimonial.quote.replace(/«\s*/, '').replace(/\s*»/, '')}
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover object-top border-2 border-[#F39200]"
                />
                <div className="text-left">
                  <p className="font-extrabold text-sm" style={{ color: '#07182C' }}>{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={() => setActiveTestimonial((p) => (p === 0 ? profiles.length - 1 : p - 1))}
              className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:border-[#F39200] transition-colors"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="h-4 w-4" style={{ color: '#07182C' }} />
            </button>
            <div className="flex gap-2">
              {profiles.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setActiveTestimonial(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ backgroundColor: i === activeTestimonial ? '#F39200' : '#e5e7eb' }}
                  aria-label={`Témoignage ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveTestimonial((p) => (p + 1) % profiles.length)}
              className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:border-[#F39200] transition-colors"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="h-4 w-4" style={{ color: '#07182C' }} />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <img
          src={SIB_PHOTOS_CDN.parc}
          alt="Parc d'Exposition Mohammed VI — El Jadida"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-50"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(7, 24, 44, 0.7)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Users className="h-10 w-10 mx-auto mb-6 text-white/60" />
            <h2 className="text-white font-extrabold uppercase leading-tight mb-4"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              {get('cta_title', 'Rejoignez les Bâtisseurs\ndu Maroc').split('\n').map((line, i, arr) => (
                <React.Fragment key={line}>
                  {line}
                  {i < arr.length - 1 ? <br /> : null}
                </React.Fragment>
              ))}
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-10 max-w-2xl mx-auto">
              {get('cta_subtitle', "Du 25 au 29 novembre 2026 · Parc d'Exposition Mohammed VI · El Jadida")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to={ROUTES.EXHIBITOR_SUBSCRIPTION}
                className="inline-flex items-center gap-2 px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#07182C] hover:brightness-90 transition-all"
                style={{ backgroundColor: '#F39200' }}
              >
                Réserver un stand
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={ROUTES.REGISTER_VISITOR}
                className="inline-flex items-center gap-2 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white border border-white/40 hover:bg-white/10 transition-all"
              >
                Devenir visiteur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </PublicPageLayout>
  );
}

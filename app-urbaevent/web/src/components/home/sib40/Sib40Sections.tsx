import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Eye,
  Gift,
  Globe,
  MapPin,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { SIB40_IMAGES } from '../../../config/sib40HomeAssets';
import { useSiteImage } from '../../../hooks/useSiteImage';

const SERVICE_KEYS = ['exposer', 'visiter', 'talks', 'b2b', 'diner', 'international'] as const;
const SERVICE_ICONS = {
  exposer: Building2,
  visiter: Eye,
  talks: MessageSquare,
  b2b: Users,
  diner: Gift,
  international: Globe,
} as const;
const SERVICE_ROUTES = {
  exposer: ROUTES.EXHIBITOR_SUBSCRIPTION,
  visiter: ROUTES.POURQUOI_VISITER,
  talks: ROUTES.EVENTS,
  b2b: ROUTES.B2B_NETWORKING_AI,
  diner: ROUTES.EVENTS,
  international: ROUTES.PAVILIONS,
} as const;

const TIMELINE_KEYS = ['y1986', 'y2000', 'y2012', 'y2022', 'y2026'] as const;

// Mapping service keys → site image keys
const SERVICE_IMAGE_KEYS: Record<(typeof SERVICE_KEYS)[number], Parameters<typeof useSiteImage>[0]> = {
  exposer:      'home_stand',
  visiter:      'home_visitors',
  talks:        'home_conferences',
  b2b:          'home_b2b',
  diner:        'home_inauguration',
  international:'home_international',
};
// Mapping timeline keys → site image keys
const TIMELINE_IMAGE_KEYS: Record<(typeof TIMELINE_KEYS)[number], Parameters<typeof useSiteImage>[0]> = {
  y1986: 'sib40_timeline_1986',
  y2000: 'sib40_timeline_2000',
  y2012: 'sib40_timeline_2012',
  y2022: 'sib40_timeline_2022',
  y2026: 'sib40_timeline_2026',
};

/** Sub-composant : carte service avec image dynamique. */
const ServiceCard: React.FC<{
  sKey: (typeof SERVICE_KEYS)[number];
  t: (k: string) => string;
}> = ({ sKey, t }) => {
  const { src } = useSiteImage(SERVICE_IMAGE_KEYS[sKey]);
  const Icon = SERVICE_ICONS[sKey];
  return (
    <Link
      to={SERVICE_ROUTES[sKey]}
      className="relative group overflow-hidden h-48 block"
    >
      <img
        alt={t(`home.sib40.salon.${sKey}_title`)}
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-500"
        src={src}
        loading="lazy"
      />
      <div className="absolute inset-0 sib40-dark-blue opacity-85 group-hover:opacity-75" />
      <div className="relative h-full p-8 flex items-start gap-4 text-white">
        <div className="sib40-text-orange shrink-0">
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">{t(`home.sib40.salon.${sKey}_title`)}</h3>
          <p className="text-[10px] leading-relaxed opacity-80 uppercase tracking-tight">
            {t(`home.sib40.salon.${sKey}_desc`)}
          </p>
        </div>
        <div className="absolute bottom-4 right-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
};

/** Sub-composant : entrée de timeline avec image dynamique. */
const TimelineItem: React.FC<{
  tKey: (typeof TIMELINE_KEYS)[number];
  t: (k: string) => string;
}> = ({ tKey, t }) => {
  const { src } = useSiteImage(TIMELINE_IMAGE_KEYS[tKey]);
  return (
    <div className="relative pt-6">
      <div className="sib40-timeline-dot" />
      <p className={`sib40-text-orange font-bold mb-1 ${tKey === 'y2026' ? 'text-xl' : ''}`}>
        {t(`home.sib40.timeline.${tKey}_year`)}
      </p>
      <p className="text-[10px] font-bold uppercase mb-2">{t(`home.sib40.timeline.${tKey}_title`)}</p>
      <p className="text-[10px] text-gray-500 mb-4">{t(`home.sib40.timeline.${tKey}_desc`)}</p>
      <img
        alt={`SIB ${t(`home.sib40.timeline.${tKey}_year`)} — ${t(`home.sib40.timeline.${tKey}_title`)}`}
        className="w-full grayscale"
        src={src}
        loading="lazy"
      />
    </div>
  );
};

const FLAG_CODES = ['TR', 'CN', 'ES', 'IT', 'PT'] as const;

export const Sib40HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { src: heroSrc } = useSiteImage('sib40_hero');
  return (
    <section
      className="relative min-h-[85vh] flex items-center pt-28 bg-cover bg-center"
      style={{ backgroundImage: `url('${heroSrc}')`, backgroundPosition: 'top center' }}
    >
      <div className="absolute inset-0 sib40-gradient-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 w-full text-white">
        <div className="max-w-2xl">
          {/* "SIB" blanc · "2026" orange — identique à la maquette */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-2 leading-none">
            <span className="text-white">SIB </span>
            <span className="sib40-text-orange">2026</span>
          </h1>
          <p className="sib40-text-orange text-base sm:text-lg font-bold tracking-widest uppercase mb-4">
            {t('home.sib40.hero.kicker')}
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight mb-8 uppercase whitespace-pre-line">
            {t('home.sib40.hero.headline')}
          </h2>
          <div className="space-y-3 mb-10 text-xs font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 sib40-text-orange shrink-0" strokeWidth={2} />
              <span>{t('home.sib40.hero.date')}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 sib40-text-orange shrink-0 mt-0.5" strokeWidth={2} />
              <span className="whitespace-pre-line">{t('home.sib40.hero.location')}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to={ROUTES.EXHIBITOR_SUBSCRIPTION}
              className="sib40-orange px-8 py-4 text-xs font-bold flex items-center gap-3 hover:bg-orange-600 transition-all text-white uppercase tracking-widest"
            >
              {t('home.sib40.hero.cta_stand')} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.REGISTER_VISITOR}
              className="bg-transparent border border-white/60 px-8 py-4 text-xs font-bold flex items-center gap-3 hover:bg-white hover:text-[#0b1c3f] transition-all uppercase tracking-widest"
            >
              {t('home.sib40.hero.cta_visitor')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Sib40StatsBar: React.FC = () => {
  const { t } = useTranslation();
  const stats = [
    { value: '+600',      label: t('home.sib40.stats.exhibitors'), icon: Users  },
    { value: '+200 000',  label: t('home.sib40.stats.visitors'),   icon: Users  },
    { value: '40',        label: t('home.sib40.stats.history'),     icon: Award  },
    { value: '+30',       label: t('home.sib40.stats.countries'),   icon: Globe  },
  ];
  return (
    <section className="sib40-dark-blue text-white py-10 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 py-2">
            <div className="text-white/30 shrink-0">
              <Icon className="w-9 h-9" strokeWidth={1.2} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold leading-none">{value}</p>
              <p className="text-[9px] uppercase tracking-[0.12em] font-bold opacity-70 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const Sib40MissionSection: React.FC = () => {
  const { t } = useTranslation();
  const { src: img0 } = useSiteImage('home_stand');
  const { src: img1 } = useSiteImage('home_conferences');
  const { src: img2 } = useSiteImage('sib40_timeline_2022');
  const { src: img3 } = useSiteImage('home_b2b');
  const missionStats = [
    t('home.sib40.mission.stat1'),
    t('home.sib40.mission.stat2'),
    t('home.sib40.mission.stat3'),
  ];
  const missionImgs = [img0, img1, img2, img3];
  return (
    <section className="py-20 sib40-dark-blue text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="md:w-1/3">
            <p className="sib40-text-orange text-[10px] font-bold uppercase tracking-[0.18em] mb-4">
              {t('home.sib40.mission.kicker')}
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-8 whitespace-pre-line">
              {t('home.sib40.mission.title')}
            </h2>
            <div className="space-y-4 mb-10">
              {missionStats.map((stat) => (
                <div key={stat} className="flex items-center gap-4">
                  <div className="w-6 h-px bg-orange-500 shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300">{stat}</p>
                </div>
              ))}
            </div>
            <Link
              to={ROUTES.FEMMES_HOMMES}
              className="sib40-text-orange text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest hover:translate-x-2 transition-transform"
            >
              {t('home.sib40.mission.cta')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {missionImgs.map((src) => (
              <div key={src} className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                <img alt={t('home.sib40.mission.title').replace(/\n/g, ' ')} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src={src} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Sib40TimelineSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#0b1c3f] mb-8 whitespace-pre-line">{t('home.sib40.timeline.title')}</h2>
            <Link
              to={ROUTES.EDITIONS}
              className="border border-[#0b1c3f] px-6 py-3 text-[10px] font-bold inline-flex items-center gap-4 hover:bg-[#0b1c3f] hover:text-white transition-colors"
            >
              {t('home.sib40.timeline.cta')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex-1 w-full relative pt-10">
            <div className="sib40-timeline-line" />
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              {TIMELINE_KEYS.map((key) => (
                <TimelineItem key={key} tKey={key} t={t} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Sib40ServicesGrid: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/4 bg-white p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-[#0b1c3f] leading-tight whitespace-pre-line">{t('home.sib40.salon.title')}</h2>
          </div>
          <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-1">
            {SERVICE_KEYS.map((key) => (
              <ServiceCard key={key} sKey={key} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Sib40InternationalSection: React.FC = () => {
  const { t } = useTranslation();
  const { src: worldMapSrc } = useSiteImage('home_world_map');
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/3">
            <h2 className="text-3xl font-extrabold text-[#0b1c3f] mb-6">{t('home.sib40.international.title')}</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-8">{t('home.sib40.international.desc')}</p>
            <Link
              to={ROUTES.PAVILIONS}
              className="sib40-text-orange text-[10px] font-bold flex items-center gap-2 hover:translate-x-2 transition-transform uppercase tracking-widest"
            >
              {t('home.sib40.international.cta')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="lg:w-2/3 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <img alt={t('home.sib40.international.title')} className="w-full grayscale opacity-40" src={worldMapSrc} loading="lazy" />
            </div>
            <div className="w-full md:w-1/2 flex flex-wrap gap-4 justify-center">
              {FLAG_CODES.map((code) => (
                <div key={code} className="text-center">
                  <div className="w-16 h-10 shadow-md mb-2 overflow-hidden">
                    <img alt={t(`home.sib40.flags.${code}`)} className="w-full h-full object-cover" src={SIB40_IMAGES.flags[code]} loading="lazy" />
                  </div>
                  <p className="text-[8px] font-bold uppercase tracking-widest">{t(`home.sib40.flags.${code}`)}</p>
                </div>
              ))}
              <div className="text-center flex flex-col justify-center items-center h-16 w-16">
                <p className="text-lg font-bold sib40-text-orange">+30</p>
                <p className="text-[8px] font-bold uppercase tracking-tight leading-none text-center">{t('home.sib40.international.more')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Sib40CtaBanner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="relative h-[250px] overflow-hidden">
      <img alt="" className="absolute inset-0 w-full h-full object-cover grayscale brightness-50" src={SIB40_IMAGES.ctaBg} loading="lazy" />
      <div className="absolute inset-0 bg-[#0b1c3f]/40" />
      <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col md:flex-row items-center justify-between">
        <div className="text-white">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 whitespace-pre-line">{t('home.sib40.cta.title')}</h2>
          <p className="text-sm font-medium opacity-80 whitespace-pre-line">{t('home.sib40.cta.desc')}</p>
        </div>
        <Link
          to={ROUTES.EXHIBITOR_SUBSCRIPTION}
          className="sib40-orange px-10 py-5 text-white font-bold text-sm tracking-widest flex items-center gap-4 hover:bg-orange-600 transition-all mt-6 md:mt-0"
        >
          {t('home.sib40.cta.button')} <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
};

const SocialIcon: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-orange-500 transition-all"
  >
    {children}
  </a>
);

export const Sib40Footer: React.FC = () => {
  const { t } = useTranslation();
  const quickLinks = [
    { to: ROUTES.PRESENTATION,      label: t('home.sib40.footer.about')          },
    { to: ROUTES.POURQUOI_EXPOSER,  label: t('home.sib40.footer.exhibit')         },
    { to: ROUTES.PAVILIONS,         label: t('home.sib40.footer.international')   },
    { to: ROUTES.ACCOMMODATION,     label: t('home.sib40.footer.hotel')           },
    { to: ROUTES.POURQUOI_VISITER,  label: t('home.sib40.footer.visit')           },
    { to: ROUTES.NEWS,              label: t('home.sib40.footer.press')           },
  ];
  const practicalLinks = [
    { to: ROUTES.INFOS_PRATIQUES, label: t('home.sib40.footer.access')          },
    { to: ROUTES.TELECHARGEMENTS, label: t('home.sib40.footer.brochure_visitor') },
    { to: ROUTES.HALL_MAP,        label: t('home.sib40.footer.map')              },
    { to: ROUTES.INFOS_PRATIQUES, label: t('home.sib40.footer.faq')             },
  ];
  const downloadLinks = [
    { to: ROUTES.TELECHARGEMENTS, label: t('home.sib40.footer.brochure_exhibitor') },
    { to: ROUTES.TELECHARGEMENTS, label: t('home.sib40.footer.brochure_visitor')   },
    { to: ROUTES.HALL_MAP,        label: t('home.sib40.footer.map')                },
    { to: ROUTES.NEWS,            label: t('home.sib40.footer.press_kit')          },
    { to: ROUTES.INFOS_PRATIQUES, label: t('home.sib40.footer.faq')               },
  ];
  return (
    <footer className="sib40-dark-blue text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-1">
            <div className="text-white font-bold text-2xl flex items-baseline mb-3">
              SiB&nbsp;<span className="sib40-text-orange text-3xl">40</span><span className="text-xs uppercase ml-0.5">Ans</span>
            </div>
            <p className="text-[9px] text-gray-400 font-semibold leading-tight uppercase tracking-[0.15em] mb-6">
              {t('home.sib40.footer.tagline')}
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                </svg>
              </SocialIcon>
            </div>
          </div>
          {/* ACCÈS RAPIDE */}
          <div>
            <h4 className="sib40-text-orange text-[9px] font-bold uppercase tracking-[0.15em] mb-5">{t('home.sib40.footer.quick')}</h4>
            <ul className="text-[10px] space-y-3 font-medium text-gray-300">
              {quickLinks.map((l) => (
                <li key={l.label}><Link to={l.to} className="hover:text-orange-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          {/* INFOS PRATIQUES */}
          <div>
            <h4 className="sib40-text-orange text-[9px] font-bold uppercase tracking-[0.15em] mb-5">{t('home.sib40.footer.practical')}</h4>
            <ul className="text-[10px] space-y-3 font-medium text-gray-300">
              {practicalLinks.map((l) => (
                <li key={l.label}><Link to={l.to} className="hover:text-orange-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          {/* TÉLÉCHARGER */}
          <div>
            <h4 className="sib40-text-orange text-[9px] font-bold uppercase tracking-[0.15em] mb-5">{t('home.sib40.footer.download')}</h4>
            <ul className="text-[10px] space-y-3 font-medium text-gray-300">
              {downloadLinks.map((l) => (
                <li key={l.label}><Link to={l.to} className="hover:text-orange-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          {/* CONTACT */}
          <div>
            <h4 className="sib40-text-orange text-[9px] font-bold uppercase tracking-[0.15em] mb-5">{t('home.sib40.footer.contact')}</h4>
            <div className="text-[10px] space-y-3 text-gray-300">
              <p>+212 (0)5 29 36 68 16</p>
              <p>contact@sib.ma</p>
              <p className="whitespace-pre-line leading-relaxed">{t('home.sib40.footer.address')}</p>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest">
            © 2026 SIB – Salon International du Bâtiment. Tous droits réservés.
          </p>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest">
            Parc d'Exposition Mohammed VI · El Jadida · Maroc
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Building2, ArrowRight, Globe, Mic2, Cpu, Leaf, Wifi, Eye, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { SupabaseService } from '../../services/supabaseService';
import { useExhibitorStore } from '../../store/exhibitorStore';

/* ─────────────────────────────────────────────────────────────────────
   CONCEPT C — SMART CITY / FUTURISTE
   Palette : Blanc #FAFBFC · Cyan #06B6D4 · Indigo #4F46E5 · Vert #10B981
   Esprit  : Clean tech, BIM, wireframes, glassmorphisme, données en temps réel
   ───────────────────────────────────────────────────────────────────── */

const CYAN = '#06B6D4';
const INDIGO = '#4F46E5';

/* ── Countdown ── */
function useCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const end = new Date('2026-11-25T09:00:00').getTime();
    const tick = () => {
      const d = end - Date.now();
      if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return { days: Math.floor(d / 864e5), hours: Math.floor((d % 864e5) / 36e5), minutes: Math.floor((d % 36e5) / 6e4), seconds: Math.floor((d % 6e4) / 1e3) };
    };
    setT(tick());
    const id = setInterval(() => setT(tick()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}
const pad = (n: number) => String(n).padStart(2, '0');

/* ── Logo scroller ── */
const scrollCSS = `
@keyframes smart-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.smart-rail{display:flex;width:max-content;animation:smart-scroll var(--speed,38s) linear infinite}
.smart-band:hover .smart-rail{animation-play-state:paused}
`;

const LogoRail: React.FC<{ logos: { to: string; src: string; alt: string }[]; speed?: number }> = ({ logos, speed = 38 }) => {
  if (!logos.length) return null;
  const all = [...logos, ...logos, ...logos];
  return (
    <div className="smart-band relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-20" style={{ background: 'linear-gradient(to right, #FAFBFC, transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-20" style={{ background: 'linear-gradient(to left, #FAFBFC, transparent)' }} />
      <div className="smart-rail" style={{ '--speed': `${speed}s` } as React.CSSProperties}>
        {all.map((l, i) => (
          <Link key={i} to={l.to} className="flex-shrink-0 mx-4 flex items-center justify-center px-8 py-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-cyan-200 hover:scale-105 transition-all duration-400 group" title={l.alt}>
            <img src={l.src} alt={l.alt} className="h-14 lg:h-18 max-w-[170px] object-contain grayscale-[20%] group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-400" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </Link>
        ))}
      </div>
    </div>
  );
};

/* ── PAGE ── */
export default function HomeConceptC() {
  const { t } = useTranslation();
  const time = useCountdown();
  const { exhibitors, fetchExhibitors } = useExhibitorStore();
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    SupabaseService.getPartners().then(d => setPartners(d.filter(p => p.logo?.trim()))).catch(() => {});
    if (!exhibitors.length) fetchExhibitors();
  }, []);

  const partnerLogos = partners.map(p => ({ to: `${ROUTES.PARTNERS}/${p.id}`, src: p.logo, alt: p.name || '' }));
  const exhLogos = exhibitors.filter(e => e.logo?.trim()).map(e => ({ to: `${ROUTES.EXHIBITORS}/${e.id}`, src: e.logo || '', alt: e.companyName || '' }));

  const stats = [
    { v: '300+', l: t('stats.exhibitors'), icon: Building2, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { v: '6,000+', l: t('stats.visitors'), icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { v: '40', l: t('stats.countries'), icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { v: '40+', l: t('stats.conferences'), icon: Mic2, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  const features = [
    { icon: Cpu, title: 'BIM & Modélisation', desc: 'Technologies numériques pour le bâtiment intelligent' },
    { icon: Leaf, title: 'Éco-Construction', desc: 'Matériaux durables et certification verte' },
    { icon: Wifi, title: 'IoT & Domotique', desc: 'Bâtiments connectés et automation' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-800 selection:bg-cyan-200/50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{scrollCSS}</style>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen overflow-hidden flex items-center">
        {/* Grid lines background */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {/* Gradient orbs */}
        <div className="absolute top-20 right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-200/20 to-indigo-200/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Content */}
            <div>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-medium mb-8">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Sous l'égide du Ministère de l'Équipement et de l'Eau
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500">SIB 2026</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-light">
                  Le salon qui réinvente le <strong className="text-slate-700 font-semibold">bâtiment de demain</strong> — Innovation, durabilité et intelligence artificielle au service de la construction.
                </p>
              </motion.div>

              {/* Countdown — Clean pills */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12">
                <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-4 font-medium">Ouverture dans</p>
                <div className="flex gap-3">
                  {[
                    { val: time.days, label: 'jours' },
                    { val: time.hours, label: 'heures' },
                    { val: time.minutes, label: 'min' },
                    { val: time.seconds, label: 'sec' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 text-center min-w-[80px] hover:shadow-md hover:border-cyan-100 transition-all">
                      <div className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight font-mono">{pad(item.val)}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Location */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-slate-100">
                  <MapPin className="w-4 h-4 text-cyan-500" />Parc Mohammed VI • El Jadida
                </span>
                <span className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-slate-100">
                  <Calendar className="w-4 h-4 text-indigo-500" />25 — 29 Nov 2026
                </span>
              </motion.div>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-10 flex flex-wrap gap-4">
                <Link to={ROUTES.REGISTER_EXHIBITOR} className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-sm flex items-center gap-2">
                  Devenir Exposant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to={ROUTES.EXHIBITORS} className="px-8 py-4 bg-white text-slate-600 font-medium rounded-2xl border border-slate-200 hover:border-cyan-300 hover:text-cyan-600 transition-all text-sm">
                  Découvrir le Salon
                </Link>
              </motion.div>
            </div>

            {/* Right — Visual Card */}
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-200/30 via-indigo-200/20 to-emerald-200/30 rounded-[2rem] blur-2xl" />
                <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-1.5 shadow-2xl shadow-slate-200/50">
                  <img src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Smart Building" className="w-full h-80 object-cover rounded-[1.5rem]" />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1.5 text-xs text-slate-500">
                          <f.icon className="w-3 h-3 text-cyan-500" />{f.title}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-xl px-4 py-3">
                      <span className="text-sm font-medium text-slate-600">Innovation Index</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ duration: 1.5, delay: 1 }} className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" />
                        </div>
                        <span className="text-sm font-bold text-cyan-600">92%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-5 h-5 text-slate-300" />
        </motion.div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center group p-6 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${s.bg} mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">{s.v}</div>
                <div className="text-xs text-slate-400 uppercase tracking-[0.15em] mt-1 font-medium">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-lg hover:border-cyan-100 transition-all duration-400 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-indigo-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARTENAIRES ═══ */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs text-cyan-500 uppercase tracking-[0.25em] font-semibold">Écosystème</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Partenaires <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-500">Officiels</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {partners.slice(0, 3).map((p, i) => (
              <motion.div key={p.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`${ROUTES.PARTNERS}/${p.id}`} className="block group">
                  <div className="bg-slate-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-lg hover:shadow-slate-100 border border-transparent hover:border-cyan-100 transition-all duration-400">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-3 group-hover:scale-105 group-hover:border-cyan-200 transition-all">
                      {p.logo ? <img src={p.logo} alt={p.name || ''} className="w-full h-full object-contain" /> : <Eye className="w-8 h-8 text-slate-300" />}
                    </div>
                    <h3 className="text-base font-semibold text-slate-700">{p.organization_name || p.name}</h3>
                    {(p.partner_tier || p.partnerType) && <span className="inline-block text-[10px] text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full mt-2 uppercase tracking-wider font-semibold">{p.partner_tier || p.partnerType}</span>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {partnerLogos.length > 0 && (
            <>
              <p className="text-xs text-center text-slate-300 uppercase tracking-[0.2em] mb-6 font-medium">Nos partenaires</p>
              <LogoRail logos={partnerLogos} speed={Math.max(25, partners.length * 3.5)} />
            </>
          )}
        </div>
      </section>

      {/* ═══ EXPOSANTS ═══ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs text-indigo-500 uppercase tracking-[0.25em] font-semibold">Innovation</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Exposants <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">en vedette</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {exhibitors.filter(e => e.logo?.trim()).slice(0, 3).map((e, i) => (
              <motion.div key={e.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`${ROUTES.EXHIBITORS}/${e.id}`} className="block group">
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all duration-400">
                    <div className="h-44 bg-gradient-to-br from-slate-50 to-cyan-50/30 flex items-center justify-center">
                      {e.logo ? <img src={e.logo} alt={e.companyName || ''} className="h-24 max-w-[180px] object-contain group-hover:scale-110 transition-transform duration-400" /> : <Building2 className="w-14 h-14 text-slate-200" />}
                    </div>
                    <div className="p-6 border-t border-slate-50">
                      <h3 className="text-base font-semibold text-slate-700">{e.companyName}</h3>
                      {e.sector && <p className="text-xs text-slate-400 mt-1">{e.sector}</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {exhLogos.length > 0 && (
            <>
              <p className="text-xs text-center text-slate-300 uppercase tracking-[0.2em] mb-6 font-medium">Nos exposants</p>
              <LogoRail logos={exhLogos} speed={Math.max(28, exhLogos.length * 3.5)} />
            </>
          )}
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-indigo-500/5 to-emerald-500/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Le bâtiment du futur<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-500">se construit ici</span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
              BIM, éco-construction, smart building — découvrez les technologies qui transforment l'industrie du bâtiment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={ROUTES.REGISTER_EXHIBITOR} className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-sm">
                Réserver votre stand
              </Link>
              <Link to={ROUTES.EXHIBITORS} className="px-10 py-4 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:text-cyan-600 transition-all font-medium text-sm">
                Explorer les exposants
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

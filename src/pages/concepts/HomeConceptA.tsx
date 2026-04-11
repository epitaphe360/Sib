import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Building2, ArrowRight, Award, Globe, Mic2, ChevronDown, Sparkles, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { SupabaseService } from '../../services/supabaseService';
import { useExhibitorStore } from '../../store/exhibitorStore';

/* ─────────────────────────────────────────────────────────────────────
   CONCEPT A — PRESTIGE & OR
   Palette : Noir profond #09090B · Or #C5A47E · Crème #F5F0EB
   Esprit  : Galerie d'art, luxe discret, espaces aérés, lignes fines
   ───────────────────────────────────────────────────────────────────── */

const GOLD = '#C5A47E';
const DARK = '#09090B';

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
@keyframes prestige-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.prestige-rail{display:flex;width:max-content;animation:prestige-scroll var(--speed,40s) linear infinite}
.prestige-band:hover .prestige-rail{animation-play-state:paused}
`;

const LogoRail: React.FC<{ logos: { to: string; src: string; alt: string }[]; speed?: number }> = ({ logos, speed = 40 }) => {
  if (!logos.length) return null;
  const all = [...logos, ...logos, ...logos];
  return (
    <div className="prestige-band relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-20" style={{ background: `linear-gradient(to right, ${DARK}, transparent)` }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-20" style={{ background: `linear-gradient(to left, ${DARK}, transparent)` }} />
      <div className="prestige-rail" style={{ '--speed': `${speed}s` } as React.CSSProperties}>
        {all.map((l, i) => (
          <Link key={i} to={l.to} className="flex-shrink-0 mx-6 flex items-center justify-center px-8 py-4 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C5A47E]/30 transition-all duration-500 hover:scale-110 group" title={l.alt}>
            <img src={l.src} alt={l.alt} className="h-16 lg:h-20 max-w-[180px] object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-500" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </Link>
        ))}
      </div>
    </div>
  );
};

/* ── PAGE ── */
export default function HomeConceptA() {
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
    { v: '300+', l: t('stats.exhibitors'), icon: Building2 },
    { v: '6,000+', l: t('stats.visitors'), icon: Users },
    { v: '40', l: t('stats.countries'), icon: Globe },
    { v: '40+', l: t('stats.conferences'), icon: Mic2 },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#C5A47E]/30">
      <style>{scrollCSS}</style>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#09090B]" />
        </div>
        <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-[#C5A47E] to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center py-32">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-[#C5A47E] text-xs tracking-[0.4em] uppercase mb-2 font-medium">Sous l'égide du Ministère de l'Équipement et de l'Eau</p>
            <div className="w-16 h-px bg-[#C5A47E]/50 mx-auto mb-12" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9] mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <span className="text-white">SIB</span><span className="text-[#C5A47E]"> 2026</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
              Le rendez-vous incontournable du <span className="text-[#C5A47E]">bâtiment</span> et de la <span className="text-[#C5A47E]">construction</span> au Maroc
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-16">
            <p className="text-[#C5A47E]/60 text-xs tracking-[0.3em] uppercase mb-6">Compte à rebours</p>
            <div className="flex items-center justify-center gap-3 md:gap-6">
              {[
                { val: time.days, label: 'Jours' },
                { val: time.hours, label: 'Heures' },
                { val: time.minutes, label: 'Min' },
                { val: time.seconds, label: 'Sec' },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-[#C5A47E]/20 text-4xl font-thin hidden md:block">:</span>}
                  <div className="group">
                    <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl w-20 md:w-28 py-5 md:py-7 text-center hover:border-[#C5A47E]/20 transition-colors duration-500">
                      <div className="text-3xl md:text-5xl font-bold text-white tracking-tight font-mono">{pad(item.val)}</div>
                      <div className="text-[10px] md:text-xs text-[#C5A47E]/70 uppercase tracking-[0.2em] mt-2">{item.label}</div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#C5A47E]" />Parc d'Exposition Mohammed VI • El Jadida</span>
            <span className="w-1 h-1 rounded-full bg-[#C5A47E]/50" />
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#C5A47E]" />25 — 29 Novembre 2026</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.REGISTER_EXHIBITOR} className="group px-8 py-4 bg-[#C5A47E] text-[#09090B] font-semibold rounded-full hover:bg-[#d4b68e] transition-colors text-sm tracking-wide flex items-center gap-2">
              Devenir Exposant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to={ROUTES.EXHIBITORS} className="px-8 py-4 border border-white/10 text-white/70 hover:text-white hover:border-[#C5A47E]/40 rounded-full transition-all text-sm tracking-wide">
              Découvrir le Salon
            </Link>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-6 h-6 text-[#C5A47E]/40" />
        </motion.div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative py-24 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C5A47E]/[0.08] border border-[#C5A47E]/10 mb-5 group-hover:bg-[#C5A47E]/[0.15] transition-colors duration-500">
                  <s.icon className="w-6 h-6 text-[#C5A47E]" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{s.v}</div>
                <div className="text-sm text-white/40 uppercase tracking-[0.15em]">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARTENAIRES ═══ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Crown className="w-8 h-8 text-[#C5A47E] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Partenaires <span className="text-[#C5A47E]">Officiels</span></h2>
            <div className="w-20 h-px bg-[#C5A47E]/30 mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {partners.slice(0, 3).map((p, i) => (
              <motion.div key={p.id || i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <Link to={`${ROUTES.PARTNERS}/${p.id}`} className="block group">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center hover:border-[#C5A47E]/20 hover:bg-white/[0.04] transition-all duration-500">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center p-3 group-hover:scale-105 transition-transform duration-500">
                      {p.logo ? <img src={p.logo} alt={p.name || ''} className="w-full h-full object-contain" /> : <Award className="w-10 h-10 text-[#C5A47E]/30" />}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{p.organization_name || p.name}</h3>
                    {(p.partner_tier || p.partnerType) && <span className="inline-block text-xs text-[#C5A47E] bg-[#C5A47E]/10 px-3 py-1 rounded-full mt-2 uppercase tracking-wider">{p.partner_tier || p.partnerType}</span>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {partnerLogos.length > 0 && (
            <>
              <p className="text-xs text-center text-white/20 uppercase tracking-[0.25em] mb-6">Nos Partenaires</p>
              <LogoRail logos={partnerLogos} speed={Math.max(25, partners.length * 3.5)} />
            </>
          )}
        </div>
      </section>

      {/* ═══ EXPOSANTS ═══ */}
      <section className="py-24 bg-white/[0.01] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Sparkles className="w-8 h-8 text-[#C5A47E] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Exposants <span className="text-[#C5A47E]">à la Une</span></h2>
            <div className="w-20 h-px bg-[#C5A47E]/30 mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {exhibitors.filter(e => e.logo?.trim()).slice(0, 3).map((e, i) => (
              <motion.div key={e.id || i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <Link to={`${ROUTES.EXHIBITORS}/${e.id}`} className="block group">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#C5A47E]/20 hover:bg-white/[0.04] transition-all duration-500">
                    <div className="h-48 bg-gradient-to-br from-[#C5A47E]/5 to-transparent flex items-center justify-center">
                      {e.logo ? <img src={e.logo} alt={e.companyName || ''} className="h-28 max-w-[200px] object-contain group-hover:scale-110 transition-transform duration-500" /> : <Building2 className="w-16 h-16 text-white/10" />}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-1">{e.companyName}</h3>
                      {e.sector && <p className="text-sm text-white/40">{e.sector}</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {exhLogos.length > 0 && (
            <>
              <p className="text-xs text-center text-white/20 uppercase tracking-[0.25em] mb-6">Nos Exposants</p>
              <LogoRail logos={exhLogos} speed={Math.max(28, exhLogos.length * 3.5)} />
            </>
          )}
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-32 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Construisons <span className="text-[#C5A47E]">l'avenir</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
            Rejoignez les leaders du secteur du bâtiment et de la construction pour 5 jours d'innovation, de networking et de business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.REGISTER_EXHIBITOR} className="px-10 py-4 bg-[#C5A47E] text-[#09090B] font-semibold rounded-full hover:bg-[#d4b68e] transition-colors text-sm tracking-wide">
              Réserver votre stand
            </Link>
            <Link to={ROUTES.EXHIBITORS} className="px-10 py-4 border border-white/10 text-white/60 hover:text-white hover:border-[#C5A47E]/40 rounded-full transition-all text-sm tracking-wide">
              Explorer les exposants
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Building2, ArrowRight, Globe, Mic2, HardHat, Layers, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { SupabaseService } from '../../services/supabaseService';
import { useExhibitorStore } from '../../store/exhibitorStore';

/* ─────────────────────────────────────────────────────────────────────
   CONCEPT B — BÉTON BRUT / CHANTIER INDUSTRIEL
   Palette : Charbon #111111 · Orange chantier #FF6B00 · Béton #8B8680
   Esprit  : Brutalisme, typographie massive, textures béton, angles vifs
   ───────────────────────────────────────────────────────────────────── */

const ORANGE = '#FF6B00';
const CHARCOAL = '#111111';

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
@keyframes brut-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.brut-rail{display:flex;width:max-content;animation:brut-scroll var(--speed,35s) linear infinite}
.brut-band:hover .brut-rail{animation-play-state:paused}
`;

const LogoRail: React.FC<{ logos: { to: string; src: string; alt: string }[]; speed?: number }> = ({ logos, speed = 35 }) => {
  if (!logos.length) return null;
  const all = [...logos, ...logos, ...logos];
  return (
    <div className="brut-band relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-20" style={{ background: `linear-gradient(to right, #0A0A0A, transparent)` }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-20" style={{ background: `linear-gradient(to left, #0A0A0A, transparent)` }} />
      <div className="brut-rail" style={{ '--speed': `${speed}s` } as React.CSSProperties}>
        {all.map((l, i) => (
          <Link key={i} to={l.to} className="flex-shrink-0 mx-4 flex items-center justify-center px-6 py-4 bg-white/5 border-2 border-transparent hover:border-[#FF6B00] transition-all duration-300 group" title={l.alt}>
            <img src={l.src} alt={l.alt} className="h-14 lg:h-18 max-w-[170px] object-contain grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100 transition-all duration-300" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </Link>
        ))}
      </div>
    </div>
  );
};

/* ── PAGE ── */
export default function HomeConceptB() {
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
    { v: '300+', l: t('stats.exhibitors'), icon: Building2, accent: 'from-orange-500 to-red-600' },
    { v: '6,000+', l: t('stats.visitors'), icon: Users, accent: 'from-amber-500 to-orange-600' },
    { v: '40', l: t('stats.countries'), icon: Globe, accent: 'from-yellow-500 to-amber-600' },
    { v: '40+', l: t('stats.conferences'), icon: Mic2, accent: 'from-red-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FF6B00]/30" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{scrollCSS}</style>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Texture béton */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

        {/* Diagonale orange */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FF6B00] transform skew-x-[-8deg] translate-x-1/4 opacity-[0.04]" />

        {/* Barre latérale */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#FF6B00]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 min-h-screen flex flex-col justify-center py-24">
          {/* Ministère */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-0.5 bg-[#FF6B00]" />
              <span className="text-xs text-white/40 uppercase tracking-[0.3em]">Sous l'égide du Ministère de l'Équipement et de l'Eau</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h1 className="text-7xl md:text-[10rem] lg:text-[12rem] font-black leading-[0.85] tracking-tighter uppercase">
              <span className="text-white block">SIB</span>
              <span className="text-[#FF6B00] block">2026</span>
            </h1>
          </motion.div>

          {/* Subtitle + Info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 max-w-xl">
            <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed">
              Salon International du <strong className="text-white font-semibold">Bâtiment</strong> — Là où se construit le futur
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-white/30">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FF6B00]" />El Jadida, Maroc</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#FF6B00]" />25—29 Nov. 2026</span>
            </div>
          </motion.div>

          {/* Countdown — Industriel */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-16">
            <div className="flex items-stretch gap-1 md:gap-2">
              {[
                { val: time.days, label: 'JOURS' },
                { val: time.hours, label: 'HEURES' },
                { val: time.minutes, label: 'MIN' },
                { val: time.seconds, label: 'SEC' },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="bg-[#1A1A1A] border-t-4 border-[#FF6B00] px-4 md:px-8 py-5 md:py-8 text-center min-w-[70px] md:min-w-[110px]">
                    <div className="text-3xl md:text-6xl font-black text-white tracking-tighter font-mono">{pad(item.val)}</div>
                    <div className="text-[9px] md:text-[11px] text-white/30 uppercase tracking-[0.2em] mt-2 font-bold">{item.label}</div>
                  </div>
                  {/* Rivets */}
                  <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/10" />
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-12 flex flex-wrap gap-4">
            <Link to={ROUTES.REGISTER_EXHIBITOR} className="group px-8 py-4 bg-[#FF6B00] text-white font-bold uppercase tracking-wider text-sm hover:bg-[#FF8533] transition-colors flex items-center gap-3">
              <HardHat className="w-5 h-5" />
              Devenir Exposant
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to={ROUTES.EXHIBITORS} className="px-8 py-4 border-2 border-white/10 text-white/60 hover:text-white hover:border-[#FF6B00] font-bold uppercase tracking-wider text-sm transition-all">
              Découvrir le Salon
            </Link>
          </motion.div>
        </div>

        {/* Grande image côté droit (desktop) */}
        <div className="hidden xl:block absolute top-0 right-0 w-[45%] h-full">
          <img src="https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
          <div className="absolute inset-0 bg-[#FF6B00]/5 mix-blend-multiply" />
        </div>
      </section>

      {/* ═══ STATS - Panneaux industriels ═══ */}
      <section className="py-20 bg-[#0F0F0F] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[#1A1A1A] p-6 md:p-8 border-l-4 border-[#FF6B00] hover:bg-[#1F1F1F] transition-colors group"
              >
                <s.icon className="w-8 h-8 text-[#FF6B00] mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">{s.v}</div>
                <div className="text-xs text-white/30 uppercase tracking-[0.2em] mt-2 font-bold">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARTENAIRES ═══ */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-1 bg-[#FF6B00]" />
              <span className="text-xs text-white/30 uppercase tracking-[0.3em] font-bold">Ils nous soutiennent</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Partenaires <span className="text-[#FF6B00]">Officiels</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {partners.slice(0, 3).map((p, i) => (
              <motion.div key={p.id || i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`${ROUTES.PARTNERS}/${p.id}`} className="block group">
                  <div className="bg-[#151515] border-l-4 border-[#FF6B00] p-6 hover:bg-[#1A1A1A] transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        {p.logo ? <img src={p.logo} alt={p.name || ''} className="w-14 h-14 object-contain" /> : <Shield className="w-8 h-8 text-white/20" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{p.organization_name || p.name}</h3>
                        {(p.partner_tier || p.partnerType) && <span className="text-xs text-[#FF6B00] uppercase tracking-wider font-bold">{p.partner_tier || p.partnerType}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {partnerLogos.length > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-0.5 bg-[#FF6B00]" />
                <p className="text-xs text-white/20 uppercase tracking-[0.25em] font-bold">Tous nos partenaires</p>
              </div>
              <LogoRail logos={partnerLogos} speed={Math.max(25, partners.length * 3.5)} />
            </>
          )}
        </div>
      </section>

      {/* ═══ EXPOSANTS ═══ */}
      <section className="py-24 bg-[#0F0F0F] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-1 bg-[#FF6B00]" />
              <span className="text-xs text-white/30 uppercase tracking-[0.3em] font-bold">Secteur du bâtiment</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Exposants <span className="text-[#FF6B00]">en vedette</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {exhibitors.filter(e => e.logo?.trim()).slice(0, 3).map((e, i) => (
              <motion.div key={e.id || i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`${ROUTES.EXHIBITORS}/${e.id}`} className="block group">
                  <div className="bg-[#151515] overflow-hidden hover:bg-[#1A1A1A] transition-all duration-300 border-t-4 border-transparent hover:border-[#FF6B00]">
                    <div className="h-40 bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-center group-hover:from-[#FF6B00]/5">
                      {e.logo ? <img src={e.logo} alt={e.companyName || ''} className="h-24 max-w-[180px] object-contain group-hover:scale-110 transition-transform duration-300" /> : <Building2 className="w-16 h-16 text-white/10" />}
                    </div>
                    <div className="p-5 border-t border-white/5">
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">{e.companyName}</h3>
                      {e.sector && <p className="text-xs text-white/30 mt-1 uppercase tracking-wider">{e.sector}</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {exhLogos.length > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-0.5 bg-[#FF6B00]" />
                <p className="text-xs text-white/20 uppercase tracking-[0.25em] font-bold">Tous nos exposants</p>
              </div>
              <LogoRail logos={exhLogos} speed={Math.max(28, exhLogos.length * 3.5)} />
            </>
          )}
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-32 bg-[#0A0A0A] relative overflow-hidden">
        {/* Diagonale déco */}
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-[#FF6B00] transform skew-x-[-12deg] translate-x-1/3 opacity-[0.03]" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
              Bâtissez<br /><span className="text-[#FF6B00]">avec nous</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto mb-12 text-lg">
              5 jours. 300+ exposants. Une seule mission : façonner l'industrie du bâtiment de demain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={ROUTES.REGISTER_EXHIBITOR} className="px-10 py-5 bg-[#FF6B00] text-white font-black uppercase tracking-wider text-sm hover:bg-[#FF8533] transition-colors flex items-center gap-3">
                <HardHat className="w-5 h-5" />
                Réserver mon stand
              </Link>
              <Link to={ROUTES.EXHIBITORS} className="px-10 py-5 border-2 border-white/10 text-white/50 hover:text-white hover:border-[#FF6B00] font-bold uppercase tracking-wider text-sm transition-all">
                Voir tous les exposants
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

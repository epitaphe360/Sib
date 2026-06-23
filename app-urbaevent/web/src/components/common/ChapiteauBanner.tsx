import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tent, ArrowRight, Zap, CheckCircle } from "lucide-react";
import { ROUTES } from "../../lib/routes";

interface ChapiteauBannerProps {
  variant?: "hero" | "compact" | "sidebar";
  to?: string;
}

const SIZES = [
  { emoji: "⛺", label: "3×3m",   sub: "9 m² — Stand individuel",     price: "1 200" },
  { emoji: "🏕️", label: "5×5m",   sub: "25 m² — Exposant standard",   price: "2 500" },
  { emoji: "🎪", label: "10×10m", sub: "100 m² — Collectif/animation", price: "5 000" },
  { emoji: "🏟️", label: "20×40m", sub: "800 m² — Grand événement",    price: "18 000" },
];

const FEATURES = [
  "Installation & dépose incluses",
  "Structure aluminium professionnelle",
  "Bâches imperméables UV",
  "Disponible 25–29 nov. 2026",
];

function useSizeRotate(interval = 3000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % SIZES.length), interval);
    return () => clearInterval(id);
  }, [interval]);
  return { item: SIZES[index], index };
}

/* ── Hero banner ── */
function HeroBanner({ to }: { to: string }) {
  const { item: size } = useSizeRotate();
  const [hover, setHover] = useState(false);

  return (
    <section className="py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #0b1929 0%, #1e3a5f 45%, #0b1929 100%)",
            boxShadow: "0 24px 80px rgba(11,25,41,0.45)",
          }}>

          {/* Shimmer */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(243,146,0,0.07) 50%, transparent 60%)",
              zIndex: 0,
            }}
          />

          {/* Zellige */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cpath stroke='%232E5984' stroke-width='1' d='M30 0L60 30L30 60L0 30Z'/%3E%3Cpath stroke='%232E5984' stroke-width='0.6' d='M30 12L48 30L30 48L12 30Z'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%232E5984'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative z-10 p-8 md:p-14 grid md:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F39200]/15 border border-[#F39200]/30 rounded-full px-4 py-1.5 mb-5">
                <Zap className="w-3.5 h-3.5 text-[#F39200]" />
                <span className="text-[#F39200] text-xs font-semibold tracking-wide uppercase">
                  SIB 2026 — Nouveau module
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                Location de{" "}
                <span style={{ color: "#F39200" }}>Chapiteaux</span>
              </h2>
              <p className="text-[#F39200]/60 text-base mb-6 leading-relaxed">
                Du petit stand individuel au chapiteau géant — structures professionnelles
                avec installation assurée par notre équipe terrain.
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-[#F39200] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={to}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all"
                style={{
                  background: "linear-gradient(135deg, #F39200, #E07A00)",
                  color: "#0b1929",
                  boxShadow: hover ? "0 8px 32px rgba(243,146,0,0.4)" : "0 4px 16px rgba(243,146,0,0.2)",
                  transform: hover ? "translateY(-2px)" : "none",
                }}>
                <Tent className="w-4 h-4" />
                Réserver un chapiteau
                <motion.div animate={{ x: hover ? 4 : 0 }} transition={{ duration: 0.2 }}>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </div>

            {/* Right: rotating size card */}
            <div className="flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={size.label}
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(243,146,0,0.2)",
                    backdropFilter: "blur(8px)",
                    minWidth: 220,
                  }}>
                  <div className="text-6xl mb-3">{size.emoji}</div>
                  <div className="text-3xl font-black text-[#F39200] mb-1">{size.label}</div>
                  <div className="text-sm text-white/60 mb-4">{size.sub}</div>
                  <div className="bg-[#F39200]/10 rounded-xl px-4 py-2">
                    <div className="text-[#F39200] font-bold">{size.price} MAD/jour</div>
                    <div className="text-white/40 text-xs">Installation incluse</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Compact banner ── */
function CompactBanner({ to }: { to: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B1C3D, #1e3a5f)" }}>
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(243,146,0,0.15)" }}>
            <Tent className="w-5 h-5 text-[#F39200]" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">Location de Chapiteaux</div>
            <div className="text-[#F39200]/70 text-xs">Dès 1 200 MAD/jour • Installation incluse</div>
          </div>
        </div>
        <Link to={to}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0"
          style={{ background: "rgba(243,146,0,0.9)", color: "#0B1C3D" }}>
          Réserver <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Sidebar banner ── */
function SidebarBanner({ to }: { to: string }) {
  const { item: size } = useSizeRotate(2500);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0B1C3D, #1e3a5f)" }}>
      <div className="p-5">
        <div className="text-3xl mb-2">⛺</div>
        <div className="text-[#F39200] font-black text-base mb-1">Chapiteaux SIB 2026</div>
        <div className="text-white/60 text-xs mb-4">
          Structures professionnelles avec installation incluse
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={size.label}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white/5 rounded-xl p-3 mb-4 text-center">
            <div className="text-2xl">{size.emoji}</div>
            <div className="text-white font-bold text-sm">{size.label}</div>
            <div className="text-[#F39200] text-xs">{size.price} MAD/jour</div>
          </motion.div>
        </AnimatePresence>
        <Link to={to}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-[#0B1C3D] transition"
          style={{ background: "linear-gradient(135deg, #F39200, #E07A00)" }}>
          <Tent className="w-3.5 h-3.5" /> Voir les chapiteaux
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Export ── */
export default function ChapiteauBanner({ variant = "hero", to }: ChapiteauBannerProps) {
  const dest = to ?? ROUTES.CHAPITEAU_CATALOG;
  if (variant === "compact")  { return <CompactBanner  to={dest} />; }
  if (variant === "sidebar")  { return <SidebarBanner  to={dest} />; }
  return <HeroBanner to={dest} />;
}

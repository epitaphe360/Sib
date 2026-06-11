import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Package, ArrowRight, Zap, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { ROUTES } from "../../lib/routes";

interface RentalBannerProps {
  variant?: "hero" | "compact" | "sidebar";
  to?: string;
}

const CATEGORIES = [
  { emoji: "🪑", label: "Mobilier", sub: "Tables, chaises, podiums" },
  { emoji: "📺", label: "Audiovisuel", sub: "Écrans LED, sono, projecteurs" },
  { emoji: "⛺", label: "Structures", sub: "Stands, cloisons, verrières" },
  { emoji: "🌿", label: "Décoration", sub: "Plantes, éclairage ambiance" },
  { emoji: "💡", label: "Éclairage", sub: "Spots, néons, backlit" },
];

const STOCK_ITEMS = [
  { label: "Écrans LED 55\"", left: 3 },
  { label: "Stands modulaires", left: 5 },
  { label: "Systèmes sono", left: 2 },
  { label: "Tables cocktail", left: 8 },
];

function useStockRotate(items: typeof STOCK_ITEMS, interval = 2800) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items.length, interval]);
  return items[index];
}

function useCategoryRotate(items: typeof CATEGORIES, interval = 3200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items.length, interval]);
  return { item: items[index], index };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroBanner({ to }: { to: string }) {
  const stock = useStockRotate(STOCK_ITEMS);
  const { item: cat } = useCategoryRotate(CATEGORIES);
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
          }}
        >
          {/* Shimmer diagonal animé */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(243,146,0,0.07) 50%, transparent 60%)",
              zIndex: 0,
            }}
          />

          {/* Zellige de fond */}
          <div
            className="absolute inset-0 opacity-[0.045] pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cpath stroke='%232E5984' stroke-width='1' d='M30 0L60 30L30 60L0 30Z'/%3E%3Cpath stroke='%232E5984' stroke-width='0.6' d='M30 12L48 30L30 48L12 30Z'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%232E5984'/%3E%3Ccircle cx='0' cy='0' r='1.5' fill='%232E5984'/%3E%3Ccircle cx='60' cy='60' r='1.5' fill='%232E5984'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          {/* Glow dorée */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(243,146,0,0.14) 0%, transparent 65%)" }}
          />

          <div className="relative z-10 px-8 py-10 md:px-14 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-8">

            {/* Icône pulsante */}
            <motion.div
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="flex-shrink-0 p-5 rounded-2xl"
              style={{ background: "rgba(243,146,0,0.12)", border: "1px solid rgba(243,146,0,0.35)" }}
            >
              <Package className="h-12 w-12" style={{ color: "#F39200" }} />
            </motion.div>

            {/* Texte central */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge stock + statut */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-3">
                {/* Compteur stock rotatif */}
                <div className="relative h-7 overflow-hidden flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={stock.label}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                      style={{ background: "rgba(243,146,0,0.18)", color: "#F39200", border: "1px solid rgba(243,146,0,0.35)" }}
                    >
                      <Clock className="h-3 w-3" />
                      {stock.label} — {stock.left} restants
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  />
                  Disponible maintenant
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Équipez votre stand —{" "}
                <span style={{ color: "#F39200" }}>Location de matériel</span>
              </h2>

              {/* Catégorie animée */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mt-2">
                <span className="text-slate-400 text-sm">Disponible :</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cat.label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.38 }}
                    className="text-sm font-semibold"
                    style={{ color: "#2E5984" }}
                  >
                    {cat.emoji} {cat.label} — {cat.sub}
                  </motion.span>
                </AnimatePresence>
              </div>

              <p className="text-slate-400 text-sm mt-2">
                Réservez avant épuisement du stock.{" "}
                <span className="text-[#F39200] font-semibold">Places limitées, première réservation prioritaire.</span>
              </p>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              <Link to={to}>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHover(true)}
                  onHoverEnd={() => setHover(false)}
                  className="relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #F39200, #2E5984)", color: "#0b1929" }}
                >
                  <motion.span
                    animate={{ x: hover ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Voir le catalogue
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                  {/* Shimmer bouton */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)" }}
                  />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Compact (dashboard) ────────────────────────────────────────────────────
function CompactBanner({ to }: { to: string }) {
  const stock = useStockRotate(STOCK_ITEMS, 3000);
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0b1929 0%, #1e3a5f 100%)",
        boxShadow: "0 4px 20px rgba(15,32,52,0.22)",
      }}
    >
      {/* Barre dorée shimmer en haut */}
      <div className="relative h-1 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #F39200, #2E5984, #F39200)" }} />
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
        />
      </div>

      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="p-2.5 rounded-xl flex-shrink-0"
            style={{ background: "rgba(243,146,0,0.15)", border: "1px solid rgba(243,146,0,0.3)" }}
          >
            <Package className="h-6 w-6" style={{ color: "#F39200" }} />
          </motion.div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-bold text-sm">Location de matériel pour votre stand</span>
            </div>
            <div className="h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stock.label}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs flex items-center gap-1.5"
                  style={{ color: "#F39200" }}
                >
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  {stock.label} — <span className="font-bold">{stock.left} restants</span>
                  <span className="text-slate-400 ml-1">· Mobilier · Audiovisuel · Structures</span>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <Link to={to} className="flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHover(true)}
            onHoverEnd={() => setHover(false)}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap overflow-hidden"
            style={{ background: "linear-gradient(135deg, #F39200, #2E5984)", color: "#0b1929" }}
          >
            <Zap className="h-4 w-4" />
            Réserver maintenant
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: "linear" }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)" }}
            />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function SidebarBanner({ to }: { to: string }) {
  const stock = useStockRotate(STOCK_ITEMS, 3500);
  const { item: cat } = useCategoryRotate(CATEGORIES, 3000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0b1929 0%, #1e3a5f 100%)",
        border: "1px solid rgba(243,146,0,0.25)",
        boxShadow: "0 4px 16px rgba(15,32,52,0.18)",
      }}
    >
      {/* Barre shimmer */}
      <div className="relative h-0.5 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #F39200, #2E5984)" }} />
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <Package className="h-5 w-5" style={{ color: "#F39200" }} />
          </motion.div>
          <span className="text-white font-bold text-sm">Location matériel</span>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full ml-auto bg-emerald-400"
          />
        </div>

        {/* Catégorie animée */}
        <div className="h-5 overflow-hidden mb-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={cat.label}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-xs"
              style={{ color: "#2E5984" }}
            >
              {cat.emoji} {cat.label} — {cat.sub}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Stock rotatif */}
        <div className="h-5 overflow-hidden mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={stock.label}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#F39200" }}
            >
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="font-bold">{stock.label}</span> — {stock.left} restants
            </motion.div>
          </AnimatePresence>
        </div>

        <Link to={to} className="block">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs overflow-hidden"
            style={{ background: "linear-gradient(135deg, #F39200, #2E5984)", color: "#0b1929" }}
          >
            Voir le catalogue <ArrowRight className="h-3.5 w-3.5" />
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "linear" }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)" }}
            />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Export principal ────────────────────────────────────────────────────────
export function RentalBanner({ variant = "compact", to = ROUTES.RENTAL_CATALOG }: RentalBannerProps) {
  if (variant === "hero") { return <HeroBanner to={to} />; }
  if (variant === "sidebar") { return <SidebarBanner to={to} />; }
  return <CompactBanner to={to} />;
}

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Megaphone, TrendingUp } from 'lucide-react';
import { ROUTES } from '../../lib/routes';

interface AdvertisingBannerProps {
  /** 'compact' = petit encart dashboard | 'sidebar' = colonne latérale | 'hero' = grande bannière */
  variant?: 'compact' | 'sidebar' | 'hero';
  to?: string;
}

/* ── Compact ────────────────────────────────────────────────────────────────── */
function CompactBanner({ to }: { to: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0B1C3D 0%, #1e3a5f 100%)' }}>
      <div className="px-4 py-4 flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(243,146,0,0.18)' }}>
          <Megaphone className="w-5 h-5 text-[#F39200]" />
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Espaces Publicitaires</p>
          <p className="text-[#F39200]/80 text-xs mt-0.5 line-clamp-1">
            Boostez votre visibilité SIB 2026
          </p>
        </div>
        {/* CTA */}
        <Link to={to}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#0B1C3D] text-xs font-bold transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #F39200, #E07A00)' }}>
          <TrendingUp className="w-3.5 h-3.5" /> Réserver
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Sidebar ────────────────────────────────────────────────────────────────── */
function SidebarBanner({ to }: { to: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden p-4 flex flex-col gap-3"
      style={{ background: 'linear-gradient(135deg, #0B1C3D 0%, #1e3a5f 100%)' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(243,146,0,0.18)' }}>
          <Megaphone className="w-4 h-4 text-[#F39200]" />
        </div>
        <span className="text-white font-bold text-sm">Pub SIB 2026</span>
      </div>
      <p className="text-[#F39200]/80 text-xs leading-relaxed">
        Bannières, emails, push, espaces physiques… Touchez +5 000 visiteurs B2B.
      </p>
      <Link to={to}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-[#0B1C3D] transition hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #F39200, #E07A00)' }}>
        <Megaphone className="w-3.5 h-3.5" /> Voir les espaces
      </Link>
    </motion.div>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────────── */
function HeroBanner({ to }: { to: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0B1C3D 0%, #1e3a5f 60%, #0B1C3D 100%)' }}>
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cpath stroke='%232E5984' stroke-width='1' d='M30 0L60 30L30 60L0 30Z'/%3E%3C/g%3E%3C/svg%3E\")",
        }} />
      <div className="relative z-10 px-8 py-10 text-white">
        <div className="text-5xl mb-3">📢</div>
        <h2 className="text-2xl font-bold mb-2">Espaces Publicitaires SIB 2026</h2>
        <p className="text-[#F39200]/80 max-w-md mb-6 text-sm">
          Bannières, email marketing, notifications push, espaces physiques…
          Maximisez votre impact auprès de +5 000 visiteurs et décideurs B2B.
        </p>
        <Link to={to}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[#0B1C3D] font-bold text-sm shadow hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #F39200, #E07A00)' }}>
          <Megaphone className="w-4 h-4" /> Découvrir les espaces
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Export ─────────────────────────────────────────────────────────────────── */
export default function AdvertisingBanner({ variant = 'hero', to }: AdvertisingBannerProps) {
  const dest = to ?? ROUTES.EXHIBITOR_ADVERTISING;
  if (variant === 'compact')  { return <CompactBanner  to={dest} />; }
  if (variant === 'sidebar')  { return <SidebarBanner  to={dest} />; }
  return <HeroBanner to={dest} />;
}

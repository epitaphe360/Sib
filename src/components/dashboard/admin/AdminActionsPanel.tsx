import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ClipboardList, CreditCard, FileText,
  Building2, Handshake, Crown, Users,
  Calendar, Newspaper, LayoutGrid,
  Video, Mail, BarChart3,
  Power, ChevronRight,
} from 'lucide-react';
import { ROUTES } from '../../../lib/routes';

// ─── Variants stagger pour les grilles de tuiles ───────────────────────────
const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 150, damping: 15 } },
};

interface AdminActionsPanelProps {
  adminMetrics: Record<string, number | unknown>;
  showRegistrationRequests: boolean;
  onToggleRegistrationRequests: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

// ─── Tuile générique ───────────────────────────────────────────────────────
interface TileProps {
  Icon: React.FC<{ className?: string }>;
  label: string;
  sub?: string;
  badge?: number | null;
  urgent?: boolean;
  active?: boolean;
}

function Tile({ Icon, label, sub, badge, urgent, active }: TileProps) {
  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ y: -4, scale: 1.03, boxShadow: urgent ? '0 0 24px rgba(201,168,76,0.2)' : '0 0 20px rgba(255,255,255,0.08)' }}
      whileTap={{ scale: 0.96 }}
      className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl transition-all cursor-pointer select-none relative"
      style={{
        background: urgent ? 'rgba(201,168,76,0.07)' : active ? 'rgba(201,168,76,0.05)' : 'rgba(255,255,255,0.03)',
        border: urgent ? '1px solid rgba(201,168,76,0.45)' : active ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Badge urgence */}
      {badge != null && badge > 0 && (
        <span className="absolute top-3 right-3 bg-[#C9A84C] text-[#0F2034] text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center leading-tight">
          {badge}
        </span>
      )}

      {/* Icône grande */}
      <div className={`p-4 rounded-2xl ${urgent ? 'bg-[#C9A84C]/20' : 'bg-white/6'}`}>
        <Icon className={`h-11 w-11 ${urgent ? 'text-[#C9A84C]' : 'text-white/60'}`} />
      </div>

      {/* Texte */}
      <div className="text-center">
        <div className="text-sm font-bold leading-tight" style={{ color: urgent ? '#C9A84C' : 'rgba(255,255,255,0.82)' }}>{label}</div>
        {sub && <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ─── Titre de section ────────────────────────────────────────────────────
function SectionTitle({ icon, label, sub }: { icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-4 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span>{icon}</span>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C9A84C', letterSpacing: '0.15em' }}>{label}</h3>
        {sub && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────
export function AdminActionsPanel({
  adminMetrics: m,
  showRegistrationRequests,
  onToggleRegistrationRequests,
  t,
}: AdminActionsPanelProps) {
  const metrics = m as any;
  const pendingVal = metrics.pendingValidations || 0;
  const pendingMod = metrics.contentModerations || 0;
  const totalUrgent = pendingVal + pendingMod;

  return (
    <div className="mb-12">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: 0.05 }}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
        >

          {/* Header navy animé */}
          <div
            className="bg-[#0F2034] px-8 py-5 flex items-center justify-between animate-gradient-x"
            style={{ background: 'linear-gradient(90deg, #0F2034, #1B365D, #0F2034)', backgroundSize: '300% auto' }}
          >
            <div className="flex items-center gap-4">
              <Power className="h-6 w-6 text-[#C9A84C]" />
              <span className="text-white font-semibold text-base">Actions &amp; Navigation</span>
            </div>
            {totalUrgent > 0 && (
              <span className="bg-[#C9A84C] text-[#0F2034] text-xs font-bold px-3 py-1.5 rounded-full">
                {totalUrgent} en attente
              </span>
            )}
          </div>

          <div className="p-8 space-y-10">

            {/* ── URGENCES ─────────────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<AlertCircle className="h-5 w-5 text-[#C9A84C]" />}
                label="Urgences"
                sub="Actions nécessitant une réponse"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-3 gap-5">

                {/* Inscriptions — navigation vers la page dédiée */}
                <Link to={ROUTES.ADMIN_REGISTRATION_REQUESTS}>
                  <Tile
                    Icon={ClipboardList}
                    label={t('admin.registration_requests')}
                    sub={t('admin.click_to_process')}
                    badge={pendingVal}
                    urgent={pendingVal > 0}
                  />
                </Link>

                {/* Validation paiements — lien, sans montants */}
                <Link to={ROUTES.ADMIN_PAYMENT_VALIDATION}>
                  <Tile
                    Icon={CreditCard}
                    label={t('admin.payment_validation')}
                    sub="Activer les tableaux de bord"
                  />
                </Link>

                {/* Modération */}
                <Link to={ROUTES.ADMIN_PUBLICATION_CONTROL}>
                  <Tile
                    Icon={FileText}
                    label={t('admin.content_moderation')}
                    sub={t('admin.required_actions')}
                    badge={pendingMod}
                    urgent={pendingMod > 0}
                  />
                </Link>
              </motion.div>
            </div>

            {/* ── PARTICIPANTS ─────────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Users className="h-5 w-5 text-[#1B365D]" />}
                label="Participants"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <Link to={ROUTES.ADMIN_EXHIBITORS}>
                  <Tile Icon={Building2} label="Exposants" sub={`${metrics.totalExhibitors || 0} inscrits`} />
                </Link>
                <Link to={ROUTES.ADMIN_PARTNERS_MANAGE}>
                  <Tile Icon={Handshake} label="Partenaires" sub={`${metrics.totalPartners || 0} actifs`} />
                </Link>
                <Link to={ROUTES.ADMIN_VIP_VISITORS}>
                  <Tile Icon={Crown} label={t('admin.vip_visitors_management')} sub={t('admin.view_list')} />
                </Link>
                <Link to={ROUTES.ADMIN_USERS}>
                  <Tile Icon={Users} label={t('admin.users_label')} sub={`${metrics.totalUsers || 0} comptes`} />
                </Link>
              </motion.div>
            </div>

            {/* ── CONTENU ──────────────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Calendar className="h-5 w-5 text-[#1B365D]" />}
                label="Contenu"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <Link to={ROUTES.ADMIN_EVENTS}>
                  <Tile Icon={Calendar} label="Événements" sub={`${metrics.totalEvents || 0} programmés`} />
                </Link>
                <Link to={ROUTES.ADMIN_NEWS}>
                  <Tile Icon={Newspaper} label="Articles" sub="Actualités du salon" />
                </Link>
                <Link to={ROUTES.ADMIN_PAVILIONS}>
                  <Tile Icon={LayoutGrid} label="Pavillons" sub={`${metrics.totalExhibitors || 0} stands`} />
                </Link>
              </motion.div>
            </div>

            {/* ── MÉDIAS & STATS ───────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Video className="h-5 w-5 text-[#1B365D]" />}
                label="Médias &amp; Statistiques"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <Link to={ROUTES.ADMIN_MEDIA_MANAGE}>
                  <Tile Icon={Video} label="Médias" sub="Bibliothèque" />
                </Link>
                <Link to={ROUTES.ADMIN_EMAIL_TEMPLATES}>
                  <Tile Icon={Mail} label="Templates email" sub="Communications" />
                </Link>
                <Link to={ROUTES.METRICS}>
                  <Tile Icon={BarChart3} label="Statistiques" sub="Métriques plateforme" />
                </Link>
              </motion.div>
            </div>

            {/* ── CONTRÔLE TOTAL ───────────────────────────────────── */}
            <Link to={ROUTES.ADMIN_PUBLICATION_CONTROL}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              className="flex items-center justify-between px-8 py-5 rounded-2xl transition-all"
              style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.25)' }}
              onHoverStart={e => ((e.target as HTMLElement).closest('.control-btn') as HTMLElement | null)?.style && ((e.target as HTMLElement).closest('.control-btn') as any)?.style.setProperty('border-color', 'rgba(201,168,76,0.5)')}
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30">
                    <Power className="h-6 w-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{t('admin.total_control')}</div>
                    <div className="text-slate-400 text-xs mt-1">Contrôle publication et accès complet</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#C9A84C]/70" />
              </motion.div>
            </Link>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

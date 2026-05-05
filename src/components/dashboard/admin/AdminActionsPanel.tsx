import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ClipboardList, CreditCard, FileText,
  Building2, Handshake, Crown, Users,
  Calendar, LayoutGrid,
  Video, BarChart3, Image as ImageIcon,
  Power, ChevronRight,
  Package, UserPlus,
  ActivitySquare, CheckSquare, ShieldAlert, Mic,
  MapPin,
  Globe,
  BadgeCheck,
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
  t: (key: string, params?: Record<string, string | number> | string) => string;
}

// ─── Tuile générique ───────────────────────────────────────────────────────
interface TileProps {
  Icon: React.FC<{ className?: string }>;
  label: string;
  sub?: string;
  badge?: number | null;
  urgent?: boolean;
  active?: boolean;
  color?: string;   // accent hex
}

function Tile({ Icon, label, sub, badge, urgent, active, color = '#6366f1' }: TileProps) {
  const accentColor = urgent ? '#f59e0b' : color;
  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ y: -5, scale: 1.04, boxShadow: `0 8px 28px ${accentColor}30` }}
      whileTap={{ scale: 0.96 }}
      className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all cursor-pointer select-none relative overflow-hidden"
      style={{
        background: urgent ? `${accentColor}0f` : active ? `${accentColor}08` : '#ffffff',
        border: `1px solid ${accentColor}25`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Subtle top accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: accentColor }} />

      {/* Badge */}
      {badge != null && badge > 0 && (
        <span className="absolute top-3 right-3 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center leading-tight" style={{ background: accentColor }}>
          {badge}
        </span>
      )}

      {/* Icône */}
      <div className="p-3 rounded-xl" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
        <Icon className="h-9 w-9" style={{ color: accentColor }} />
      </div>

      {/* Texte */}
      <div className="text-center">
        <div className="text-sm font-bold leading-tight text-gray-800">{label}</div>
        {sub && <div className="text-xs mt-0.5 text-gray-500">{sub}</div>}
      </div>
    </motion.div>
  );
}

// ─── Titre de section ────────────────────────────────────────────────────
function SectionTitle({ icon, label, sub, color = '#6366f1' }: { icon: React.ReactNode; label: string; sub?: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >{icon}</span>
      <div className="flex-1">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color, letterSpacing: '0.15em' }}>{label}</h3>
        {sub && <p className="text-xs mt-0.5 text-gray-400">{sub}</p>}
      </div>
      <div className="h-px flex-1 ml-2" style={{ background: `linear-gradient(to right, ${color}30, transparent)` }} />
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────
export function AdminActionsPanel({
  adminMetrics: m,
  showRegistrationRequests: _showRegistrationRequests,
  onToggleRegistrationRequests: _onToggleRegistrationRequests,
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
          style={{ background: '#ffffff', border: '1px solid rgba(30,58,95,0.1)', boxShadow: '0 2px 12px rgba(30,58,95,0.06)' }}
        >

          {/* Header indigo gradient */}
          <div className="px-8 py-5 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/15 border border-white/25">
                <Power className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-semibold text-base">Actions &amp; Navigation</span>
            </div>
            {totalUrgent > 0 && (
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                {totalUrgent} en attente
              </span>
            )}
          </div>

          <div className="p-8 space-y-10">

            {/* ── URGENCES ─────────────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<AlertCircle className="h-4 w-4" style={{ color: '#f59e0b' }} />}
                label="Urgences"
                sub="Actions nécessitant une réponse"
                color="#f59e0b"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link to={ROUTES.ADMIN_REGISTRATION_REQUESTS}>
                  <Tile Icon={ClipboardList} label={t('admin.registration_requests')} sub={t('admin.click_to_process')} badge={pendingVal} urgent={pendingVal > 0} color="#f59e0b" />
                </Link>
                <Link to={ROUTES.ADMIN_PAYMENT_VALIDATION}>
                  <Tile Icon={CreditCard} label={t('admin.payment_validation')} sub="Activer les tableaux de bord" color="#f59e0b" />
                </Link>
                <Link to={ROUTES.ADMIN_PUBLICATION_CONTROL}>
                  <Tile Icon={FileText} label={t('admin.content_moderation')} sub={t('admin.required_actions')} badge={pendingMod} urgent={pendingMod > 0} color="#f59e0b" />
                </Link>
                <Link to={ROUTES.ADMIN_VISA_LETTERS}>
                  <Tile Icon={Globe} label="Lettres Visa" sub="Demandes d'invitation" color="#f59e0b" />
                </Link>
              </motion.div>
            </div>

            {/* ── GESTION PARTICIPANTS ──────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Users className="h-4 w-4" style={{ color: '#6366f1' }} />}
                label="Gestion Participants"
                color="#6366f1"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to={ROUTES.ADMIN_EXHIBITORS}>
                  <Tile Icon={Building2} label="Gestion Exposants" sub={`${metrics.totalExhibitors || 0} inscrits`} color="#6366f1" />
                </Link>
                <Link to={ROUTES.ADMIN_PARTNERS_MANAGE}>
                  <Tile Icon={Handshake} label="Gestion Sponsors" sub={`${metrics.totalPartners || 0} actifs`} color="#6366f1" />
                </Link>
                <Link to={ROUTES.ADMIN_VIP_VISITORS}>
                  <Tile Icon={Crown} label={t('admin.vip_visitors_management')} sub={t('admin.view_list')} color="#6366f1" />
                </Link>
                <Link to={ROUTES.ADMIN_USERS}>
                  <Tile Icon={Users} label={t('admin.users_label')} sub={`${metrics.totalUsers || 0} comptes`} color="#6366f1" />
                </Link>
                <Link to={ROUTES.ADMIN_PRESS_ACCREDITATIONS}>
                  <Tile Icon={Mic} label="Gestion Presse Média" sub="Journalistes & médias" color="#6366f1" />
                </Link>
              </motion.div>
            </div>

            {/* ── CONTENU ──────────────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Calendar className="h-4 w-4" style={{ color: '#10b981' }} />}
                label="Contenu"
                color="#10b981"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link to={ROUTES.ADMIN_EVENTS}>
                  <Tile Icon={Calendar} label="Événements" sub={`${metrics.totalEvents || 0} programmés`} color="#10b981" />
                </Link>
                <Link to={ROUTES.ADMIN_PAVILIONS}>
                  <Tile Icon={LayoutGrid} label="Pavillons" sub={`${metrics.totalExhibitors || 0} stands`} color="#10b981" />
                </Link>
              </motion.div>
            </div>

            {/* ── MÉDIAS & STATS ───────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Video className="h-4 w-4" style={{ color: '#8b5cf6' }} />}
                label="Médias & Statistiques"
                color="#8b5cf6"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link to={ROUTES.ADMIN_MEDIA_MANAGE}>
                  <Tile Icon={Video} label="Gestion Media" sub="Bibliothèque" color="#8b5cf6" />
                </Link>
                <Link to={ROUTES.ADMIN_MEDIA_LIBRARY}>
                  <Tile Icon={ImageIcon} label="Bibliothèque Images & Vidéos" sub="Photos · Vidéos · Assets" color="#8b5cf6" />
                </Link>
                <Link to={ROUTES.METRICS}>
                  <Tile Icon={BarChart3} label="Statistiques" sub="Métriques plateforme" color="#8b5cf6" />
                </Link>
              </motion.div>
            </div>

            {/* ── NOUVEAUX MODULES ─────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Package className="h-4 w-4" style={{ color: '#0ea5e9' }} />}
                label="Nouveaux Modules"
                sub="Fonctionnalités SIB 2026"
                color="#0ea5e9"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to={ROUTES.ADMIN_RENTAL}>
                  <Tile Icon={Package} label="Location Matériel" sub="Stock & Commandes" color="#0ea5e9" />
                </Link>
                <Link to={ROUTES.ADMIN_STAND_COLLABORATORS}>
                  <Tile Icon={UserPlus} label="Collaborateurs Stand" sub="Gestion équipes" color="#0ea5e9" />
                </Link>
                <Link to={ROUTES.ADMIN_BADGE_CONFIG}>
                  <Tile Icon={BadgeCheck} label="Badge A4" sub="Personnalisation bifold" color="#0ea5e9" />
                </Link>
              </motion.div>
            </div>

            {/* ── AUDIT & VALIDATION ───────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<ShieldAlert className="h-4 w-4" style={{ color: '#ef4444' }} />}
                label="Audit & Validation"
                sub="Suivi et contrôle qualité"
                color="#ef4444"
              />
              <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link to={ROUTES.ADMIN_ACTIVITY}>
                  <Tile Icon={ActivitySquare} label="Journal d'Activité" sub="Audit complet" color="#ef4444" />
                </Link>
                <Link to={ROUTES.ADMIN_VALIDATION}>
                  <Tile Icon={CheckSquare} label="Validation Comptes" sub="Approuver / Rejeter" badge={(metrics as any).pendingValidations || null} urgent={(metrics as any).pendingValidations > 0} color="#ef4444" />
                </Link>
                <Link to={ROUTES.ADMIN_MODERATION}>
                  <Tile Icon={ShieldAlert} label="Modération" sub="Contenu signalé" badge={(metrics as any).contentModerations || null} urgent={(metrics as any).contentModerations > 0} color="#ef4444" />
                </Link>
                <Link to={ROUTES.ADMIN_SECURITY_ZONES}>
                  <Tile Icon={MapPin} label="Zones de Contrôle" sub="Ajouter / Modifier" color="#ef4444" />
                </Link>
              </motion.div>
            </div>

            {/* ── CONTRÔLE TOTAL ───────────────────────────────────── */}
            <Link to={ROUTES.ADMIN_PUBLICATION_CONTROL}>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-between px-8 py-5 rounded-2xl transition-all bg-gradient-to-r from-indigo-50 to-purple-50"
                style={{ border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-xl bg-indigo-100 border border-indigo-200">
                    <Power className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-indigo-900">{t('admin.total_control')}</div>
                    <div className="text-indigo-400 text-xs mt-1">Contrôle publication et accès complet</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-400" />
              </motion.div>
            </Link>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

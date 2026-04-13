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
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer select-none relative
        ${urgent
          ? 'border-[#C9A84C] bg-[#C9A84C]/8 hover:bg-[#C9A84C]/14'
          : active
          ? 'border-[#1B365D] bg-[#1B365D]/6'
          : 'border-sib-gray-200 bg-white hover:border-[#1B365D]/40 hover:bg-[#1B365D]/4'
        }`}
    >
      {/* Badge urgence */}
      {badge != null && badge > 0 && (
        <span className="absolute top-2.5 right-2.5 bg-[#C9A84C] text-[#0F2034] text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-tight">
          {badge}
        </span>
      )}

      {/* Icône grande */}
      <div className={`p-4 rounded-2xl ${urgent ? 'bg-[#C9A84C]/20' : 'bg-[#1B365D]/8'}`}>
        <Icon className={`h-10 w-10 ${urgent ? 'text-[#A88830]' : 'text-[#1B365D]'}`} />
      </div>

      {/* Texte */}
      <div className="text-center">
        <div className="text-sm font-bold text-[#0F2034] leading-tight">{label}</div>
        {sub && <div className="text-xs text-sib-gray-400 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

// ─── Titre de section ────────────────────────────────────────────────────
function SectionTitle({ icon, label, sub }: { icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span>{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-[#0F2034] uppercase tracking-wider">{label}</h3>
        {sub && <p className="text-xs text-sib-gray-400">{sub}</p>}
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
    <div className="mb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-xl shadow-sib border border-sib-gray-100 overflow-hidden">

          {/* Header navy */}
          <div className="bg-[#0F2034] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Power className="h-5 w-5 text-[#C9A84C]" />
              <span className="text-white font-semibold text-sm">Actions &amp; Navigation</span>
            </div>
            {totalUrgent > 0 && (
              <span className="bg-[#C9A84C] text-[#0F2034] text-xs font-bold px-2.5 py-1 rounded-full">
                {totalUrgent} en attente
              </span>
            )}
          </div>

          <div className="p-6 space-y-8">

            {/* ── URGENCES ─────────────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<AlertCircle className="h-4 w-4 text-[#C9A84C]" />}
                label="Urgences"
                sub="Actions nécessitant une réponse"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                {/* Inscriptions — bouton toggle */}
                <button className="text-left" onClick={onToggleRegistrationRequests}>
                  <Tile
                    Icon={ClipboardList}
                    label={t('admin.registration_requests')}
                    sub={t('admin.click_to_process')}
                    badge={pendingVal}
                    urgent={pendingVal > 0}
                    active={showRegistrationRequests}
                  />
                </button>

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
              </div>
            </div>

            {/* ── PARTICIPANTS ─────────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Users className="h-4 w-4 text-[#1B365D]" />}
                label="Participants"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              </div>
            </div>

            {/* ── CONTENU ──────────────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Calendar className="h-4 w-4 text-[#1B365D]" />}
                label="Contenu"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link to={ROUTES.ADMIN_EVENTS}>
                  <Tile Icon={Calendar} label="Événements" sub={`${metrics.totalEvents || 0} programmés`} />
                </Link>
                <Link to={ROUTES.ADMIN_NEWS}>
                  <Tile Icon={Newspaper} label="Articles" sub="Actualités du salon" />
                </Link>
                <Link to={ROUTES.ADMIN_PAVILIONS}>
                  <Tile Icon={LayoutGrid} label="Pavillons" sub={`${metrics.totalExhibitors || 0} stands`} />
                </Link>
              </div>
            </div>

            {/* ── MÉDIAS & STATS ───────────────────────────────────── */}
            <div>
              <SectionTitle
                icon={<Video className="h-4 w-4 text-[#1B365D]" />}
                label="Médias &amp; Statistiques"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link to={ROUTES.ADMIN_MEDIA_MANAGE}>
                  <Tile Icon={Video} label="Médias" sub="Bibliothèque" />
                </Link>
                <Link to={ROUTES.ADMIN_EMAIL_TEMPLATES}>
                  <Tile Icon={Mail} label="Templates email" sub="Communications" />
                </Link>
                <Link to={ROUTES.METRICS}>
                  <Tile Icon={BarChart3} label="Statistiques" sub="Métriques plateforme" />
                </Link>
              </div>
            </div>

            {/* ── CONTRÔLE TOTAL ───────────────────────────────────── */}
            <Link to={ROUTES.ADMIN_PUBLICATION_CONTROL}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between bg-[#0F2034] hover:bg-[#1B365D] border-2 border-[#C9A84C]/40 hover:border-[#C9A84C]/70 text-white px-6 py-4 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30">
                    <Power className="h-6 w-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <div className="font-bold text-base">{t('admin.total_control')}</div>
                    <div className="text-slate-400 text-xs mt-0.5">Contrôle publication et accès complet</div>
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

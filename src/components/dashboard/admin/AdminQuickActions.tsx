import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3, Users, Building2, Calendar, Award, Plus, FileText,
  Video, Shield, Mail, Handshake, Crown, Power, ChevronRight
} from 'lucide-react';
import { ROUTES } from '../../../lib/routes';

interface AdminQuickActionsProps {
  adminMetrics: Record<string, number | unknown>;
  t: (key: string, params?: Record<string, unknown>) => string;
}

/** Lien d'action uniforme â€” navy + or sur hover */
function ActionLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ x: 4 }}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#334155] hover:text-[#1B365D] hover:bg-[#1B365D]/5 transition-all group"
      >
        <span className="flex-shrink-0 text-[#C9A84C] group-hover:text-[#A88830] transition-colors">{icon}</span>
        <span className="text-xs font-semibold truncate">{label}</span>
        <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
      </motion.div>
    </Link>
  );
}

/** Titre de colonne uniforme */
function ColHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sib-gray-100">
      <span className="text-[#C9A84C]">{icon}</span>
      <span className="text-xs font-bold text-[#1B365D] uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function AdminQuickActions({ adminMetrics: m, t }: AdminQuickActionsProps) {
  const metrics = m as any;

  return (
    <div className="mb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="bg-white rounded-xl shadow-sib border border-sib-gray-100 overflow-hidden">

          {/* Header navy */}
          <div className="bg-[#0F2034] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Power className="h-4 w-4 text-[#C9A84C]" />
              <span className="text-white font-semibold text-sm">{t('admin.quick_actions')}</span>
            </div>
            {/* Compteurs sobres */}
            <div className="flex items-center gap-3 text-xs">
              {[
                { label: t('admin.users_label'), val: metrics.totalUsers },
                { label: t('admin.exhibitors'), val: metrics.totalExhibitors },
                { label: t('admin.partners'), val: metrics.totalPartners },
              ].map(({ label, val }) => (
                <div key={label} className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded px-2 py-1">
                  <span className="font-bold text-[#C9A84C]">{val || 0}</span>
                  <span className="text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-sib-gray-100">

            {/* Col 1 â€” Participants */}
            <div className="p-5">
              <ColHeader icon={<Building2 className="h-4 w-4" />} label={t('admin.participant_management')} />
              <div className="space-y-0.5">
                <ActionLink to={ROUTES.ADMIN_CREATE_EXHIBITOR} icon={<Plus className="h-3.5 w-3.5" />} label={t('admin.create_exhibitor')} />
                <ActionLink to={ROUTES.ADMIN_EXHIBITORS} icon={<Building2 className="h-3.5 w-3.5" />} label={t('admin.manage_exhibitors_action')} />
                <ActionLink to={ROUTES.ADMIN_CREATE_PARTNER} icon={<Plus className="h-3.5 w-3.5" />} label={t('admin.create_partner')} />
                <ActionLink to={ROUTES.ADMIN_PARTNERS_MANAGE} icon={<Handshake className="h-3.5 w-3.5" />} label={t('admin.manage_partners_action')} />
                <ActionLink to={ROUTES.ADMIN_VIP_VISITORS} icon={<Crown className="h-3.5 w-3.5" />} label={t('admin.vip_visitors_management')} />
                <ActionLink to={ROUTES.ADMIN_USERS} icon={<Users className="h-3.5 w-3.5" />} label={t('admin.users_label')} />
              </div>
              <div className="mt-4 pt-4 border-t border-sib-gray-100">
                <Link to={ROUTES.ADMIN_PUBLICATION_CONTROL}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-[#1B365D] hover:bg-[#0F2034] text-white px-3 py-2.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Power className="h-3.5 w-3.5 text-[#C9A84C]" />
                    {t('admin.total_control')}
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Col 2 â€” Contenu */}
            <div className="p-5">
              <ColHeader icon={<Calendar className="h-4 w-4" />} label={t('admin.content_management')} />
              <div className="space-y-0.5">
                <ActionLink to={ROUTES.ADMIN_CREATE_EVENT} icon={<Plus className="h-3.5 w-3.5" />} label={t('admin.create_event')} />
                <ActionLink to={ROUTES.ADMIN_EVENTS} icon={<Calendar className="h-3.5 w-3.5" />} label={t('admin.manage_events_action')} />
                <ActionLink to={ROUTES.ADMIN_CREATE_NEWS} icon={<Plus className="h-3.5 w-3.5" />} label={t('admin.create_article')} />
                <ActionLink to={ROUTES.ADMIN_NEWS} icon={<FileText className="h-3.5 w-3.5" />} label={t('admin.manage_articles_action')} />
                <ActionLink to={ROUTES.ADMIN_CREATE_PAVILION} icon={<Plus className="h-3.5 w-3.5" />} label={t('admin.create_pavilion_action')} />
                <ActionLink to={ROUTES.ADMIN_PAVILIONS} icon={<Building2 className="h-3.5 w-3.5" />} label={t('admin.manage_pavilions_action')} />
              </div>
            </div>

            {/* Col 3 â€” MÃ©dias */}
            <div className="p-5">
              <ColHeader icon={<Video className="h-4 w-4" />} label={t('admin.media_management_section')} />
              <div className="space-y-0.5">
                <ActionLink to={ROUTES.ADMIN_MEDIA_MANAGE} icon={<Video className="h-3.5 w-3.5" />} label={t('admin.manage_media_action')} />
                <ActionLink to={ROUTES.ADMIN_PARTNER_MEDIA_APPROVAL} icon={<Shield className="h-3.5 w-3.5" />} label={t('admin.validate_media')} />
                <ActionLink to={ROUTES.ADMIN_EMAIL_TEMPLATES} icon={<Mail className="h-3.5 w-3.5" />} label={t('admin.email_templates_label')} />
              </div>
            </div>

            {/* Col 4 â€” Analytique */}
            <div className="p-5">
              <ColHeader icon={<BarChart3 className="h-4 w-4" />} label={t('admin.nav_and_stats')} />
              <div className="space-y-3">
                {[
                  { to: ROUTES.METRICS, Icon: BarChart3, value: null, label: t('admin.metrics_label') },
                  { to: ROUTES.ADMIN_USERS, Icon: Users, value: metrics.totalUsers, label: t('admin.users_label') },
                  { to: ROUTES.ADMIN_PAVILIONS, Icon: Award, value: metrics.totalExhibitors, label: t('admin.pavilions_label') },
                  { to: ROUTES.ADMIN_EVENTS, Icon: Calendar, value: metrics.totalEvents, label: t('admin.events_label') },
                ].map(({ to, Icon, value, label }) => (
                  <Link key={to} to={to}>
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-sib-gray-50 hover:bg-[#1B365D]/5 border border-sib-gray-100 hover:border-[#1B365D]/20 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-[#C9A84C]" />
                        <span className="text-xs font-semibold text-[#1B365D]">{label}</span>
                      </div>
                      {value != null && (
                        <span className="text-sm font-bold text-[#0F2034]">{value}</span>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

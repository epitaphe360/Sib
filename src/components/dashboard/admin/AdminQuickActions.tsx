import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3, Users, Building2, Calendar, Award, Plus, FileText,
  Video, Shield, Mail, Handshake, Crown, Power
} from 'lucide-react';
import { ROUTES } from '../../../lib/routes';

interface AdminQuickActionsProps {
  adminMetrics: Record<string, number | unknown>;
  t: (key: string, params?: Record<string, unknown>) => string;
}

export function AdminQuickActions({ adminMetrics: m, t }: AdminQuickActionsProps) {
  const metrics = m as any;
  return (
    <div className="mb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 rounded-xl"><Plus className="h-5 w-5 text-white" /></div>
              <h3 className="text-lg font-bold text-white">{t('admin.quick_actions')}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { Icon: Users, value: metrics.totalUsers, label: t('admin.users_label'), bg: 'bg-blue-500/20', iconCls: 'text-blue-300' },
                { Icon: Building2, value: metrics.totalExhibitors, label: t('admin.exhibitors'), bg: 'bg-emerald-500/20', iconCls: 'text-emerald-300' },
                { Icon: Handshake, value: metrics.totalPartners, label: t('admin.partners'), bg: 'bg-purple-500/20', iconCls: 'text-purple-300' },
                { Icon: Crown, value: metrics.totalVisitors, label: t('admin.visitors'), bg: 'bg-amber-500/20', iconCls: 'text-amber-300' },
              ].map(({ Icon, value, label, bg, iconCls }, i) => (
                <div key={i} className={`${bg} rounded-lg px-3 py-1.5 flex items-center gap-2`}>
                  <Icon className={`h-3.5 w-3.5 ${iconCls}`} />
                  <span className="text-white text-sm font-bold">{value}</span>
                  <span className="text-white/60 text-xs hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-gray-100">
            {/* Col 1 — Participants */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-100 rounded-lg"><Building2 className="h-4 w-4 text-emerald-600" /></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.participant_management')}</span>
              </div>
              <div className="space-y-1">
                {[
                  { to: ROUTES.ADMIN_CREATE_EXHIBITOR, icon: <Plus className="h-3.5 w-3.5" />, label: t('admin.create_exhibitor'), cls: 'text-emerald-700 hover:bg-emerald-50' },
                  { to: ROUTES.ADMIN_EXHIBITORS, icon: <Building2 className="h-3.5 w-3.5" />, label: t('admin.manage_exhibitors_action'), cls: 'text-teal-700 hover:bg-teal-50' },
                  { to: ROUTES.ADMIN_CREATE_PARTNER, icon: <Plus className="h-3.5 w-3.5" />, label: t('admin.create_partner'), cls: 'text-purple-700 hover:bg-purple-50' },
                  { to: ROUTES.ADMIN_PARTNERS_MANAGE, icon: <Handshake className="h-3.5 w-3.5" />, label: t('admin.manage_partners_action'), cls: 'text-pink-700 hover:bg-pink-50' },
                  { to: ROUTES.ADMIN_VIP_VISITORS, icon: <Crown className="h-3.5 w-3.5" />, label: t('admin.vip_visitors_management'), cls: 'text-amber-700 hover:bg-amber-50' },
                  { to: ROUTES.ADMIN_USERS, icon: <Users className="h-3.5 w-3.5" />, label: t('admin.users_label'), cls: 'text-blue-700 hover:bg-blue-50' },
                ].map(item => (
                  <Link key={item.to} to={item.to}>
                    <motion.div whileHover={{ x: 3 }} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${item.cls}`}>
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-dashed border-red-200">
                <Link to={ROUTES.ADMIN_PUBLICATION_CONTROL}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all">
                    <Power className="h-3.5 w-3.5" />
                    {t('admin.total_control')}
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Col 2 — Content */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-orange-100 rounded-lg"><Calendar className="h-4 w-4 text-orange-600" /></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.content_management')}</span>
              </div>
              <div className="space-y-1">
                {[
                  { to: ROUTES.ADMIN_CREATE_EVENT, icon: <Plus className="h-3.5 w-3.5" />, label: t('admin.create_event'), cls: 'text-orange-700 hover:bg-orange-50' },
                  { to: ROUTES.ADMIN_EVENTS, icon: <Calendar className="h-3.5 w-3.5" />, label: t('admin.manage_events_action'), cls: 'text-red-700 hover:bg-red-50' },
                  { to: ROUTES.ADMIN_CREATE_NEWS, icon: <Plus className="h-3.5 w-3.5" />, label: t('admin.create_article'), cls: 'text-blue-700 hover:bg-blue-50' },
                  { to: ROUTES.ADMIN_NEWS, icon: <FileText className="h-3.5 w-3.5" />, label: t('admin.manage_articles_action'), cls: 'text-cyan-700 hover:bg-cyan-50' },
                  { to: ROUTES.ADMIN_CREATE_PAVILION, icon: <Plus className="h-3.5 w-3.5" />, label: t('admin.create_pavilion_action'), cls: 'text-indigo-700 hover:bg-indigo-50' },
                  { to: ROUTES.ADMIN_PAVILIONS, icon: <Building2 className="h-3.5 w-3.5" />, label: t('admin.manage_pavilions_action'), cls: 'text-purple-700 hover:bg-purple-50' },
                ].map(item => (
                  <Link key={item.to} to={item.to}>
                    <motion.div whileHover={{ x: 3 }} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${item.cls}`}>
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 3 — Media */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-rose-100 rounded-lg"><Video className="h-4 w-4 text-rose-600" /></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.media_management_section')}</span>
              </div>
              <div className="space-y-1">
                {[
                  { to: ROUTES.ADMIN_MEDIA_MANAGE, icon: <Video className="h-3.5 w-3.5" />, label: t('admin.manage_media_action'), cls: 'text-rose-700 hover:bg-rose-50' },
                  { to: ROUTES.ADMIN_PARTNER_MEDIA_APPROVAL, icon: <Shield className="h-3.5 w-3.5" />, label: t('admin.validate_media'), cls: 'text-amber-700 hover:bg-amber-50' },
                  { to: ROUTES.ADMIN_EMAIL_TEMPLATES, icon: <Mail className="h-3.5 w-3.5" />, label: t('admin.email_templates_label'), cls: 'text-orange-700 hover:bg-orange-50' },
                ].map(item => (
                  <Link key={item.to} to={item.to}>
                    <motion.div whileHover={{ x: 3 }} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${item.cls}`}>
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 4 — Nav & Stats */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-slate-100 rounded-lg"><BarChart3 className="h-4 w-4 text-slate-600" /></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.nav_and_stats')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { to: ROUTES.METRICS, Icon: BarChart3, value: null, label: t('admin.metrics_label'), cls: 'bg-slate-50 border-slate-200', iconCls: 'text-slate-500', textCls: 'text-slate-700' },
                  { to: ROUTES.ADMIN_USERS, Icon: Users, value: metrics.totalUsers, label: t('admin.users_label'), cls: 'bg-blue-50 border-blue-200', iconCls: 'text-blue-500', textCls: 'text-blue-700' },
                  { to: ROUTES.ADMIN_PAVILIONS, Icon: Building2, value: metrics.totalExhibitors, label: t('admin.pavilions_label'), cls: 'bg-green-50 border-green-200', iconCls: 'text-green-500', textCls: 'text-green-700' },
                  { to: ROUTES.ADMIN_EVENTS, Icon: Calendar, value: metrics.totalEvents, label: t('admin.events_label'), cls: 'bg-purple-50 border-purple-200', iconCls: 'text-purple-500', textCls: 'text-purple-700' },
                ].map(({ to, Icon, value, label, cls, iconCls, textCls }) => (
                  <Link key={to} to={to}>
                    <motion.div whileHover={{ scale: 1.04 }} className={`${cls} border rounded-xl p-3 text-center hover:shadow-md transition-all`}>
                      <Icon className={`h-6 w-6 ${iconCls} mx-auto mb-1.5`} />
                      {value !== null && <div className={`text-sm font-bold ${textCls}`}>{value}</div>}
                      <div className={`${value !== null ? 'text-[10px]' : 'text-xs font-bold'} ${textCls}`}>{label}</div>
                    </motion.div>
                  </Link>
                ))}
                <Link to={ROUTES.ADMIN_VIP_VISITORS} className="col-span-2">
                  <motion.div whileHover={{ scale: 1.02 }} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <span className="text-xs font-bold text-amber-700">{t('admin.vip_visitors_management')}</span>
                    </div>
                    <span className="text-base font-bold text-amber-600">{metrics.totalVisitors}</span>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

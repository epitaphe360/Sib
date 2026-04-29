import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, BarChart3, FileText, Mail, Newspaper, Image, Calendar, Mic2, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ROUTES } from '../../lib/routes';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import {
  AdminHeader,
  AdminActionsPanel,
  AdminMetricsGrid,
  AdminChartsSection,
  SystemHealthPanel,
  ActivityFeed,
} from './admin';

export default function AdminDashboard() {
  const ctx = useAdminDashboard();
  const { user, t, isLoading, error, fetchMetrics, adminMetrics } = ctx;

  // ── Early returns ─────────────────────────────────────────────────────────
  if (!user || user.type !== 'admin') {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-[#1B365D]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-[#1B365D]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0F2034] mb-2">{t('dashboard.restricted_access')}</h2>
          <p className="text-sib-gray-500 mb-6">{t('dashboard.restricted_message')}</p>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="default" className="bg-[#1B365D] hover:bg-[#0F2034]">{t('dashboard.back_to_dashboard')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sib-bg p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-40 bg-[#1B365D]/10 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={`sk-${i}`} className="h-28 bg-sib-gray-100 rounded-xl" />)}
          </div>
          <div className="h-56 bg-sib-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-[#C9A84C] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#0F2034] mb-2">{t('dashboard.metrics_error')}</h2>
          <p className="text-sib-gray-500 mb-6">{error}</p>
          <Button variant="default" className="bg-[#1B365D] hover:bg-[#0F2034]" onClick={() => fetchMetrics()}>
            {t('dashboard.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% -5%, #0f2240 0%, #07101e 55%, #04080f 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <AdminHeader
          user={user}
          adminMetrics={adminMetrics as any}
          isLoading={isLoading}
          onRefresh={fetchMetrics}
          t={t}
        />

        {/* Premium section divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-12 flex items-center gap-4 origin-left"
        >
          <div className="w-2 h-2 rounded" style={{ background: '#C9A84C' }} />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
        </motion.div>

        <AdminActionsPanel
          adminMetrics={adminMetrics as any}
          showRegistrationRequests={ctx.showRegistrationRequests}
          onToggleRegistrationRequests={() => ctx.setShowRegistrationRequests(v => !v)}
          t={t}
        />

        {/* Acces CMS explicites */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>Accès CMS</h3>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Gestion complète du contenu et des templates</p>
              </div>
              <div className="w-8 h-0.5 rounded-full" style={{ background: '#C9A84C' }} />
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {([
                { to: ROUTES.ADMIN_CONTENT,         Icon: FileText,   label: 'Contenu pages',   sub: 'Modifier les contenus des pages' },
                { to: ROUTES.ADMIN_EMAIL_TEMPLATES, Icon: Mail,       label: 'Templates email', sub: 'Editer les emails envoyes' },
                { to: ROUTES.ADMIN_NEWS,            Icon: Newspaper,  label: 'Actualites',      sub: 'Gerer les articles et news' },
                { to: ROUTES.ADMIN_MEDIA,           Icon: Image,      label: 'Medias',          sub: 'Bibliotheque images/videos' },
                { to: ROUTES.ADMIN_EVENTS,          Icon: Calendar,   label: 'Programme',       sub: 'Gerer le programme scientifique' },
                { to: ROUTES.ADMIN_SPEAKERS,        Icon: Mic2,       label: 'Intervenants',    sub: 'Gerer les speakers du salon' },
                { to: ROUTES.ADMIN_SALONS,          Icon: Building2,  label: 'Salons',          sub: 'Gerer les editions du salon' },
              ] as const).map(({ to, Icon, label, sub }) => (
                <motion.div
                  key={label}
                  variants={{ hidden: { opacity: 0, y: 14, scale: 0.94 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 14 } } }}
                  whileHover={{ y: -4, scale: 1.03, boxShadow: '0 0 24px rgba(201,168,76,0.18)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link to={to} className="block p-4 rounded-xl h-full transition-colors" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm text-white/80"><Icon className="h-4 w-4" style={{ color: '#C9A84C' }} /> {label}</div>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Premium section divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-12 flex items-center gap-4 origin-left"
        >
          <div className="w-2 h-2 rounded" style={{ background: '#C9A84C' }} />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
        </motion.div>

        <AdminMetricsGrid adminMetrics={adminMetrics as any} t={t} />

        <AdminChartsSection
          userGrowthData={ctx.userGrowthData}
          activityData={ctx.activityData}
          trafficData={ctx.trafficData}
          userTypeDistribution={ctx.userTypeDistribution}
          hasActivityData={ctx.hasActivityData}
          isLoading={isLoading}
        />

        {/* Santé + Activité côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: 0.05 }}>
            <SystemHealthPanel healthItems={ctx.systemHealth as any} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: 0.1 }}>
            <ActivityFeed activities={ctx.recentAdminActivity as any} formatDate={ctx.formatDate} />
          </motion.div>
        </div>

        {/* Métriques détaillées — navy sobre */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4 }} className="mb-4">
          <div className="bg-[#0F2034] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30">
                <BarChart3 className="h-6 w-6 text-[#C9A84C]" />
              </div>
              <div>
                <h3 className="text-white font-heading font-bold">{t('admin.detailed_metrics')}</h3>
                <p className="text-slate-400 text-sm">{t('admin.detailed_metrics_desc')}</p>
              </div>
            </div>
            <Link to={ROUTES.METRICS}>
              <Button
                variant="outline"
                className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 bg-transparent whitespace-nowrap"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('admin.full_metrics')}
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}



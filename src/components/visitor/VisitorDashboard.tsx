import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, X, Calendar, Crown, Zap, Lock, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { DashboardSkeleton } from '../ui/Skeleton';
import { QuotaSummaryCard } from '../common/QuotaWidget';
import { useVisitorDashboard } from '../../hooks/useVisitorDashboard';
import { ROUTES } from '../../lib/routes';
import {
  VisitorPendingPaymentBanner,
  VisitorHeader,
  VisitorStatsGrid,
  VisitorVIPBenefits,
  VisitorQuickActions,
  VisitorAnalyticsSection,
  VisitorCommunicationCards,
  VisitorAvailabilityModal,
} from './components';
import { getVisitorQuota } from '../../config/quotas';
import { useTranslation } from '../../hooks/useTranslation';

export default memo(function VisitorDashboard() {
  const { t } = useTranslation();
  const ctx = useVisitorDashboard();

  if (ctx.isLoading) {return <DashboardSkeleton />;}

  if (!ctx.isAuthenticated || !ctx.user) {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md border border-sib-gray-100">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#C9A84C]/15 rounded-full flex items-center justify-center border border-[#C9A84C]/30">
              <Users className="h-10 w-10 text-[#C9A84C]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('visitor.unauthorized_access')}</h3>
            <p className="text-gray-600 mb-6">{t('visitor.please_login')}</p>
            <Link to={ROUTES.LOGIN}>
              <Button className="w-full bg-[#1B365D] hover:bg-[#0F2034] text-white">
                <Activity className="h-4 w-4 mr-2" />{t('nav.login')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sib-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Pending payment banner */}
        {ctx.user.status === 'pending_payment' && <VisitorPendingPaymentBanner />}

        {/* Header */}
        <VisitorHeader
          user={ctx.user}
          userLevel={ctx.userLevel}
          remaining={ctx.remaining}
          registeredEventsCount={ctx.registeredEvents.length}
          connectionsRequested={ctx.stats.connectionsRequested}
        />

        {/* Quota summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
          <QuotaSummaryCard
            title={t('dashboard.your_quotas')}
            level={ctx.userLevel}
            type="visitor"
            quotas={[{
              label: t('visitor.b2b_appointments'),
              current: ctx.confirmedAppointments.length,
              limit: getVisitorQuota(ctx.userLevel),
              icon: <Calendar className="h-4 w-4 text-gray-400" />,
            }]}
            upgradeLink={ctx.userLevel === 'free' ? ROUTES.VISITOR_UPGRADE : undefined}
          />
        </motion.div>

        {/* VIP benefits */}
        {ctx.userLevel === 'vip' && <VisitorVIPBenefits />}

        {/* Error banner */}
        {ctx.error && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="ml-3 text-red-800 text-sm font-medium flex-1">{ctx.error}</p>
              <button onClick={() => ctx.setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats grid */}
        <VisitorStatsGrid
          userLevel={ctx.userLevel}
          appointmentsBooked={ctx.stats.appointmentsBooked}
          exhibitorsVisited={ctx.stats.exhibitorsVisited}
          registeredEventsCount={ctx.registeredEvents.length}
          connectionsRequested={ctx.stats.connectionsRequested}
        />

        {/* Quick actions */}
        <VisitorQuickActions userLevel={ctx.userLevel} remaining={ctx.remaining} />

        {/* Bloc upgrade FREE */}
        {ctx.userLevel === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F2034] via-[#1B365D] to-[#0F2034] border border-[#C9A84C]/30 shadow-2xl">
              {/* Fond décoratif */}
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C9A84C]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 p-6 md:p-8">
                {/* Badge FREE limité */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Lock className="w-3 h-3" /> Compte FREE — Accès limité
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  {/* Texte principal */}
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                      Débloquez l'expérience <span className="text-[#C9A84C]">SIB 2026</span> complète
                    </h2>
                    <p className="text-white/60 text-sm mb-6 max-w-lg">
                      Avec un badge payant, accédez aux fonctionnalités exclusives réservées aux professionnels du bâtiment.
                    </p>

                    {/* Liste des avantages */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {[
                        { icon: <Star className="w-3.5 h-3.5 text-[#C9A84C]" />, text: 'Rendez-vous B2B avec les exposants' },
                        { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />, text: 'Accès aux séminaires & conférences' },
                        { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />, text: 'Badge officiel nominatif imprimable' },
                        { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />, text: "Lettre d'invitation & visa officielle" },
                        { icon: <Star className="w-3.5 h-3.5 text-[#C9A84C]" />, text: 'Accès VIP Lounge & networking exclusif' },
                        { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />, text: 'Catalogue exposants complet' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {item.icon}
                          <span className="text-white/80 text-xs">{item.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Boutons CTA */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to={ROUTES.VISITOR_UPGRADE}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A84C] hover:bg-[#B8963E] text-[#0F2034] font-black text-sm rounded-xl transition-all shadow-lg shadow-[#C9A84C]/30 hover:shadow-[#C9A84C]/50 hover:scale-[1.02]"
                      >
                        <Crown className="w-4 h-4" />
                        Passer en Standard ou VIP
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to={ROUTES.VISITOR_VIP_REGISTRATION}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 transition-all"
                      >
                        <Zap className="w-4 h-4 text-[#C9A84C]" />
                        Voir les offres VIP
                      </Link>
                    </div>
                  </div>

                  {/* Comparaison rapide FREE vs VIP */}
                  <div className="lg:w-72 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <div className="text-xs text-white/50 mb-1 font-semibold uppercase tracking-wide">FREE</div>
                        <div className="text-red-400 font-black text-lg">0</div>
                        <div className="text-white/40 text-[10px]">RDV B2B</div>
                      </div>
                      <div className="text-center p-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-lg">
                        <div className="text-xs text-[#C9A84C] mb-1 font-semibold uppercase tracking-wide">VIP</div>
                        <div className="text-[#C9A84C] font-black text-lg">∞</div>
                        <div className="text-white/40 text-[10px]">RDV B2B</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Accès conférences', free: false, paid: true },
                        { label: 'Badge nominatif', free: false, paid: true },
                        { label: 'Lettre visa', free: false, paid: true },
                        { label: 'Networking B2B', free: false, paid: true },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-white/60">{row.label}</span>
                          <div className="flex gap-4">
                            <span className={row.free ? 'text-emerald-400' : 'text-red-400/70'}>
                              {row.free ? '✓' : '✗'}
                            </span>
                            <span className="text-emerald-400">✓</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={ROUTES.VISITOR_UPGRADE}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#C9A84C] hover:bg-[#B8963E] text-[#0F2034] font-black text-xs rounded-lg transition-all"
                    >
                      <Crown className="w-3.5 h-3.5" /> Upgrader maintenant
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics */}
        <VisitorAnalyticsSection
          userLevel={ctx.userLevel}
          visitActivityData={ctx.visitActivityData}
          appointmentStatusData={ctx.appointmentStatusData}
          interestAreasData={ctx.interestAreasData}
          confirmedCount={ctx.confirmedAppointments.length}
          receivedCount={ctx.receivedAppointments.length}
          exhibitorsVisited={ctx.stats.exhibitorsVisited}
          connections={ctx.stats.connections}
          predictions={ctx.predictions}
        />

        {/* Communication cards */}
        <VisitorCommunicationCards userLevel={ctx.userLevel} />

        {/* Availability modal */}
        <VisitorAvailabilityModal
          exhibitorId={ctx.showAvailabilityModal?.exhibitorId ?? null}
          onClose={() => ctx.setShowAvailabilityModal(null)}
        />
      </div>
    </div>
  );
});

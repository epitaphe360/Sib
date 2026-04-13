import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, ClipboardList, CreditCard, Building2, Handshake, Crown, FileText } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';

interface AdminAlertsSectionProps {
  adminMetrics: Record<string, number | unknown>;
  showRegistrationRequests: boolean;
  onToggleRegistrationRequests: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

export function AdminAlertsSection({ adminMetrics: m, showRegistrationRequests, onToggleRegistrationRequests, t }: AdminAlertsSectionProps) {
  const metrics = m as any;
  const totalActions = (metrics.pendingValidations || 0) + (metrics.contentModerations || 0);

  const actionCards = [
    {
      key: 'registrations',
      Icon: ClipboardList,
      count: metrics.pendingValidations,
      label: t('admin.registration_requests'),
      sub: t('admin.click_to_process'),
      isButton: true,
      urgent: (metrics.pendingValidations || 0) > 0,
    },
    {
      key: 'payments',
      Icon: CreditCard,
      count: null,
      label: t('admin.payment_validation'),
      sub: t('admin.manage_proofs'),
      to: ROUTES.ADMIN_PAYMENT_VALIDATION,
      isButton: false,
    },
    {
      key: 'exhibitors',
      Icon: Building2,
      count: metrics.totalExhibitors,
      label: t('admin.exhibitors'),
      sub: t('admin.list_and_subscriptions'),
      to: ROUTES.ADMIN_EXHIBITORS,
      isButton: false,
    },
    {
      key: 'partners',
      Icon: Handshake,
      count: metrics.totalPartners,
      label: t('admin.partners'),
      sub: t('admin.list_and_packs'),
      to: ROUTES.ADMIN_PARTNERS_MANAGE,
      isButton: false,
    },
    {
      key: 'vip',
      Icon: Crown,
      count: null,
      label: t('admin.vip_visitors_management'),
      sub: t('admin.view_list'),
      to: ROUTES.ADMIN_VIP_VISITORS,
      isButton: false,
    },
    {
      key: 'moderation',
      Icon: FileText,
      count: metrics.contentModerations,
      label: t('admin.content_moderation'),
      sub: t('admin.required_actions'),
      to: ROUTES.ADMIN_PUBLICATION_CONTROL,
      isButton: false,
    },
  ];

  return (
    <div className="mb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-xl shadow-sib border border-sib-gray-100 overflow-hidden">

          {/* Header navy */}
          <div className="bg-[#0F2034] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#C9A84C]" />
              <span className="text-white font-semibold text-sm">{t('admin.required_actions')}</span>
            </div>
            {totalActions > 0 && (
              <span className="bg-[#C9A84C] text-[#0F2034] text-xs font-bold px-2.5 py-1 rounded-full">
                {totalActions} {t('admin.items_need_attention', { count: totalActions }).split(' ')[0] || 'en attente'}
              </span>
            )}
          </div>

          {/* Grille de cartes d'action */}
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {actionCards.map((card) => {
                const inner = (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`h-full p-4 rounded-xl border transition-all cursor-pointer select-none
                      ${card.isButton && showRegistrationRequests
                        ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                        : card.urgent
                        ? 'border-[#C9A84C]/60 bg-[#C9A84C]/5 hover:border-[#C9A84C] hover:bg-[#C9A84C]/8'
                        : 'border-sib-gray-200 bg-sib-gray-50 hover:border-[#1B365D]/30 hover:bg-[#1B365D]/3'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${card.urgent ? 'bg-[#C9A84C]/20' : 'bg-[#1B365D]/8'}`}>
                        <card.Icon className={`h-4 w-4 ${card.urgent ? 'text-[#A88830]' : 'text-[#1B365D]'}`} />
                      </div>
                      {card.count != null && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded
                          ${card.urgent && card.count > 0
                            ? 'bg-[#C9A84C] text-[#0F2034]'
                            : 'bg-sib-gray-200 text-sib-gray-600'
                          }`}>
                          {card.count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-[#0F2034] leading-tight mb-1">{card.label}</div>
                    <div className="text-xs text-sib-gray-400">{card.sub}</div>
                  </motion.div>
                );

                return card.isButton ? (
                  <button key={card.key} onClick={onToggleRegistrationRequests} className="text-left h-full">
                    {inner}
                  </button>
                ) : (
                  <Link key={card.key} to={card.to!} className="block h-full">
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

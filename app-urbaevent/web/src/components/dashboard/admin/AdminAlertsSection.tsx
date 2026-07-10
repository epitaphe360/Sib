import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, ClipboardList, CreditCard, FileText } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';

interface AdminAlertsSectionProps {
  adminMetrics: Record<string, number | unknown>;
  t: (key: string, params?: Record<string, string | number> | string) => string;
}

/** Bandeau urgent uniquement — la navigation complète est dans Actions & Navigation. */
export function AdminAlertsSection({ adminMetrics: m, t }: AdminAlertsSectionProps) {
  const metrics = m as Record<string, number>;
  const pendingRegistrations = metrics.pendingValidations || 0;
  const pendingModeration = metrics.contentModerations || 0;
  const pendingPayments = metrics.pendingPaymentRequests || 0;
  const totalActions = pendingRegistrations + pendingModeration + pendingPayments;

  const actionCards = [
    {
      key: 'registrations',
      Icon: ClipboardList,
      count: pendingRegistrations,
      label: t('admin.registration_requests'),
      sub: t('admin.click_to_process'),
      to: ROUTES.ADMIN_REGISTRATION_REQUESTS,
      urgent: pendingRegistrations > 0,
    },
    {
      key: 'payments',
      Icon: CreditCard,
      count: pendingPayments,
      label: t('admin.payment_validation'),
      sub: t('admin.manage_proofs'),
      to: ROUTES.ADMIN_PAYMENT_VALIDATION,
      urgent: pendingPayments > 0,
    },
    {
      key: 'moderation',
      Icon: FileText,
      count: pendingModeration,
      label: t('admin.content_moderation'),
      sub: t('admin.required_actions'),
      to: ROUTES.ADMIN_PUBLICATION_CONTROL,
      urgent: pendingModeration > 0,
    },
  ];

  if (totalActions === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-xl shadow-sib border border-sib-gray-100 overflow-hidden">
          <div className="bg-[#0F2034] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#F39200]" />
              <span className="text-white font-semibold text-sm">{t('admin.required_actions')}</span>
            </div>
            <span className="bg-[#F39200] text-[#0F2034] text-xs font-bold px-2.5 py-1 rounded-full">
              {totalActions} en attente
            </span>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {actionCards.map((card) => (
                <Link key={card.key} to={card.to} className="block h-full">
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`h-full p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      card.urgent
                        ? 'border-[#F39200]/60 bg-[#F39200]/5 hover:border-[#F39200] hover:bg-[#F39200]/8'
                        : 'border-sib-gray-200 bg-sib-gray-50 hover:border-[#1B365D]/30 hover:bg-[#1B365D]/3'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${card.urgent ? 'bg-[#F39200]/20' : 'bg-[#1B365D]/8'}`}>
                        <card.Icon className={`h-4 w-4 ${card.urgent ? 'text-[#A88830]' : 'text-[#1B365D]'}`} />
                      </div>
                      {card.count != null && card.count > 0 && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#F39200] text-[#0F2034]">
                          {card.count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-[#0F2034] leading-tight mb-1">{card.label}</div>
                    <div className="text-xs text-sib-gray-400">{card.sub}</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

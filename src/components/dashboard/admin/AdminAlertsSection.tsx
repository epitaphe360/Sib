import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, CreditCard, Building2, Handshake, Crown, FileText, Award } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { ROUTES } from '../../../lib/routes';

interface AdminAlertsSectionProps {
  adminMetrics: Record<string, number | unknown>;
  showRegistrationRequests: boolean;
  onToggleRegistrationRequests: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

export function AdminAlertsSection({ adminMetrics: m, showRegistrationRequests, onToggleRegistrationRequests, t }: AdminAlertsSectionProps) {
  const metrics = m as any;
  return (
    <div className="mb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{t('admin.required_actions')}</h3>
                <p className="text-orange-100 text-sm">{t('admin.items_need_attention', { count: (metrics.pendingValidations || 0) + (metrics.contentModerations || 0) })}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Registration Requests */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onToggleRegistrationRequests}
                className={`bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 transition-all cursor-pointer text-left shadow-md hover:shadow-xl ${showRegistrationRequests ? 'border-amber-500' : 'border-amber-200 hover:border-amber-400'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-amber-500 p-2 rounded-lg"><ClipboardList className="h-5 w-5 text-white" /></div>
                  <Badge variant="warning" className="text-base px-3 py-1">{metrics.pendingValidations}</Badge>
                </div>
                <div className="text-3xl font-bold text-amber-700 mb-2">{metrics.pendingValidations}</div>
                <div className="text-sm font-medium text-amber-900 mb-1">{t('admin.registration_requests')}</div>
                <div className="text-xs text-amber-600 flex items-center mt-3">
                  <span>{t('admin.click_to_process')}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </motion.button>

              {/* Payment Validation */}
              <Link to={ROUTES.ADMIN_PAYMENT_VALIDATION} className="block h-full">
                <motion.div whileHover={{ scale: 1.02 }} className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-blue-500 p-2 rounded-lg"><CreditCard className="h-5 w-5 text-white" /></div>
                    <Badge variant="default" className="bg-blue-500 text-white border-none">{t('actions.access')}</Badge>
                  </div>
                  <div className="text-xl font-bold text-blue-800 mb-2 mt-4">{t('admin.payment_validation')}</div>
                  <div className="text-sm font-medium text-blue-900 mb-1">{t('admin.manage_proofs')}</div>
                  <div className="text-xs text-blue-600 flex items-center mt-3"><span>{t('actions.access')}</span><svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
                </motion.div>
              </Link>

              {/* Exhibitors */}
              <Link to={ROUTES.ADMIN_EXHIBITORS} className="block h-full">
                <motion.div whileHover={{ scale: 1.02 }} className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-emerald-500 p-2 rounded-lg"><Building2 className="h-5 w-5 text-white" /></div>
                    <Badge variant="default" className="bg-emerald-500 text-white border-none">{t('actions.manage')}</Badge>
                  </div>
                  <div className="text-xl font-bold text-emerald-800 mb-2 mt-4">{t('admin.exhibitors')}</div>
                  <div className="text-sm font-medium text-emerald-900 mb-1">{t('admin.list_and_subscriptions')}</div>
                  <div className="text-xs text-emerald-600 flex items-center mt-3"><span>{t('actions.manage')}</span><svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
                </motion.div>
              </Link>

              {/* Partners */}
              <Link to={ROUTES.ADMIN_PARTNERS_MANAGE} className="block h-full">
                <motion.div whileHover={{ scale: 1.02 }} className="h-full bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-purple-500 p-2 rounded-lg"><Handshake className="h-5 w-5 text-white" /></div>
                    <Badge variant="default" className="bg-purple-500 text-white border-none">{t('nav.partners')}</Badge>
                  </div>
                  <div className="text-xl font-bold text-purple-800 mb-2 mt-4">{t('admin.partners')}</div>
                  <div className="text-sm font-medium text-purple-900 mb-1">{t('admin.list_and_packs')}</div>
                  <div className="text-xs text-purple-600 flex items-center mt-3"><span>{t('actions.manage')}</span><svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
                </motion.div>
              </Link>

              {/* VIP Visitors */}
              <Link to={ROUTES.ADMIN_VIP_VISITORS} className="block h-full">
                <motion.div whileHover={{ scale: 1.02 }} className="h-full bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-yellow-500 p-2 rounded-lg"><Crown className="h-5 w-5 text-white" /></div>
                    <Badge variant="default" className="bg-yellow-500 text-white border-none">{t('admin.vip_visitors_management').split(' ')[0]}</Badge>
                  </div>
                  <div className="text-xl font-bold text-yellow-800 mb-2 mt-4">{t('admin.vip_visitors_management')}</div>
                  <div className="text-sm font-medium text-yellow-900 mb-1">{t('admin.view_list')}</div>
                  <div className="text-xs text-yellow-600 flex items-center mt-3"><span>{t('actions.view')}</span><svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
                </motion.div>
              </Link>

              {/* Content Moderation */}
              <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-red-500 p-2 rounded-lg"><FileText className="h-5 w-5 text-white" /></div>
                </div>
                <div className="text-3xl font-bold text-red-700 mb-2">{metrics.contentModerations}</div>
                <div className="text-sm font-medium text-red-900">{t('admin.content_moderation')}</div>
              </motion.div>


            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

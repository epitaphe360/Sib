import { motion } from 'framer-motion';
import { Calendar, Share2 } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { MoroccanPattern } from '../../ui/MoroccanDecor';
import { useTranslation } from '../../../hooks/useTranslation';
import { getVisitorDisplayName } from '../../../utils/visitorHelpers';
import PublicAvailabilityCalendar from '../../calendar/PublicAvailabilityCalendar';

interface PendingAppointment {
  id: string;
  message?: string;
  [key: string]: unknown;
}

interface PartnerNetworkingTabProps {
  userId: string;
  pendingAppointments: PendingAppointment[];
  confirmedCount: number;
  processingId: string | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function PartnerNetworkingTab({
  userId, pendingAppointments, confirmedCount, processingId, onAccept, onReject
}: PartnerNetworkingTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-10">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">{t('partner.appointments_management')}</h2>
            <p className="text-slate-500 font-medium">{t('partner.appointments_description')}</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2 font-bold rounded-xl">
            {confirmedCount} {t('partner.confirmed_appointments')}
          </Badge>
        </div>
        <div className="p-4 md:p-10">
          <PublicAvailabilityCalendar userId={userId} standalone={false} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 bg-white rounded-[2.5rem] shadow-xl border-2 border-indigo-50 overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{t('partner.pending')}</h3>
              <p className="text-sm text-slate-500">{t('partner.pending_requests', { count: pendingAppointments.length })}</p>
            </div>
          </div>
          <div className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-slate-400 font-medium">{t('partner.no_pending_requests')}</p>
              </div>
            ) : (
              pendingAppointments.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-gradient-to-br from-slate-50 to-white hover:from-indigo-50 hover:to-blue-50 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 p-6 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {getVisitorDisplayName(app as any).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-1">{getVisitorDisplayName(app as any)}</p>
                      <p className="text-sm text-slate-500 break-words">{app.message || t('partner.no_message')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold"
                      onClick={() => onAccept(app.id)}
                      disabled={processingId === app.id}
                    >
                      {processingId === app.id ? '⏳ ...' : `✓ ${t('partner.accept')}`}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 rounded-xl font-bold"
                      onClick={() => onReject(app.id)}
                      disabled={processingId === app.id}
                    >
                      {processingId === app.id ? '⏳ ...' : `✕ ${t('partner.reject')}`}
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 text-white rounded-2xl shadow-md relative overflow-hidden">
          <MoroccanPattern className="opacity-10" color="white" scale={0.6} />
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Share2 className="h-5 w-5 text-indigo-400" />
              {t('partner.share_scheduling_link')}
            </h3>
            <p className="text-slate-300 text-sm mb-4">{t('partner.share_calendar_description')}</p>
            <Button variant="outline" className="w-full py-4 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold">
              {t('partner.copy_virtual_booth_link')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

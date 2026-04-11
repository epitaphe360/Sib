import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';

interface PartnerRejectModalProps {
  appointmentId: string;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}

export function PartnerRejectModal({ appointmentId, onConfirm, onCancel }: PartnerRejectModalProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('partner.confirm_reject_title')}</h3>
          <p className="text-sm text-gray-500">{t('partner.confirm_reject_body')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => onConfirm(appointmentId)}>
            {t('partner.reject')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

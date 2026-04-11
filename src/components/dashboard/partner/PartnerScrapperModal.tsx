import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import PartnerProfileScrapper from '../../partner/PartnerProfileScrapper';

interface PartnerScrapperModalProps {
  partnerId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function PartnerScrapperModal({ partnerId, onSuccess, onClose }: PartnerScrapperModalProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('partner.autofill_profile_ai')}</h2>
              <p className="text-sm text-gray-600">{t('partner.autofill_description')}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose} className="rounded-full">✕</Button>
        </div>
        <div className="p-6">
          <PartnerProfileScrapper partnerId={partnerId} onSuccess={onSuccess} />
        </div>
      </motion.div>
    </div>
  );
}

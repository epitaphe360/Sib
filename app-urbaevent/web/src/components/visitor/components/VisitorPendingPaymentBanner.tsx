import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

export function VisitorPendingPaymentBanner() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 shadow-md"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Crown className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900">{t('payment.pending_title') || 'Paiement en attente'}</h3>
            <p className="text-amber-700 text-sm">
              {t('payment.pending_description') || "Votre compte sera mis à niveau VIP après validation de votre virement."}
            </p>
          </div>
        </div>
        <Link to={ROUTES.VISITOR_BANK_TRANSFER}>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
            {t('payment.see_bank_details') || 'Voir les coordonnées bancaires'}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}


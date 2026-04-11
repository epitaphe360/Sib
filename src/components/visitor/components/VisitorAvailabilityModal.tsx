import { X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicAvailability from '../PersonalCalendar';
import { useTranslation } from '../../../hooks/useTranslation';

// Note: we import PersonalCalendar's sibling PublicAvailability via a local import alias
// The actual component is in src/components/availability/PublicAvailability
import PublicAvailabilityComp from '../../availability/PublicAvailability';

interface VisitorAvailabilityModalProps {
  exhibitorId: string | null;
  onClose: () => void;
}

export function VisitorAvailabilityModal({ exhibitorId, onClose }: VisitorAvailabilityModalProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {exhibitorId && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-2xl w-full relative overflow-hidden text-gray-900"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <button
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-all z-10"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{t('visitor.choose_b2b_slot')}</h3>
                  <p className="text-gray-500">{t('visitor.choose_b2b_slot_desc')}</p>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <PublicAvailabilityComp userId={exhibitorId} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

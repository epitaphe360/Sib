import { Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { useTranslation } from '../../../hooks/useTranslation';
import PublicAvailabilityCalendar from '../../calendar/PublicAvailabilityCalendar';
import PersonalAppointmentsCalendar from '../../calendar/PersonalAppointmentsCalendar';

interface ExhibitorCalendarSectionProps {
  userId: string;
  activeTab: 'availability' | 'appointments';
  onTabChange: (tab: 'availability' | 'appointments') => void;
}

export function ExhibitorCalendarSection({
  userId,
  activeTab,
  onTabChange,
}: ExhibitorCalendarSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <Card className="overflow-hidden border border-blue-100 shadow-lg">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t('exhibitor.calendar_title')}{' '}
                  <span className="text-blue-600">{t('exhibitor.calendar_hub')}</span>
                </h2>
                <p className="text-sm text-gray-500">{t('exhibitor.calendar_subtitle')}</p>
              </div>
            </div>

            {/* Tab selector */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => onTabChange('availability')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'availability'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('exhibitor.tab_availability')}</span>
              </button>
              <button
                onClick={() => onTabChange('appointments')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'appointments'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('exhibitor.tab_appointments')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-1">
          <AnimatePresence mode="wait">
            {activeTab === 'availability' ? (
              <motion.div
                key="availability-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <PublicAvailabilityCalendar userId={userId} isEditable={true} standalone={false} />
              </motion.div>
            ) : (
              <motion.div
                key="appointments-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <PersonalAppointmentsCalendar userType="exhibitor" standalone={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}

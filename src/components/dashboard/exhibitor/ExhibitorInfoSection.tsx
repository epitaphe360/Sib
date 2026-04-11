import { Calendar, Clock, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { useTranslation } from '../../../hooks/useTranslation';
import { DEFAULT_SALON_CONFIG, formatSalonDates, formatSalonLocation, formatSalonHours } from '../../../config/salonInfo';

export function ExhibitorInfoSection() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8"
    >
      <Card className="SIB-glass-card border-l-4 border-l-SIB-gold overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-SIB-gold/5 to-transparent rounded-full blur-3xl" />
        <div className="p-6 relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t('exhibitor.info_title')}</h3>
              <p className="text-xs text-gray-500">{t('exhibitor.info_subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dates */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              className="group relative bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue-100" />
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">{DEFAULT_SALON_CONFIG.name}</h4>
                </div>
                <p className="text-sm text-blue-50 leading-relaxed">{formatSalonDates(DEFAULT_SALON_CONFIG)}</p>
                <p className="text-sm text-blue-100 font-medium mt-1">{formatSalonLocation(DEFAULT_SALON_CONFIG)}</p>
              </div>
            </motion.div>

            {/* Hours */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              className="group relative bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-5 w-5 text-green-100" />
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">{t('exhibitor.info_booth_opening')}</h4>
                </div>
                <p className="text-sm text-green-50 leading-relaxed">{formatSalonHours(DEFAULT_SALON_CONFIG)}</p>
                <p className="text-xs text-green-100 mt-2">{t('exhibitor.info_every_day')}</p>
              </div>
            </motion.div>

            {/* Visitors */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              className="group relative bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="h-5 w-5 text-purple-100" />
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">{t('exhibitor.info_objective')}</h4>
                </div>
                <p className="text-2xl font-black text-white mb-1">
                  {DEFAULT_SALON_CONFIG.expectedVisitors.toLocaleString()}
                </p>
                <p className="text-sm text-purple-100">{t('exhibitor.info_expected_visitors')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

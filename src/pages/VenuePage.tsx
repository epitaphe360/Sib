import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import InteractiveVenueMap from '../components/venue/InteractiveVenueMap';
import { PageHero } from '../components/ui/PageHero';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const VenuePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHero
        badge={<><MapPin className="w-4 h-4 text-yellow-300" /><span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">Plan du Salon</span></>}
        title={<>{t('venue.title')}</>}
        subtitle={t('venue.description')}
        py="py-16 md:py-20"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <InteractiveVenueMap />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900">{t('venue.how_to_use')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{t('venue.step1_title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('venue.step1_desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{t('venue.step2_title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('venue.step2_desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{t('venue.step3_title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('venue.step3_desc')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VenuePage;



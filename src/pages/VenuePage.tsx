import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import InteractiveVenueMap from '../components/venue/InteractiveVenueMap';

const VenuePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('venue.title')}</h1>
          <p className="text-lg text-gray-600">
            {t('venue.description')}
          </p>
        </div>

        <InteractiveVenueMap />

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('venue.how_to_use')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{t('venue.step1_title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('venue.step1_desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{t('venue.step2_title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('venue.step2_desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{t('venue.step3_title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('venue.step3_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenuePage;



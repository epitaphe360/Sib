import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import InteractiveVenueMap from '../components/venue/InteractiveVenueMap';
import { SmartImage } from '../components/ui/SmartImage';
import { IMAGES } from '../lib/images';

const VenuePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-14 lg:pt-20 lg:pb-16">
        <div className="absolute inset-0 -z-10">
          <SmartImage
            source={IMAGES.morocco.eljadida}
            aspect="auto"
            rounded="none"
            priority
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/92 via-primary-900/85 to-primary-900/95" />
          <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
        </div>

        <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                El Jadida · Maroc
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-5">
              {t('venue.title')}
            </h1>
            <p className="text-base lg:text-lg text-white/75 leading-relaxed">
              {t('venue.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map */}
      <div className="max-w-container mx-auto px-6 lg:px-8 py-12">
        <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
          <InteractiveVenueMap />
        </div>

        {/* How to use */}
        <div className="mt-10 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
          <div className="mb-8">
            <div className="sib-kicker mb-3">
              <MapPin className="h-3 w-3" />
              Guide
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {t('venue.how_to_use')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-start gap-4 group">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center transition-all duration-300 group-hover:bg-primary-600 group-hover:scale-110">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold group-hover:text-white transition-colors">
                    {n}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1.5 tracking-tight">
                    {t(`venue.step${n}_title`)}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t(`venue.step${n}_desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenuePage;

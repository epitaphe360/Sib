import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { IMAGES, img, srcSet } from '../../../lib/images';
import { formatSalonDatesShort, DEFAULT_SALON_CONFIG } from '../../../config/salonInfo';
import { MinistryEgidBar } from '../MinistryEgidBar';

export const HomeHeroSplitNavy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
    <MinistryEgidBar />
    <section className="min-h-[520px] grid grid-cols-1 lg:grid-cols-2">
      <div className="home-dark bg-primary-900 text-white flex flex-col justify-center px-8 lg:px-16 py-16 order-2 lg:order-1">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-300 font-bold mb-4">{t('hero.edition')}</p>
          <h1 className="text-white text-4xl lg:text-5xl font-bold tracking-tight mb-4">{t('hero.title')}</h1>
          <p className="text-lg text-primary-100 mb-2">{t('hero.tagline')}</p>
          <p className="text-sm text-white/70 mb-8">{formatSalonDatesShort()} · {DEFAULT_SALON_CONFIG.location.city}</p>
          <Link to={`${ROUTES.HOME_P4}#badges`}>
            <Button variant="accent" size="lg" className="group">
              {t('hero.cta.ticket')}
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
      <div className="relative min-h-[280px] lg:min-h-full order-1 lg:order-2 home-hero-media overflow-hidden">
        <img
          src={img(IMAGES.hero.architecture, 2560, undefined, 90)}
          srcSet={srcSet(IMAGES.hero.architecture)}
          alt="Parc d'Exposition Mohammed VI"
          className="absolute inset-0 w-full h-full object-cover home-hero-photo"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-primary-900/40 to-transparent" />
      </div>
    </section>
    </>
  );
};

export default HomeHeroSplitNavy;

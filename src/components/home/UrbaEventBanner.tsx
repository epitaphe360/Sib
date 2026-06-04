import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { motion } from 'framer-motion';
import { useSiteBanner } from '../../hooks/useSiteBanner';
import { getBannerDefinition } from '../../config/banners';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Bannière image cliquable en page d'accueil (remplace l'ancienne bannière UrbaEvent).
 * Image par défaut : hall SIB / parc Mohammed VI — lien vers inscription exposant.
 */
export const UrbaEventBanner: React.FC = () => {
  const { t } = useTranslation();
  const def = getBannerDefinition('urbaevent');
  const { src, fallback } = useSiteBanner('urbaevent');
  const [currentSrc, setCurrentSrc] = useState(src);
  const linkTo = def?.linkTo ?? ROUTES.EXHIBITOR_SUBSCRIPTION;

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleImgError = () => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
  };

  return (
    <section className="py-12 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            to={linkTo}
            className="block relative overflow-hidden rounded-2xl shadow-xl group ring-1 ring-neutral-200/80 dark:ring-neutral-700"
            aria-label={t('home.promo_banner.aria')}
          >
            <img
              src={currentSrc}
              alt={t('home.promo_banner.alt')}
              className="w-full h-44 sm:h-52 md:h-60 lg:h-64 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              onError={handleImgError}
              loading="lazy"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#001A3D]/90 via-[#001A3D]/55 to-transparent pointer-events-none"
              aria-hidden
            />
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14 pointer-events-none">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#F39200] mb-2">
                {t('home.promo_banner.kicker')}
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight max-w-lg mb-2">
                {t('home.promo_banner.title')}
              </p>
              <p className="text-sm text-white/80 max-w-md mb-4 hidden sm:block">
                {t('home.promo_banner.desc')}
              </p>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-white bg-[#F39200] px-5 py-2.5 w-fit group-hover:bg-[#E08500] transition-colors">
                {t('home.promo_banner.cta')}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default UrbaEventBanner;

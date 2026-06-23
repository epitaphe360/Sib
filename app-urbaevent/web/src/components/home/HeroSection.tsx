import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';

export const HeroSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t } = useTranslation();

  React.useEffect(() => {
    // Date du salon SIB 2026 (25-29 Novembre 2026)
    const salonDate = new Date('2026-11-25T09:00:00');
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = salonDate.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  const getTimeUnit = (value: number, singularKey: string, pluralKey: string) => {
    return value <= 1 ? t(singularKey) : t(pluralKey);
  };

  return (
    <>
      <section className="relative text-white overflow-hidden min-h-screen flex items-center">
      {/* Photo d'arrière-plan plein écran */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/sib_ma_hero_image.webp')" }}
      />
      {/* Overlay : sombre à gauche/bas, transparent à droite — laisse la photo respirer */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      {/* Gradient sombre en haut pour lisibilité du menu transparent */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 sm:pt-36 xl:pt-44 pb-24 lg:pb-36">
        <div className="max-w-2xl">

          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              {t('hero.title')}
            </h1>
          </motion.div>

          {/* Dates & lieu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mb-8 space-y-2"
          >
            <p className="text-2xl lg:text-3xl font-semibold text-white drop-shadow">
              25 – 29 Novembre 2026
            </p>
            <div className="flex items-center gap-2 text-lg text-white/90">
              <MapPin className="h-5 w-5 text-SIB-gold flex-shrink-0" />
              <span>Parc d'Exposition Mohammed VI — El Jadida</span>
            </div>
          </motion.div>

          {/* Compte à rebours compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mb-10"
          >
            <div className="inline-flex gap-3">
              {[
                { value: timeLeft.days,    labelKey: 'time.days'    },
                { value: timeLeft.hours,   labelKey: 'time.hours'   },
                { value: timeLeft.minutes, labelKey: 'time.minutes' },
                { value: timeLeft.seconds, labelKey: 'time.seconds' },
              ].map(({ value, labelKey }) => (
                <div key={labelKey} className="text-center bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 min-w-[70px]">
                  <div className="text-3xl font-bold text-SIB-gold leading-none">{formatNumber(value)}</div>
                  <div className="text-white/70 text-[11px] uppercase tracking-widest mt-1">{t(labelKey)}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <Link to={ROUTES.REGISTER_EXHIBITOR}>
              <Button size="lg" className="bg-SIB-gold text-white hover:bg-SIB-gold/90 border-none shadow-lg shadow-black/30 text-base px-8">
                {t('hero.cta.exhibitor')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to={ROUTES.EXHIBITORS}>
              <Button variant="outline" size="lg" className="border-white/70 text-white hover:bg-white hover:text-SIB-primary text-base px-8">
                {t('hero.cta.discover')}
              </Button>
            </Link>
          </motion.div>

          {/* Info pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.65 }}
            className="flex flex-wrap gap-3"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20">
              <Users className="h-4 w-4 text-SIB-gold" />
              <span>Networking B2B &amp; B2C</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20">
              <Building2 className="h-4 w-4 text-SIB-gold" />
              <span>Networking B2B</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20">
              <Calendar className="h-4 w-4 text-SIB-gold" />
              <span>5 Jours d'Exposition</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-12 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor" />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" />
        </svg>
      </div>
    </section>

      {/* Section Organisateurs */}
      <div className="bg-white border-b border-gray-200 py-10 px-6">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Ligne 1 : Organisateurs + Co-organisateurs */}
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 lg:gap-24">
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Organisateurs</span>
              <div className="flex items-center gap-10 sm:gap-16">
                <img src="/logos/ministere.png" alt="Ministère de l'Aménagement du Territoire National" className="h-24 sm:h-28 lg:h-32 w-auto object-contain" />
                <img src="/logos/amdie.png" alt="AMDIE" className="h-20 sm:h-24 lg:h-28 w-auto object-contain" />
              </div>
            </div>
            <div className="hidden lg:block w-px h-24 bg-gray-200" />
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Co-organisateurs</span>
              <div className="flex items-center gap-10 sm:gap-16">
                <img src="/logos/fmc.png" alt="FMC - Fédération des Industries des Matériaux de Construction" className="h-24 sm:h-28 lg:h-32 w-auto object-contain" />
                <img src="/logos/fnbtp.png" alt="FNBTP" className="h-24 sm:h-28 lg:h-32 w-auto object-contain" />
              </div>
            </div>
          </div>

          {/* Ligne 2 : Sponsor officiel + Organisateur délégué */}
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-24 border-t border-gray-100 pt-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Sponsor officiel</span>
              <img src="/logos/lap.png" alt="LAP - Sponsor officiel" className="h-20 sm:h-24 lg:h-28 w-auto object-contain" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Organisateur délégué</span>
              <img src="/logos/urbacom.png" alt="URBACOM" className="h-20 sm:h-24 lg:h-28 w-auto object-contain" />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
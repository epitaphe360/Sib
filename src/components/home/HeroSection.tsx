import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { MoroccanPattern, MoroccanArch } from '../ui/MoroccanDecor';

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
      {/* Bannière Sous l'égide du Ministère */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl md:text-2xl font-serif italic text-gray-600 mb-6">
            Sous l'égide du
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <img
              src="/logo-ministere.png"
              alt="Royaume du Maroc - Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville"
              className="h-28 md:h-36 w-auto object-contain transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = '/logo-ministere.svg';
              }}
            />
          </div>
        </div>
      </div>

      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Moroccan Zellige Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,215,0,0.1) 35px, rgba(255,215,0,0.1) 70px),
                           repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(0,128,0,0.1) 35px, rgba(0,128,0,0.1) 70px)`
        }} />
      </div>

      {/* Decorative Moroccan Arches */}
      <div className="absolute top-0 left-0 w-full h-24 opacity-20">
        <svg viewBox="0 0 1200 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,0 Q150,80 300,0 Q450,80 600,0 Q750,80 900,0 Q1050,80 1200,0 L1200,100 L0,100 Z" fill="currentColor" className="text-yellow-300" />
        </svg>
      </div>

      {/* Background Pattern */}
      <MoroccanPattern className="opacity-10" color="white" scale={1.5} />

      {/* Decorative Arch at bottom */}
      <MoroccanArch className="text-white" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                25-29 Nov. 2026
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                {t('hero.title')}
              </h1>
                <p className="text-xl text-white/70 mb-8 leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Compte à Rebours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-center mb-2 text-white">
                  {t('hero.countdown.title')}
                </h2>
                <p className="text-center text-white/60 mb-6 text-sm">
                  {t('hero.countdown.subtitle')}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="relative group">
                    <div className="relative bg-white/10 border border-yellow-300/60 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-300 mb-1">
                        {formatNumber(timeLeft.days)}
                      </div>
                      <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                        {getTimeUnit(timeLeft.days, 'time.day', 'time.days')}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="relative bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {formatNumber(timeLeft.hours)}
                      </div>
                      <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                        {getTimeUnit(timeLeft.hours, 'time.hour', 'time.hours')}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="relative bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {formatNumber(timeLeft.minutes)}
                      </div>
                      <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                        {getTimeUnit(timeLeft.minutes, 'time.minute', 'time.minutes')}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="relative bg-sib-gold/20 border border-sib-gold/50 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-sib-gold mb-1">
                        {formatNumber(timeLeft.seconds)}
                      </div>
                      <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                        {getTimeUnit(timeLeft.seconds, 'time.second', 'time.seconds')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                    <MapPin className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      Mohammed VI Exhibition Center • {t('hero.stats.location')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Event Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="bg-sib-gold/20 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-sib-gold" />
                </div>
                <div>
                  <p className="font-semibold text-white">{t('hero.stats.location')}</p>
                  <p className="text-white/70 text-sm">Morocco</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="bg-sib-gold/20 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-sib-gold" />
                </div>
                <div>
                  <p className="font-semibold text-white">Networking</p>
                  <p className="text-white/70 text-sm">B2B & B2G</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="bg-sib-gold/20 p-2 rounded-lg">
                  <Building2 className="h-5 w-5 text-sib-gold" />
                </div>
                <div>
                  <p className="font-semibold text-white">Format</p>
                  <p className="text-white/70 text-sm">Hybride</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={ROUTES.REGISTER_EXHIBITOR}>
                <Button size="lg" className="bg-sib-gold text-white hover:bg-sib-gold/90 border-none w-full sm:w-auto shadow-lg shadow-sib-gold/20">
                  {t('hero.cta.exhibitor')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to={ROUTES.EXHIBITORS}>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-sib-primary w-full sm:w-auto">
                  {t('hero.cta.discover')}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative block"
          >
            <div className="relative z-10">
              <div className="absolute -inset-4 bg-sib-gold/20 rounded-t-[10rem] rounded-b-2xl blur-xl" />
              <div className="relative rounded-t-[10rem] rounded-b-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                <img
                  src="/hero-sib.jpg"
                  alt="Salon International du Bâtiment"
                  className="w-full h-56 lg:h-[340px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
              </div>

              {/* Decorative Elements */}
              <div className="hidden lg:block absolute -top-12 -right-12 text-sib-gold/20 animate-spin-slow">
                <MoroccanPattern className="w-48 h-48" />
              </div>

              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="hidden lg:block absolute bottom-8 -left-12 bg-white p-4 rounded-xl shadow-xl border-l-4 border-sib-gold"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-sib-primary/5 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-sib-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-sib-primary">Innovation</p>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Smart Building</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="hidden lg:block absolute top-24 -right-8 bg-white p-4 rounded-xl shadow-xl border-l-4 border-sib-gold"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-sib-primary/5 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-sib-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-sib-primary">Conférences</p>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">High Level</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
    </>
  );
};
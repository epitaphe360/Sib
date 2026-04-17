import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Building2, ArrowRight } from 'lucide-react';
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

  const fmt = (n: number) => n.toString().padStart(2, '0');

  const getTimeUnit = (value: number, singularKey: string, pluralKey: string) => {
    return value <= 1 ? t(singularKey) : t(pluralKey);
  };

  return (
    <>
      {/* Bannière Ministère */}
      <div className="bg-white py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl md:text-2xl font-display italic text-gray-500 mb-4">
            Sous l'égide du
          </p>
          <div className="flex items-center justify-center">
            <img
              src="/logo-ministere.png"
              alt="Royaume du Maroc - Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville"
              className="h-28 md:h-36 w-auto object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = '/logo-ministere.svg';
              }}
            />
          </div>
        </div>
      </div>

      {/* Hero dark luxury */}
      <section className="relative bg-[#0A0F1E] text-white overflow-hidden min-h-[90vh] flex items-center">
        {/* Photo de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E]/92 via-[#0A0F1E]/78 to-[#0A0F1E]/60" />
        {/* Grille de points dorés */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.07) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Dégradé diagonal doré */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#C9A84C]/8 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Colonne gauche — contenu */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              {/* Badge dates */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#E7D192] text-sm font-bold tracking-widest uppercase mb-6">
                <Calendar className="h-3.5 w-3.5" />
                25–29 Nov. 2026
              </div>

              <h1 className="font-display text-4xl lg:text-6xl font-light leading-tight mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              {/* Compte à rebours */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
              >
                <p className="text-[11px] text-[#E7D192] uppercase tracking-[0.25em] font-medium text-center mb-4">
                  {t('hero.countdown.title')}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: timeLeft.days,    unit: getTimeUnit(timeLeft.days,    'time.day',    'time.days'),    gold: true  },
                    { value: timeLeft.hours,   unit: getTimeUnit(timeLeft.hours,   'time.hour',   'time.hours'),   gold: false },
                    { value: timeLeft.minutes, unit: getTimeUnit(timeLeft.minutes, 'time.minute', 'time.minutes'), gold: false },
                    { value: timeLeft.seconds, unit: getTimeUnit(timeLeft.seconds, 'time.second', 'time.seconds'), gold: true  },
                  ].map((item, i) => (
                    <div key={i} className={`rounded-xl p-3 text-center border ${item.gold ? 'border-[#C9A84C]/50 bg-[#C9A84C]/10' : 'border-white/10 bg-white/5'}`}>
                      <div className={`text-2xl font-bold tabular-nums ${item.gold ? 'text-[#E7D192]' : 'text-white'}`}>
                        {fmt(item.value)}
                      </div>
                      <div className="text-white/40 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                        {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-white/35 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  Mohammed VI Exhibition Center · {t('hero.stats.location')}
                </div>
              </motion.div>

              {/* Pills d'info */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: MapPin,     label: t('hero.stats.location'), sub: 'Morocco'  },
                  { icon: Users,      label: 'Networking',             sub: 'B2B & B2G' },
                  { icon: Building2,  label: 'Format',                 sub: 'Hybride'   },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <div className="bg-[#C9A84C]/15 p-1.5 rounded-lg flex-shrink-0">
                      <item.icon className="h-4 w-4 text-[#C9A84C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-xs truncate">{item.label}</p>
                      <p className="text-white/45 text-[10px]">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={ROUTES.REGISTER_EXHIBITOR}>
                  <button className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0F1E] font-bold px-6 py-3 rounded-sm hover:bg-[#E7D192] transition-colors w-full sm:w-auto justify-center text-sm tracking-wide">
                    {t('hero.cta.exhibitor')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link to={ROUTES.EXHIBITORS}>
                  <button className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-sm hover:bg-white/10 transition-colors w-full sm:w-auto justify-center text-sm">
                    {t('hero.cta.discover')}
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Colonne droite — image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                <img
                  src="/hero-sib.jpg"
                  alt="Salon International du Bâtiment"
                  className="w-full h-[420px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/60 via-transparent to-transparent" />
                {/* Badge Innovation */}
                <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5">
                  <p className="text-white font-bold text-sm">Innovation</p>
                  <p className="text-white/45 text-[10px] uppercase tracking-wider">Smart Building</p>
                </div>
                {/* Badge Conférences */}
                <div className="absolute top-6 right-6 bg-[#C9A84C]/20 backdrop-blur-md border border-[#C9A84C]/30 rounded-xl px-4 py-2.5">
                  <p className="text-[#E7D192] font-bold text-sm">Conférences</p>
                  <p className="text-white/45 text-[10px] uppercase tracking-wider">High Level</p>
                </div>
              </div>
              {/* Gold glow */}
              <div className="absolute -inset-10 bg-[#C9A84C]/4 rounded-full blur-3xl -z-10 pointer-events-none" />
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
};

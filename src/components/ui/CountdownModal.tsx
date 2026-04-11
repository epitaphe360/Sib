import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, Globe, Mail } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from './Card';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownModal: React.FC<CountdownModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEventStarted, setIsEventStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Date du salon SIB 2026 (1-3 Avril 2026)
    const salonDate = new Date('2026-04-01T09:00:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = salonDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsEventStarted(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    // Calcul initial
    setTimeLeft(calculateTimeLeft());

    // Mise à jour chaque seconde
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const salonInfo = {
    name: 'SIB 2026',
    fullName: 'Salon International du Bâtiment',
    dates: '1-3 Avril 2026',
    location: 'Casablanca, Maroc',
    venue: 'Mohammed VI Exhibition Center',
    hours: '9h30 - 18h00',
    stats: {
      exhibitors: 300,
      visitors: 6000,
      countries: 40,
      conferences: 40
    }
  };

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{salonInfo.name}</h2>
                <p className="text-blue-100">{salonInfo.fullName}</p>
              </div>
              <button aria-label={t('common.close')}
                onClick={onClose}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Informations du salon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{salonInfo.dates}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{salonInfo.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{salonInfo.hours}</span>
              </div>
            </div>
          </div>

          {/* Compte à rebours */}
          <div className="p-8">
            {isEventStarted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="bg-green-100 p-8 rounded-2xl mb-6">
                  <div className="text-6xl mb-4">??</div>
                  <h3 className="text-3xl font-bold text-green-800 mb-2">
                    {t('countdown.event_started')}
                  </h3>
                  <p className="text-green-700">
                    {t('countdown.event_welcome')}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('countdown.opening_in')}
                </h3>
                <p className="text-gray-600 mb-8">
                  {t('countdown.opening_description', { 
                    period: timeLeft.days > 30 ? t('countdown.months') : timeLeft.days > 7 ? t('countdown.weeks') : t('countdown.days_plural') 
                  })}
                </p>

                {/* Compteurs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <motion.div
                    key={timeLeft.days}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">
                      {formatNumber(timeLeft.days)}
                    </div>
                    <div className="text-blue-100 text-sm font-medium">
                      {timeLeft.days <= 1 ? t('countdown.day') : t('countdown.days')}
                    </div>
                  </motion.div>

                  <motion.div
                    key={timeLeft.hours}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">
                      {formatNumber(timeLeft.hours)}
                    </div>
                    <div className="text-purple-100 text-sm font-medium">
                      {timeLeft.hours <= 1 ? t('countdown.hour') : t('countdown.hours')}
                    </div>
                  </motion.div>

                  <motion.div
                    key={timeLeft.minutes}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">
                      {formatNumber(timeLeft.minutes)}
                    </div>
                    <div className="text-green-100 text-sm font-medium">
                      {timeLeft.minutes <= 1 ? t('countdown.minute') : t('countdown.minutes')}
                    </div>
                  </motion.div>

                  <motion.div
                    key={timeLeft.seconds}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">
                      {formatNumber(timeLeft.seconds)}
                    </div>
                    <div className="text-orange-100 text-sm font-medium">
                      {timeLeft.seconds <= 1 ? t('countdown.second') : t('countdown.seconds')}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Informations détaillées du salon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    {t('countdown.location_access')}
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">{t('countdown.venue')} :</span>
                      <p className="text-gray-600">{salonInfo.venue}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t('countdown.address')} :</span>
                      <p className="text-gray-600">{t('countdown.event_address')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t('countdown.schedule')} :</span>
                      <p className="text-gray-600">{salonInfo.hours}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    {t('countdown.key_figures')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {salonInfo.stats.exhibitors}+
                      </div>
                      <div className="text-xs text-gray-600">{t('countdown.exhibitors')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {salonInfo.stats.visitors.toLocaleString()}+
                      </div>
                      <div className="text-xs text-gray-600">{t('countdown.visitors')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {salonInfo.stats.countries}
                      </div>
                      <div className="text-xs text-gray-600">{t('countdown.countries')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {salonInfo.stats.conferences}+
                      </div>
                      <div className="text-xs text-gray-600">{t('countdown.conferences')}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Programme des 3 jours */}
            <Card className="mb-6">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  {t('countdown.program_3days')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="font-bold text-blue-600 mb-2">{t('countdown.day1_title')}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• {t('countdown.day1_opening')}</div>
                      <div>• {t('countdown.day1_plenary')}</div>
                      <div>• {t('countdown.day1_networking')}</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-600 mb-2">{t('countdown.day2_title')}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• {t('countdown.day2_workshops')}</div>
                      <div>• {t('countdown.day2_b2b')}</div>
                      <div>• {t('countdown.day2_demos')}</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="font-bold text-purple-600 mb-2">{t('countdown.day3_title')}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• {t('countdown.day3_roundtables')}</div>
                      <div>• {t('countdown.day3_awards')}</div>
                      <div>• {t('countdown.day3_closing')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="default"
                onClick={() => {
                  toast.success(t('countdown.reminder_set'));
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                {t('countdown.set_reminder')}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const shareText = t('countdown.share_text', {
                    dates: salonInfo.dates,
                    location: salonInfo.location,
                    days: timeLeft.days,
                    hours: timeLeft.hours
                  });
                  
                  if (navigator.share) {
                    navigator.share({
                      title: t('countdown.share_title'),
                      text: shareText,
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(shareText)
                      .then(() => toast.success(t('countdown.copied_clipboard')))
                      .catch(() => toast.error(t('countdown.copy_failed')));
                  }
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                {t('countdown.share_countdown')}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const calendarEvent = {
                    title: 'SIB 2026 - Salon International du Bâtiment',
                    start: '2026-04-01T09:00:00',
                    end: '2026-04-03T18:00:00',
                    location: 'Mohammed VI Exhibition Center, Casablanca, Maroc',
                    description: t('countdown.calendar_description')
                  };
                  
                  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${calendarEvent.start.replace(/[-:]/g, '').replace('.000', '')}Z/${calendarEvent.end.replace(/[-:]/g, '').replace('.000', '')}Z&location=${encodeURIComponent(calendarEvent.location)}&details=${encodeURIComponent(calendarEvent.description)}`;
                  
                  window.open(googleCalendarUrl, '_blank');
                  toast.success(t('countdown.calendar_added'));
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t('countdown.add_to_calendar')}
              </Button>
            </div>

            {/* Informations pratiques */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">{t('countdown.practical_info')}</h5>
                  <div className="space-y-2 text-gray-600">
                    <div>• {t('countdown.info_registration')}</div>
                    <div>• {t('countdown.info_parking')}</div>
                    <div>• {t('countdown.info_shuttles')}</div>
                    <div>• {t('countdown.info_catering')}</div>
                    <div>• {t('countdown.info_wifi')}</div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">{t('countdown.contact_org')}</h5>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>contact@sib2026.ma</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>www.sib2026.ma</span>
                    </div>
                    <div>?? +212 1 23 45 67 89</div>
                    <div>?? {t('countdown.contact_hours')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
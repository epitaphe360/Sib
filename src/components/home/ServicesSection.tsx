import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

export function ServicesSection() {
  const { t } = useTranslation();
  const whatsappNumber = '+212612345678';
  const phoneNumber = '+212123456789';
  const emailAddress = 'contact@sib2026.ma';

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale');
    window.open(`https://wa.me/${whatsappNumber.replace(/\s/g, '')}?text=${message}`, '_blank');
  };

  const cards = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      desc: t('services.whatsapp_desc'),
      action: (
        <Button variant="primary" size="sm" onClick={handleWhatsAppClick} className="w-full">
          {t('services.send_message')}
        </Button>
      ),
    },
    {
      icon: Mail,
      title: 'Email',
      desc: t('services.email_desc'),
      action: (
        <a href={`mailto:${emailAddress}`} className="block">
          <Button variant="secondary" size="sm" className="w-full">{t('services.send_email')}</Button>
        </a>
      ),
    },
    {
      icon: Phone,
      title: t('services.phone'),
      desc: t('services.phone_desc'),
      action: (
        <a href={`tel:${phoneNumber}`} className="block">
          <Button variant="secondary" size="sm" className="w-full">{t('services.call_now')}</Button>
        </a>
      ),
    },
    {
      icon: Clock,
      title: t('services.hours'),
      desc: t('services.hours_desc'),
      html: true,
      action: (
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          {t('services.timezone')}
        </div>
      ),
    },
  ];

  return (
    <section className="relative py-20 lg:py-24 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">Support</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            {t('services.need_help')}
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('services.help_desc')}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary-600 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight">
                  {card.title}
                </h3>
                {card.html ? (
                  <p
                    className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 flex-grow leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: card.desc }}
                  />
                ) : (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 flex-grow leading-relaxed">
                    {card.desc}
                  </p>
                )}
                {card.action}
              </motion.div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-10 lg:p-14 bg-gradient-to-br from-primary-900 to-primary-700 border border-primary-800"
        >
          {/* Accent glow */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto text-white">
            <div className="sib-kicker mb-4 justify-center !text-accent-500">
              Direct
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight">
              {t('services.ready_to_chat')}
            </h3>
            <p className="text-white/80 mb-8 leading-relaxed">
              {t('services.whatsapp_fast')}
            </p>
            <Button variant="accent" size="lg" onClick={handleWhatsAppClick} className="group">
              <MessageCircle className="mr-1 h-4 w-4" />
              {t('services.whatsapp_cta')}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

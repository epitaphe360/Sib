import React from 'react';
import { MessageCircle, Mail, Phone, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

export function ServicesSection() {
  const { t } = useTranslation();
  const whatsappNumber = '+212612345678'; // À personnaliser avec votre numéro
  const phoneNumber = '+212123456789'; // À personnaliser
  const emailAddress = 'Sib2026@urbacom.net';

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale');
    window.open(`https://wa.me/${whatsappNumber.replace(/\s/g, '')}?text=${message}`, '_blank');
  };

  return (
    <section className="py-24 px-4 bg-[#F8F9FA] border-t" style={{ borderColor: 'rgba(231,209,146,0.3)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1A1A1A] mb-4" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {t('services.need_help')}
          </h2>
          <p className="text-base text-[#666] font-light">
            {t('services.help_desc')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* WhatsApp */}
          <div className="luxury-card p-6 flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 rounded-sm mb-4" style={{ background: 'rgba(231,209,146,0.1)', border: '0.5px solid rgba(231,209,146,0.3)' }}>
              <MessageCircle className="h-5 w-5" style={{ color: '#C9A84C' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              WhatsApp
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              {t('services.whatsapp_desc')}
            </p>
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-[#C9A84C] hover:bg-[#E7D192] text-[#1A1A1A] font-medium"
            >
              {t('services.send_message')}
            </Button>
          </div>

          {/* Email */}
          <div className="luxury-card p-6 flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 rounded-sm mb-4" style={{ background: 'rgba(231,209,146,0.1)', border: '0.5px solid rgba(231,209,146,0.3)' }}>
              <Mail className="h-5 w-5" style={{ color: '#C9A84C' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              {t('services.email_desc')}
            </p>
            <a href={`mailto:${emailAddress}`}>
              <Button className="w-full bg-[#C9A84C] hover:bg-[#E7D192] text-[#1A1A1A] font-medium">
                {t('services.send_email')}
              </Button>
            </a>
          </div>

          {/* Phone */}
          <div className="luxury-card p-6 flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 rounded-sm mb-4" style={{ background: 'rgba(231,209,146,0.1)', border: '0.5px solid rgba(231,209,146,0.3)' }}>
              <Phone className="h-5 w-5" style={{ color: '#C9A84C' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('services.phone')}
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              {t('services.phone_desc')}
            </p>
            <a href={`tel:${phoneNumber}`}>
              <Button className="w-full bg-[#C9A84C] hover:bg-[#E7D192] text-[#1A1A1A] font-medium">
                {t('services.call_now')}
              </Button>
            </a>
          </div>

          {/* Horaires */}
          <div className="luxury-card p-6 flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 rounded-sm mb-4" style={{ background: 'rgba(231,209,146,0.1)', border: '0.5px solid rgba(231,209,146,0.3)' }}>
              <Clock className="h-5 w-5" style={{ color: '#C9A84C' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('services.hours')}
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow" dangerouslySetInnerHTML={{ __html: t('services.hours_desc') }} />
            <div className="text-xs text-gray-500 mt-auto">
              {t('services.timezone')}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-sm p-10 text-white text-center" style={{ background: 'linear-gradient(135deg, #0D0D0D 0%, #141414 100%)', border: '0.5px solid rgba(231,209,146,0.2)' }}>
          <h3 className="text-3xl font-light mb-3" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {t('services.ready_to_chat')}
          </h3>
          <p className="mb-6 text-green-50 max-w-2xl mx-auto">
            {t('services.whatsapp_fast')}
          </p>
          <Button
            onClick={handleWhatsAppClick}
            className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {t('services.whatsapp_cta')}
          </Button>
        </div>
      </div>
    </section>
  );
}

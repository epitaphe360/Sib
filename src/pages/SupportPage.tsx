import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { HelpCircle, MessageCircle, FileText, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { CONFIG, getSupportEmail, getSupportPhone, getSupportMessage } from '../lib/config';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { motion } from 'framer-motion';

export default function SupportPage() {
  const { t } = useTranslation();
  const handleSupportRequest = (type: keyof typeof CONFIG.supportTypes) => {
    const message = getSupportMessage(type.toLowerCase() as keyof typeof CONFIG.messages.support);
    toast.success(message);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHero
        badge={<><HelpCircle className="w-4 h-4 text-yellow-300" /><span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">{t('support.title')}</span></>}
        title={<>{t('support.title')}</>}
        subtitle={t('support.description')}
        py="py-16 md:py-20"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Support Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <Card className="p-8 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-100">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('support.technicalTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('support.technicalDesc')}
            </p>
            <Button onClick={() => handleSupportRequest('technical')} className="w-full">
              {t('support.contactTechnical')}
            </Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-100">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('support.commercialTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('support.commercialDesc')}
            </p>
            <Button onClick={() => handleSupportRequest('commercial')} variant="outline" className="w-full">
              {t('support.contactCommercial')}
            </Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-100">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('support.exhibitorTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('support.exhibitorDesc')}
            </p>
            <Button onClick={() => handleSupportRequest('exhibitor')} variant="outline" className="w-full">
              {t('support.contactExhibitor')}
            </Button>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <Card className="p-8 mb-12 border border-gray-100">
          <SectionHeader
            align="center"
            badge={<>{t('support.faqTitle')}</>}
            badgeClass="bg-indigo-50 text-indigo-700 border-indigo-200"
            title={<>{t('support.faqTitle')}</>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('support.loginProblems')}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{t('support.forgotPassword')}</h4>
                  <p className="text-gray-600 text-sm">{t('support.forgotPasswordAnswer')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('support.accountNotActivated')}</h4>
                  <p className="text-gray-600 text-sm">{t('support.accountNotActivatedAnswer')}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('support.platformFeatures')}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{t('support.howToAppointment')}</h4>
                  <p className="text-gray-600 text-sm">{t('support.howToAppointmentAnswer')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('support.howToEditProfile')}</h4>
                  <p className="text-gray-600 text-sm">{t('support.howToEditProfileAnswer')}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-8 text-center">
          <Phone className="h-16 w-16 text-indigo-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('support.immediateHelp')}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('support.teamAvailable')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('support.technicalTitle')}</h3>
              <p className="text-gray-600">{getSupportEmail('technical')}</p>
              <p className="text-gray-600">{getSupportPhone('technical')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('support.commercialTitle')}</h3>
              <p className="text-gray-600">{getSupportEmail('commercial')}</p>
              <p className="text-gray-600">{getSupportPhone('commercial')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('support.emergencies')}</h3>
              <p className="text-gray-600">{getSupportEmail('emergency')}</p>
              <p className="text-gray-600">{getSupportPhone('emergency')}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => handleSupportRequest('general')} size="lg">
              {t('support.openTicket')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(`mailto:${getSupportEmail('technical')}`)}
            >
              {t('support.sendEmail')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}




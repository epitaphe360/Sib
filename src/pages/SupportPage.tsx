import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { HelpCircle, MessageCircle, FileText, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { CONFIG, getSupportEmail, getSupportPhone, getSupportMessage } from '../lib/config';

export default function SupportPage() {
  const { t } = useTranslation();

  const handleSupportRequest = (type: keyof typeof CONFIG.supportTypes) => {
    const message = getSupportMessage(type.toLowerCase() as keyof typeof CONFIG.messages.support);
    toast.success(message);
  };

  const categories = [
    {
      icon: HelpCircle,
      title: t('support.technicalTitle'),
      desc: t('support.technicalDesc'),
      action: t('support.contactTechnical'),
      type: 'technical' as const,
      variant: 'primary' as const,
    },
    {
      icon: MessageCircle,
      title: t('support.commercialTitle'),
      desc: t('support.commercialDesc'),
      action: t('support.contactCommercial'),
      type: 'commercial' as const,
      variant: 'secondary' as const,
    },
    {
      icon: FileText,
      title: t('support.exhibitorTitle'),
      desc: t('support.exhibitorDesc'),
      action: t('support.contactExhibitor'),
      type: 'exhibitor' as const,
      variant: 'secondary' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-16">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="sib-kicker mb-3 justify-center">Support</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
            {t('support.title')}
          </h1>
          <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('support.description')}
          </p>
        </div>

        {/* Support categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:bg-primary-600 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight">
                  {c.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 flex-grow leading-relaxed">
                  {c.desc}
                </p>
                <Button variant={c.variant} size="md" onClick={() => handleSupportRequest(c.type)} className="w-full">
                  {c.action}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 lg:p-10 mb-12">
          <div className="text-center mb-8">
            <div className="sib-kicker mb-3 justify-center">FAQ</div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {t('support.faqTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-4 tracking-tight">
                {t('support.loginProblems')}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                    {t('support.forgotPassword')}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t('support.forgotPasswordAnswer')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                    {t('support.accountNotActivated')}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t('support.accountNotActivatedAnswer')}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-4 tracking-tight">
                {t('support.platformFeatures')}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                    {t('support.howToAppointment')}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t('support.howToAppointmentAnswer')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                    {t('support.howToEditProfile')}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t('support.howToEditProfileAnswer')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="relative overflow-hidden rounded-2xl p-10 lg:p-14 bg-gradient-to-br from-primary-900 to-primary-700 border border-primary-800">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto text-white">
            <div className="h-14 w-14 mx-auto mb-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <Phone className="h-6 w-6 text-accent-500" />
            </div>
            <div className="sib-kicker mb-3 justify-center !text-accent-500">Besoin d'aide ?</div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight">
              {t('support.immediateHelp')}
            </h2>
            <p className="text-white/80 mb-10 leading-relaxed">
              {t('support.teamAvailable')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { label: t('support.technicalTitle'), mail: getSupportEmail('technical'), phone: getSupportPhone('technical') },
                { label: t('support.commercialTitle'), mail: getSupportEmail('commercial'), phone: getSupportPhone('commercial') },
                { label: t('support.emergencies'), mail: getSupportEmail('emergency'), phone: getSupportPhone('emergency') },
              ].map((b) => (
                <div key={b.label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-500 mb-2">
                    {b.label}
                  </div>
                  <p className="text-sm text-white/80 break-all">{b.mail}</p>
                  <p className="text-sm text-white/80">{b.phone}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="accent" size="lg" onClick={() => handleSupportRequest('general')}>
                {t('support.openTicket')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.open(`mailto:${getSupportEmail('technical')}`)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/15"
              >
                {t('support.sendEmail')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

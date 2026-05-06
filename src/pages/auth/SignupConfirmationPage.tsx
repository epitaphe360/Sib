import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmailService } from '@/services/emailService';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/hooks/useTranslation';

export default function SignupConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const userType = searchParams.get('type') || 'visitor';
  const userLevel = searchParams.get('level') || '';
  const needsPassword = searchParams.get('needsPassword') === 'true';
  const [countdown, setCountdown] = useState(60);
  const { t } = useTranslation();

  // Messages personnalisés selon le type
  const getTitle = () => {
    if (userType === 'exhibitor') {return t('signup.title_exhibitor');}
    if (userType === 'partner') {return t('signup.title_partner');}
    if (userLevel === 'free' && needsPassword) {return t('signup.title_badge_password');}
    if (userLevel === 'free') {return t('signup.title_free_badge');}
    if (userLevel === 'premium') {return t('signup.title_vip');}
    return t('signup.title_default');
  };

  const getDescription = () => {
    if (userType === 'exhibitor') {return t('signup.desc_exhibitor');}
    if (userType === 'partner') {return t('signup.desc_partner');}
    if (userLevel === 'free' && needsPassword) {return t('signup.desc_badge_password');}
    if (userLevel === 'free') {return t('signup.desc_free_badge');}
    if (userLevel === 'premium') {return t('signup.desc_vip');}
    return t('signup.desc_default');
  };

  const getInstructions = () => {
    if (userLevel === 'free' && needsPassword) {
      return [
        { step: 1, title: t('signup.step_set_password_title'), description: t('signup.step_set_password_desc') },
        { step: 2, title: t('signup.step_download_badge_title'), description: t('signup.step_download_badge_desc') },
        { step: 3, title: t('signup.step_access_salon_title'), description: t('signup.step_access_salon_desc') },
        { step: 4, title: t('signup.step_dashboard_title'), description: t('signup.step_dashboard_desc') },
      ];
    }

    if (userLevel === 'free') {
      return [
        { step: 1, title: t('signup.step_open_email_title'), description: t('signup.step_open_email_desc') },
        { step: 2, title: t('signup.step_download_badge_title2'), description: t('signup.step_download_badge_desc2') },
        { step: 3, title: t('signup.step_show_badge_title'), description: t('signup.step_show_badge_desc') },
      ];
    }

    if (userType === 'exhibitor' || userType === 'partner') {
      return [
        { step: 1, title: t('signup.step_verify_email_title'), description: t('signup.step_verify_email_desc') },
        { step: 2, title: t('signup.step_admin_review_title'), description: t('signup.step_admin_review_desc') },
        { step: 3, title: t('signup.step_full_access_title'), description: t('signup.step_full_access_desc') },
      ];
    }

    return [
      { step: 1, title: t('signup.step_open_email_title'), description: t('signup.step_open_email_desc2') },
      { step: 2, title: t('signup.step_confirm_link_title'), description: t('signup.step_confirm_link_desc') },
      { step: 3, title: t('signup.step_login_action_title'), description: t('signup.step_login_action_desc') },
    ];
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    try {
      setCountdown(60);
      // ✅ Envoyer email de bienvenue
      await EmailService.sendWelcomeEmail(email, 'Utilisateur', userType);
    } catch (error) {
      console.warn('Email resend failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-8 md:p-12">
          {/* Icon de succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-green-100 rounded-full p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-600">
              {getDescription()}
            </p>
          </motion.div>

          {/* Email de confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('signup.check_email')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t('signup.email_sent_to')}
                </p>
                <p className="text-sm font-mono bg-white px-3 py-2 rounded border border-blue-200 text-blue-700 break-all">
                  {email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-8"
          >
            {getInstructions().map((instruction) => (
              <div key={instruction.step} className="flex items-start gap-3">
                <div className="bg-gray-100 rounded-full p-1 mt-1 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {instruction.step}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>{instruction.title}</strong> {instruction.description && `- ${instruction.description}`}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Statut pour partner/exhibitor */}
          {(userType === 'partner' || userType === 'exhibitor') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">
                    {t('signup.validation_in_progress')}
                  </h4>
                  <p className="text-sm text-amber-700">
                    {t('signup.validation_desc', { type: userType === 'exhibitor' ? t('signup.type_exhibitor') : t('signup.type_sponsor') })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Message pour visiteur gratuit */}
          {userLevel === 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">
                    {t('signup.badge_sent')}
                  </h4>
                  <p className="text-sm text-green-700">
                    {t('signup.badge_sent_desc')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bouton de renvoi */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {userLevel !== 'free' && (
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
                disabled={countdown > 0}
              >
                <RefreshCw className={`h-4 w-4 ${countdown > 0 ? 'opacity-50' : ''}`} />
                {countdown > 0 ? t('signup.resend_countdown', { count: countdown }) : t('signup.resend_email')}
              </Button>
            )}

            <Button
              onClick={() => userLevel === 'free' ? navigate(ROUTES.HOME) : navigate(ROUTES.LOGIN)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {userLevel === 'free' ? t('signup.back_home') : t('signup.go_login')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Note spam */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              {t('signup.check_spam')}
            </p>
          </motion.div>
        </Card>

        {/* Lien d'aide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            {t('signup.need_help')}{' '}
            <button
              onClick={() => navigate(ROUTES.CONTACT)}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              {t('nav.contact')}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

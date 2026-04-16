import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmailService } from '@/services/emailService';
import { ROUTES } from '@/lib/routes';

export default function SignupConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const userType = searchParams.get('type') || 'visitor';
  const userLevel = searchParams.get('level') || '';
  const needsPassword = searchParams.get('needsPassword') === 'true';
  const [countdown, setCountdown] = useState(60);

  // Messages personnalisés selon le type
  const getTitle = () => {
    if (userType === 'exhibitor') {return 'Inscription Exposant Réussie !';}
    if (userType === 'partner') {return 'Inscription Partenaire Réussie !';}
    if (userLevel === 'free' && needsPassword) {return '📧 Badge Gratuit + Définition Mot de Passe';}
    if (userLevel === 'free') {return 'Badge Gratuit Envoyé !';}
    if (userLevel === 'premium') {return 'Inscription VIP Réussie !';}
    return 'Inscription réussie !';
  };

  const getDescription = () => {
    if (userType === 'exhibitor') {return 'Votre demande de compte exposant a été enregistrée';}
    if (userType === 'partner') {return 'Votre demande de compte partenaire a été enregistrée';}
    if (userLevel === 'free' && needsPassword) {return 'Votre badge gratuit vous a été envoyé + un email pour définir votre mot de passe';}
    if (userLevel === 'free') {return 'Votre badge d\'accès gratuit vous a été envoyé par email';}
    if (userLevel === 'premium') {return 'Votre compte VIP a été créé avec succès';}
    return 'Votre compte a été créé avec succès';
  };

  const getInstructions = () => {
    if (userLevel === 'free' && needsPassword) {
      return [
        {
          step: 1,
          title: '🔐 Définissez votre mot de passe',
          description: 'Cliquez sur le lien dans l\'email "Définir votre mot de passe" pour créer votre mot de passe sécurisé'
        },
        {
          step: 2,
          title: '🎫 Téléchargez votre badge gratuit',
          description: 'Un autre email contient votre badge QR à imprimer ou sauvegarder sur mobile'
        },
        {
          step: 3,
          title: '🚪 Accédez au salon',
          description: 'Présentez votre badge QR à l\'entrée pour accéder gratuitement'
        },
        {
          step: 4,
          title: '💻 Connectez-vous au dashboard',
          description: 'Utilisez votre email et mot de passe pour accéder à vos fonctionnalités limitées'
        }
      ];
    }

    if (userLevel === 'free') {
      return [
        {
          step: 1,
          title: 'Ouvrez votre boîte email',
          description: 'Recherchez l\'email contenant votre badge QR gratuit'
        },
        {
          step: 2,
          title: 'Téléchargez votre badge',
          description: 'Cliquez sur le badge pour le sauvegarder ou l\'imprimer'
        },
        {
          step: 3,
          title: 'Présentez-vous au salon',
          description: 'Montrez votre badge QR à l\'entrée pour accéder gratuitement'
        }
      ];
    }

    if (userType === 'exhibitor' || userType === 'partner') {
      return [
        {
          step: 1,
          title: 'Vérifiez votre email',
          description: 'Cliquez sur le lien de confirmation dans l\'email'
        },
        {
          step: 2,
          title: 'Validation administrative',
          description: 'Votre compte sera examiné par notre équipe (24-48h)'
        },
        {
          step: 3,
          title: 'Accès complet',
          description: 'Vous recevrez un email une fois votre compte validé'
        }
      ];
    }

    return [
      {
        step: 1,
        title: 'Ouvrez votre boîte email',
        description: 'Recherchez notre message de confirmation'
      },
      {
        step: 2,
        title: 'Cliquez sur le lien de confirmation',
        description: 'Validez votre adresse email'
      },
      {
        step: 3,
        title: 'Connectez-vous',
        description: 'Utilisez vos identifiants pour accéder à votre compte'
      }
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
                  Vérifiez votre boîte email
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nous avons envoyé un email de confirmation à :
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
                    Validation en cours
                  </h4>
                  <p className="text-sm text-amber-700">
                    Votre demande de compte {userType === 'exhibitor' ? 'exposant' : 'partenaire'} sera examinée par notre équipe dans les 24-48 heures.
                    Vous recevrez un email de confirmation une fois votre compte validé.
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
                    Badge envoyé par email
                  </h4>
                  <p className="text-sm text-green-700">
                    Votre badge d'accès gratuit avec QR code a été envoyé à votre adresse email.
                    Imprimez-le ou affichez-le sur votre smartphone à l'entrée du salon.
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
                {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer l\'email'}
              </Button>
            )}

            <Button
              onClick={() => userLevel === 'free' ? navigate(ROUTES.HOME) : navigate(ROUTES.LOGIN)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {userLevel === 'free' ? 'Retour à l\'accueil' : 'Aller à la connexion'}
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
              Vous ne trouvez pas l'email ? Vérifiez votre dossier spam ou courrier indésirable.
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
            Besoin d'aide ?{' '}
            <button
              onClick={() => navigate(ROUTES.CONTACT)}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Contactez-nous
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

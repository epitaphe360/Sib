import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { CheckCircle, Loader, Anchor } from 'lucide-react';
import { ROUTES } from '../../lib/routes';

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(5);

  const accountType = (location.state as any)?.accountType || 'visitor';
  const email = (location.state as any)?.email || '';
  const nextPath = (location.state as any)?.nextPath || '';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Rediriger
          if (nextPath && nextPath.startsWith('/')) {
            navigate(nextPath);
          } else if (accountType === 'visitor') {
            navigate(ROUTES.VISITOR_DASHBOARD, {
              state: { message: 'Bienvenue sur SIB 2026 !' }
            });
          } else {
            navigate(ROUTES.LOGIN, {
              state: { message: 'Inscription réussie ! Votre compte est en attente de validation.' }
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, accountType, nextPath]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-white p-3 rounded-lg">
              <Anchor className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SIB</span>
              <span className="text-sm text-green-200 block leading-none">2026</span>
            </div>
          </div>
        </motion.div>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-14 w-14 text-green-600" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-center text-gray-900 mb-4"
            >
              {accountType === 'visitor'
                ? ' Compte créé !'
                : '✅ Inscription réussie !'}
            </motion.h1>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 mb-8"
            >
              {accountType === 'visitor' ? (
                <>
                  <p className="text-center text-gray-700">
                    Félicitations ! Votre compte visiteur a été créé avec succès.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {email}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Vous pouvez maintenant accéder à toutes les fonctionnalités de SIB 2026 et explorer les innovations BTP.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-center text-gray-700">
                    Votre demande d'inscription a été reçue avec succès.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {email}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-semibold text-center">
                      â³ Votre compte est en attente de validation
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Notre équipe d'administrateurs examinera votre demande. Vous recevrez un email de confirmation une fois votre compte validé.
                    </p>
                  </div>
                </>
              )}
            </motion.div>

            {/* Redirect Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                <Loader className="h-4 w-4 animate-spin" />
                <p className="text-sm font-medium">
                  Redirection dans <span className="font-bold">{countdown}</span>s
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {accountType === 'visitor'
                  ? 'Redirection vers votre tableau de bord...'
                  : 'Redirection vers la page de connexion...'}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="mt-6 h-1 bg-green-600 rounded-full"
            />

            {/* Features List */}
            {accountType === 'visitor' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Vous avez accès à :
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    Catalogue complet des exposants
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    Programme des conférences
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    Planification des rendez-vous
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    Réseau professionnel
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Support Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-green-100 text-sm mt-6"
        >
          Besoin d'aide ? <a href="mailto:support@sibs.fr" className="underline hover:text-white">Contactez notre support</a>
        </motion.p>
      </div>
    </div>
  );
}



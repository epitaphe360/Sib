/**
 * Page de choix d'inscription visiteur
 * Permet de choisir entre Pass Gratuit et Pass Premium VIP
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { motion } from 'framer-motion';
import { Crown, Ticket, CheckCircle, ArrowRight, Anchor } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../lib/routes';

export default function VisitorRegistrationChoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const freeFeatures = [
    'AccËs au salon SIB 2026',
    'Badge QR sÈcurisÈ',
    'AccËs aux zones publiques',
    'ConfÈrences publiques',
    'Inscription rapide sans mot de passe',
    'Gratuit - 0 EUR'
  ];

  const vipFeatures = [
    'Tous les avantages du Pass Gratuit',
    'Rendez-vous B2B ILLIMIT…S',
    'AccËs zones VIP premium',
    'Badge ultra-sÈcurisÈ avec photo',
    'Networking area exclusif',
    'Ateliers et confÈrences VIP',
    'Gala de clÙture exclusif',
    'Tableau de bord complet',
    'Support prioritaire',
    '700,00 EUR'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 rounded-lg shadow-lg">
              <Anchor className="h-10 w-10 text-white" />
            </div>
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                SIB
              </span>
              <span className="text-lg text-gray-600 block leading-none">2026</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Inscription Visiteur
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez le pass qui correspond ‡ vos besoins pour SIB 2026
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Free Pass */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full relative overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl">
              {/* Badge Gratuit */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                GRATUIT
              </div>

              <div className="p-8">
                {/* Icon & Title */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Ticket className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pass Gratuit</h2>
                    <p className="text-gray-600">AccËs salon de base</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600">0</span>
                    <span className="text-2xl text-gray-600 ml-2">EUR</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Inscription simple et rapide</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {freeFeatures.map((feature) => (
                    <div key={feature} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  onClick={() => navigate(ROUTES.REGISTER_VISITOR)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
                >
                  S'inscrire gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Info */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-800">
                    ? Aucun mot de passe requis ï Badge envoyÈ par email
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* VIP Premium Pass */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full relative overflow-hidden border-2 border-yellow-400 hover:border-yellow-500 transition-all duration-300 hover:shadow-2xl shadow-lg">
              {/* Badge Premium */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                PREMIUM
              </div>

              <div className="p-8 pt-10">
                {/* Icon & Title */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-lg shadow-md">
                    <Crown className="h-8 w-8 text-gray-900" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pass Premium VIP</h2>
                    <p className="text-gray-600">AccËs complet et exclusif</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                      700
                    </span>
                    <span className="text-2xl text-gray-600 ml-2">EUR</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Paiement sÈcurisÈ unique</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {vipFeatures.map((feature, idx) => (
                    <div key={feature} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className={idx === 1 ? "text-gray-900 font-semibold" : "text-gray-700"}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  onClick={() => navigate(ROUTES.VISITOR_VIP_REGISTRATION)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 py-4 text-lg font-bold shadow-lg"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Devenir VIP Premium
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Highlight */}
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-300">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                     Rendez-vous B2B ILLIMIT…S
                  </p>
                  <p className="text-xs text-gray-700">
                    Planifiez autant de meetings stratÈgiques que vous le souhaitez avec les exposants et partenaires du salon.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <Card className="overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Comparaison dÈtaillÈe
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Choisissez le pass adaptÈ ‡ vos objectifs
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">FonctionnalitÈ</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-green-700">Pass Gratuit</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-yellow-700">Pass VIP Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">AccËs au salon</td>
                    <td className="px-6 py-4 text-center">?</td>
                    <td className="px-6 py-4 text-center">?</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Badge QR sÈcurisÈ</td>
                    <td className="px-6 py-4 text-center">? Simple</td>
                    <td className="px-6 py-4 text-center">? Avec photo</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{t('common.public_conferences')}</td>
                    <td className="px-6 py-4 text-center">?</td>
                    <td className="px-6 py-4 text-center">?</td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-yellow-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{t('common.b2b_meetings')}</td>
                    <td className="px-6 py-4 text-center text-gray-400">? 0</td>
                    <td className="px-6 py-4 text-center text-yellow-700 font-bold">? {t('common.unlimited')}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{t('common.dashboard')}</td>
                    <td className="px-6 py-4 text-center text-gray-400">‚ùå</td>
                    <td className="px-6 py-4 text-center">?</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{t('common.vip_zones')}</td>
                    <td className="px-6 py-4 text-center text-gray-400">‚ùå</td>
                    <td className="px-6 py-4 text-center">?</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{t('common.networking')} area</td>
                    <td className="px-6 py-4 text-center text-gray-400">‚ùå</td>
                    <td className="px-6 py-4 text-center">?</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Gala de clÙture</td>
                    <td className="px-6 py-4 text-center text-gray-400">‚ùå</td>
                    <td className="px-6 py-4 text-center">?</td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 text-sm text-gray-900">Prix</td>
                    <td className="px-6 py-4 text-center text-green-700">0 EUR</td>
                    <td className="px-6 py-4 text-center text-yellow-700">700 EUR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-3xl mx-auto text-center"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Questions frÈquentes</h3>
            <div className="space-y-2 text-sm text-gray-700 text-left">
              <p>
                <strong>Q: Puis-je passer du Pass Gratuit au Pass VIP plus tard ?</strong><br />
                R: Oui, vous pourrez upgrader votre compte ‡ tout moment depuis votre badge.
              </p>
              <p>
                <strong>Q: Le paiement est-il sÈcurisÈ ?</strong><br />
                R: Oui, nous utilisons Stripe, PayPal et CMI pour des paiements 100% sÈcurisÈs.
              </p>
              <p>
                <strong>Q: Comment recevoir mon badge ?</strong><br />
                R: Pass Gratuit : badge envoyÈ par email immÈdiatement. Pass VIP : badge avec photo envoyÈ aprËs validation du paiement.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.HOME)}
            className="text-gray-600 hover:text-gray-900"
          >
            ‚Üê Retour ‡ l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}




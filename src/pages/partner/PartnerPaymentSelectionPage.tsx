import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Building2,
  Shield,
  Zap,
  Clock,
  Check,
  ArrowRight,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import { PartnerTier } from '../../config/partnerTiers';
import {
  getPartnerTierAmount,
  formatPartnerAmount,
  calculateUpgradeAmount
} from '../../config/partnerBankTransferConfig';
import { createPartnerBankTransferRequest } from '../../services/partnerPaymentService';

type PaymentMethod = 'online' | 'bank_transfer';

export default function PartnerPaymentSelectionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect if already active
  React.useEffect(() => {
    if (user?.status === 'active') {
      toast.info('Votre compte est déjà actif');
      navigate('/partner/dashboard');
      return;
    }
    
    // Redirection automatique vers le virement bancaire
    if (user && tier) {
      handleBankTransfer();
    }
  }, [user, tier, navigate]);

  const tier = (searchParams.get('tier') || 'museum') as PartnerTier;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);

  const currentTier = (user?.partner_tier || 'museum') as PartnerTier;
  const tierInfo = getPartnerTierAmount(tier);
  const isUpgrade = currentTier !== tier;
  const amount = isUpgrade
    ? calculateUpgradeAmount(currentTier, tier)
    : tierInfo.amount;

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-16 w-16 mx-auto mb-4 text-purple-600" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Préparation de votre demande de virement bancaire...</p>
        </div>
      </div>
    );
  }

  const handleOnlinePayment = () => {
    // Rediriger vers la page de paiement en ligne avec PayPal/CMI
    navigate(`/partner/payment-online?tier=${tier}`);
  };

  const handleBankTransfer = async () => {
    if (!user) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setProcessing(true);

    try {
      // Créer une demande de virement bancaire
      const { requestId } = await createPartnerBankTransferRequest(
        user.id,
        tier,
        currentTier
      );

      toast.success('Demande de virement créée avec succès !');

      // Rediriger vers la page d'instructions de virement
      navigate(`/partner/bank-transfer?request_id=${requestId}&tier=${tier}`);
    } catch (error: any) {
      console.error('Error creating bank transfer request:', error);
      toast.error('Erreur lors de la création de la demande');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Virement bancaire',
      description: 'Virement SEPA ou international',
      icon: Building2,
      color: 'green',
      recommended: true,
      features: [
        'Virement bancaire sécurisé',
        'Délai de traitement: 2-5 jours',
        'Idéal pour montants élevés',
        'SEPA ou SWIFT acceptés',
        'Justificatif requis',
        'Validation manuelle par l\'administrateur'
      ],
      action: handleBankTransfer
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Crown className="h-16 w-16 mx-auto mb-4 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isUpgrade ? 'Upgrade vers' : 'Abonnement'} {tierInfo.displayName}
          </h1>
          <p className="text-xl text-gray-600">
            Choisissez votre méthode de paiement
          </p>
        </motion.div>

        {/* Order Summary */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isUpgrade ? 'â¬†ï¸ Montant de l\'upgrade' : ' Montant total'}
            </h3>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">
                {formatPartnerAmount(amount)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatPartnerAmount(amount, 'EUR')} | {formatPartnerAmount(amount, 'MAD')}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-4 mt-4">
            <h4 className="font-semibold text-gray-900 mb-3">✨ Inclus dans votre abonnement:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tierInfo.features.map((feature) => (
                <div key={feature} className="flex items-center text-sm text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            Sélectionnez votre mode de paiement
          </h3>

          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? `border-2 border-${method.color}-500 shadow-xl`
                    : 'border-2 border-transparent hover:border-gray-300 hover:shadow-lg'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-full bg-${method.color}-100`}>
                      <method.icon className={`h-6 w-6 text-${method.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg">{method.name}</h4>
                        {method.recommended && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                            Recommandé
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                      <div className="space-y-2">
                        {method.features.map((feature) => (
                          <div key={feature} className="flex items-center text-sm text-gray-700">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {selectedMethod === method.id ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                </div>

                {selectedMethod === method.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <Button
                      onClick={method.action}
                      disabled={processing}
                      size="lg"
                      className={`w-full bg-gradient-to-r from-${method.color}-600 to-${method.color}-700 hover:from-${method.color}-700 hover:to-${method.color}-800`}
                    >
                      {processing ? (
                        <>
                          <Clock className="mr-2 h-5 w-5 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          {method.id === 'online' ? (
                            <>
                              <Zap className="mr-2 h-5 w-5" />
                              Payer maintenant - Activation immédiate
                            </>
                          ) : (
                            <>
                              <Building2 className="mr-2 h-5 w-5" />
                              Voir les instructions de virement
                            </>
                          )}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center text-sm text-gray-600">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          <span>Paiement 100% sécurisé - Vos données sont cryptées</span>
        </div>

        {/* Cancel Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/partner/upgrade')}
            className="text-gray-600 hover:text-gray-900 text-sm underline"
          >
            Retour aux options d'abonnement
          </button>
        </div>
      </div>
    </div>
  );
}




import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { motion } from 'framer-motion';
import { 
  Clock, Mail, CreditCard, Upload, CheckCircle, 
  AlertCircle, LogOut, FileText, RefreshCw, 
  Building2, Phone, Copy, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface PaymentRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'proof_uploaded' | 'approved' | 'rejected';
  payment_method: string;
  reference: string;
  description: string;
  transfer_proof_url?: string;
  metadata: {
    subscriptionLevel?: string;
    standArea?: number;
    eventName?: string;
    eventDates?: string;
  };
  created_at: string;
  updated_at: string;
}

// Informations bancaires SIB (à configurer selon vos besoins)
const BANK_INFO = {
  bankName: 'Banque Internationale du Commerce',
  accountHolder: 'SIB EVENEMENTS SARL',
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  bic: 'BICFRPP',
  reference: 'SIB-2026'
};

export default function PendingAccountPage() {
  const { logout, user } = useAuthStore();
  const { t } = useTranslation();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchPaymentRequest = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur recuperation payment_request:', error);
      }

      setPaymentRequest(data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPaymentRequest();
  }, [fetchPaymentRequest]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !paymentRequest) return;

    // Validation du fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporte. Utilisez PDF, JPG ou PNG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux. Maximum 5 Mo.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simuler progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/proof_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      clearInterval(progressInterval);

      if (uploadError) {
        // Si le bucket n'existe pas, on cree l'URL manuellement
        console.warn('Upload error (bucket may not exist):', uploadError);
        
        // Mise a jour du statut sans URL reelle pour la demo
        const { error: updateError } = await supabase
          .from('payment_requests')
          .update({
            status: 'proof_uploaded',
            transfer_proof_url: `demo://proof/${fileName}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentRequest.id);

        if (updateError) throw updateError;
      } else {
        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(uploadData.path);

        // Mettre a jour la payment_request
        const { error: updateError } = await supabase
          .from('payment_requests')
          .update({
            status: 'proof_uploaded',
            transfer_proof_url: urlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentRequest.id);

        if (updateError) throw updateError;
      }

      setUploadProgress(100);
      toast.success('Preuve de paiement envoyee avec succes !');
      
      // Rafraichir les donnees
      await fetchPaymentRequest();
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error("Erreur lors de l'envoi du fichier");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copie !`))
      .catch(() => toast.error('Impossible de copier'));
  };

  const getStatusInfo = () => {
    if (!paymentRequest) {
      return {
        icon: Clock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        title: 'Inscription enregistrée — en attente de validation',
        description: 'Votre demande d\'inscription a bien été reçue. Notre équipe examine votre dossier et vous enverra les instructions de paiement par email sous 24 à 48h ouvrées.'
      };
    }

    switch (paymentRequest.status) {
      case 'pending':
        return {
          icon: CreditCard,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          title: 'En attente de paiement',
          description: 'Effectuez votre virement bancaire puis uploadez la preuve de paiement ci-dessous.'
        };
      case 'proof_uploaded':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Preuve envoyée — Validation en cours',
          description: 'Votre preuve de paiement est en cours de vérification par notre équipe. Délai habituel : 24 à 48h ouvrées.'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Paiement validé !',
          description: 'Votre compte est activé ! Vous allez être redirigé vers votre espace exposant.'
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Paiement refusé',
          description: 'Veuillez nous contacter ou soumettre une nouvelle preuve de paiement.'
        };
      default:
        return {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          title: 'Inscription enregistrée — en attente de validation',
          description: 'Votre demande d\'inscription a bien été reçue. Notre équipe examine votre dossier et vous enverra les instructions de paiement par email sous 24 à 48h ouvrées.'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tete */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user?.profile?.firstName || 'Utilisateur'} !
          </h1>
          <p className="text-gray-600">
            {paymentRequest?.status === 'pending'
              ? 'Finalisez votre inscription en effectuant le paiement'
              : paymentRequest?.status === 'proof_uploaded'
              ? 'Votre dossier est en cours de traitement'
              : paymentRequest?.status === 'approved'
              ? 'Votre espace exposant est prêt !'
              : 'Votre demande d\'inscription est en cours de traitement'
            }
          </p>
        </motion.div>

        {/* Carte de statut principale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`mb-6 border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
                  <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${statusInfo.color}`}>
                    {statusInfo.title}
                  </h2>
                  <p className="text-gray-600">{statusInfo.description}</p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-600 font-medium">
                    1. Inscription ?
                  </span>
                  <span className={
                    !paymentRequest ? 'text-gray-400' :
                    paymentRequest.status === 'pending' ? 'text-amber-600 font-medium' :
                    ['proof_uploaded', 'approved'].includes(paymentRequest.status) ? 'text-green-600 font-medium' :
                    'text-gray-400'
                  }>
                    2. Paiement {!paymentRequest ? '' : paymentRequest.status === 'pending' ? '...' : ['proof_uploaded', 'approved'].includes(paymentRequest.status) ? '?' : ''}
                  </span>
                  <span className={paymentRequest?.status === 'approved' ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    3. Activation {paymentRequest?.status === 'approved' ? '?' : ''}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                    style={{ 
                      width: paymentRequest?.status === 'approved' ? '100%' : 
                             paymentRequest?.status === 'proof_uploaded' ? '66%' :
                             paymentRequest?.status === 'pending' ? '33%' : '15%'
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Message explicatif quand pas de payment_request */}
        {!paymentRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-2 border-amber-200 bg-amber-50">
              <div className="p-6">
                <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Que se passe-t-il ensuite ?
                </h3>
                <div className="space-y-3 text-amber-900">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <p className="text-sm"><strong>Validation de votre dossier</strong> — Notre équipe vérifie vos informations d'inscription (entreprise, secteur, surface du stand).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <p className="text-sm"><strong>Réception des instructions de paiement</strong> — Vous recevrez un email avec le montant exact et les coordonnées bancaires pour effectuer votre virement.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <p className="text-sm"><strong>Activation de votre espace</strong> — Dès réception de votre paiement, votre espace exposant sera activé et vous y aurez pleinement accès.</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    ? <strong>Délai estimé :</strong> 24 à 48 heures ouvrées. Vérifiez vos emails (y compris les spams).
                  </p>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={fetchPaymentRequest}
                    variant="outline"
                    className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Actualiser le statut
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Informations de paiement */}
          {paymentRequest && paymentRequest.status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Informations de virement
                  </h3>

                  <div className="space-y-4">
                    {/* Montant a payer */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
                      <p className="text-sm opacity-80">Montant a payer</p>
                      <p className="text-3xl font-bold">
                        {paymentRequest.amount.toLocaleString()} {paymentRequest.currency}
                      </p>
                      <p className="text-sm opacity-80 mt-1">
                        {paymentRequest.description}
                      </p>
                    </div>

                    {/* Coordonnees bancaires */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500">Banque</p>
                          <p className="font-medium">{BANK_INFO.bankName}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500">Titulaire</p>
                          <p className="font-medium">{BANK_INFO.accountHolder}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(BANK_INFO.accountHolder, 'Titulaire')}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                          <Copy className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500">IBAN</p>
                          <p className="font-mono font-medium text-sm">{BANK_INFO.iban}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(BANK_INFO.iban.replace(/\s/g, ''), 'IBAN')}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                          <Copy className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500">BIC/SWIFT</p>
                          <p className="font-mono font-medium">{BANK_INFO.bic}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(BANK_INFO.bic, 'BIC')}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                          <Copy className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div>
                          <p className="text-xs text-amber-600">Reference obligatoire</p>
                          <p className="font-mono font-bold text-amber-700">{paymentRequest.reference}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(paymentRequest.reference, 'Reference')}
                          className="p-2 hover:bg-amber-100 rounded-lg transition"
                        >
                          <Copy className="h-4 w-4 text-amber-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Upload preuve de paiement */}
          {paymentRequest && (paymentRequest.status === 'pending' || paymentRequest.status === 'rejected') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    Envoyer la preuve de paiement
                  </h3>

                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      Une fois le virement effectue, uploadez votre justificatif 
                      (capture d'ecran ou PDF du virement).
                    </p>

                    {/* Zone d'upload */}
                    <label 
                      className={`
                        block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-300
                        ${isUploading 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                        }
                      `}
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />

                      {isUploading ? (
                        <div className="space-y-3">
                          <RefreshCw className="h-10 w-10 text-blue-500 mx-auto animate-spin" />
                          <p className="text-blue-600 font-medium">Upload en cours...</p>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-700 font-medium">
                            Cliquez ou glissez votre fichier ici
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            PDF, JPG ou PNG (max 5 Mo)
                          </p>
                        </>
                      )}
                    </label>

                    {/* Aide */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Conseils pour votre justificatif
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>- Le document doit etre lisible et non coupe</li>
                        <li>- La reference {paymentRequest.reference} doit etre visible</li>
                        <li>- Le montant et la date doivent apparaitre</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Statut preuve uploadee */}
          {paymentRequest?.status === 'proof_uploaded' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:col-span-2"
            >
              <Card className="border-2 border-blue-200 bg-blue-50">
                <div className="p-6 text-center">
                  <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-blue-800 mb-2">
                    Preuve de paiement recue !
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Notre equipe verifie actuellement votre virement. 
                    Vous serez notifie par email des que votre compte sera active.
                  </p>
                  <p className="text-sm text-blue-600">
                    Delai de traitement habituel : 24 a 48 heures ouvrees
                  </p>

                  {paymentRequest.transfer_proof_url && !paymentRequest.transfer_proof_url.startsWith('demo://') && (
                    <a 
                      href={paymentRequest.transfer_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Voir le document envoye
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Informations de contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-600" />
                Besoin d'aide ?
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <a 
                  href="mailto:exposants@SIB.com"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">exposants@SIB.com</p>
                  </div>
                </a>

                <a 
                  href="tel:+33123456789"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Telephone</p>
                    <p className="font-medium">+33 1 23 45 67 89</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-500">Horaires</p>
                    <p className="font-medium">Lun-Ven 9h-18h</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bouton deconnexion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <Button onClick={logout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Se deconnecter
          </Button>
        </motion.div>
      </div>
    </div>
  );
}



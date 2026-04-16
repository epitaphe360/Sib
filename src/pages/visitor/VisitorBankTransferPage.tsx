import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Check,
  Upload,
  ArrowLeft,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  Crown,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  VISITOR_BANK_TRANSFER_INFO,
  generateVisitorPaymentReference,
  formatVisitorAmount
} from '../../config/visitorBankTransferConfig';

interface VisitorPaymentRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_method: string;
  transfer_reference?: string;
  transfer_date?: string;
  transfer_proof_url?: string;
  validation_notes?: string;
  created_at: string;
}

export default function VisitorBankTransferPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('request_id');
  const { user } = useAuthStore();

  const [paymentRequest, setPaymentRequest] = useState<VisitorPaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferReference, setTransferReference] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadPaymentRequest();
  }, [requestId]);

  async function loadPaymentRequest() {
    if (!requestId || !user) {
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {throw error;}

      // @ts-expect-error - Supabase type inference limitation
      setPaymentRequest(data as VisitorPaymentRequest);
      // @ts-expect-error - Supabase type inference limitation
      if (data && 'transfer_reference' in data && data.transfer_reference) {
        // @ts-expect-error - Supabase type inference limitation
        setTransferReference(data.transfer_reference as string);
      } else {
        // Générer une référence si elle n'existe pas
        const ref = generateVisitorPaymentReference(user.id);
        setTransferReference(ref);
        // Sauvegarder la référence
        if (supabase) {
          await supabase
            .from('payment_requests')
            // @ts-expect-error - Supabase type inference limitation
            .update({ transfer_reference: ref })
            .eq('id', requestId);
        }
      }
      // @ts-expect-error - Supabase type inference limitation
      if (data && 'transfer_proof_url' in data && data.transfer_proof_url) {
        // @ts-expect-error - Supabase type inference limitation
        setProofUrl(data.transfer_proof_url as string);
      }
    } catch (error) {
      console.error('Error loading payment request:', error);
      toast.error('Erreur lors du chargement de la demande');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitProof() {
    if (!requestId || !transferReference.trim()) {
      toast.error('Veuillez renseigner la référence de votre virement');
      return;
    }

    if (!proofUrl && !selectedFile) {
      toast.error('Veuillez uploader un justificatif de virement');
      return;
    }

    setUploading(true);

    try {
      let finalProofUrl = proofUrl;

      // Upload du fichier si nouveau fichier sélectionné
      if (selectedFile && supabase) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
        const filePath = `visitor-transfer-proofs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {throw uploadError;}

        const { data: urlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(filePath);

        finalProofUrl = urlData.publicUrl;
      }

      // Mettre à jour la demande de paiement
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error: updateError } = await supabase
        .from('payment_requests')
        // @ts-expect-error - Supabase type inference limitation
        .update({
          transfer_reference: transferReference,
          transfer_proof_url: finalProofUrl,
          transfer_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', requestId);

      if (updateError) {throw updateError;}

      toast.success('Justificatif envoyé avec succès !');
      toast.info('Votre paiement sera validé sous 2-5 jours ouvrés');

      // Recharger les données
      await loadPaymentRequest();
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast.error('Erreur lors de l\'envoi du justificatif');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {return;}

    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format invalide. Utilisez JPG, PNG ou PDF');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    setSelectedFile(file);
    toast.success(`Fichier sélectionné: ${file.name}`);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const bankInfo = VISITOR_BANK_TRANSFER_INFO;
  const vipInfo = bankInfo.vipPass;
  const instructions = bankInfo.instructions.fr;

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'En attente de validation'
    },
    approved: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Paiement validé'
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Paiement refusé'
    }
  };

  const status = statusConfig[paymentRequest?.status || 'pending'];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/visitor/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <Crown className="h-12 w-12 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Virement Bancaire - Pass VIP
              </h1>
              <p className="text-gray-600 mt-1">
                Instructions de paiement par virement
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <Card className={`p-4 ${status.bg} ${status.border} border-2`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-6 w-6 ${status.color}`} />
              <div className="flex-1">
                <div className={`font-semibold ${status.color}`}>
                  {status.label}
                </div>
                {paymentRequest?.validation_notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    {paymentRequest.validation_notes}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Montant */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Montant à virer</div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-600 mb-2">
              {formatVisitorAmount(vipInfo.amount)}
            </div>
            <div className="text-sm text-gray-500">
              {vipInfo.displayName} - {vipInfo.description}
            </div>
          </div>
        </Card>

        {/* Informations bancaires */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            Coordonnées bancaires
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Banque</div>
                <div className="font-semibold">{bankInfo.bankName}</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Bénéficiaire</div>
                <div className="font-semibold">{bankInfo.accountHolder}</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="text-sm text-gray-600">IBAN</div>
                <div className="font-mono font-semibold">{bankInfo.iban}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bankInfo.iban)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="text-sm text-gray-600">BIC/SWIFT</div>
                <div className="font-mono font-semibold">{bankInfo.bic}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bankInfo.bic)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="flex-1">
                <div className="text-sm text-purple-600 font-semibold">
                  ⚠️ Référence de paiement (OBLIGATOIRE)
                </div>
                <div className="font-mono font-bold text-lg mt-1">{transferReference}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(transferReference)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600" />
            {instructions.title}
          </h2>

          <div className="space-y-6">
            {/* Étapes */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Étapes à suivre:</h3>
              <ol className="space-y-2">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Points importants */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Points importants:</h3>
              <ul className="space-y-1">
                {instructions.important.map((point, index) => (
                  <li key={index} className="text-sm text-yellow-800">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Infos additionnelles */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Informations complémentaires:</h3>
              <ul className="space-y-1">
                {instructions.additionalInfo.map((info, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {info}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Upload de justificatif */}
        {paymentRequest?.status === 'pending' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-6 w-6 text-purple-600" />
              Justificatif de virement
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence du virement
                </label>
                <input
                  type="text"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="Ex: VIP-XXXX-YYYY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preuve de virement (PDF, JPG ou PNG - max 5MB)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {selectedFile
                          ? selectedFile.name
                          : proofUrl
                          ? 'Fichier déjà uploadé - Cliquez pour changer'
                          : 'Cliquez pour sélectionner un fichier'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleSubmitProof}
                disabled={uploading || (!selectedFile && !proofUrl)}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Envoyer le justificatif
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Message de confirmation si approuvé */}
        {paymentRequest?.status === 'approved' && (
          <Card className="p-6 bg-green-50 border-2 border-green-200">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                Paiement validé !
              </h3>
              <p className="text-green-700 mb-4">
                Votre compte VIP est maintenant actif. Profitez de tous vos avantages Premium !
              </p>
              <Button
                onClick={() => navigate('/visitor/dashboard')}
                className="bg-green-600 hover:bg-green-700"
              >
                Aller au tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

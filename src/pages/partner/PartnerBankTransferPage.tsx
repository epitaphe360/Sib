import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Check,
  AlertCircle,
  Upload,
  ArrowLeft,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  PARTNER_BANK_TRANSFER_INFO,
  generatePartnerPaymentReference,
  formatPartnerAmount,
  getPartnerTierAmount
} from '../../config/partnerBankTransferConfig';
import { PartnerTier } from '../../config/partnerTiers';

interface PartnerPaymentRequest {
  id: string;
  user_id: string;
  requested_level: string;
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

export default function PartnerBankTransferPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('request_id');
  const tier = (searchParams.get('tier') || 'partner') as PartnerTier;
  const { user } = useAuthStore();

  const [paymentRequest, setPaymentRequest] = useState<PartnerPaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferReference, setTransferReference] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [declaredAmount, setDeclaredAmount] = useState<string>('');

  useEffect(() => {
    loadPaymentRequest();
  }, [requestId]);

  async function loadPaymentRequest() {
    if (!requestId || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('id, user_id, requested_level, amount, currency, status, payment_method, transfer_reference, transfer_date, transfer_proof_url')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {throw error;}

      setPaymentRequest(data);
      if (data?.transfer_reference) {
        setTransferReference(data.transfer_reference);
      }
      if (data?.transfer_proof_url) {
        setProofUrl(data.transfer_proof_url);
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

    if (!selectedFile && !proofUrl.trim()) {
      toast.error('Veuillez uploader un fichier ou fournir un lien vers votre preuve');
      return;
    }

    // Fix P0-5 : Validation du montant déclaré
    const expectedAmount = paymentRequest?.amount;
    const parsedDeclaredAmount = parseFloat(declaredAmount.replace(/[^0-9.]/g, ''));
    if (!declaredAmount.trim() || isNaN(parsedDeclaredAmount)) {
      toast.error('Veuillez saisir le montant exact que vous avez viré');
      return;
    }
    if (expectedAmount && Math.abs(parsedDeclaredAmount - expectedAmount) > 0.01) {
      toast.error(
        `Montant incorrect. Attendu : $${expectedAmount.toLocaleString('fr-FR')} USD — Saisi : $${parsedDeclaredAmount.toLocaleString('fr-FR')} USD. Vérifiez votre virement.`
      );
      return;
    }

    setUploading(true);
    let uploadedFileUrl = proofUrl;

    try {
      // Upload file to Supabase Storage if a file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user?.id}_${requestId}_${Date.now()}.${fileExt}`;
        const filePath = `partner-payment-proofs/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Erreur upload: ${uploadError.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        uploadedFileUrl = publicUrlData.publicUrl;
        setUploadProgress(100);
      }

      // Update payment request with proof
      const { error } = await supabase
        .from('payment_requests')
        .update({
          transfer_reference: transferReference,
          transfer_proof_url: uploadedFileUrl || null,
          transfer_date: new Date().toISOString(),
          declared_amount: parseFloat(declaredAmount.replace(/[^0-9.]/g, '')) || null,
        })
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (error) {throw error;}

      // Créer une notification pour les admins
      try {
        // Récupérer tous les admins
        const { data: admins } = await supabase
          .from('users')
          .select('id')
          .eq('type', 'admin');

        // Créer une notification pour chaque admin
        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            user_id: admin.id,
            title: 'Nouveau justificatif de paiement partenaire',
            message: `${user?.companyName || user?.firstName + ' ' + user?.lastName} a soumis un justificatif de paiement pour validation.`,
            type: 'info',
            created_at: new Date().toISOString()
          }));

          await supabase.from('notifications').insert(notifications);
        }
      } catch (notifError) {
        console.error('Erreur création notification admin:', notifError);
        // Ne pas bloquer si la notification échoue
      }

      toast.success('Justificatif enregistré avec succès !');
      toast.info('Votre paiement sera validé sous 2-5 jours ouvrés');
      setSelectedFile(null);
      setUploadProgress(0);
      loadPaymentRequest();
    } catch (error: any) {
      console.error('Error submitting proof:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {return;}

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez PDF, JPG ou PNG');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux. Maximum 5 MB');
      return;
    }

    setSelectedFile(file);
    toast.success(`Fichier sélectionné: ${file.name}`);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast.success(`${label} copié dans le presse-papier`);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Impossible de copier'));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !requestId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 text-center mb-4">
            Vous devez d'abord soumettre une demande de partenariat avant d'accéder à cette page.
          </p>
          <Button onClick={() => navigate('/partner/upgrade')} className="w-full">
            Faire une demande de partenariat
          </Button>
        </Card>
      </div>
    );
  }

  const tierInfo = getPartnerTierAmount(tier);
  const bankInfo = PARTNER_BANK_TRANSFER_INFO;
  const paymentReference = generatePartnerPaymentReference(user.id, requestId, tier);
  const instructions = bankInfo.instructions.fr;

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
            onClick={() => navigate('/partner/upgrade')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux options de paiement
          </Button>

          <div className="text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Instructions de Virement Bancaire
            </h1>
            <p className="text-xl text-gray-600">
              {tierInfo.displayName} - {formatPartnerAmount(tierInfo.amount)}
            </p>
          </div>
        </motion.div>

        {/* Status Alert */}
        {paymentRequest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {paymentRequest.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                <Clock className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800">Demande en attente de validation</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Votre demande sera traitée sous 2-5 jours ouvrés après réception du virement
                  </p>
                </div>
              </div>
            )}

            {paymentRequest.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Paiement approuvé !</p>
                  <p className="text-green-700 text-sm mt-1">
                    Votre compte a été activé avec le niveau {tierInfo.displayName}
                  </p>
                </div>
              </div>
            )}

            {paymentRequest.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Paiement refusé</p>
                  {paymentRequest.validation_notes && (
                    <p className="text-red-700 text-sm mt-1">
                      Raison: {paymentRequest.validation_notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Bank Information Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-blue-600" />
            Informations Bancaires
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Banque:</span>
              <span className="text-gray-900 font-semibold">{bankInfo.bankName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Titulaire:</span>
              <span className="text-gray-900 font-semibold">{bankInfo.accountHolder}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">IBAN:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-white px-3 py-1 rounded border border-gray-300 font-mono text-sm">
                  {bankInfo.iban}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankInfo.iban, 'IBAN')}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">BIC/SWIFT:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-white px-3 py-1 rounded border border-gray-300 font-mono text-sm">
                  {bankInfo.bic}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankInfo.bic, 'BIC')}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium text-lg">Montant à virer:</span>
                <span className="text-3xl font-bold text-green-600">
                  {formatPartnerAmount(tierInfo.amount)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Également: {formatPartnerAmount(tierInfo.amount, 'EUR')} |{' '}
                {formatPartnerAmount(tierInfo.amount, 'MAD')}
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4 mt-4">
              <div className="mb-2">
                <span className="text-gray-700 font-medium">Référence obligatoire:</span>
              </div>
              <div className="flex items-center space-x-2">
                <code className="bg-yellow-100 px-3 py-2 rounded border-2 border-yellow-400 font-mono text-sm font-bold flex-1">
                  {paymentReference}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(paymentReference, 'Référence')}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-red-600 mt-2 font-semibold">
                ⚠️ Cette référence DOIT figurer dans le libellé de votre virement
              </p>
            </div>
          </div>
        </Card>

        {/* Instructions Card */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
             {instructions.title}
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Étapes à suivre:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {instructions.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Points importants:
              </h4>
              <ul className="space-y-1 text-sm text-red-800">
                {instructions.important.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Informations complémentaires:
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                {instructions.additionalInfo.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Proof Submission Form */}
        {paymentRequest?.status === 'pending' && !paymentRequest.transfer_reference && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Upload className="h-6 w-6 mr-2 text-blue-600" />
              Soumettre votre preuve de paiement
            </h3>

            <div className="space-y-4">
              {/* Montant déclaré - Fix P0-5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant viré (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={declaredAmount}
                    onChange={(e) => setDeclaredAmount(e.target.value)}
                    placeholder={paymentRequest?.amount ? `${paymentRequest.amount.toLocaleString('fr-FR')}` : '0'}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {paymentRequest?.amount && (
                  <p className="text-xs text-blue-600 mt-1">
                    Montant attendu : <strong>${paymentRequest.amount.toLocaleString('fr-FR')} USD</strong>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="proof-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  Justificatif de virement <span className="text-red-500">*</span>
                </label>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="proof-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    {selectedFile ? (
                      <div className="text-sm">
                        <p className="font-semibold text-green-600 mb-1">✓ {selectedFile.name}</p>
                        <p className="text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Cliquez pour uploader votre preuve de virement
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, JPG ou PNG (max 5 MB)
                        </p>
                      </>
                    )}
                  </label>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="my-4 text-center text-gray-500 text-sm">ou</div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du justificatif (alternative)
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://... (lien vers Google Drive, Dropbox, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!!selectedFile}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si vous préférez, hébergez votre document sur un service cloud
                </p>
              </div>

              <Button
                onClick={handleSubmitProof}
                disabled={uploading || !transferReference.trim() || (!selectedFile && !proofUrl.trim())}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Soumettre le justificatif
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Submitted Proof Info */}
        {paymentRequest?.transfer_reference && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Justificatif soumis avec succès</p>
                <p className="text-blue-800 text-sm mt-1">
                  Date de soumission:{' '}
                  {new Date(paymentRequest.transfer_date || '').toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-blue-800 text-sm mt-1">
                  <strong>Référence:</strong> {paymentRequest.transfer_reference}
                </p>
                {paymentRequest.transfer_proof_url && (
                  <p className="text-blue-800 text-sm mt-1">
                    <strong>Justificatif:</strong>{' '}
                    <a
                      href={paymentRequest.transfer_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-600"
                    >
                      Voir le document
                    </a>
                  </p>
                )}
                <p className="text-blue-700 text-sm mt-3">
                  â³ Votre demande est en cours de traitement. Vous serez notifié par email dès validation.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Features Included */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ✨ Inclus dans votre abonnement {tierInfo.displayName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tierInfo.features.map((feature) => (
              <div key={feature} className="flex items-center text-gray-700">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Support Contact */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
             Besoin d'aide ?
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${bankInfo.support.email}`} className="text-blue-600 hover:underline">
                {bankInfo.support.email}
              </a>
            </p>
            <p>
              <strong>Téléphone:</strong>{' '}
              <a href={`tel:${bankInfo.support.phone}`} className="text-blue-600 hover:underline">
                {bankInfo.support.phone}
              </a>
            </p>
            <p>
              <strong>WhatsApp:</strong>{' '}
              <a href={`https://wa.me/${bankInfo.support.whatsapp.replace(/\s/g, '')}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {bankInfo.support.whatsapp}
              </a>
            </p>
            <p className="text-gray-600">{bankInfo.support.hours.fr}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}




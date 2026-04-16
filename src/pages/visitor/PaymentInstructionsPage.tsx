import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { BANK_TRANSFER_INFO, generatePaymentReference } from '../../config/bankTransferConfig';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckCircle, AlertTriangle, XCircle, Copy, Building2, CreditCard, FileText, HelpCircle, Clock, Upload } from 'lucide-react';

interface PaymentRequest {
  id: string;
  requested_level: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  transfer_reference?: string;
  transfer_date?: string;
  validation_notes?: string;
}

export default function PaymentInstructionsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');
  const { user } = useAuthStore();

  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofUrl, setProofUrl] = useState('');
  const [reference, setReference] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (requestId || user?.id) {
      loadData();
    }
  }, [requestId, user?.id]);

  async function loadData() {
    try {
      if (requestId) {
        const { data: request } = await supabase
          .from('payment_requests')
          .select('id, requested_level, amount, currency, status, created_at, transfer_reference, transfer_date, validation_notes')
          .eq('id', requestId)
          .eq('user_id', user?.id)
          .maybeSingle();

        if (request) {setPaymentRequest(request);}
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement:', error);
      setLoading(false);
    }
  }

  async function handleSubmitProof() {
    if (!requestId || !reference) {
      toast.error(t('payment.error.missingReference'));
      return;
    }

    setUploading(true);

    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({
          transfer_reference: reference,
          transfer_proof_url: proofUrl || null,
          transfer_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {throw error;}

      toast.success(t('payment.success.proofSubmitted'));
      loadData();
    } catch (error: unknown) {
      const errorInfo = error as Record<string, unknown>;
      toast.error(t('payment.error.generic', { message: (errorInfo.message as string) || String(error) }));
    } finally {
      setUploading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copiedToClipboard'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !requestId) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Card className="p-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t('common.error')}</h2>
          <p className="text-gray-600">{t('payment.error.notFound')}</p>
        </Card>
      </div>
    );
  }

  const referenceCode = generatePaymentReference(user.id, requestId);
  const bankInfo = BANK_TRANSFER_INFO;
  const amount = paymentRequest?.requested_level === 'premium' ? bankInfo.amounts.premium.amount : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('payment.instructions.title')}</h1>
        <p className="text-xl text-gray-600">
          {t('payment.instructions.subtitle')}<span className="font-bold text-blue-600">{amount.toFixed(2)}€</span>
        </p>
      </div>

      {paymentRequest?.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="block font-semibold">{t('payment.status.pendingTitle')}</strong>
            <p className="text-sm mt-1">{t('payment.status.pendingDescription')}</p>
          </div>
        </div>
      )}

      {paymentRequest?.status === 'approved' && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="block font-semibold">{t('payment.status.approvedTitle')}</strong>
            <p className="text-sm mt-1">{t('payment.status.approvedDescription')}</p>
          </div>
        </div>
      )}

      {paymentRequest?.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-start gap-3">
          <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="block font-semibold">{t('payment.status.rejectedTitle')}</strong>
            {paymentRequest && (paymentRequest as any).validation_notes && (
              <p className="text-sm mt-1">
                {t('payment.status.rejectedReason')}{(paymentRequest as any).validation_notes}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Bank Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            {t('payment.bank.title')}
          </h2>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">{t('payment.bank.bankName')}</div>
              <div className="font-medium">{bankInfo.bankName}</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">{t('payment.bank.accountHolder')}</div>
              <div className="font-medium">{bankInfo.accountHolder}</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg relative group cursor-pointer" onClick={() => copyToClipboard(bankInfo.iban)}>
              <div className="text-xs text-gray-500 mb-1">{t('payment.bank.iban')}</div>
              <div className="font-mono font-medium break-all">{bankInfo.iban}</div>
              <Copy className="w-4 h-4 text-gray-400 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg relative group cursor-pointer" onClick={() => copyToClipboard(bankInfo.bic)}>
              <div className="text-xs text-gray-500 mb-1">{t('payment.bank.bic')}</div>
              <div className="font-mono font-medium">{bankInfo.bic}</div>
              <Copy className="w-4 h-4 text-gray-400 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="text-xs text-blue-600 mb-1 font-bold uppercase tracking-wider">{t('payment.bank.mandatoryReference')}</div>
              <div className="flex items-center justify-between">
                <code className="text-lg font-bold text-blue-900">{referenceCode}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(referenceCode)} className="h-8 w-8 p-0">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {t('payment.bank.referenceNote')}
              </p>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <div className="space-y-6">
          <Card className="p-6 bg-blue-50 border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('payment.instructions.stepsTitle')}
            </h3>
            <ol className="space-y-3 text-blue-800 text-sm">
              <li className="flex gap-2">
                <span className="font-bold bg-blue-200 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <span dangerouslySetInnerHTML={{ __html: t('payment.instructions.step1', { amount: amount.toFixed(2) }) }} />
              </li>
              <li className="flex gap-2">
                <span className="font-bold bg-blue-200 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <span dangerouslySetInnerHTML={{ __html: t('payment.instructions.step2', { reference: referenceCode }) }} />
              </li>
              <li className="flex gap-2">
                <span className="font-bold bg-blue-200 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <span>{t('payment.instructions.step3')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold bg-blue-200 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</span>
                <span>{t('payment.instructions.step4')}</span>
              </li>
            </ol>
          </Card>

          {paymentRequest?.status === 'pending' && !paymentRequest.transfer_reference && (
            <Card className="p-6 border-2 border-blue-100 shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                {t('payment.proof.title')}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.proof.referenceLabel')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder={referenceCode}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('payment.proof.referenceHint')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.proof.urlLabel')}
                  </label>
                  <Input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('payment.proof.urlHint')}
                  </p>
                </div>

                <Button
                  onClick={handleSubmitProof}
                  disabled={uploading || !reference}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? t('payment.proof.submitting') : t('payment.proof.submit')}
                </Button>
              </div>
            </Card>
          )}

          {paymentRequest?.transfer_reference && (
            <Card className="p-6 bg-green-50 border-green-100">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-900">{t('payment.proof.submittedTitle')}</h3>
                  <p className="text-sm text-green-800 mt-1">
                    {t('payment.proof.submittedDate', { date: new Date(paymentRequest.transfer_date || '').toLocaleDateString('fr-FR') })}
                  </p>
                  <div className="mt-2 p-2 bg-white/50 rounded border border-green-200 text-sm font-mono text-green-900">
                    Ref: {paymentRequest.transfer_reference}
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    {t('payment.proof.processingNote')}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-600">
        <HelpCircle className="w-4 h-4" />
        <span>{t('payment.support.needHelp')}</span>
        <a href={`mailto:${bankInfo.supportEmail}`} className="text-blue-600 hover:underline font-medium">
          {bankInfo.supportEmail}
        </a>
      </div>
    </div>
  );
}




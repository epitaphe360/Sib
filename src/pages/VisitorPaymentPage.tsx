import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import {
  Building2,
  Check,
  ArrowRight,
  Loader,
  Crown,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';
import { supabase } from '../lib/supabase';
import {
  generateVisitorPaymentReference,
  formatVisitorAmount
} from '../config/visitorBankTransferConfig';

export default function VisitorPaymentPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Redirect if already VIP or create payment request - runs ONCE
  useEffect(() => {
    if (initializedRef.current) return;
    
    // Get user from store directly (stable reference)
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    initializedRef.current = true;
    
    if (currentUser.visitor_level === 'premium' || currentUser.visitor_level === 'vip') {
      toast.success(t('payment.alreadyPremium'));
      navigate(ROUTES.VISITOR_DASHBOARD, { replace: true });
      return;
    }
    
    createBankTransferRequest();
  }, []); // Empty deps - runs only on mount

  async function createBankTransferRequest() {
    try {
      if (!user) {
        console.warn('⚠️ User not loaded yet, waiting...');
        // Attendre que le user soit chargé
        setTimeout(() => {
          if (!useAuthStore.getState().user) {
            toast.error(t('payment.userNotConnected'));
            navigate(ROUTES.LOGIN);
          } else {
            // Réessayer avec le user maintenant chargé
            createBankTransferRequest();
          }
        }, 500);
        return;
      }

      console.log('🔄 Creating bank transfer request for user:', user.id);

      // Vérifier si une demande existe déjà
      const { data: existingRequest } = await supabase
        .from('payment_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequest) {
        console.log('✅ Existing payment request found:', existingRequest.id);
        // Rediriger vers la page de virement existante
        navigate(`/visitor/bank-transfer?request_id=${existingRequest.id}`);
        return;
      }

      console.log('📝 Creating new payment request...');

      // Créer une nouvelle demande de paiement
      const paymentReference = generateVisitorPaymentReference(user.id);
      
      const { data: newRequest, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          amount: 700,
          currency: 'EUR',
          payment_method: 'bank_transfer',
          status: 'pending',
          requested_level: 'premium',
          transfer_reference: paymentReference
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error creating payment request:', error);
        throw error;
      }

      console.log('✅ Payment request created:', newRequest.id);
      toast.success(t('payment.requestCreated'));
      
      // Petit délai pour que l'utilisateur voit le toast
      setTimeout(() => {
        navigate(`/visitor/bank-transfer?request_id=${newRequest.id}`);
      }, 500);
      
    } catch (error) {
      console.error('❌ Error in createBankTransferRequest:', error);
      toast.error(t('payment.requestError'));
      
      // En cas d'erreur, rediriger vers le dashboard avec un message
      setTimeout(() => {
        navigate(ROUTES.VISITOR_DASHBOARD);
      }, 2000);
    } finally {
      setLoading(false);
    }
  }

  const handleStripePayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment record
      const paymentRecord = await createPaymentRecord({
        userId: user.id,
        amount: PAYMENT_AMOUNTS.VIP_PASS,
        currency: 'EUR',
        paymentMethod: 'stripe',
        status: 'pending',
      });

      // Create Stripe checkout session
      const session = await createStripeCheckoutSession(user.id, user.email);

      // Redirect to Stripe
      await redirectToStripeCheckout(session.id);
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      console.error('Stripe payment error:', err);
      setError((errorInfo.message as string) || t('payment.stripeError'));
      toast.error(t('payment.stripeErrorToast'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalApprove = async (data: Record<string, unknown>) => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Capture PayPal order
      const captureData = await capturePayPalOrder(data.orderID as string, user.id);

      // Create payment record
      await createPaymentRecord({
        userId: user.id,
        amount: PAYMENT_AMOUNTS.VIP_PASS,
        currency: 'EUR',
        paymentMethod: 'paypal',
        transactionId: data.orderID as string,
        status: 'approved', // PayPal approves instantly
      });

      toast.success(t('payment.paypalSuccess'));
      navigate('/visitor/payment-success');
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      console.error('PayPal capture error:', err);
      setError((errorInfo.message as string) || t('payment.paypalCaptureError'));
      toast.error(t('payment.paypalCaptureErrorToast'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCMIPayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment record
      await createPaymentRecord({
        userId: user.id,
        amount: convertEURtoMAD(PAYMENT_AMOUNTS.VIP_PASS),
        currency: 'MAD',
        paymentMethod: 'cmi',
        status: 'pending',
      });

      // Create CMI payment request
      const cmiData = await createCMIPaymentRequest(user.id, user.email);

      // Redirect to CMI payment gateway
      window.location.href = cmiData.paymentUrl as string;
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      console.error('CMI payment error:', err);
      setError((errorInfo.message as string) || t('payment.cmiError'));
      toast.error(t('payment.cmiErrorToast'));
    } finally {
      setIsProcessing(false);
    }
  };

  // TEST ONLY: Simulate successful payment
  const handleSimulateSuccess = async () => {
    if (!user) return;
    
    // Si l'utilisateur n'a pas de password auth, montrer le formulaire d'upgrade d'abord
    if (!user.profile?.hasPassword) {
      setShowUpgradeForm(true);
      return;
    }
    
    await completeVIPUpgrade();
  };

  // Handler pour photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('payment.selectImage'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('payment.photoMaxSize'));
        return;
      }
      setPhotoFile(file);
      setValue('photo', e.target.files);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Compléter les données VIP manquantes pour visiteur FREE
  const onSubmitUpgradeData = async (data: UpgradeVIPForm) => {
    if (!user) return;
    setIsProcessing(true);

    try {
      // 1. Upload photo si fournie
      let photoUrl = user.profile?.photoUrl || '';
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('visitor-photos')
          .upload(fileName, photoFile);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('visitor-photos')
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      // 2. Créer compte auth avec password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: data.password,
        options: {
          data: {
            name: user.name,
            type: 'visitor',
            visitor_level: 'premium'
          }
        }
      });

      if (authError) {
        console.error('Erreur création auth:', authError);
        toast.error(t('payment.authCreationError'));
        return;
      }

      // 3. Mettre à jour profil avec données complètes
      await supabase.from('users').update({
        profile: {
          ...user.profile,
          position: data.position || user.profile?.position,
          company: data.company || user.profile?.company,
          photoUrl,
          hasPassword: true
        }
      }).eq('id', user.id);

      // 4. Mettre à jour le store local
      setUser({
        ...user,
        profile: {
          ...user.profile,
          position: data.position || user.profile?.position,
          company: data.company || user.profile?.company,
          photoUrl,
          hasPassword: true
        }
      });

      toast.success(t('payment.profileCompleted'));
      setShowUpgradeForm(false);
      
      // Maintenant faire l'upgrade VIP
      await completeVIPUpgrade();
    } catch (error) {
      console.error('Erreur upgrade données:', error);
      toast.error(t('payment.profileUpdateError'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Finaliser l'upgrade VIP
  const completeVIPUpgrade = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      // Create payment record (may fail if table doesn't exist - non-blocking)
      try {
        await createPaymentRecord({
          userId: user.id,
          amount: PAYMENT_AMOUNTS.VIP_PASS,
          currency: 'EUR',
          paymentMethod: 'stripe',
          status: 'approved',
          transactionId: `sim_${Date.now()}`
        });
      } catch (paymentError) {
        console.warn('Payment record creation skipped:', paymentError);
      }
      
      // Update user status AND visitor_level to premium
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          visitor_level: 'premium'
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      // Show success toast
      toast.success(t('payment.simulatedSuccess'));

      // Send Receipt Email
      try {
        await EmailService.sendPaymentReceipt(
          user.email,
          user.name,
          PAYMENT_AMOUNTS.VIP_PASS,
          'EUR',
          `sim_${Date.now()}`
        );
      } catch (emailErr) {
        console.warn('Failed to send receipt email', emailErr);
      }
      
      // Navigate to success page
      navigate(ROUTES.VISITOR_PAYMENT_SUCCESS);
    } catch (err) {
      console.error('Simulation error:', err);
      toast.error(t('payment.simulationError'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('payment.preparing')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Redirection en cours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Crown className="h-16 w-16 mx-auto mb-4 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('payment.redirecting')}
          </h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {t('payment.pleaseWait')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}



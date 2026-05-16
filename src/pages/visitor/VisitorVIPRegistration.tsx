/**
 * Formulaire d'inscription Visiteur VIP PREMIUM
 * Workflow complet avec photo, mot de passe et paiement obligatoire
 */
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Briefcase, Loader, Lock, Upload, Crown, Camera, CheckCircle, Tag, XCircle, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { MoroccanPattern } from '../../components/ui/MoroccanDecor';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { COUNTRIES } from '../../data/countries';
import useAuthStore from '../../store/authStore';

const vipVisitorSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(72, 'Le mot de passe ne doit pas dépasser 72 caractères') // Limite bcrypt Supabase
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[!@#$%^&*]/, 'Doit contenir un caractère spécial'),
  confirmPassword: z.string(),
  phone: z.string().min(8, 'Téléphone requis'),
  country: z.string().min(2, 'Pays requis'),
  sector: z.string().min(2, 'Secteur requis'),
  position: z.string().min(2, 'Fonction requise'),
  company: z.string().min(2, 'Entreprise requise'),
  photo: z.any().optional() // Photo optionnelle - peut être ajoutée plus tard
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

type VIPVisitorForm = z.infer<typeof vipVisitorSchema>;

const sectors = [
  'Autorité urbaine',
  'Transport & mobilité',
  'Logistique',
  'Consulting',
  'Technologie',
  'Finance',
  'Média/Presse',
  'Institutionnel',
  'Autre'
];

interface AppliedPromo {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  used_count: number;
}

export default function VisitorVIPRegistration() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [badgePrice, setBadgePrice] = useState(700);
  const [priceCurrency, setPriceCurrency] = useState('MAD');
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuthStore();

  useEffect(() => {
    (supabase as any)
      .from('pricing_config')
      .select('amount, currency')
      .eq('category', 'visitor')
      .eq('level', 'vip')
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }: { data: { amount: number; currency: string } | null }) => {
        if (data) {
          setBadgePrice(data.amount);
          setPriceCurrency(data.currency);
        }
      });
  }, []);

  let finalPrice = badgePrice;
  if (appliedPromo) {
    if (appliedPromo.discount_type === 'percentage') {
      finalPrice = Math.max(0, Math.round(badgePrice * (1 - appliedPromo.discount_value / 100)));
    } else {
      finalPrice = Math.max(0, badgePrice - appliedPromo.discount_value);
    }
  }

  const checkPromoCode = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setIsCheckingPromo(true);
    setPromoError('');
    setAppliedPromo(null);
    const { data, error } = await (supabase as any)
      .from('promo_codes')
      .select('id, code, discount_type, discount_value, max_uses, used_count, expires_at, is_active')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();
    if (error || !data) {
      setPromoError('Code promo invalide ou introuvable.');
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromoError('Ce code promo a expiré.');
    } else if (data.max_uses !== null && data.used_count >= data.max_uses) {
      setPromoError('Ce code promo a atteint son nombre maximum d\'utilisations.');
    } else {
      setAppliedPromo(data as AppliedPromo);
      toast.success('Code promo appliqué !');
    }
    setIsCheckingPromo(false);
  };

  const removePromo = () => { setAppliedPromo(null); setPromoInput(''); setPromoError(''); };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<VIPVisitorForm>({
    resolver: zodResolver(vipVisitorSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: currentUser?.profile?.firstName || '',
      lastName: currentUser?.profile?.lastName || '',
      email: currentUser?.email || '',
      phone: currentUser?.profile?.phone || '',
      country: currentUser?.profile?.country || '',
      company: currentUser?.profile?.company || '',
      position: currentUser?.profile?.position || '',
      sector: currentUser?.profile?.businessSector || ''
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5MB');
        return;
      }

      setPhotoFile(file);
      setValue('photo', e.target.files);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: VIPVisitorForm) => {
    setIsSubmitting(true);

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      // 1. Upload photo to Supabase Storage (OPTIONNEL - ne bloque pas)
      let photoUrl = '';
      if (photoFile) {
        try {
          const fileExt = photoFile.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('visitor-photos')
            .upload(filePath, photoFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            toast.warning('Photo non uploadée (non bloquant)');
          } else {
            const { data: urlData } = supabase.storage
              .from('visitor-photos')
              .getPublicUrl(filePath);
            photoUrl = urlData.publicUrl;
          }
        } catch (photoErr) {
          toast.warning('Photo non uploadée (non bloquant)');
        }
      } else {
      }

      // 2. Vérification préalable : L'email existe-t-il déjà ?
      const emailToCheck = data.email.toLowerCase().trim();

      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email, type, visitor_level')
        .eq('email', emailToCheck)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('? [VIP INSCRIPTION] Erreur lors de la vérification:', checkError);
        toast.error('Erreur lors de la vérification de l\'email. Veuillez réessayer.');
        setIsSubmitting(false);
        return;
      }

      if (existingUser) {
        let accountType = 'visiteur';
        if (existingUser.type === 'exhibitor') {
          accountType = 'exposant';
        } else if (existingUser.type === 'partner') {
          accountType = 'sponsor';
        } else if (existingUser.type === 'visitor') {
          const level = existingUser.visitor_level === 'vip' ? 'VIP' : 'Gratuit';
          accountType = `visiteur ${level}`;
        }

        toast.error(`Cet email est déjà enregistré en tant que ${accountType}. Connectez-vous pour accéder à votre compte.`);

        setTimeout(() => {
          if (globalThis.confirm('Voulez-vous être redirigé vers la page de connexion ?')) {
            navigate(ROUTES.LOGIN);
          }
        }, 2000);

        setIsSubmitting(false);
        return;
      }


      // 3. Auth: Check if logged in or need to sign up
      let userId = currentUser?.id;

      if (!userId) {

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: fullName,
              type: 'visitor',
              visitor_level: 'vip'
            }
          }
        });

        if (authError) {
          console.error('? Erreur auth signUp:', authError);
          console.error('   Code:', authError.status);
          console.error('   Message:', authError.message);

          // Messages d'erreur plus clairs
          if (authError.message?.includes('User already registered')) {
            toast.error('Cet email est déjà utilisé');
          } else if (authError.message?.includes('Password')) {
            toast.error('Le mot de passe ne respecte pas les exigences');
          } else {
            toast.error(`Erreur d'inscription: ${authError.message}`);
          }
          throw authError;
        }
        if (!authData.user) {
          console.error('? Pas de user créé');
          throw new Error('Échec création utilisateur');
        }
        userId = authData.user.id;
      } else {
      }

      // 4. Update or Create user profile
      const { error: userError } = await supabase
        .from('users')
        .upsert([{
          id: userId,
          email: data.email,
          name: fullName,
          type: 'visitor',
          visitor_level: 'vip',
          status: 'pending_payment',
          profile: {
            ...(currentUser?.profile || {}),
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            country: data.country,
            businessSector: data.sector,
            position: data.position,
            company: data.company,
            photoUrl: photoUrl || currentUser?.profile?.photoUrl || '',
            hasPassword: true // Compte VIP avec auth password
          }
        }]);

      if (userError) {
        console.error('? Erreur profil (UPSERT):', userError);
        throw userError;
      }

      // 5. CRITICAL: Update local auth store
      const localUser = {
        id: userId,
        email: data.email,
        name: fullName,
        type: 'visitor' as const,
        visitor_level: 'vip' as const, // Cohérent avec DB : seul 'vip' existe (pas 'premium')
        status: 'pending_payment' as const,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          country: data.country,
          company: data.company,
          position: data.position,
          businessSector: data.sector,
          photoUrl: photoUrl || currentUser?.profile?.photoUrl || '',
          hasPassword: true, // Compte VIP avec auth password
          bio: currentUser?.profile?.bio || '',
          interests: currentUser?.profile?.interests || [],
          objectives: currentUser?.profile?.objectives || [],
          sectors: currentUser?.profile?.sectors || [],
          products: currentUser?.profile?.products || [],
          videos: currentUser?.profile?.videos || [],
          images: currentUser?.profile?.images || [],
          participationObjectives: currentUser?.profile?.participationObjectives || [],
          thematicInterests: currentUser?.profile?.thematicInterests || [],
          collaborationTypes: currentUser?.profile?.collaborationTypes || [],
          expertise: currentUser?.profile?.expertise || [],
          visitObjectives: currentUser?.profile?.visitObjectives || [],
          competencies: currentUser?.profile?.competencies || []
        },
        createdAt: currentUser?.createdAt || new Date().toISOString()
      };
      setUser(localUser);

      // 6. Create payment request in database
      let paymentRequestId: string | null = null;
      try {
        let discountAmount = 0;
        if (appliedPromo) {
          discountAmount = appliedPromo.discount_type === 'percentage'
            ? Math.round(badgePrice * appliedPromo.discount_value / 100)
            : Math.min(badgePrice, appliedPromo.discount_value);
        }

        const { data: prData, error: paymentError } = await supabase
          .from('payment_requests')
          .insert([{
            user_id: userId,
            amount: finalPrice,
            original_amount: badgePrice,
            promo_code_id: appliedPromo?.id || null,
            promo_discount_amount: discountAmount,
            status: 'pending',
            payment_method: 'bank_transfer',
            requested_level: 'vip'
          }])
          .select('id')
          .single();

        if (paymentError) {
        } else {
          paymentRequestId = prData?.id || null;
          // Incrémenter used_count du code promo
          if (appliedPromo) {
            await (supabase as any)
              .from('promo_codes')
              .update({ used_count: appliedPromo.used_count + 1 })
              .eq('id', appliedPromo.id);
          }
        }
      } catch (e) {
      }

      // 7. Send email via Node.js server (SMTP - non bloquant)
      try {
        const emailController = new AbortController();
        const emailTimeout = setTimeout(() => emailController.abort(), 5000);

        const emailResponse = await fetch('/api/send-visitor-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: emailController.signal,
          body: JSON.stringify({
            email: data.email,
            name: fullName,
            level: 'vip',
            userId: userId,
            includePaymentInstructions: true
          })
        });
        clearTimeout(emailTimeout);
        const emailResult = await emailResponse.json();
        if (emailResult.success) {
        } else {
        }
      } catch (e) {
      }

      // 8. Success - Redirect DIRECTLY to bank transfer page (skip VisitorPaymentPage)
      toast.success('Compte créé ! Redirection vers les instructions de paiement...');

      await new Promise(resolve => setTimeout(resolve, 100));

      const bankTransferUrl = paymentRequestId
        ? `/visitor/bank-transfer?request_id=${paymentRequestId}`
        : ROUTES.VISITOR_PAYMENT;

      navigate(bankTransferUrl, { replace: true });

    } catch (error: any) {
      console.error('? ERREUR INSCRIPTION VIP:', error);
      console.error('   Type:', typeof error);
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('   Status:', error.status);

      // Message d'erreur plus spécifique selon le type
      let errorMessage = 'Erreur lors de l\'inscription';

      if (error.message?.includes('already registered')) {
        errorMessage = 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Le mot de passe ne respecte pas les exigences de sécurité.';
      } else if (error.message?.includes('Invalid')) {
        errorMessage = 'Données invalides. Vérifiez vos informations.';
      } else if (error.status === 422) {
        errorMessage = 'Erreur de validation. Vérifiez votre email et mot de passe.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <MoroccanPattern className="opacity-[0.05] text-white" scale={1.5} />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#52B847]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-amber-400 p-3 rounded-lg shadow-lg shadow-amber-400/30">
              <Crown className="h-8 w-8 text-gray-900" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SIB VIP</span>
              <span className="text-sm text-white/70 block leading-none">Premium Pass 2026</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Inscription Pass Premium VIP
          </h1>
          <p className="text-white/80 text-lg">
            Accès complet au salon avec badge photo sécurisé
          </p>
          <div className="mt-4 inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full">
            <span className="text-amber-300 font-semibold">RDV B2B Illimités</span>
            <span className="text-white/60">•</span>
            <span className="text-amber-300 font-semibold">Gala exclusif</span>
            <span className="text-white/60">•</span>
            <span className="text-amber-300 font-semibold">Networking premium</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-950/30">
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
              console.error("? Validation errors:", errors);
              toast.error("Veuillez corriger les erreurs rouges dans le formulaire.");

              // Scroll to first error
              const firstError = Object.keys(errors)[0];
              if (firstError) {
                const element = document.getElementById(firstError);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element?.focus();
              }
            })} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    errors.email ? 'text-red-500' : 'text-gray-400'
                  }`} />
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-yellow-500'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      {...register('password')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Minimum 8 caractères"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Confirmer le mot de passe"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Phone and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      id="country"
                      {...register('country')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
                    >
                      <option value="">Sélectionnez</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.country && (
                    <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>

              {/* Professional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité *
                  </label>
                  <select
                    id="sector"
                    {...register('sector')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Sélectionnez</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  {errors.sector && (
                    <p className="text-red-600 text-sm mt-1">{errors.sector.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Fonction *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="position"
                      type="text"
                      {...register('position')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Ex: Directeur Commercial"
                    />
                  </div>
                  {errors.position && (
                    <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise *
                </label>
                <input
                  id="company"
                  type="text"
                  {...register('company')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nom de votre entreprise"
                />
                {errors.company && (
                  <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
                )}
              </div>

              {/* VIP Benefits */}
              <div className="bg-gradient-to-r from-indigo-50 to-amber-50 border border-sib-gold/40 rounded-lg p-6">
                <h4 className="font-bold text-indigo-900 mb-3 flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Inclus dans votre Pass Premium VIP
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-sib-gold mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Rendez-vous B2B ILLIMITÉS</strong> - Planifiez autant de meetings que souhaité</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-sib-gold mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Badge ultra-sécurisé avec photo</strong> - QR code JWT rotatif</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-sib-gold mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Accès zones VIP</strong> - Salons premium, networking area</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-sib-gold mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Gala de clôture exclusif</strong> - Événement réseau premium</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-sib-gold mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Ateliers et conférences VIP</strong> - Contenus exclusifs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-sib-gold mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>{t('common.complete_dashboard')}</strong> - {t('common.dashboard')} {t('common.appointments')} & {t('common.networking')}</span>
                  </li>
                </ul>
              </div>

              {/* Code Promo */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700">Code promo (optionnel)</span>
                </div>
                <div className="p-4">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="font-mono font-bold text-emerald-800">{appliedPromo.code}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            {appliedPromo.discount_type === 'percentage'
                              ? `-${appliedPromo.discount_value}%`
                              : `-${appliedPromo.discount_value} MAD`}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">
                          Prix réduit : <strong>{finalPrice} {priceCurrency}</strong> au lieu de {badgePrice} {priceCurrency}
                        </p>
                      </div>
                      <button type="button" onClick={removePromo} className="p-1 rounded-lg hover:bg-emerald-100 transition-colors">
                        <XCircle className="h-4 w-4 text-emerald-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); checkPromoCode(); } }}
                        placeholder="Ex: SIB-VIP2026"
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <button
                        type="button"
                        onClick={checkPromoCode}
                        disabled={isCheckingPromo || !promoInput.trim()}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {isCheckingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                        Appliquer
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> {promoError}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-900">
                  <strong>Paiement requis</strong> : Après création du compte, vous serez redirigé vers la page de paiement sécurisé{' '}
                  {appliedPromo ? (
                    <><span className="line-through text-gray-400">{badgePrice} {priceCurrency}</span>{' '}<strong className="text-emerald-700">{finalPrice} {priceCurrency}</strong> (code promo appliqué)</>
                  ) : (
                    <strong>{badgePrice} {priceCurrency}</strong>
                  )}. Votre accès VIP sera activé immédiatement après validation du paiement.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sib-gold hover:bg-sib-gold/90 text-white py-4 text-lg font-bold shadow-lg shadow-sib-gold/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Création du compte VIP...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Créer mon compte VIP et payer — {finalPrice} {priceCurrency}
                  </>
                )}
              </Button>

              {/* Free Pass Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Vous cherchez un accès gratuit au salon ?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.REGISTER_VISITOR)}
                  className="border-indigo-500 text-indigo-700 hover:bg-indigo-50"
                >
                  S'inscrire avec le Pass Gratuit
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}






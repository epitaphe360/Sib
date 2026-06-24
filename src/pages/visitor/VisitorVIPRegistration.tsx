/**
 * Formulaire d'inscription Visiteur VIP PREMIUM
 * Workflow complet avec photo, mot de passe et paiement obligatoire
 */
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Briefcase, Loader, Lock, Upload, Crown, Camera, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { fetchVipPassPricing } from '../../services/visitorLevelService';
import { useVisitorPassPricing } from '../../hooks/useVisitorPassPricing';
import { FormSuccessBanner } from '../../components/common/FormSuccessBanner';
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
  'BTP & Construction',
  'Architecture & Design',
  'Matériaux & Équipements',
  'Immobilier & Promotion',
  'Consulting & Ingénierie',
  'Technologie & PropTech',
  'Institutionnel',
  'Autre',
];

interface VisitorVIPRegistrationProps {
  embedded?: boolean;
}

export default function VisitorVIPRegistration({ embedded = false }: VisitorVIPRegistrationProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuthStore();
  const { formattedPrice } = useVisitorPassPricing();

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
    console.log('?? onSubmit APPELÉ avec données:', JSON.stringify(data, null, 2));
    setIsSubmitting(true);

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      console.log('?? Full name:', fullName);

      // 1. Upload photo to Supabase Storage (OPTIONNEL - ne bloque pas)
      let photoUrl = '';
      if (photoFile) {
        console.log('?? Upload photo en cours...');
        console.log('   ?? Fichier:', photoFile.name, 'Taille:', photoFile.size);
        try {
          const fileExt = photoFile.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${fileName}`;

          console.log('   ?? Upload vers visitor-photos/', filePath);
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('visitor-photos')
            .upload(filePath, photoFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.warn('?? Photo upload échoué (non bloquant):', uploadError);
            console.warn('   Code:', uploadError.message);
            toast.warning('Photo non uploadée (non bloquant)');
          } else {
            console.log('   ? Upload réussi:', uploadData);
            const { data: urlData } = supabase.storage
              .from('visitor-photos')
              .getPublicUrl(filePath);
            photoUrl = urlData.publicUrl;
            console.log('? Photo uploadée:', photoUrl);
          }
        } catch (photoErr) {
          console.warn('?? Erreur photo (non bloquant):', photoErr);
          toast.warning('Photo non uploadée (non bloquant)');
        }
      } else {
        console.log('?? Pas de photo sélectionnée');
      }

      // 2. Vérification préalable : L'email existe-t-il déjà ?
      console.log('?? [VIP INSCRIPTION] Vérification si email existe déjà...');
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
        console.warn('?? [VIP INSCRIPTION] Email déjà existant:', existingUser);
        let accountType = 'visiteur';
        if (existingUser.type === 'exhibitor') {
          accountType = 'exposant';
        } else if (existingUser.type === 'partner') {
          accountType = 'partenaire';
        } else if (existingUser.type === 'visitor') {
          const level = existingUser.visitor_level === 'premium' ? 'VIP' :
                       existingUser.visitor_level === 'standard' ? 'Standard' : 'Gratuit';
          accountType = `visiteur ${level}`;
        }

        toast.error(`?? Cet email est déjà enregistré en tant que ${accountType}. Connectez-vous pour accéder à votre compte.`);

        setTimeout(() => {
          if (window.confirm('Voulez-vous être redirigé vers la page de connexion ?')) {
            navigate(ROUTES.LOGIN);
          }
        }, 2000);

        setIsSubmitting(false);
        return;
      }

      console.log('? [VIP INSCRIPTION] Email disponible');

      // 3. Auth: Check if logged in or need to sign up
      let userId = currentUser?.id;

      if (!userId) {
        console.log('?? Création compte auth...');
        console.log('   ?? Email:', data.email);
        console.log('   ?? Password length:', data.password.length);
        console.log('   ?? Name:', fullName);

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: fullName,
              type: 'visitor',
              visitor_level: 'premium'
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
        console.log('? Auth user créé:', userId);
      } else {
        console.log('?? Utilisateur déjà connecté, on passe la création Auth:', userId);
      }

      // 4. Update or Create user profile
      console.log('?? Mise à jour profil utilisateur...');
      const { error: userError } = await supabase
        .from('users')
        .upsert([{
          id: userId,
          email: data.email,
          name: fullName,
          type: 'visitor',
          visitor_level: 'premium',
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
      console.log('? Profil utilisateur synchronisé');

      // 5. CRITICAL: Update local auth store
      const localUser = {
        id: userId,
        email: data.email,
        name: fullName,
        type: 'visitor' as const,
        visitor_level: 'premium' as const, // ? FIX P0-1: Cohérent avec DB ligne 229
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
        const vipPricing = await fetchVipPassPricing();
        const { data: prData, error: paymentError } = await supabase
          .from('payment_requests')
          .insert([{
            user_id: userId,
            amount: vipPricing.price,
            currency: vipPricing.currency,
            status: 'pending',
            payment_method: 'bank_transfer',
            requested_level: 'premium'
          }])
          .select('id')
          .single();

        if (paymentError) {
          console.warn('?? Erreur payment_request (non bloquant):', paymentError);
        } else {
          paymentRequestId = prData?.id || null;
          console.log('? Payment request créé:', paymentRequestId);
        }
      } catch (e) {
        console.warn('?? Erreur payment_request (non bloquant):', e);
      }

      // 7. Send email via Node.js server (SMTP - non bloquant)
      try {
        console.log('?? [VIP] Envoi email de bienvenue...');
        const emailController = new AbortController();
        const emailTimeout = setTimeout(() => emailController.abort(), 5000);

        const emailResponse = await fetch('/api/send-visitor-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: emailController.signal,
          body: JSON.stringify({
            email: data.email,
            name: fullName,
            level: 'premium',
            userId: userId,
            includePaymentInstructions: true
          })
        });
        clearTimeout(emailTimeout);
        const emailResult = await emailResponse.json();
        if (emailResult.success) {
          console.log('? Email VIP envoyé:', emailResult.messageId);
        } else {
          console.warn('?? Email non envoyé:', emailResult.error);
        }
      } catch (e) {
        console.warn('?? Erreur email (non bloquant):', e);
      }

      // 8. Success - Redirect DIRECTLY to bank transfer page (skip VisitorPaymentPage)
      console.log('?? [VIP] SUCCÈS COMPLET - Redirection vers coordonnées bancaires...');
      toast.success('Compte créé ! Redirection vers les instructions de paiement...');
      setSubmitSuccess(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      const bankTransferUrl = paymentRequestId
        ? `/visitor/bank-transfer?request_id=${paymentRequestId}`
        : ROUTES.VISITOR_PAYMENT;

      console.log('?? Navigation vers', bankTransferUrl);
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

  const wrapperClass = embedded ? 'p-4' : 'min-h-screen bg-sib-paper text-sib-ink';
  const innerClass = embedded ? 'w-full' : 'sib-v4-container max-w-3xl mx-auto pb-16 -mt-10 relative z-10 px-4 sm:px-0';

  const inputClass =
    'w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg bg-white text-sib-ink focus:outline-none focus:ring-2 focus:ring-sib-orange/40 focus:border-sib-orange transition-colors';
  const inputErrorClass =
    'w-full pl-10 pr-4 py-3 border border-danger-500 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-danger-500/30';
  const selectClass =
    'w-full px-4 py-3 border border-neutral-200 rounded-lg bg-white text-sib-ink focus:outline-none focus:ring-2 focus:ring-sib-orange/40 focus:border-sib-orange';

  const vipBadges = [
    'RDV B2B illimités',
    'Gala exclusif',
    'Networking premium',
  ];

  return (
    <div className={wrapperClass}>
      {!embedded && (
        <section className="relative overflow-hidden bg-sib-navy text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: "url('/sib2026-home-v4/assets/sib-hero.webp')" }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,27,56,.94) 0%, rgba(0,22,47,.78) 45%, rgba(0,15,34,.55) 100%)',
            }}
            aria-hidden
          />
          <div className="sib-v4-container relative z-10 py-14 md:py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Link to={ROUTES.HOME} className="inline-block mb-6" aria-label="SIB 2026 — Accueil">
                <img
                  src="/logo-sib2026.png"
                  alt="SIB 2026 — Salon International du Bâtiment"
                  className="h-14 sm:h-16 md:h-[4.5rem] w-auto mx-auto object-contain drop-shadow-md"
                />
              </Link>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sib-orange mb-3 font-display">
                Pass Premium VIP
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 leading-[0.95] tracking-tight">
                Inscription Pass Premium VIP
              </h1>
              <p className="text-base md:text-lg text-white/75 max-w-xl mx-auto mb-4 leading-relaxed">
                Accès complet au salon avec badge photo sécurisé
              </p>
              {formattedPrice && (
                <p className="text-2xl md:text-3xl font-bold text-sib-orange font-display mb-8 tabular-nums">
                  {formattedPrice}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {vipBadges.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/90"
                  >
                    <CheckCircle className="h-4 w-4 text-sib-orange shrink-0" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 inset-x-0 leading-none pointer-events-none">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 md:h-12">
              <path d="M0,48 C360,8 720,40 1080,16 C1260,4 1380,12 1440,8 L1440,48 Z" fill="#f7f7f5" />
            </svg>
          </div>
        </section>
      )}

      <div className={innerClass}>
        {submitSuccess && embedded && (
          <FormSuccessBanner
            title="Demande enregistrée"
            message="Votre inscription VIP a été soumise. Consultez vos emails pour les instructions de paiement."
          />
        )}

        {embedded && !submitSuccess && (
          <h3 className="text-base font-bold text-sib-navy dark:text-white mb-3 px-1 font-display">
            Pass VIP
          </h3>
        )}

        {(!embedded || !submitSuccess) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: embedded ? 0 : 0.15 }}
        >
          <Card className={`${embedded ? 'p-4' : 'p-6 sm:p-8'} border border-neutral-200/80 shadow-xl bg-white rounded-2xl`}>
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
                  <label htmlFor="firstName" className="block text-sm font-medium text-sib-navy mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      className={inputClass}
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-sib-navy mb-2">
                    Nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      className={inputClass}
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
                <label htmlFor="email" className="block text-sm font-medium text-sib-navy mb-2">
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
                    className={errors.email ? inputErrorClass : inputClass}
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
                  <label htmlFor="password" className="block text-sm font-medium text-sib-navy mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      {...register('password')}
                      className={inputClass}
                      placeholder="Minimum 8 caractères"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-sib-navy mb-2">
                    Confirmer mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      className={inputClass}
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
                  <label htmlFor="phone" className="block text-sm font-medium text-sib-navy mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className={inputClass}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-sib-navy mb-2">
                    Pays *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      id="country"
                      {...register('country')}
                      className={`${inputClass} appearance-none`}
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
                  <label htmlFor="sector" className="block text-sm font-medium text-sib-navy mb-2">
                    Secteur d'activité *
                  </label>
                  <select
                    id="sector"
                    {...register('sector')}
                    className={selectClass}
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
                  <label htmlFor="position" className="block text-sm font-medium text-sib-navy mb-2">
                    Fonction *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="position"
                      type="text"
                      {...register('position')}
                      className={inputClass}
                      placeholder="Ex: Directeur Commercial"
                    />
                  </div>
                  {errors.position && (
                    <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-sib-navy mb-2">
                  Entreprise *
                </label>
                <input
                  id="company"
                  type="text"
                  {...register('company')}
                  className={selectClass}
                  placeholder="Nom de votre entreprise"
                />
                {errors.company && (
                  <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
                )}
              </div>

              {/* VIP Benefits */}
              <div className="bg-sib-orange/5 border border-sib-orange/20 rounded-xl p-6">
                <h4 className="font-bold text-sib-navy mb-3 flex items-center font-display">
                  <Crown className="h-5 w-5 mr-2 text-sib-orange" />
                  Inclus dans votre Pass Premium VIP
                </h4>
                <ul className="text-sm text-neutral-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sib-orange mt-0.5 shrink-0" aria-hidden />
                    <span><strong>Rendez-vous B2B ILLIMITÉS</strong> - Planifiez autant de meetings que souhaité</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sib-orange mt-0.5 shrink-0" aria-hidden />
                    <span><strong>Badge ultra-sécurisé avec photo</strong> - QR code JWT rotatif</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sib-orange mt-0.5 shrink-0" aria-hidden />
                    <span><strong>Accès zones VIP</strong> - Salons premium, networking area</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sib-orange mt-0.5 shrink-0" aria-hidden />
                    <span><strong>Gala de clôture exclusif</strong> - Événement réseau premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sib-orange mt-0.5 shrink-0" aria-hidden />
                    <span><strong>Ateliers et conférences VIP</strong> - Contenus exclusifs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sib-orange mt-0.5 shrink-0" aria-hidden />
                    <span><strong>{t('common.complete_dashboard')}</strong> - {t('common.dashboard')} {t('common.appointments')} & {t('common.networking')}</span>
                  </li>
                </ul>
              </div>

              {/* Payment Info */}
              <div className="bg-sib-navy/5 border border-sib-navy/15 rounded-xl p-4">
                <p className="text-sm text-sib-navy">
                  <strong>Paiement requis</strong> : Après création du compte, vous serez redirigé vers la page d’instructions de virement bancaire. Votre Pass VIP sera activé une fois le virement validé par notre équipe (délai habituel : 2 à 5 jours ouvrés).
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="sib-v4-btn-orange w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Création du compte VIP...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Créer mon compte VIP et payer
                  </>
                )}
              </button>

              {/* Free Pass Link */}
              {!embedded && (
              <div className="text-center pt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-600 mb-2">
                  Vous cherchez un accès gratuit au salon ?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.REGISTER_VISITOR)}
                  className="border-sib-orange text-sib-navy hover:bg-sib-orange/5"
                >
                  Pass Gratuit
                </Button>
              </div>
              )}
            </form>
          </Card>
        </motion.div>
        )}
      </div>
    </div>
  );
}





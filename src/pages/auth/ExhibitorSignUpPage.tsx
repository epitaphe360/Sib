import { useState, useEffect, useMemo } from 'react';
import { useRegistrationControl } from '../../hooks/useRegistrationControl';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { ROUTES } from '../../lib/routes';
import { motion } from 'framer-motion';
import { Building, Mail, Lock, Phone, Briefcase, Globe, AlertCircle, Languages, Save } from 'lucide-react';
import { countries } from '../../utils/countries';
import { PasswordStrengthIndicator } from '../../components/ui/PasswordStrengthIndicator';
import { ProgressSteps } from '../../components/ui/ProgressSteps';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { PreviewModal } from '../../components/ui/PreviewModal';
import { useFormAutoSave } from '../../hooks/useFormAutoSave';
import { useEmailValidation } from '../../hooks/useEmailValidation';
import { translations, Language } from '../../utils/translations';
import { toast } from 'sonner';
import { SubscriptionSelector } from '../../components/exhibitor/SubscriptionSelector';
import { ExhibitorLevel } from '../../config/exhibitorQuotas';
import { supabase } from '../../lib/supabase';


const MAX_DESCRIPTION_LENGTH = 500;

// Factory function: creates the Zod schema with translated validation messages
function createExhibitorSignUpSchema(t: typeof translations['fr']) {
  return z.object({
    firstName: z.string().min(2, t.validationFirstNameMin2),
    lastName: z.string().min(2, t.validationLastNameMin2),
    companyName: z.string().min(2, t.validationCompanyRequired),
    email: z.string().email(t.validationEmailInvalid),
    phone: z.string().regex(/^[\d\s\-+()]+$/, t.validationPhoneInvalid),
    country: z.string().min(2, t.validationCountrySelect),
    position: z.string().min(2, t.validationPositionRequired),
    sectors: z.array(z.string()).min(1, t.validationSectorSelect),
    companyDescription: z.string().min(20, t.validationDescriptionMin20).max(MAX_DESCRIPTION_LENGTH),
    website: z.string().url(t.validationUrlInvalid).optional().or(z.literal('')),
    standArea: z.number().min(1, t.validationStandAreaRequired),
    subscriptionLevel: z.string().min(1, t.validationSubscriptionRequired),
    subscriptionPrice: z.number().min(1, t.validationSubscriptionPriceRequired),
    password: z.string()
      .min(12, t.validationPasswordMin12)
      .regex(/[A-Z]/, t.validationPasswordUppercase)
      .regex(/[a-z]/, t.validationPasswordLowercase)
      .regex(/[0-9]/, t.validationPasswordNumber)
      .regex(/[!@#$%^&*]/, t.validationPasswordSpecialExh),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: t.validationAcceptTermsExh,
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: t.validationAcceptPrivacy,
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.validationPasswordMismatch,
    path: ["confirmPassword"],
  });
}

type ExhibitorSignUpFormValues = z.infer<ReturnType<typeof createExhibitorSignUpSchema>>;

export default function ExhibitorSignUpPage() {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, loginWithLinkedIn } = useAuthStore();
  const { isOpen: regOpen, isLoading: regCheckLoading } = useRegistrationControl();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [language, setLanguage] = useState<Language>('fr');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);

  const t = translations[language];
  const exhibitorSignUpSchema = useMemo(() => createExhibitorSignUpSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExhibitorSignUpFormValues>({
    resolver: zodResolver(exhibitorSignUpSchema),
    mode: 'onChange',
  });

  // Debug: Log validation errors quand ils changent
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('🔴 Erreurs de validation:', errors);
    }
  }, [errors]);

  const watchedFields = watch();

  // Auto-save functionality
  // SECURITY: Exclude password fields from localStorage
  const { loadFromLocalStorage, clearLocalStorage } = useFormAutoSave<ExhibitorSignUpFormValues>({
    key: 'exhibitor-signup-draft',
    data: watchedFields,
    delay: 2000,
    excludeFields: ['password', 'confirmPassword'] // Never save passwords
  });

  // Email validation
  const { suggestion: emailSuggestion } = useEmailValidation(watchedFields.email || '');

  // Options pour les secteurs d'activité
  const sectorsOptions = [
    { value: 'technologie', label: 'Technologie' },
    { value: 'logistique', label: 'Logistique' },
    { value: 'media', label: 'Média' },
    { value: 'finance', label: 'Finance' },
    { value: 'sante', label: 'Santé' },
    { value: 'education', label: 'Éducation' },
    { value: 'tourisme', label: 'Tourisme' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'industrie', label: 'Industrie' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'services', label: 'Services' },
    { value: 'institutionnel', label: 'Institutionnel' },
  ];

  // Charger le brouillon au montage
  useEffect(() => {
    const draft = loadFromLocalStorage();
    if (draft && Object.keys(draft).length > 0) {
      const loadDraft = window.confirm('Un brouillon a été trouvé. Voulez-vous le restaurer ?');
      if (loadDraft) {
        Object.entries(draft).forEach(([key, value]) => {
          setValue(key as keyof ExhibitorSignUpFormValues, value);
        });
      } else {
        clearLocalStorage();
      }
    }
  }, [loadFromLocalStorage, clearLocalStorage, setValue]);

  // Fonction pour calculer les étapes de progression
  const getProgressSteps = () => {
    const steps = [
      {
        id: '1',
        label: 'Abonnement Exposant',
        completed: !!(watchedFields.subscriptionLevel && watchedFields.standArea && watchedFields.subscriptionPrice),
      },
      {
        id: '2',
        label: 'Informations Entreprise',
        completed: !!(watchedFields.companyName && watchedFields.sectors?.length > 0 && watchedFields.country),
      },
      {
        id: '3',
        label: 'Informations Personnelles',
        completed: !!(watchedFields.firstName && watchedFields.lastName && watchedFields.position),
      },
      {
        id: '4',
        label: 'Contact',
        completed: !!(watchedFields.email && watchedFields.phone),
      },
      {
        id: '5',
        label: 'Sécurité',
        completed: !!(watchedFields.password && watchedFields.confirmPassword && watchedFields.password === watchedFields.confirmPassword),
      },
      {
        id: '6',
        label: 'Conditions',
        completed: !!(watchedFields.acceptTerms && watchedFields.acceptPrivacy),
      },
    ];

    const completedCount = steps.filter(step => step.completed).length;
    const percentage = Math.round((completedCount / steps.length) * 100);

    return { steps, percentage };
  };

  const handlePreviewSubmit = () => {
    console.log('🟡 handlePreviewSubmit: Ouverture preview modal');
    setShowPreview(true);
  };

  const onSubmit: SubmitHandler<ExhibitorSignUpFormValues> = async (data) => {
    console.log('🟢 onSubmit APPELÉ! Données:', { email: data.email, firstName: data.firstName, company: data.companyName });
    setIsLoading(true);
    const { email, password, confirmPassword, acceptTerms, acceptPrivacy, sectors, standArea, subscriptionLevel, subscriptionPrice, ...profileData } = data;

    const finalProfileData = {
      ...profileData,
      sectors: sectors,         // Tableau JSON — permet filtrage et édition
      sector: sectors.join(', '), // Chaîne lisible pour affichage rétrocompatible
      role: 'exhibitor' as const,
      status: 'pending' as const,
      standArea, // Ajouter la surface du stand
      subscriptionLevel, // Ajouter le niveau d'abonnement
    };

    try {
      const { error, data: userData } = await signUp({ email, password }, finalProfileData);

      if (error) {
        throw error;
      }

      //  Créer la demande de paiement
      if (userData?.user?.id) {
        // Générer référence de paiement unique
        const paymentReference = `EXH-2026-${userData.user.id.substring(0, 8).toUpperCase()}`;

        const { error: paymentError } = await supabase
          .from('payment_requests')
          .insert({
            user_id: userData.user.id,
            amount: subscriptionPrice,
            currency: 'USD',
            status: 'pending',
            payment_method: 'bank_transfer',
            reference: paymentReference,
            description: `Abonnement Exposant SIB 2026 - ${subscriptionLevel} (${standArea}mÂ²)`,
            metadata: {
              subscriptionLevel,
              standArea,
              eventName: 'SIB 2026',
              eventDates: '25-29 Novembre 2026'
            }
          });

        if (paymentError) {
          console.error('Erreur création demande paiement:', paymentError);
          // Ne pas bloquer l'inscription si la création de paiement échoue
        }

        //  Envoyer email avec instructions de paiement
        try {
          const { error: emailError } = await supabase.functions.invoke('send-exhibitor-payment-instructions', {
            body: {
              email,
              name: `${profileData.firstName} ${profileData.lastName}`,
              companyName: profileData.companyName,
              subscriptionLevel,
              standArea,
              amount: subscriptionPrice,
              paymentReference,
              userId: userData.user.id
            }
          });

          if (emailError) {
            console.warn('âš ï¸ Email de paiement non envoyé:', emailError);
            // Ne pas bloquer si l'email échoue
          }
        } catch (emailError) {
          console.warn('âš ï¸ Edge function email non disponible:', emailError);
        }
      }

      // Supprimer le brouillon après succès
      clearLocalStorage();

      toast.success(
        t.toastSignUpSuccessExh,
        { duration: 5000 }
      );
      navigate(ROUTES.PENDING_ACCOUNT);
    } catch (error) {
      console.error("Sign up error:", error);
      // Message d'erreur clair pour l'utilisateur
      let errorMessage = t.toastSignUpError;
      if (error instanceof Error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          errorMessage = 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setIsLoading(false);
      setShowPreview(false);
    }
  };

  // ─── Chargement de l'état d'inscription ────────────────────────────────────
  if (regCheckLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f]/95 to-[#1e3a5f]/85 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-[#C9A84C]/30 border-t-[#C9A84C] animate-spin" />
          <p className="text-blue-100 text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  // ─── Page « Stands complets » si inscriptions clôturées ──────────────────
  if (!regOpen) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f]/95 to-[#1e3a5f]/85 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <img src="/logo-sib2026.png" alt="SIB 2026" className="h-10 w-10 object-contain" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">SIB 2026</div>
              <div className="text-xs text-blue-100">Salon International du Bâtiment</div>
            </div>
          </div>
        </div>

        {/* Carte "Stands complets" */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Bandeau or */}
          <div className="bg-gradient-to-r from-[#C9A84C] via-[#e8c96a] to-[#C9A84C] h-2" />

          <div className="p-8 sm:p-10 text-center">
            {/* Icône */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#1e3a5f] to-[#2a4f82] rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Badge "Complet" */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
              <span className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">Inscriptions clôturées</span>
            </div>

            {/* Titre */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a5f] mb-3 font-display">
              Tous les stands ont été vendus
            </h1>

            <p className="text-gray-600 text-base mb-6 leading-relaxed max-w-lg mx-auto">
              Merci de l'engouement remarquable autour du SIB 2026 !
              <br />
              <strong className="text-[#1e3a5f]">L'ensemble des stands disponibles a été attribué</strong> et nous ne pouvons malheureusement plus accepter de nouvelles inscriptions exposant pour cette édition.
            </p>

            {/* Liste d'options alternatives */}
            <div className="bg-[#1e3a5f]/5 rounded-xl p-5 mb-6 text-left">
              <p className="font-semibold text-[#1e3a5f] mb-3 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vous pouvez tout de même :
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A84C] mt-0.5">→</span>
                  <span><strong>Demander à être mis en liste d'attente</strong> en cas de désistement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A84C] mt-0.5">→</span>
                  <span><strong>Vous inscrire comme visiteur professionnel</strong> pour ne rien manquer du salon</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A84C] mt-0.5">→</span>
                  <span><strong>Découvrir nos formules sponsoring</strong> pour gagner en visibilité autrement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A84C] mt-0.5">→</span>
                  <span><strong>Réserver dès maintenant pour SIB 2027</strong> et bénéficier d'un tarif préférentiel</span>
                </li>
              </ul>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:Sib2026@urbacom.net?subject=Liste%20d'attente%20stand%20SIB%202026"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold text-sm transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Liste d'attente
              </a>
              <a
                href="/register/visitor"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#C9A84C] hover:bg-[#b8973d] text-white font-semibold text-sm transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                S'inscrire comme visiteur
              </a>
            </div>

            {/* Contact */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Pour toute demande spécifique, contactez-nous au{' '}
                <a href="tel:+212688500500" className="text-[#1e3a5f] font-semibold hover:underline">+212 6 88 50 05 00</a>
                {' '}ou par email à{' '}
                <a href="mailto:Sib2026@urbacom.net" className="text-[#1e3a5f] font-semibold hover:underline">Sib2026@urbacom.net</a>
              </p>
            </div>
          </div>
        </div>

        {/* Lien retour */}
        <div className="text-center mt-6">
          <a href="/" className="text-blue-100 text-sm hover:text-white transition-colors inline-flex items-center gap-1">
            ← Retour à l'accueil
          </a>
        </div>
      </motion.div>
    </div>
  );

  // ─── Formulaire d'inscription (inscriptions ouvertes) ───
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Sélecteur de langue */}
        <div className="flex justify-end gap-2">
          {(['fr', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === lang
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <Languages className="h-4 w-4" />
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Inscription Exposant SIB 2026
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre écosystème et présentez vos produits et services.
          </p>
        </div>

        {/* Note d'information : processus d'inscription complet */}
        <div className="rounded-xl border-l-4 border-[#C9A84C] bg-gradient-to-r from-[#1e3a5f]/5 to-transparent px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1e3a5f] mb-1">
                Inscription complète en 6 étapes
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Votre demande d'inscription comprend la sélection de l'abonnement, les informations entreprise,
                vos coordonnées personnelles, le contact, la sécurité du compte et l'acceptation des conditions.
                <strong className="text-[#1e3a5f]"> Comptez environ 8 à 10 minutes</strong> pour finaliser votre dossier.
                Vos données sont enregistrées à chaque étape et votre compte sera activé après validation par notre équipe sous 48h.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#1e3a5f] text-xs font-medium border border-[#C9A84C]/30">
                  ✓ Données chiffrées
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#1e3a5f] text-xs font-medium border border-[#C9A84C]/30">
                  ✓ Validation sous 48h
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#1e3a5f] text-xs font-medium border border-[#C9A84C]/30">
                  ✓ Support 7j/7
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicateur de progression */}
        <Card className="p-6">
          <ProgressSteps steps={getProgressSteps().steps} />
        </Card>

        <Card className="p-8">
          <form onSubmit={handleSubmit(handlePreviewSubmit)} className="space-y-8">
            {/* Section 0: Sélection d'abonnement */}
            <div className="space-y-6">
              <SubscriptionSelector
                selectedLevel={watchedFields.subscriptionLevel as ExhibitorLevel}
                onSelect={(level, area, price) => {
                  setValue('subscriptionLevel', level);
                  setValue('standArea', area);
                  setValue('subscriptionPrice', price);
                }}
              />
              {errors.subscriptionLevel && (
                <p className="text-red-500 text-sm text-center font-medium">
                  {errors.subscriptionLevel.message}
                </p>
              )}
            </div>

            {/* Section 1: Informations sur l'entreprise */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Informations sur votre entreprise
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="companyName"
                      {...register('companyName')}
                      placeholder="Votre entreprise"
                      className="pl-10"
                      autoComplete="organization"
                    />
                  </div>
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="sectors">Secteur(s) d'activité *</Label>
                  <MultiSelect
                    label="Secteurs d'activité"
                    options={sectorsOptions}
                    selectedValues={watchedFields.sectors || []}
                    onChange={(values) => setValue('sectors', values)}
                    placeholder="Sélectionnez vos secteurs d'activité"
                    maxSelections={3}
                  />
                  {errors.sectors && <p className="text-red-500 text-xs mt-1">{errors.sectors.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="country">Pays *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                    <Select onValueChange={(value: string) => setValue('country', value)} defaultValue="">
                      <SelectTrigger id="country" className="pl-10">
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} (+{country.dial})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>

                <div>
                  <Label htmlFor="website">Site web (optionnel)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="website"
                      type="url"
                      {...register('website')}
                      placeholder="https://www.example.com"
                      className="pl-10"
                      autoComplete="url"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="companyDescription">Description de votre organisation *</Label>
                <Textarea
                  id="companyDescription"
                  {...register('companyDescription')}
                  rows={4}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  placeholder="Décrivez votre organisation, vos activités et vos objectifs pour SIB 2026."
                />
                {errors.companyDescription && <p className="text-red-500 text-xs mt-1">{errors.companyDescription.message}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {watchedFields.companyDescription?.length || 0} / {MAX_DESCRIPTION_LENGTH} caractères
                </p>
              </div>
            </div>

            {/* Section 2: Informations personnelles */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-3">
                Vos informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="Votre prénom"
                    autoComplete="given-name"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Votre nom"
                    autoComplete="family-name"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="position">Poste / Fonction *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="position"
                    {...register('position')}
                    placeholder="Votre poste"
                    className="pl-10"
                  />
                </div>
                {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
              </div>
            </div>

            {/* Section 3: Coordonnées de contact */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-3">
                Coordonnées de contact
              </h3>

              <div>
                <Label htmlFor="email">Adresse e-mail professionnelle *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="contact@votre-entreprise.com"
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                {emailSuggestion && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-xs text-yellow-700">
                      Voulez-vous dire{' '}
                      <button
                        type="button"
                        onClick={() => {
                          if (emailSuggestion) {
                            setValue('email', emailSuggestion.suggestion);
                          }
                        }}
                        className="font-semibold underline hover:text-yellow-900"
                      >
                        {emailSuggestion.suggestion}
                      </button>
                      ?
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Utilisez votre email professionnel</p>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone professionnel *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+33 1 23 45 67 89"
                    className="pl-10"
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Section 4: Sécurité */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-3">
                Informations de sécurité
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      placeholder="Créez un mot de passe sécurisé"
                      className="pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  {watchedFields.password && <PasswordStrengthIndicator password={watchedFields.password} />}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="Confirmez votre mot de passe"
                      className="pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {/* CGU et RGPD */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Conditions Générales</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    {...register('acceptTerms')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                      J'accepte les{' '}
                      <Link to={ROUTES.TERMS} target="_blank" className="text-primary-600 hover:text-primary-700 underline">
                        Conditions Générales d'Utilisation
                      </Link>
                      {' '}de SIB 2026 *
                    </label>
                    {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptPrivacy"
                    {...register('acceptPrivacy')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="acceptPrivacy" className="text-sm text-gray-700 cursor-pointer">
                      J'accepte la{' '}
                      <Link to={ROUTES.PRIVACY} target="_blank" className="text-primary-600 hover:text-primary-700 underline">
                        Politique de Confidentialité
                      </Link>
                      {' '}et consent au traitement de mes données personnelles conformément au RGPD *
                    </label>
                    {errors.acceptPrivacy && <p className="text-red-500 text-xs mt-1">{errors.acceptPrivacy.message}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900">
                  <strong>Protection de vos données :</strong> Vos informations personnelles sont sécurisées et ne seront jamais partagées avec des tiers sans votre consentement. Vous pouvez exercer vos droits d'accès, de rectification et de suppression à tout moment.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? 'Envoi en cours...' : "Prévisualiser et soumettre"}
              </Button>

              {watchedFields && Object.keys(watchedFields).length > 0 && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Save className="h-3 w-3" />
                  <span>Brouillon enregistré automatiquement</span>
                </div>
              )}

              <p className="text-center text-xs text-gray-500">
                * Champs obligatoires
              </p>
            </div>
          </form>

          {/* Modal de prévisualisation */}
          <PreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            onConfirm={handleSubmit(onSubmit)}
            data={watchedFields}
          />
        </Card>

        {/* Séparateur "OU" */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary-600 hover:text-primary-700 underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};



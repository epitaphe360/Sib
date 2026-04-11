import { useState, useEffect, useMemo } from 'react';
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
              eventDates: '5-7 Février 2026'
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



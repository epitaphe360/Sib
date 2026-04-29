
import { useState, useEffect, useMemo } from 'react';
import { useRegistrationControl } from '../../hooks/useRegistrationControl';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { PreviewModal } from '@/components/ui/PreviewModal';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { countries } from '@/utils/countries';
import { useFormAutoSave } from '@/hooks/useFormAutoSave';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { useTranslation, Language } from '@/utils/translations';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { Building, Mail, Lock, User, Phone, Globe, Briefcase, MapPin, Languages, AlertCircle, Save, Crown } from 'lucide-react';
import { sendPartnerPaymentInstructions } from '../../services/partnerSignupEmailService';

// Factory function: creates the Zod schema with translated validation messages
function createPartnerSignUpSchema(t: ReturnType<typeof useTranslation>) {
  const passwordSchema = z.string()
    .min(12, t.validationPasswordMin12)
    .max(128, t.validationPasswordMax128)
    .regex(/[A-Z]/, t.validationPasswordUppercase)
    .regex(/[a-z]/, t.validationPasswordLowercase)
    .regex(/[0-9]/, t.validationPasswordNumber)
    .regex(/[!@#$%^&*(),.?":{}|<>]/, t.validationPasswordSpecial);

  const phoneSchema = z.string()
    .min(5, t.validationPhoneRequired)
    .regex(/^\+?[1-9]\d{1,14}$/, t.validationPhoneFormat);

  return z.object({
    companyName: z.string().min(2, t.validationCompanyNameRequired),
    sectors: z.array(z.string()).min(1, t.validationSectorRequired),
    country: z.string().min(2, t.validationCountryRequired),
    website: z.string().url(t.validationWebsiteInvalid).optional().or(z.literal('')),
    partnerTier: z.string().min(2, t.validationPartnerTierRequired),
    firstName: z.string().min(2, t.validationFirstNameRequired),
    lastName: z.string().min(2, t.validationLastNameRequired),
    position: z.string().min(2, t.validationPositionRequired),
    email: z.string().email(t.validationEmailInvalid),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, t.validationConfirmPasswordRequired),
    companyDescription: z.string().min(20, t.validationDescriptionMin20),
    partnershipType: z.string().min(2, t.validationPartnershipTypeRequired),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: t.validationAcceptTerms,
    }),
    acceptPrivacy: z.boolean().refine(val => val === true, {
      message: t.validationAcceptPrivacy,
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.validationPasswordMismatch,
    path: ["confirmPassword"],
  });
}

type PartnerSignUpFormValues = z.infer<ReturnType<typeof createPartnerSignUpSchema>>;

export default function PartnerSignUpPage() {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, loginWithLinkedIn } = useAuthStore();
  const { isOpen: regOpen, isLoading: regCheckLoading } = useRegistrationControl('partner');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validatedFormData, setValidatedFormData] = useState<PartnerSignUpFormValues | null>(null);
  const [language, setLanguage] = useState<Language>('fr');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);

  const t = useTranslation(language);
  const partnerSignUpSchema = useMemo(() => createPartnerSignUpSchema(t), [t]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PartnerSignUpFormValues>({
    resolver: zodResolver(partnerSignUpSchema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
      sectors: [],
      partnerTier: 'silver', // Default to silver
    }
  });

  // Watch les valeurs pour la progression
  const watchedFields = watch();

  // Validation email en temps réel
  const { suggestion: emailSuggestion } = useEmailValidation(watchedFields.email || '');

  // SECURITY: Exclude password fields from localStorage
  const { loadFromLocalStorage, clearLocalStorage } = useFormAutoSave({
    key: 'partner-signup-draft',
    data: watchedFields,
    delay: 2000,
    excludeFields: ['password', 'confirmPassword'] // Never save passwords
  });

  // Charger le brouillon au montage
  useEffect(() => {
    const draft = loadFromLocalStorage();
    if (draft) {
      const confirmed = window.confirm(
        'Un brouillon de formulaire a été trouvé. Voulez-vous le reprendre ?'
      );
      if (confirmed) {
        Object.keys(draft).forEach((key) => {
          setValue(key as any, (draft as any)[key]);
        });
        toast.success(t.toastDraftLoaded);
      } else {
        clearLocalStorage();
      }
    }
  }, []);

  const sectorsOptions = [
    { value: 'logistique', label: 'Logistique et Transport' },
    { value: 'technologie', label: 'Technologie et Innovation' },
    { value: 'finance', label: 'Finance et Banque' },
    { value: 'institutionnel', label: 'Institutionnel et Gouvernemental' },
    { value: 'media', label: 'Médias et Communication' },
    { value: 'energie', label: 'Énergie et Ressources' },
    { value: 'agriculture', label: 'Agriculture et Agroalimentaire' },
    { value: 'sante', label: 'Santé et Bien-être' },
    { value: 'education', label: 'Éducation et Formation' },
    { value: 'immobilier', label: 'Immobilier et Construction' },
    { value: 'tourisme', label: 'Tourisme et Hôtellerie' },
    { value: 'industrie', label: 'Industrie et Manufacturing' },
  ];

  // Calculer la progression
  const getProgressSteps = () => {
    const orgComplete = !!(watchedFields.companyName && watchedFields.sectors?.length > 0 && watchedFields.country);
    const contactComplete = !!(watchedFields.firstName && watchedFields.lastName && watchedFields.email && watchedFields.phone);
    const authComplete = !!(watchedFields.password && watchedFields.confirmPassword && watchedFields.password === watchedFields.confirmPassword);
    const detailsComplete = !!(watchedFields.companyDescription && watchedFields.partnershipType);
    const termsComplete = !!(watchedFields.acceptTerms && watchedFields.acceptPrivacy);

    return [
      { id: 'org', label: t.stepOrganization, completed: orgComplete },
      { id: 'contact', label: t.stepContact, completed: contactComplete },
      { id: 'auth', label: t.stepSecurity, completed: authComplete },
      { id: 'details', label: t.stepDetails, completed: detailsComplete },
      { id: 'terms', label: t.stepTerms, completed: termsComplete },
    ];
  };

  useEffect(() => {
    register('partnershipType');
    register('country');
    register('acceptTerms');
    register('acceptPrivacy');
    register('sectors');
    register('partnerTier');
  }, [register]);

  // Quand le formulaire est valide, stocker les données et ouvrir la preview
  const handlePreviewSubmit: SubmitHandler<PartnerSignUpFormValues> = (data) => {
    setValidatedFormData(data);
    setShowPreview(true);
  };

  // Fonction appelée depuis la modal de confirmation
  const handleConfirmSubmit = async () => {
    if (!validatedFormData) {
      toast.error(t.toastFormDataUnavailable);
      return;
    }
    await onSubmit(validatedFormData);
  };

  const onSubmit = async (data: PartnerSignUpFormValues) => {
    setIsLoading(true);
    const { email, password, confirmPassword, acceptTerms, acceptPrivacy, sectors, ...profileData } = data;

    const finalProfileData = {
      ...profileData,
      sectors: sectors,         // Tableau JSON — permet filtrage et édition
      sector: sectors.join(', '), // Chaîne lisible pour affichage rétrocompatible
      role: 'partner' as const,
      status: 'pending' as const,
    };

    try {
      const result = await signUp({ email, password }, finalProfileData);

      if (result?.error) {
        throw result.error;
      }

      // Envoyer l'email d'instructions de paiement
      const userId = result.user?.id;
      if (userId) {
        try {
          await sendPartnerPaymentInstructions({
            userId,
            email,
            firstName: data.firstName,
            lastName: data.lastName,
            companyName: data.companyName
          });
        } catch (emailError) {
          console.error('Erreur envoi email paiement:', emailError);
          // Ne pas bloquer l'inscription si l'email échoue
        }
      }

      // Supprimer le brouillon après succès
      clearLocalStorage();

      toast.success(t.toastSignUpSuccess);

      // ✅ FIX: Redirection vers le choix du mode de paiement IMPÉDIATEMENT lors de l'inscription
      // Cela évite que l'utilisateur ne se retrouve sur le tableau de bord sans avoir payé
      // Note: Cela suppose que l'auto-login a fonctionné ou qu'on utilise le userId/email pour pré-remplir
      navigate(`${ROUTES.PARTNER_PAYMENT_SELECTION}?tier=${data.partnerTier}`);
    } catch (error) {
      console.error("Sign up error:", error);
      if (error instanceof Error && (error.message.includes('already registered') || error.message.includes('already exists'))) {
        toast.error(
          'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.',
          { duration: 6000 }
        );
      } else {
        toast.error(error instanceof Error ? error.message : t.toastSignUpError);
      }
    } finally {
      setIsLoading(false);
      setShowPreview(false);
    }
  };

  // ─── Chargement de l'état d'inscription partenaire ──────────────────────────
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

  // ─── Page « Partenariats complets » si inscriptions clôturées ────────────────
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

        {/* Carte « Partenariats complets » */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Bandeau or */}
          <div className="bg-gradient-to-r from-[#C9A84C] via-[#e8c96a] to-[#C9A84C] h-2" />

          <div className="p-8 sm:p-10 text-center">
            {/* Icône */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#1e3a5f] to-[#2a4f82] rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Crown className="h-10 w-10 text-[#C9A84C]" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
              <span className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">Partenariats clôturés</span>
            </div>

            {/* Titre */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a5f] mb-3">
              Les partenariats sont complets
            </h1>

            <p className="text-gray-600 text-base mb-6 leading-relaxed max-w-lg mx-auto">
              Merci de l'intérêt porté au SIB 2026 !<br />
              <strong className="text-[#1e3a5f]">L'ensemble des formules de partenariat a été attribué</strong> pour cette édition.
            </p>

            {/* Alternatives */}
            <div className="bg-[#1e3a5f]/5 rounded-xl p-5 mb-6 text-left">
              <p className="font-semibold text-[#1e3a5f] mb-3 text-sm">Vous pouvez tout de même :</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A84C] mt-0.5">→</span>
                  <span><strong>Demander à être mis en liste d'attente</strong> en cas de désistement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A84C] mt-0.5">→</span>
                  <span><strong>Vous inscrire comme visiteur professionnel</strong> pour assister au salon</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A84C] mt-0.5">→</span>
                  <span><strong>Réserver une formule pour SIB 2027</strong> et bénéficier d'un tarif préférentiel</span>
                </li>
              </ul>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:Sib2026@urbacom.net?subject=Liste%20d'attente%20partenariat%20SIB%202026"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold text-sm transition-colors shadow-md"
              >
                <Mail className="h-4 w-4" />
                Liste d'attente
              </a>
              <a
                href="/register/visitor"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#C9A84C] hover:bg-[#b8973d] text-white font-semibold text-sm transition-colors shadow-md"
              >
                <User className="h-4 w-4" />
                S'inscrire comme visiteur
              </a>
            </div>

            {/* Contact */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Pour toute demande spécifique, contactez-nous à{' '}
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

  // ─── Formulaire d'inscription partenaire (inscriptions ouvertes) ───
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
            {t.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Indicateur de progression */}
        <Card className="p-6">
          <ProgressSteps steps={getProgressSteps()} />
        </Card>

        <Card className="p-8">
          <form onSubmit={handleSubmit(handlePreviewSubmit)} className="space-y-6">{/*Changed to open preview first*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations sur l'organisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations sur l'Organisation</h3>
                <div>
                  <Label htmlFor="companyName">Nom de l'organisation *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="companyName" {...register('companyName')} placeholder="Nom de votre organisation" className="pl-10" />
                  </div>
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="partnerTier">Niveau de Partenariat *</Label>
                  <div className="relative">
                    <Crown className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                    <Select onValueChange={(value: string) => setValue('partnerTier', value)} defaultValue="silver">
                      <SelectTrigger id="partnerTier" className="pl-10">
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="silver">🥈 Sponsor Silver (200 000 MAD)</SelectItem>
                        <SelectItem value="gold">🥇 Sponsor Gold (350 000 MAD)</SelectItem>
                        <SelectItem value="official_sponsor">⭐ Sponsor Officiel (500 000 MAD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.partnerTier && <p className="text-red-500 text-xs mt-1">{errors.partnerTier.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Vous pourrez changer de niveau ultérieurement.</p>
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
                <div>
                  <Label htmlFor="country">Pays *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                    <Select onValueChange={(value: string) => setValue('country', value)} defaultValue="">
                      <SelectTrigger id="country" className="pl-10">
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.name} ({country.dial})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>
                <div>
                  <Label htmlFor="website">Site web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="website" {...register('website')} placeholder="https://votre-site.com" className="pl-10" />
                  </div>
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="partnershipType">Type de partenariat souhaité *</Label>
                  <Select onValueChange={(value: string) => setValue('partnershipType', value)} defaultValue="">
                    <SelectTrigger id="partnershipType">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="institutionnel">Institutionnel</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="technologique">Technologique</SelectItem>
                      <SelectItem value="financier">Financier</SelectItem>
                      <SelectItem value="logistique">Logistique</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.partnershipType && <p className="text-red-500 text-xs mt-1">{errors.partnershipType.message}</p>}
                </div>
              </div>

              {/* Informations de contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations de Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="firstName" {...register('firstName')} placeholder="Votre prénom" className="pl-10" />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" {...register('lastName')} placeholder="Votre nom" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="position">Poste / Fonction *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="position" {...register('position')} placeholder="Votre poste" className="pl-10" />
                  </div>
                  {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Adresse e-mail professionnelle *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="contact@votre-organisation.com"
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
                            setValue('email', emailSuggestion.suggestion);
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
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+237 6 12 34 56 78"
                      className="pl-10"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Format international (ex: +237612345678)</p>
                </div>
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
                  <PasswordStrengthIndicator password={watchedFields.password || ''} />
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

            {/* Description */}
            <div>
              <Label htmlFor="companyDescription">Description de votre organisation et de vos motivations *</Label>
              <Textarea
                id="companyDescription"
                {...register('companyDescription')}
                rows={4}
                placeholder="Décrivez votre organisation, vos activités et pourquoi vous souhaitez devenir partenaire de SIB 2026."
              />
              {errors.companyDescription && <p className="text-red-500 text-xs mt-1">{errors.companyDescription.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {watchedFields.companyDescription?.length || 0} / 20 caractères minimum
              </p>
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
                      {' '}*
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
                data-testid="partner-submit-button"
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
            onConfirm={handleConfirmSubmit}
            data={validatedFormData || watchedFields}
            isLoading={isLoading}
          />
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};




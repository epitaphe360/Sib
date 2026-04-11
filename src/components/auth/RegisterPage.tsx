import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  Building2,
  Globe,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Anchor,
  AlertCircle,
  Loader,
  CheckCircle,
  Check,
  X,
  Briefcase
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { supabase } from '../../lib/supabase';
import { COUNTRIES } from '../../data/countries';
import { MoroccanPattern, MoroccanArch } from '../ui/MoroccanDecor';

const MAX_DESCRIPTION_LENGTH = 1000;

// Positions pour visiteurs
const VISITOR_POSITIONS = [
  'Directeur Général / CEO',
  'Directeur des Opérations',
  'Directeur Commercial',
  'Responsable Logistique',
  'Responsable Supply Chain',
  'Ingénieur',
  'Consultant',
  'Chercheur',
  'Enseignant',
  'Étudiant',
  'Journaliste',
  'Autre'
];

const registrationSchema = z.object({
  accountType: z.enum(['exhibitor', 'partner', 'visitor']),
  visitorType: z.enum(['professional', 'student', 'other']).optional(),
  companyName: z.string().optional(),
  sector: z.string().min(2, 'Secteur d\'activité requis'),
  customSector: z.string().optional(),
  country: z.string().min(2, 'Pays requis'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  position: z.string().optional(),
  customPosition: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional().or(z.literal('')),
  linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  description: z.string().max(MAX_DESCRIPTION_LENGTH, `Maximum ${MAX_DESCRIPTION_LENGTH} caractères`).optional().or(z.literal('')),
  objectives: z.array(z.string()).optional(),
  password: z.string()
    .min(12, 'Minimum 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Doit contenir au moins un caractère spécial (!@#$%^&*...)'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => {
  // Téléphone obligatoire pour exposants et partenaires
  if ((data.accountType === 'exhibitor' || data.accountType === 'partner') && (!data.phone || data.phone.length < 8)) {
    return false;
  }
  return true;
}, {
  message: "Numéro de téléphone requis (minimum 8 caractères)",
  path: ["phone"],
}).refine((data) => {
  if ((data.accountType === 'exhibitor' || data.accountType === 'partner') && (!data.companyName || data.companyName.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Nom de l'entreprise requis pour les exposants et partenaires",
  path: ["companyName"],
}).refine((data) => {
  if ((data.accountType === 'exhibitor' || data.accountType === 'partner') && (!data.position || data.position.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Poste requis pour les exposants et partenaires",
  path: ["position"],
}).refine((data) => {
  // Description obligatoire uniquement pour exposants et partenaires
  if ((data.accountType === 'exhibitor' || data.accountType === 'partner') && (!data.description || data.description.length < 50)) {
    return false;
  }
  return true;
}, {
  message: "Description requise (minimum 50 caractères) pour les exposants et partenaires",
  path: ["description"],
}).refine((data) => {
  // Objectifs obligatoires uniquement pour exposants et partenaires
  if ((data.accountType === 'exhibitor' || data.accountType === 'partner') && (!data.objectives || data.objectives.length < 1)) {
    return false;
  }
  return true;
}, {
  message: "Sélectionnez au moins un objectif",
  path: ["objectives"],
}).refine((data) => {
  // Validation pour secteur "Autre"
  if (data.sector === 'Autre' && (!data.customSector || data.customSector.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Veuillez préciser votre secteur d'activité",
  path: ["customSector"],
}).refine((data) => {
  // Validation pour position "Autre"
  if (data.position === 'Autre' && (!data.customPosition || data.customPosition.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Veuillez préciser votre fonction",
  path: ["customPosition"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const { register: registerUser, login } = useAuthStore();
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const requestedLevel = params.get('level');
  const nextPath = params.get('next') || '';

  // Déterminer le type de compte par défaut basé sur l'URL
  const getDefaultAccountType = () => {
    if (requestedLevel) return 'visitor';
    if (location.pathname.includes('/visitor')) return 'visitor';
    if (location.pathname.includes('/exhibitor')) return 'exhibitor';
    if (location.pathname.includes('/partner')) return 'partner';
    return undefined;
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger,
    setError
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      accountType: getDefaultAccountType()
    }
  });

  // Synchroniser le type de compte si l'URL change
  useEffect(() => {
    const defaultType = getDefaultAccountType();
    if (defaultType) {
      setValue('accountType', defaultType as any);
    }
  }, [location.pathname, setValue]);

  const watchedAccountType = watch('accountType');
  const watchedSector = watch('sector');
  const watchedPosition = watch('position');
  const watchedPassword = watch('password') || '';

  // Fonction pour gérer les checkboxes objectives
  const handleObjectiveChange = (objective: string, checked: boolean) => {
    const newObjectives = checked
      ? [...selectedObjectives, objective]
      : selectedObjectives.filter(o => o !== objective);
    
    setSelectedObjectives(newObjectives);
    setValue('objectives', newObjectives.length > 0 ? newObjectives : undefined);
  };
  
  // Log des erreurs de validation
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('⚠️ [INSCRIPTION] Erreurs de validation détectées:', errors);
    }
  }, [errors]);
  
  // Log au changement d'étape (désactivé en production)
  useEffect(() => {
    if (currentStep === 5 && Object.keys(errors).length > 0) {
      console.warn('⚠️ [Étape 5] Erreurs détectées:', errors);
    }
  }, [currentStep, errors]);

  // Fonction pour calculer la force du mot de passe
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

  const steps = [
    { id: 1, title: 'Type de compte', description: 'Choisissez votre profil' },
    { id: 2, title: 'Entreprise', description: 'Informations générales' },
    { id: 3, title: 'Contact', description: 'Vos coordonnées' },
    { id: 4, title: 'Profil', description: 'Description et objectifs' },
    { id: 5, title: 'Sécurité', description: 'Mot de passe' }
  ];

  const accountTypes = [
    {
      value: 'exhibitor',
      title: 'Exposant',
      description: 'Entreprise ou organisation exposante',
      icon: Building2,
      color: 'bg-blue-50 text-siports-primary border-siports-primary'
    },
    {
      value: 'partner',
      title: 'Partenaire',
      description: 'Sponsor ou partenaire officiel',
      icon: Globe,
      color: 'bg-amber-50 text-siports-gold border-siports-gold'
    },
    {
      value: 'visitor',
      title: 'Visiteur',
      description: 'Professionnel ou particulier visitant le salon',
      icon: User,
      color: 'bg-cyan-50 text-siports-secondary border-siports-secondary'
    }
  ];

  const sectors = [
    'Autorité urbaine',
    'Opérateur de Terminal',
    'Transport & mobilité',
    'Logistique',
    'Équipements BTP',
    'Services BTP',
    'Consulting',
    'Technologie',
    'Formation',
    'Institutionnel',
    'Autre'
  ];

  const objectives = [
    ...(watchedAccountType === 'visitor' ? [
      'Découvrir les innovations BTP',
      'Assister aux conférences',
      'Rencontrer des professionnels',
      'Apprendre sur le secteur de la construction',
      'Explorer les opportunités de carrière',
      'Développer mes connaissances',
      'Identifier des solutions pour mon entreprise',
      'Participer aux événements networking'
    ] : [
      'Trouver de nouveaux partenaires',
      'Développer mon réseau',
      'Présenter mes innovations',
      'Identifier des fournisseurs',
      'Explorer de nouveaux marchés',
      'Participer aux conférences',
      'Rencontrer des investisseurs',
      'Échanger sur les bonnes pratiques'
    ])
  ];

  const nextStep = async () => {
    // À l'étape 4 pour les visiteurs, tous les champs sont optionnels
    // Donc on ignore la validation et passe à l'étape suivante
    if (currentStep === 4 && watchedAccountType === 'visitor') {
      console.log('✅ [INSCRIPTION] Étape 4 visiteur - passage sans validation (champs optionnels)');
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        console.log('🔂 [INSCRIPTION] Passage à l\'étape', currentStep + 1);
      }
      return;
    }

    const fieldsToValidate = getFieldsForStep(currentStep);
    console.log('🔍 [INSCRIPTION] Champs à valider:', fieldsToValidate);
    
    // Debug: log les valeurs actuelles des champs
    const currentValues = fieldsToValidate.reduce((acc, field) => ({
      ...acc,
      [field]: watch(field)
    }), {});
    console.log('📝 [INSCRIPTION] Valeurs actuelles:', currentValues);

    const isValid = await trigger(fieldsToValidate);
    console.log('🔍 [INSCRIPTION] Résultat validation trigger:', { 
      isValid, 
      errors: Object.keys(errors).length > 0 ? errors : 'None' 
    });
    
    if (isValid) {
      // Validations manuelles pour les champs conditionnels non couverts par le trigger
      if (currentStep === 2 && watchedSector === 'Autre') {
        const customSectorValue = watch('customSector');
        console.log('🔍 [INSCRIPTION] Validation customSector:', customSectorValue);
        if (!customSectorValue || customSectorValue.length < 2) {
          setError('customSector', { message: "Veuillez préciser votre secteur d'activité" });
          console.warn('❌ [INSCRIPTION] Erreur customSector manquante');
          return;
        }
      }
      if (currentStep === 3) {
        // Téléphone obligatoire pour exposants/partenaires
        if (watchedAccountType !== 'visitor') {
          const phoneValue = watch('phone');
          if (!phoneValue || phoneValue.length < 8) {
            setError('phone', { message: 'Numéro de téléphone requis (minimum 8 caractères)' });
            console.warn('❌ [INSCRIPTION] Erreur téléphone manquant (exposant/partenaire)');
            return;
          }
        }
        // Validation custom position pour tous les types
        if (watchedPosition === 'Autre') {
          const customPositionValue = watch('customPosition');
          console.log('🔍 [INSCRIPTION] Validation customPosition:', customPositionValue);
          if (!customPositionValue || customPositionValue.length < 2) {
            setError('customPosition', { message: 'Veuillez préciser votre fonction' });
            console.warn('❌ [INSCRIPTION] Erreur customPosition manquante');
            return;
          }
        }
        
        // 🆕 Vérifier si l'email existe déjà dans la base de données
        const emailValue = watch('email');
        if (emailValue) {
          console.log('🔍 [INSCRIPTION - Étape 3] Vérification de l\'email:', emailValue);
          
          setIsCheckingEmail(true);
          
          const emailToCheck = emailValue.toLowerCase().trim();
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('email, role')
            .eq('email', emailToCheck)
            .maybeSingle();
          
          setIsCheckingEmail(false);
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ [INSCRIPTION - Étape 3] Erreur lors de la vérification:', checkError);
            toast.error('Erreur lors de la vérification de l\'email. Veuillez réessayer.');
            return;
          }
          
          if (existingUser) {
            console.warn('⚠️ [INSCRIPTION - Étape 3] Email déjà existant:', existingUser);
            const roleLabel = existingUser.role === 'exhibitor' ? 'exposant' : 
                             existingUser.role === 'partner' ? 'partenaire' : 'visiteur';
            
            setError('email', {
              type: 'manual',
              message: `Déjà enregistré comme ${roleLabel}`
            });
            
            toast.error(`⚠️ Cet email est déjà enregistré en tant que ${roleLabel}. Connectez-vous pour accéder à votre compte.`);
            
            // Scroller vers le champ email
            setTimeout(() => {
              const emailElement = document.querySelector('[name="email"]') as HTMLElement;
              if (emailElement) {
                emailElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                emailElement.focus();
              }
            }, 200);
            
            // Proposer la redirection vers login après 2s
            setTimeout(() => {
              if (window.confirm('Voulez-vous être redirigé vers la page de connexion ?')) {
                navigate(ROUTES.LOGIN);
              }
            }, 2000);
            
            return;
          }
          
          console.log('✅ [INSCRIPTION - Étape 3] Email disponible');
        }
      }
    }

    if (isValid && currentStep < 5) {
      console.log('✅ [INSCRIPTION] Validation réussie - progression vers étape', currentStep + 1);
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      const errorFields = Object.keys(errors);
      console.warn('❌ [INSCRIPTION] Validation échouée - erreurs sur:', errorFields);
      console.warn('❌ [INSCRIPTION] Détails erreurs:', errors);
      
      // Afficher toast pour feedback immédiat
      if (errorFields.length > 0) {
        const firstError = errors[errorFields[0] as keyof RegistrationForm];
        toast.error(`Erreur: ${firstError?.message || 'Vérifiez les champs'}`);
      }
    }
  };

  const prevStep = () => {
    console.log('⬅️ [INSCRIPTION] prevStep appelé', { currentStep });
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log('🔂 [INSCRIPTION] Retour à l\'\u00e9tape', currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof RegistrationForm)[] => {
    switch (step) {
      case 1: return ['accountType'];
      case 2: return ['companyName', 'sector', 'country', 'website'];
      case 3: return ['firstName', 'lastName', 'position', 'email', 'phone', 'linkedin'];
      case 4: return ['description', 'objectives'];
      case 5: return ['password', 'confirmPassword'];
      default: return [];
    }
  };

  const onSubmit = async (data: RegistrationForm) => {
    console.log('🚀 [INSCRIPTION] onSubmit appelé');
    console.log('📝 [INSCRIPTION] Données formulaire brutes:', {
      ...data,
      password: '***',
      confirmPassword: '***'
    });
    
    setIsSubmitting(true);
    try {
      console.log('📝 [INSCRIPTION] Démarrage appel registerUser dans le store...');
      
      // 🆕 Vérification finale : L'email existe-t-il déjà ? (filet de sécurité)
      console.log('🔍 [INSCRIPTION - Vérification finale] Contrôle de l\'email avant création...');
      const emailToCheck = data.email.toLowerCase().trim();
      
      // Vérifier dans la table users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email, role')
        .eq('email', emailToCheck)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // Erreur autre que "pas de résultat"
        console.error('❌ [INSCRIPTION] Erreur lors de la vérification de l\'email:', checkError);
        toast.error('Erreur lors de la vérification de l\'email. Veuillez réessayer.');
        setIsSubmitting(false);
        return;
      }
      
      if (existingUser) {
        console.warn('⚠️ [INSCRIPTION] Email déjà existant dans la table users');
        const roleLabel = existingUser.role === 'exhibitor' ? 'exposant' : 
                         existingUser.role === 'partner' ? 'partenaire' : 'visiteur';
        toast.error(`⚠️ Cet email est déjà enregistré en tant que ${roleLabel}. Connectez-vous pour accéder à votre compte.`);
        
        // Mettre une erreur sur le champ email
        setError('email', {
          type: 'manual',
          message: `Déjà enregistré comme ${roleLabel}`
        });
        
        // Revenir à l'étape 3 (où se trouve le champ email)
        setCurrentStep(3);
        
        // Scroller vers le champ email pour la visibilité
        setTimeout(() => {
          const emailElement = document.querySelector('[name="email"]') as HTMLElement;
          if (emailElement) {
            emailElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            emailElement.focus();
          }
        }, 300);
        
        setTimeout(() => {
          if (window.confirm('Voulez-vous être redirigé vers la page de connexion ?')) {
            navigate(ROUTES.LOGIN);
          }
        }, 2000);
        
        setIsSubmitting(false);
        return;
      }
      
      console.log('✅ [INSCRIPTION] Email disponible, création du compte...');
      
      const timestamp = new Date().getTime();
      
      // Appel à Supabase authStore.register
      await registerUser(data);
      
      const duration = new Date().getTime() - timestamp;
      console.log(`✅ [INSCRIPTION] registerUser terminé succès en ${duration}ms`);

      // 📧 Send welcome email (non-blocking)
      try {
        console.log('📧 [INSCRIPTION] Envoi email de bienvenue...');
        const { EmailService } = await import('../../services/emailService');
        const firstName = data.firstName || data.accountType;
        const accountTypeLabel = data.accountType === 'visitor' ? 'visiteur' : 
                                data.accountType === 'exhibitor' ? 'exposant' : 'partenaire';
        
        await EmailService.sendWelcomeEmail(data.email, firstName, accountTypeLabel);
        console.log('✅ [INSCRIPTION] Email de bienvenue envoyé');
      } catch (emailError) {
        console.warn('⚠️ Welcome email failed:', emailError);
        // Non-blocking error - registration is already complete
      }

      // Si c'est un exposant ou partenaire, afficher un toast indiquant validation admin requise
      if (data.accountType && data.accountType !== 'visitor') {
        const label = data.accountType === 'exhibitor' ? 'exposant' : 'partenaire';
        console.log(`ℹ️ [INSCRIPTION] Compte ${label} - validation admin requise`);
        toast.success(`Inscription réussie — votre compte ${label} sera activé par un administrateur. Vous recevrez un email une fois validé.`);
      }

      // Tenter une connexion automatique pour les visiteurs
      if (data.accountType === 'visitor') {
        console.log('🔑 [INSCRIPTION] Tentative de connexion automatique pour visiteur...');
        try {
          await login(data.email, data.password, { rememberMe: true });
          console.log('✅ [INSCRIPTION] Connexion automatique réussie');
          toast.success('Connexion automatique réussie — redirection vers votre tableau de bord.');
        } catch (loginError) {
          // Ne pas bloquer l'inscription si la connexion automatique échoue
          console.warn('⚠️ [INSCRIPTION] Connexion automatique échouée:', loginError);
          toast.error('Connexion automatique impossible — veuillez vous connecter manuellement.');
        }
      }

      // Afficher la modal de succès
      console.log('✅ [INSCRIPTION] Affichage modal de succès');
      setShowSuccess(true);

      // Rediriger vers la page de confirmation après 3 secondes
      console.log('📍 [INSCRIPTION] Redirection programmée dans 3s...');
      setTimeout(() => {
        console.log('📍 [INSCRIPTION] Redirection vers confirmation');
        navigate(`${ROUTES.SIGNUP_CONFIRMATION}?email=${encodeURIComponent(data.email)}&type=${data.accountType}`);
      }, 3000);
    } catch (error) {
      console.error('❌ [INSCRIPTION] Erreur lors de l\'inscription:', error);
      console.error('❌ [INSCRIPTION] Détails erreur:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      
      // Messages d'erreur améliorés
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (error instanceof Error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          errorMessage = '⚠️ Cet email est déjà associé à un compte. Utilisez "Mot de passe oublié" si vous ne vous souvenez plus de vos identifiants.';
          
          // Mettre une erreur sur le champ email
          setError('email', {
            type: 'manual',
            message: 'Email déjà utilisé'
          });
          
          // Revenir à l'étape 3 (où se trouve le champ email)
          setCurrentStep(3);
          
          // Scroller vers le champ email après un court délai
          setTimeout(() => {
            const emailElement = document.querySelector('[name="email"]') as HTMLElement;
            if (emailElement) {
              emailElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              emailElement.focus();
            }
          }, 300);
          
          // Proposer la redirection vers login après 3s
          setTimeout(() => {
            const shouldRedirect = window.confirm(
              'Voulez-vous être redirigé vers la page de connexion ?\n\n' +
              'Cliquez sur "Mot de passe oublié" si vous ne vous souvenez plus de vos identifiants.'
            );
            if (shouldRedirect) {
              navigate(ROUTES.LOGIN);
            }
          }, 3000);
        } else if (error.message.includes('Invalid email')) {
          errorMessage = '⚠️ L\'adresse email n\'est pas valide.';
          setError('email', {
            type: 'manual',
            message: 'Adresse email invalide'
          });
          
          // Revenir à l'étape 3 (où se trouve le champ email)
          setCurrentStep(3);
          
          // Scroller vers le champ email après un court délai
          setTimeout(() => {
            const emailElement = document.querySelector('[name="email"]') as HTMLElement;
            if (emailElement) {
              emailElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              emailElement.focus();
            }
          }, 300);
        } else if (error.message.includes('Password')) {
          errorMessage = '⚠️ Le mot de passe ne respecte pas les critères de sécurité.';
          setError('password', {
            type: 'manual',
            message: 'Mot de passe non conforme'
          });
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire d'erreurs de validation
  const onError = (errors: any) => {
    console.error('❌ [INSCRIPTION] Erreurs de validation:', errors);
    
    // Afficher un toast pour informer l'utilisateur
    const errorMessages = Object.values(errors)
      .map((err: any) => err?.message)
      .filter(Boolean);
    
    if (errorMessages.length > 0) {
      toast.error(`Erreur de validation : ${errorMessages[0]}`);
      console.log('⚠️ [INSCRIPTION] Premier message d\'erreur:', errorMessages[0]);
    } else {
      toast.error('Veuillez vérifier les champs du formulaire');
    }
    
    // Trouver le premier champ avec erreur et scroller vers lui
    const firstErrorField = Object.keys(errors)[0];
    console.log('🔍 [INSCRIPTION] Premier champ en erreur:', firstErrorField);
    
    // Scroller vers le champ en erreur après un court délai
    setTimeout(() => {
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-siports-primary via-siports-secondary to-siports-accent py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <MoroccanPattern className="opacity-10" color="white" scale={1.5} />
      
      {/* Decorative Arch at bottom */}
      <MoroccanArch className="text-white/10" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <Anchor className="h-8 w-8 text-siports-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SIB</span>
              <span className="text-sm text-siports-gold block leading-none font-medium">2026</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Créer un compte
          </h1>
          <p className="text-blue-100">
            Rejoignez la plus grande communauté bâtiment mondiale
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-siports-gold text-white border-siports-gold shadow-lg shadow-siports-gold/30' 
                    : 'bg-transparent text-white border-white/30'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-siports-gold' : 'text-white/60'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-white/60">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-siports-gold' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-[60]"
        >
          <Card className="p-8 border-t-4 border-t-siports-gold shadow-2xl backdrop-blur-sm bg-white/95">
            <div>
              {/* Step 1: Account Type */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Quel est votre profil ?
                    </h2>
                    <p className="text-gray-600">
                      Sélectionnez le type de compte qui correspond à votre organisation
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {accountTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <label key={type.value} className="cursor-pointer" data-testid={`account-type-${type.value}`}>
                          <input
                            type="radio"
                            value={type.value}
                            {...register('accountType')}
                            className="sr-only"
                            data-testid={`radio-${type.value}`}
                          />
                          <div className={`p-6 border-2 rounded-lg transition-all ${
                            watchedAccountType === type.value
                              ? type.color
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <Icon className="h-8 w-8 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {errors.accountType && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{errors.accountType.message}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Company Information */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Informations sur votre organisation
                    </h2>
                    <p className="text-gray-600">
                      Présentez votre entreprise ou organisation
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'organisation {watchedAccountType !== 'visitor' && '*'}
                        {watchedAccountType === 'visitor' && <span className="text-gray-400 text-xs ml-1">(optionnel)</span>}
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text"
                          {...register('companyName')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom de votre entreprise"
                         aria-label="Nom de votre entreprise" />
                      </div>
                      {errors.companyName && watchedAccountType !== 'visitor' && (
                        <p className="text-red-600 text-sm mt-1">{errors.companyName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secteur d'activité *
                      </label>
                      <select
                        {...register('sector')}
                        name="sector"
                        data-testid="select-sector"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionnez un secteur</option>
                        {sectors.map((sector) => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                      {errors.sector && (
                        <p className="text-red-600 text-sm mt-1" data-testid="error-sector">{errors.sector.message}</p>
                      )}
                    </div>

                    {/* Champ conditionnel pour secteur "Autre" */}
                    <AnimatePresence>
                      {watchedSector === 'Autre' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Précisez votre secteur *
                          </label>
                          <input
                            type="text"
                            {...register('customSector')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Entrez votre secteur d'activité"
                          />
                          {errors.customSector && (
                            <p className="text-red-600 text-sm mt-1">{errors.customSector.message}</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                        <select
                          {...register('country')}
                          name="country"
                          data-testid="select-country"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          <option value="">Sélectionnez un pays</option>
                          {COUNTRIES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.country && (
                        <p className="text-red-600 text-sm mt-1" data-testid="error-country">{errors.country.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site web
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="url"
                          {...register('website')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://votre-site.com"
                         aria-label="https://votre-site.com" />
                      </div>
                      {errors.website && (
                        <p className="text-red-600 text-sm mt-1">{errors.website.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Vos coordonnées
                    </h2>
                    <p className="text-gray-600">
                      Informations de contact du représentant principal
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text"
                          {...register('firstName')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Votre prénom"
                         aria-label="Votre prénom" />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text"
                          {...register('lastName')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Votre nom"
                         aria-label="Votre nom" />
                      </div>
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poste/Fonction {watchedAccountType !== 'visitor' && '*'}
                        {watchedAccountType === 'visitor' && <span className="text-gray-400 text-xs ml-1">(optionnel)</span>}
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                        <select
                          {...register('position')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          <option value="">Sélectionnez votre fonction</option>
                          {VISITOR_POSITIONS.map((position) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.position && watchedAccountType !== 'visitor' && (
                        <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
                      )}
                    </div>

                    {/* Champ conditionnel pour position "Autre" */}
                    <AnimatePresence>
                      {watchedPosition === 'Autre' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Précisez votre fonction *
                          </label>
                          <input
                            type="text"
                            {...register('customPosition')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Entrez votre fonction"
                          />
                          {errors.customPosition && (
                            <p className="text-red-600 text-sm mt-1">{errors.customPosition.message}</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email professionnel *
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${errors.email ? 'text-red-500' : 'text-gray-400'}`} />
                        <input type="email"
                          data-testid="email"
                          {...register('email')}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.email 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="votre@email.com"
                         aria-label="votre@email.com" />
                      </div>
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone {watchedAccountType !== 'visitor' && '*'}
                        {watchedAccountType === 'visitor' && <span className="text-gray-400 text-xs ml-1">(optionnel)</span>}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="tel"
                          {...register('phone')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+33 1 23 45 67 89"
                         aria-label="+33 1 23 45 67 89" />
                      </div>
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input type="url"
                        {...register('linkedin')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/in/votre-profil"
                       aria-label="https://linkedin.com/in/votre-profil" />
                      {errors.linkedin && (
                        <p className="text-red-600 text-sm mt-1">{errors.linkedin.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Profile & Objectives */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Votre profil professionnel
                    </h2>
                    <p className="text-gray-600">
                      Décrivez votre organisation et vos objectifs
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {watchedAccountType === 'visitor' ? 'Présentez-vous' : 'Description de votre organisation'} {watchedAccountType !== 'visitor' && '*'}
                      {watchedAccountType === 'visitor' && <span className="text-gray-400 text-xs ml-1">(optionnel)</span>}
                    </label>
                    <textarea
                      data-testid="description"
                      {...register('description', {
                        onChange: (e) => setDescriptionLength(e.target.value.length)
                      })}
                      rows={4}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder={watchedAccountType === 'visitor' ? 'Présentez-vous brièvement, vos intérêts professionnels...' : 'Décrivez votre organisation, vos activités principales, vos spécialités...'}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <div>
                        {errors.description && watchedAccountType !== 'visitor' && (
                          <p className="text-red-600 text-xs">{errors.description.message}</p>
                        )}
                      </div>
                      <p className={`text-xs font-medium ${
                        descriptionLength >= MAX_DESCRIPTION_LENGTH
                          ? 'text-red-600'
                          : watchedAccountType !== 'visitor' && descriptionLength < 50
                          ? 'text-gray-500'
                          : descriptionLength >= 50
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        {descriptionLength}/{MAX_DESCRIPTION_LENGTH} caractères
                        {watchedAccountType !== 'visitor' && descriptionLength < 50 && ` (minimum 50)`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vos objectifs pour SIB 2026 {watchedAccountType !== 'visitor' && '*'}
                      {watchedAccountType === 'visitor' && <span className="text-gray-400 text-xs ml-1">(optionnel)</span>}
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Sélectionnez tous les objectifs qui correspondent à vos attentes
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {objectives.map((objective) => (
                        <label key={objective} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={objective}
                            checked={selectedObjectives.includes(objective)}
                            onChange={(e) => handleObjectiveChange(objective, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{objective}</span>
                        </label>
                      ))}
                    </div>
                    {errors.objectives && watchedAccountType !== 'visitor' && (
                      <p className="text-red-600 text-sm mt-1">{errors.objectives.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Security */}
              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Sécurité de votre compte
                    </h2>
                    <p className="text-gray-600">
                      Créez un mot de passe sécurisé pour protéger votre compte
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type={showPassword ? 'text' : 'password'}
                          data-testid="password"
                          {...register('password')}
                          onBlur={() => setPasswordTouched(true)}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                         aria-label="••••••••" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Indicateur de force */}
                      {watchedPassword.length > 0 && (
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                passwordStrength <= 2 ? 'bg-red-500' :
                                passwordStrength <= 3 ? 'bg-yellow-500' :
                                passwordStrength <= 4 ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            />
                          </div>
                          <p className={`text-xs mt-1 ${
                            passwordStrength <= 2 ? 'text-red-600' :
                            passwordStrength <= 3 ? 'text-yellow-600' :
                            passwordStrength <= 4 ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            Force: {
                              passwordStrength <= 2 ? 'Faible' :
                              passwordStrength <= 3 ? 'Moyenne' :
                              passwordStrength <= 4 ? 'Bonne' :
                              'Excellente'
                            }
                          </p>
                        </div>
                      )}

                      {passwordTouched && errors.password && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword')}
                          onBlur={() => setConfirmPasswordTouched(true)}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                         aria-label="••••••••" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {confirmPasswordTouched && errors.confirmPassword && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Exigences du mot de passe */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Le mot de passe doit contenir :</p>
                    <ul className="space-y-1 text-xs">
                      <li className={`flex items-center gap-2 ${watchedPassword.length >= 12 ? 'text-green-600' : 'text-gray-500'}`}>
                        {watchedPassword.length >= 12 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Au moins 12 caractères
                      </li>
                      <li className={`flex items-center gap-2 ${/[A-Z]/.test(watchedPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        {/[A-Z]/.test(watchedPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Au moins une lettre majuscule
                      </li>
                      <li className={`flex items-center gap-2 ${/[a-z]/.test(watchedPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        {/[a-z]/.test(watchedPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Au moins une lettre minuscule
                      </li>
                      <li className={`flex items-center gap-2 ${/[0-9]/.test(watchedPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        {/[0-9]/.test(watchedPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Au moins un chiffre
                      </li>
                      <li className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Au moins un caractère spécial (!@#$%^&*...)
                      </li>
                    </ul>
                  </div>

                  {watchedAccountType !== 'visitor' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Validation de votre compte</h4>
                      <p className="text-sm text-blue-700">
                        Après votre inscription, votre compte sera examiné par notre équipe. 
                        Vous recevrez un email de confirmation une fois votre compte validé.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      data-testid="btn-previous"
                    >
                      Précédent
                    </Button>
                  )}
                </div>

                <div>
                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isCheckingEmail}
                      data-testid="btn-next"
                    >
                      {isCheckingEmail ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        'Suivant'
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      data-testid="btn-submit"
                      onClick={() => {
                        console.log('👆 [INSCRIPTION] Click sur "Créer mon compte"', { 
                          isSubmitting,
                          currentStep,
                          errorsCount: Object.keys(errors).length,
                          errors,
                          formData: watch()
                        });
                        
                        // Appeler handleSubmit manuellement
                        handleSubmit(
                          (data) => {
                            console.log('✅ [INSCRIPTION] Validation réussie, appel onSubmit');
                            onSubmit(data);
                          },
                          (errors) => {
                            console.error('❌ [INSCRIPTION] Erreurs de validation:', errors);
                            onError(errors);
                          }
                        )();
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Création du compte...
                        </>
                      ) : (
                        'Créer mon compte'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link
                  to={ROUTES.LOGIN}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Se connecter
                </Link>
              </p>
            </div>


          </Card>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {watchedAccountType === 'visitor' ? 'Compte créé avec succès !' : 'Inscription réussie !'}
                </h2>
                
                {watchedAccountType === 'visitor' ? (
                  <>
                    <p className="text-gray-600 mb-2">
                      🎉 Félicitations ! Votre compte visiteur a été créé.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Vous pouvez maintenant accéder à toutes les fonctionnalités de SIB 2026.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">
                      Votre demande d'inscription a été envoyée avec succès.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Votre compte sera examiné par notre équipe. Vous recevrez un email de confirmation une fois votre compte validé.
                    </p>
                  </>
                )}

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4 }}
                  className="h-1 bg-green-600 rounded-full"
                />

                <p className="text-xs text-gray-400 mt-3">
                  Redirection automatique vers la page de connexion...
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
/**
 * Formulaire d'inscription Visiteur GRATUIT
 * Workflow simplifié sans mot de passe ni dashboard
 */
import { useState, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Briefcase, Loader, CheckCircle, Anchor, Lock, Eye, EyeOff } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { COUNTRIES } from '../../data/countries';

// Schema défini au niveau module pour éviter les problèmes de hooks
const createFreeVisitorSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(2, t('visitor.validation.firstname_required')),
  lastName: z.string().min(2, t('visitor.validation.lastname_required')),
  email: z.string().email(t('visitor.validation.email_invalid')),
  phone: z.string().optional(),
  country: z.string().min(2, t('visitor.validation.country_required')),
  sector: z.string().min(2, t('visitor.validation.sector_required')),
  position: z.string().optional(),
  company: z.string().optional(),
  password: z.string()
    .min(8, t('visitor.validation.password_length'))
    .max(72, 'Le mot de passe ne doit pas dépasser 72 caractères')
    .regex(/[A-Z]/, t('visitor.validation.password_requirements'))
    .regex(/[a-z]/, t('visitor.validation.password_requirements'))
    .regex(/[0-9]/, t('visitor.validation.password_requirements'))
    .regex(/[!@#$%^&*]/, t('visitor.validation.password_requirements')),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('visitor.validation.password_match'),
  path: ['confirmPassword']
});

type FreeVisitorForm = z.infer<ReturnType<typeof createFreeVisitorSchema>>;

export default function VisitorFreeRegistration() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const sectors = [
    { value: 'Autorité urbaine', label: t('visitor.sector.authority') },
    { value: 'Transport & mobilité', label: t('visitor.sector.transport') },
    { value: 'Logistique', label: t('visitor.sector.logistics') },
    { value: 'Consulting', label: t('visitor.sector.consulting') },
    { value: 'Technologie', label: t('visitor.sector.technology') },
    { value: 'Étudiant', label: t('visitor.sector.student') },
    { value: 'Média/Presse', label: t('visitor.sector.media') },
    { value: 'Institutionnel', label: t('visitor.sector.institutional') },
    { value: 'Autre', label: t('visitor.sector.other') }
  ];

  const freeVisitorSchema = useMemo(() => createFreeVisitorSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch
  } = useForm<FreeVisitorForm>({
    resolver: zodResolver(freeVisitorSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: FreeVisitorForm) => {
    console.log('?? [FREE VISITOR] Tentative soumission:', data);
    setIsSubmitting(true);

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      // 1. Vérification préalable : L'email existe-t-il déjà ?
      console.log('?? [FREE VISITOR] Vérification si email existe déjà...');
      const emailToCheck = data.email.toLowerCase().trim();
      
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email, type, visitor_level')
        .eq('email', emailToCheck)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('? [FREE VISITOR] Erreur lors de la vérification:', checkError);
        toast.error(t('visitor.message.email_check_error', 'Erreur lors de la vérification de l\'email. Veuillez réessayer.'));
        setIsSubmitting(false);
        return;
      }
      
      if (existingUser) {
        console.warn('?? [FREE VISITOR] Email déjà existant:', existingUser);
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
        
        // MESSAGE D'ERREUR CLAIR ET VISIBLE
        toast.error(`?? ${t('visitor.message.account_exists')}\n\n${t('visitor.message.account_exists_desc')}`, 
          { duration: 8000 }
        );
        
        // Redirection automatique vers la page de connexion
        setTimeout(() => {
            navigate(ROUTES.LOGIN);
        }, 3000);
        
        setIsSubmitting(false);
        return;
      }
      
      console.log('? [FREE VISITOR] Email disponible');

      // 2. Créer l'utilisateur Supabase Auth avec le mot de passe de l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: fullName,
            type: 'visitor',
            visitor_level: 'free'
          }
        }
      });

      if (authError) {
        // Gérer le cas spécifique où l'utilisateur existe dans Auth mais pas dans public.users
        if (authError.message === 'User already registered') {
            console.warn('?? [FREE VISITOR] Email existe dans Auth mais pas dans users (compte orphelin).');
            
            // Afficher un message clair avec options
            toast.error(
              `?? ${t('visitor.message.account_exists')}\n\n${t('visitor.message.account_exists_desc')}`, 
              { duration: 10000 }
            );
            
            // Proposer les deux options
            if (window.confirm('Voulez-vous aller à la page de connexion ?\n\nCliquez "OK" pour vous connecter\nCliquez "Annuler" pour réinitialiser votre mot de passe')) {
              // Rediriger vers login
              navigate(ROUTES.LOGIN);
            } else {
              // Rediriger vers mot de passe oublié
              navigate(ROUTES.FORGOT_PASSWORD);
            }
            
            setIsSubmitting(false);
            return;
        }
        throw authError; // Autres erreurs
      }
      if (!authData.user) throw new Error('Échec création utilisateur');

      // 3. Créer l'entrée dans la table users
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: data.email,
          name: fullName,
          type: 'visitor',
          visitor_level: 'free', // ? EXPLICITE
          status: 'active', // ? Visiteur FREE actif immédiatement (pas de validation nécessaire)
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            country: data.country,
            businessSector: data.sector,
            position: data.position || '',
            company: data.company || '',
            hasPassword: true // Compte FREE avec mot de passe défini
          }
        }]);

      if (userError) throw userError;

      // 4. Générer badge QR automatiquement (optionnel - Edge Function peut ne pas être déployée)
      try {
        const { error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
          body: {
            userId: authData.user.id,
            email: data.email,
            name: fullName,
            level: 'free',
            includePhoto: false
          }
        });
        
        if (badgeError) {
          console.error('? Erreur génération badge:', badgeError);
        } else {
          console.log('? Badge QR généré avec succès');
        }
      } catch (badgeError) {
        // Non bloquant - la fonction Edge peut ne pas être déployée en dev
        console.warn('?? Edge Function generate-visitor-badge non déployée');
      }

      // 5. Envoyer email de bienvenue via le serveur Node.js (SMTP)
      try {
        console.log('?? [FREE] Envoi email de bienvenue...');
        const emailController = new AbortController();
        const emailTimeout = setTimeout(() => emailController.abort(), 5000);
        
        const emailResponse = await fetch('/api/send-visitor-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: emailController.signal,
          body: JSON.stringify({
            email: data.email,
            name: fullName,
            level: 'free',
            userId: authData.user.id
          })
        });
        clearTimeout(emailTimeout);
        
        const emailResult = await emailResponse.json();
        
        if (!emailResponse.ok || !emailResult.success) {
          console.error('? Erreur envoi email:', emailResult.error);
          toast.info('?? L\'email de bienvenue n\'a pas pu être envoyé. Vérifiez votre boîte de réception plus tard.', {
            duration: 4000
          });
        } else {
          console.log('? Email de bienvenue envoyé avec succès:', emailResult.messageId);
          toast.success(`?? ${t('visitor.message.email_sent')}`, { duration: 3000 });
        }
      } catch (emailError) {
        // Non bloquant - le serveur peut ne pas être accessible en dev
        console.warn('?? Erreur envoi email (non bloquant):', emailError);
      }

      // NE PAS envoyer d'email de réinitialisation de mot de passe car l'utilisateur l'a déjà défini
      // NE PAS déconnecter l'utilisateur (Allow login)

      // Succès !
      console.log('? [FREE VISITOR] Inscription réussie ! Affichage du modal de succès.');
      setShowSuccess(true);
      
      // Toast de succès immédiat
      toast.success(
        `?? ${t('visitor.message.success_title')}\n\n${t('visitor.message.success_desc')}\n\n${t('visitor.message.redirect')}`, 
        { duration: 6000 }
      );

      setTimeout(() => {
        // Redirection vers le tableau de bord visiteur
        navigate(ROUTES.VISITOR_DASHBOARD);
      }, 3000);

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-white p-3 rounded-lg">
              <Anchor className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SIB</span>
              <span className="text-sm text-green-200 block leading-none">2026</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('visitor.registration.free.title')}
          </h1>
          <p className="text-green-100">
            {t('visitor.registration.free.subtitle')}
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-green-800 px-4 py-2 rounded-full">
            <span className="text-green-200 text-sm">? {t('visitor.registration.free.badge_access')}</span>
            <span className="text-green-200">•</span>
            <span className="text-green-200 text-sm">? {t('visitor.registration.free.badge_qr')}</span>
            <span className="text-green-200">•</span>
            <span className="text-green-200 text-sm">? {t('visitor.registration.free.badge_free')}</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
              console.error('? [FREE VISITOR] Erreurs validation:', errors);
              toast.error(t('visitor.validation.check_errors', 'Veuillez corriger les erreurs surlignées en rouge'));
              const firstError = Object.values(errors)[0];
              if (firstError?.message) {
                toast.error(firstError.message as string);
              }
            })} className="space-y-6">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('visitor.form.firstname')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={t('visitor.form.firstname')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('visitor.form.lastname')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={t('visitor.form.lastname')}
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
                  {t('visitor.form.email')} *
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
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    {errors.email.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                   Utilisé pour votre connexion
                </p>
              </div>

              {/* Téléphone et Pays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('visitor.form.phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('visitor.form.country')} *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      id="country"
                      {...register('country')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
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

              {/* Secteur */}
              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('visitor.form.sector')} *
                </label>
                <select
                  id="sector"
                  {...register('sector')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sélectionnez</option>
                  {sectors.map((sector) => (
                    <option key={sector.value} value={sector.value}>{sector.label}</option>
                  ))}
                </select>
                {errors.sector && (
                  <p className="text-red-600 text-sm mt-1">{errors.sector.message}</p>
                )}
              </div>

              {/* Champs optionnels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('visitor.form.position')} (optionnel)
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="position"
                      type="text"
                      {...register('position')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: Ingénieur"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company-field" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('visitor.form.company')} (optionnel)
                  </label>
                  <input
                    id="company-field"
                    type="text"
                    {...register('company')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={t('visitor.form.company')}
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('visitor.form.password')} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register('password')}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('visitor.form.confirm_password')} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...register('confirmPassword')}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">{t('visitor.free.features.title')}</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>{t('visitor.free.features.list.1')}</li>
                  <li>{t('visitor.free.features.list.2')}</li>
                  <li>{t('visitor.free.features.list.3')}</li>
                  <li>{t('visitor.free.features.list.4')}</li>
                </ul>
              </div>

              {/* Debug Info */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">? Erreurs de validation :</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>• {field}: {error?.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submit - Bouton HTML natif pour éviter problème pointer-events */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center"
                onClick={(e) => {
                  console.log('??? [FREE VISITOR] CLICK BOUTON', { 
                    isSubmitting, 
                    isValid, 
                    isDirty,
                    errorsCount: Object.keys(errors).length,
                    formData: watch()
                  });
                  // Ne pas e.preventDefault() car on veut que le type="submit" fonctionne
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    {t('visitor.form.submitting')}
                  </>
                ) : (
                  t('visitor.form.submit')
                )}
              </button>

              {/* VIP Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  {t('visitor.upsell.vip.title')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.VISITOR_VIP_REGISTRATION)}
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                   {t('visitor.upsell.vip.button')}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl p-10 w-full max-w-lg text-center border-4 border-green-500 relative overflow-hidden"
              >
                {/* Confetti Effect Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 animate-pulse" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mx-auto w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                    <CheckCircle className="h-20 w-20 text-white animate-bounce" />
                  </div>
                  
                  <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                    ?? {t('visitor.message.success_title')}
                  </h2>
                  
                  <p className="text-lg text-gray-700 mb-6">
                    {t('visitor.message.success_desc')}
                  </p>

                  <div className="bg-white border-2 border-green-500 p-5 rounded-xl mb-6 text-left shadow-lg">
                    <p className="font-bold text-green-800 mb-3 text-center">? Compte créé avec succès !</p>
                    <div className="text-gray-700 text-sm space-y-2">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Compte enregistré : <strong>{watch('email')}</strong></span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Vous êtes maintenant connecté</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Accès immédiat à votre espace visiteur</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3 text-sm font-medium">
                    {t('visitor.message.redirect')}
                  </p>
                  
                  <motion.div
                    className="relative h-3 bg-gray-200 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: "linear" }}
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-full"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}





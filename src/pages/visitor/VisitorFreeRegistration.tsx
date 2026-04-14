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
import { User, Mail, Phone, MapPin, Briefcase, Loader, CheckCircle, Building2, MailCheck } from 'lucide-react';
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
});

type FreeVisitorForm = z.infer<ReturnType<typeof createFreeVisitorSchema>>;

export default function VisitorFreeRegistration() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailExists, setEmailExists] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
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
        setEmailExists(emailToCheck);
        setIsSubmitting(false);
        return;
      }
      
      console.log('? [FREE VISITOR] Email disponible');

      // 2. Créer l'utilisateur Supabase Auth avec un mot de passe généré
      const generatedPassword = crypto.randomUUID().slice(0, 16) + 'A1!';
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: generatedPassword,
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
            setEmailExists(data.email);
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
            hasPassword: false // Compte FREE sans mot de passe (généré auto)
          }
        }]);

      if (userError) throw userError;

      // 4. Générer badge QR automatiquement (optionnel - Edge Function peut ne pas être déployée)
      let emailAlreadySent = false;
      try {
        const { data: badgeData, error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
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
          emailAlreadySent = !!badgeData?.emailSent;
          console.log('? Badge QR généré avec succès');
        }
      } catch (badgeError) {
        // Non bloquant - la fonction Edge peut ne pas être déployée en dev
        console.warn('?? Edge Function generate-visitor-badge non déployée');
      }

      // 5. Envoyer email de bienvenue via le serveur Node.js (SMTP)
      if (!emailAlreadySent) {
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
      }

      // Déconnecter immédiatement — un visiteur free n'a pas de compte connecté
      await supabase.auth.signOut();

      // Succès !
      console.log('? [FREE VISITOR] Inscription réussie ! QR code envoyé par email.');
      setShowSuccess(true);
      
      toast.success('Inscription réussie ! Consultez votre email pour votre code QR.', { duration: 6000 });

      setTimeout(() => {
        navigate(ROUTES.HOME);
      }, 5000);

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,215,0,0.08) 35px, rgba(255,215,0,0.08) 70px),
                         repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(0,128,0,0.08) 35px, rgba(0,128,0,0.08) 70px)`
      }} />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-sib-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl">
              <Building2 className="h-8 w-8 text-sib-gold" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-wide">SIB</span>
              <span className="text-sm text-sib-gold block leading-none font-medium">2026</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('visitor.registration.free.title')}
          </h1>
          <p className="text-white/80">
            {t('visitor.registration.free.subtitle')}
          </p>
          <div className="mt-4 inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full">
            <span className="text-white/90 text-sm">{t('visitor.registration.free.badge_access')}</span>
            <span className="text-sib-gold">•</span>
            <span className="text-white/90 text-sm">{t('visitor.registration.free.badge_qr')}</span>
            <span className="text-sib-gold">•</span>
            <span className="text-white/90 text-sm">{t('visitor.registration.free.badge_free')}</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-950/30">
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
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-colors"
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
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-colors"
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-300 focus:ring-[#1B365D] focus:border-[#1B365D]'
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
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-colors"
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
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] appearance-none transition-colors"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-colors"
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
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-colors"
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-colors"
                    placeholder={t('visitor.form.company')}
                  />
                </div>
              </div>



              {/* Info */}
              <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-sib-gold/35 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">{t('visitor.free.features.title')}</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>{t('visitor.free.features.list.1')}</li>
                  <li>{t('visitor.free.features.list.2')}</li>
                  <li>{t('visitor.free.features.list.3')}</li>
                  <li>{t('visitor.free.features.list.4')}</li>
                </ul>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sib-gold hover:bg-sib-gold/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 text-lg font-semibold rounded-xl shadow-lg shadow-sib-gold/30 transition-all duration-200 flex items-center justify-center"
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
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-gray-600 mb-2">
                  {t('visitor.upsell.vip.title')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.VISITOR_VIP_REGISTRATION)}
                  className="border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                   {t('visitor.upsell.vip.button')}
                </Button>
              </div>
            </form>
            {/* Email already exists - resend QR */}
            <AnimatePresence>
              {emailExists && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5"
                >
                  <p className="text-sm text-gray-800 mb-3">
                    L'adresse <strong>{emailExists}</strong> est déjà inscrite.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Vous pouvez renvoyer votre code QR par email.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={async () => {
                        setIsResending(true);
                        try {
                          const ctrl = new AbortController();
                          const timeout = setTimeout(() => ctrl.abort(), 8000);
                          const res = await fetch('/api/send-visitor-welcome-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            signal: ctrl.signal,
                            body: JSON.stringify({ email: emailExists, resend: true })
                          });
                          clearTimeout(timeout);
                          const result = await res.json();
                          if (res.ok && result.success) {
                            toast.success('Code QR renvoyé ! Vérifiez votre boîte email.', { duration: 5000 });
                            setEmailExists(null);
                          } else {
                            toast.error('Impossible de renvoyer l\'email. Réessayez plus tard.', { duration: 5000 });
                          }
                        } catch {
                          toast.error('Erreur de connexion. Réessayez plus tard.', { duration: 5000 });
                        } finally {
                          setIsResending(false);
                        }
                      }}
                      className="flex-1 bg-[#1B365D] hover:bg-[#0F2034] disabled:bg-gray-400 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isResending ? (
                        <><Loader className="animate-spin h-4 w-4" /> Envoi en cours...</>
                      ) : (
                        <><MailCheck className="h-4 w-4" /> Renvoyer mon code QR</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailExists(null)}
                      className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>          </Card>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg text-center border border-slate-200 relative overflow-hidden"
              >
                {/* Content */}
                <div className="relative z-10">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#1B365D] to-[#2E5984] rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <MailCheck className="h-12 w-12 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Inscription confirmée !
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    Votre code QR d'accès au salon a été envoyé à votre adresse email.
                  </p>

                  <div className="bg-[#1B365D]/5 border border-[#1B365D]/15 p-5 rounded-xl mb-6 text-left">
                    <div className="text-gray-700 text-sm space-y-2.5">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#1B365D] mr-2 mt-0.5 flex-shrink-0" />
                        <span>Email envoyé à : <strong>{watch('email')}</strong></span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#1B365D] mr-2 mt-0.5 flex-shrink-0" />
                        <span>Votre badge QR est dans l'email</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#1B365D] mr-2 mt-0.5 flex-shrink-0" />
                        <span>Présentez-le à l'entrée du salon</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 mb-3 text-sm">
                    Redirection vers l'accueil...
                  </p>
                  
                  <motion.div
                    className="relative h-2 bg-gray-100 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1B365D] to-[#2E5984] rounded-full"
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





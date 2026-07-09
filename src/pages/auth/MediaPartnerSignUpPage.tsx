import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mic2, Building, Mail, Lock, User, Phone, Globe, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';

const schema = z.object({
  mediaName: z.string().min(2, 'Nom du média requis'),
  mediaType: z.string().min(2, 'Type de média requis'),
  country: z.string().min(2, 'Pays requis'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  position: z.string().min(2, 'Poste requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(6, 'Téléphone requis'),
  password: z.string()
    .min(12, 'Minimum 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Doit contenir un caractère spécial'),
  confirmPassword: z.string(),
  coverage_plan: z.string().min(5, 'Décrivez votre couverture prévue'),
  acceptTerms: z.boolean().refine(v => v, 'Vous devez accepter les conditions'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

const MEDIA_TYPES = [
  'Presse écrite', 'Télévision', 'Radio', 'Web / Digital', 'Agence de presse', 'Photographe', 'Blog / Influenceur', 'Autre',
];

export default function MediaPartnerSignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await signUp(
        { email: data.email, password: data.password },
        {
          role: 'visitor',
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.mediaName,
          status: 'active',
        },
      );

      if (result.error) {
        throw result.error;
      }

      const { error } = await supabase.from('press_accreditations').insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        media_name: data.mediaName,
        media_type: data.mediaType,
        job_title: data.position,
        country: data.country,
        coverage_plan: data.coverage_plan,
        status: 'pending',
      });

      if (error) {
        throw error;
      }

      toast.success(t('media_signup.submitted_toast'));
      navigate(ROUTES.MEDIA_PARTNER_DASHBOARD);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('media_signup.error_toast');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-700 rounded-2xl mb-4 shadow-2xl">
            <Mic2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('media_signup.title')}</h1>
          <p className="text-red-300">{t('media_signup.subtitle')}</p>
          <p className="text-red-400 text-sm mt-1">{t('media_signup.location')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-6 text-sm text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            {t('media_signup.review_notice')}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Informations média */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('media_signup.media_info')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="inline h-3.5 w-3.5 mr-1" />{t('media_signup.media_name')}
                  </label>
                  <input {...register('mediaName')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    placeholder="Le Journal du BTP" />
                  {errors.mediaName && <p className="text-red-500 text-xs mt-1">{errors.mediaName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('media_signup.media_type')}</label>
                  <select {...register('mediaType')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500">
                    <option value="">Choisir...</option>
                    {MEDIA_TYPES.map(mt => <option key={mt} value={mt}>{mt}</option>)}
                  </select>
                  {errors.mediaType && <p className="text-red-500 text-xs mt-1">{errors.mediaType.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="inline h-3.5 w-3.5 mr-1" />Pays *
                  </label>
                  <input {...register('country')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    placeholder="Maroc" />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                  <input {...register('website')}
                    type="url"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    placeholder="https://..." />
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="inline h-3.5 w-3.5 mr-1" />Plan de couverture prévu *
                  </label>
                  <textarea {...register('coverage_plan')} rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    placeholder="Articles de présentation, reportage photo, interviews exposants..." />
                  {errors.coverage_plan && <p className="text-red-500 text-xs mt-1">{errors.coverage_plan.message}</p>}
                </div>
              </div>
            </div>

            {/* Informations contact */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('media_signup.journalist')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-3.5 w-3.5 mr-1" />Prénom *
                  </label>
                  <input {...register('firstName')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input {...register('lastName')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poste / Titre *</label>
                  <input {...register('position')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    placeholder="Rédacteur en chef, Journaliste..." />
                  {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-3.5 w-3.5 mr-1" />Téléphone *
                  </label>
                  <input {...register('phone')} type="tel"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    placeholder="+212..." />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-3.5 w-3.5 mr-1" />Email professionnel *
                  </label>
                  <input {...register('email')} type="email"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('media_signup.platform_access')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Lock className="inline h-3.5 w-3.5 mr-1" />Mot de passe *
                  </label>
                  <input {...register('password')} type="password"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer *</label>
                  <input {...register('confirmPassword')} type="password"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="flex items-start gap-2">
              <input {...register('acceptTerms')} type="checkbox" id="terms"
                className="mt-0.5 rounded text-red-600 focus:ring-red-500" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                J'accepte les <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">conditions d'utilisation</a> et la{' '}
                <a href="/contact" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">charte éthique</a> des accréditations médias SIB 2026
              </label>
            </div>
            {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <Mic2 className="h-4 w-4" />}
              {isLoading ? 'Envoi en cours...' : t('media_signup.submit')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('media_signup.already_account')}{' '}
            <Link to={ROUTES.LOGIN} className="text-red-600 hover:underline font-medium">{t('nav.login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

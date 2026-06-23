import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '../lib/routes';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne doit pas dépasser 255 caractères"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!isSupabaseReady() || !supabase) {
        setError("Supabase non configuré. Impossible d'envoyer l'email.");
        setLoading(false);
        return;
      }

      const redirectTo = `${window.location.origin}/reset-password`;
      const res = await (supabase as any).auth.resetPasswordForEmail(data.email, { redirectTo });
      if (res?.error) {
        setError(res.error.message || 'Erreur lors de la demande de réinitialisation.');
      } else {
        setMessage("Un email de réinitialisation a été envoyé si l'adresse existe dans le système.");
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center py-12 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-8">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>

          <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-5">
            <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
            {t('auth.forgotten_password')}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            {t('auth.forgotten_password_desc')}
          </p>

          <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                {t('auth.email')}
              </label>
              <Input
                type="email"
                {...register('email')}
                placeholder={t('auth.email_placeholder')}
                className={errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
              />
              {errors.email && (
                <p className="text-danger-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-danger-600 shrink-0 mt-0.5" />
                <p className="text-danger-700 dark:text-danger-300 text-sm">{error}</p>
              </div>
            )}
            {message && (
              <div className="flex items-start gap-2 p-3 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/30 rounded-lg">
                <CheckCircle className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />
                <p className="text-success-700 dark:text-success-300 text-sm">{message}</p>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? t('common.sending') : t('auth.send_reset_link')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

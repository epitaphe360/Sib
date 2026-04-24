import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

function parseHashTokens(hash: string) {
  // hash like #access_token=...&refresh_token=...
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(trimmed);
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
  };
}

// Validation schema
function createResetPasswordSchema(t: (key: string) => string) {
  return z.object({
    password: z.string()
      .min(12, t('resetPassword.minLength'))
      .max(72, t('resetPassword.maxLength'))
      .regex(/[A-Z]/, t('resetPassword.uppercaseRequired'))
      .regex(/[a-z]/, t('resetPassword.lowercaseRequired'))
      .regex(/[0-9]/, t('resetPassword.digitRequired'))
      .regex(/[!@#$%^&*]/, t('resetPassword.specialRequired')),
    confirmPassword: z.string().min(1, t('resetPassword.confirmRequired'))
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('resetPassword.passwordsMismatch'),
    path: ['confirmPassword']
  });
}

type ResetPasswordForm = z.infer<ReturnType<typeof createResetPasswordSchema>>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTokens, setHasTokens] = useState(false);

  const resetPasswordSchema = createResetPasswordSchema(t);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors }
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema)
  });

  useEffect(() => {
    // Try to parse tokens from URL fragment
    try {
      const { access_token, refresh_token } = parseHashTokens(window.location.hash || '');
      if (access_token) {
        setHasTokens(true);
        // set session so supabase client is authenticated
        if (isSupabaseReady() && supabase) {
          (async () => {
            try {
              await (supabase as any).auth.setSession({ access_token, refresh_token });
            } catch (e) {
              console.warn('Could not set session from tokens', e);
            }
          })();
        }
      }
    } catch (e) {
      console.warn('reset token parsing failed', e);
    }
  }, []);

  const handleSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!isSupabaseReady() || !supabase) {
        setError(t('resetPassword.supabaseNotConfigured'));
        setLoading(false);
        return;
      }

      // Update user password (requires an authenticated session set via tokens)
      const { error: updErr } = await (supabase as any).auth.updateUser({ password: data.password });
      if (updErr) {
        setError(updErr.message || t('resetPassword.errorResetting'));
      } else {
        // Mettre à jour hasPassword dans le profil utilisateur
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userData } = await supabase
              .from('users')
              .select('profile')
              .eq('id', user.id)
              .single();

            await supabase
              .from('users')
              .update({
                profile: {
                  ...(userData?.profile || {}),
                  hasPassword: true
                }
              })
              .eq('id', user.id);

            console.log('✅ hasPassword mis à jour');
          }
        } catch (profileErr) {
          console.warn('⚠️ Erreur mise à jour profil (non bloquant):', profileErr);
        }

        setMessage(t('resetPassword.success'));
        // Clear URL fragment for security
        try { history.replaceState({}, '', window.location.pathname); } catch (e) { console.warn(e) }
        
        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: unknown) {
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
          <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-5">
            <Lock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
            {t('resetPassword.title')}
          </h1>
          {!hasTokens && (
            <div className="mb-5 p-3 bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/30 rounded-lg text-sm text-warning-800 dark:text-warning-200">
              {t('resetPassword.linkExpired')}
            </div>
          )}

          <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                {t('resetPassword.newPasswordLabel')}
              </label>
              <Input
                type="password"
                {...register('password')}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                className={errors.password ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
              />
              {errors.password && (
                <p className="text-danger-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                {t('resetPassword.confirmLabel')}
              </label>
              <Input
                type="password"
                {...register('confirmPassword')}
                placeholder={t('resetPassword.confirmPlaceholder')}
                className={errors.confirmPassword ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-danger-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.confirmPassword.message}
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

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading || !hasTokens}>
              {loading ? t('resetPassword.loading') : t('resetPassword.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}



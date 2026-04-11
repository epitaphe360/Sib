import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
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
    <Card className="max-w-md mx-auto p-8 mt-12">
      <h2 className="text-2xl font-bold mb-4">{t('resetPassword.title')}</h2>
      {!hasTokens && (
        <div className="mb-4 text-gray-700">{t('resetPassword.linkExpired')}</div>
      )}
      <form onSubmit={handleFormSubmit(handleSubmit)}>
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('resetPassword.newPasswordLabel')}</label>
          <Input
            type="password"
            {...register('password')}
            placeholder={t('resetPassword.newPasswordPlaceholder')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('resetPassword.confirmLabel')}</label>
          <Input
            type="password"
            {...register('confirmPassword')}
            placeholder={t('resetPassword.confirmPlaceholder')}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {message && <div className="text-green-600 mb-2">{message}</div>}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !hasTokens}>{loading ? t('resetPassword.loading') : t('resetPassword.submit')}</Button>
        </div>
      </form>
    </Card>
  );
}



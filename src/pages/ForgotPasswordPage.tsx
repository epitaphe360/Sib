import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .max(255, 'L\'email ne doit pas dépasser 255 caractères')
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
    formState: { errors }
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const handleSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!isSupabaseReady() || !supabase) {
        setError('Supabase non configuré. Impossible d\'envoyer l\'email.');
        setLoading(false);
        return;
      }

      // Utiliser l'API d'auth de Supabase pour envoyer l'email de reset
      const redirectTo = `${window.location.origin}/reset-password`;
      const res = await (supabase as any).auth.resetPasswordForEmail(data.email, { redirectTo });
      if (res?.error) {
        setError(res.error.message || 'Erreur lors de la demande de réinitialisation.');
      } else {
        setMessage('Un email de réinitialisation a été envoyé si l\'adresse existe dans le système.');
      }
    } catch (err: unknown) {
      setError(err?.message || String(err));
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto p-8 mt-12">
      <h2 className="text-2xl font-bold mb-4">{t('auth.forgotten_password')}</h2>
      <p className="text-sm text-gray-600 mb-4">{t('auth.forgotten_password_desc')}</p>
      <form onSubmit={handleFormSubmit(handleSubmit)}>
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('auth.email')}</label>
          <Input
            type="email"
            {...register('email')}
            placeholder={t('auth.email_placeholder')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {message && <div className="text-green-600 mb-2">{message}</div>}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? t('common.sending') : t('auth.send_reset_link')}</Button>
        </div>
      </form>
    </Card>
  );
}



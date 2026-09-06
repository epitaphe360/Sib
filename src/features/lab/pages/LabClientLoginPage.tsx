import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { LAB_ROUTES } from '../routes';
import { otpCodeSchema, otpEmailSchema } from '../schemas';

export default function LabClientLoginPage() {
  const navigate = useNavigate();
  const { requestClientOtp, verifyClientOtp } = useLabSessionStore();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState<string | null>(null);

  const emailForm = useForm({ resolver: zodResolver(otpEmailSchema), mode: 'onChange' });
  const codeForm = useForm({ resolver: zodResolver(otpCodeSchema), mode: 'onChange' });

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h1 className="text-xl font-semibold text-[#0b1f3a]">Espace client</h1>
        <p className="text-sm text-slate-500">Connexion par code email (10 minutes). Aucun mot de passe.</p>
        {step === 'email' ? (
          <form
            className="space-y-3"
            onSubmit={emailForm.handleSubmit(async (v) => {
              setError(null);
              try {
                await requestClientOtp(v.email);
                codeForm.setValue('email', v.email);
                setStep('code');
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Envoi impossible');
              }
            })}
          >
            <Input type="email" placeholder="vous@entreprise.ma" {...emailForm.register('email')} />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-red-600">{emailForm.formState.errors.email.message}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={!emailForm.formState.isValid || emailForm.formState.isSubmitting}>
              Recevoir le code
            </Button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={codeForm.handleSubmit(async (v) => {
              setError(null);
              try {
                await verifyClientOtp(v.email, v.token);
                navigate(LAB_ROUTES.CLIENT_DASHBOARD);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Code invalide ou expiré');
              }
            })}
          >
            <Input placeholder="Code à 6 chiffres" inputMode="numeric" {...codeForm.register('token')} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={!codeForm.formState.isValid || codeForm.formState.isSubmitting}>
              Valider
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { LAB_ROUTES } from '../routes';
import { otpCodeSchema, otpEmailSchema } from '../schemas';
import { LabBtn, LabField, LabPublicFrame, labInputClass } from '../components/LabUi';
import { LabDemoAccounts } from '../components/LabDemoAccounts';
import { LAB_DEMO_CLIENT_ACCOUNT } from '../lib/demoAccounts';

export default function LabClientLoginPage() {
  const navigate = useNavigate();
  const { requestClientOtp, verifyClientOtp } = useLabSessionStore();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState<string | null>(null);
  const [demoId, setDemoId] = useState<string | null>(null);

  const emailForm = useForm<{ email: string }>({ resolver: zodResolver(otpEmailSchema), mode: 'onChange' });
  const codeForm = useForm<{ email: string; token: string }>({ resolver: zodResolver(otpCodeSchema), mode: 'onChange' });

  const requestOtp = async (v: { email: string }) => {
    setError(null);
    try {
      await requestClientOtp(v.email);
      codeForm.setValue('email', v.email);
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Envoi impossible');
    } finally {
      setDemoId(null);
    }
  };

  const fillAndRequestDemoOtp = () => {
    setDemoId(LAB_DEMO_CLIENT_ACCOUNT.id);
    emailForm.setValue('email', LAB_DEMO_CLIENT_ACCOUNT.email, { shouldValidate: true, shouldDirty: true });
    void emailForm.handleSubmit(requestOtp)();
  };

  return (
    <LabPublicFrame>
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
        <div className="lab-glass w-full space-y-4 rounded-3xl p-7">
          <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Étape 09 · Portail sécurisé</p>
          <h1 className="lab-display text-4xl text-white">Espace client</h1>
          <p className="text-sm text-white/60">Connexion par code email (10 minutes). Aucun mot de passe.</p>
          {step === 'email' ? (
            <form
              className="space-y-3"
              onSubmit={emailForm.handleSubmit(requestOtp)}
            >
              <LabField label="Email" error={emailForm.formState.errors.email?.message}>
                <input className={labInputClass()} type="email" placeholder="vous@entreprise.ma" {...emailForm.register('email')} />
              </LabField>
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <LabBtn type="submit" className="w-full" disabled={!emailForm.formState.isValid || emailForm.formState.isSubmitting}>
                Envoyer le code
              </LabBtn>
              <LabDemoAccounts
                accounts={[LAB_DEMO_CLIENT_ACCOUNT]}
                onPick={fillAndRequestDemoOtp}
                busyId={demoId}
                disabled={emailForm.formState.isSubmitting}
                hint="Pas de connexion mot de passe côté client : le bouton préremplit l’e-mail et envoie le code OTP. Il faut encore ouvrir la boîte client@elitech.dev."
              />
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
              <LabField label="Code à 6 chiffres">
                <input className={labInputClass()} placeholder="000000" inputMode="numeric" {...codeForm.register('token')} />
              </LabField>
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <LabBtn type="submit" className="w-full" disabled={!codeForm.formState.isValid || codeForm.formState.isSubmitting}>
                Valider
              </LabBtn>
            </form>
          )}
          <p className="text-center text-xs text-white/45">
            <Link className="text-cyan-300" to={LAB_ROUTES.ROOT}>Retour au portail</Link>
          </p>
        </div>
      </div>
    </LabPublicFrame>
  );
}

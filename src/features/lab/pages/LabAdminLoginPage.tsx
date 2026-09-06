import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { LAB_ROUTES } from '../routes';
import { LabBtn, LabField, LabPublicFrame, labInputClass } from '../components/LabUi';
import { LabDemoAccounts } from '../components/LabDemoAccounts';
import { LAB_DEMO_ADMIN_ACCOUNTS, type LabDemoAdminAccount } from '../lib/demoAccounts';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe requis'),
});

type LoginValues = z.infer<typeof schema>;

export default function LabAdminLoginPage() {
  const navigate = useNavigate();
  const loginAdmin = useLabSessionStore((s) => s.loginAdmin);
  const [error, setError] = useState<string | null>(null);
  const [demoId, setDemoId] = useState<string | null>(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting, isValid } } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const submitLogin = async (values: LoginValues) => {
    setError(null);
    try {
      await loginAdmin(values.email, values.password);
      navigate(LAB_ROUTES.ADMIN_DASHBOARD);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion impossible');
    } finally {
      setDemoId(null);
    }
  };

  const fillAndSubmitDemo = (account: LabDemoAdminAccount) => {
    setDemoId(account.id);
    setValue('email', account.email, { shouldValidate: true, shouldDirty: true });
    setValue('password', account.password, { shouldValidate: true, shouldDirty: true });
    void handleSubmit(submitLogin)();
  };

  return (
    <LabPublicFrame>
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
        <form
          className="lab-glass w-full space-y-4 rounded-3xl p-7"
          onSubmit={handleSubmit(submitLogin)}
        >
          <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Accès interne</p>
          <h1 className="lab-display text-4xl text-white">Connexion laboratoire</h1>
          <p className="text-xs text-white/55">Premier compte = SUPER_ADMIN. MFA depuis le profil.</p>
          <LabField label="Email" error={errors.email?.message}>
            <input className={labInputClass()} type="email" autoComplete="email" {...register('email')} />
          </LabField>
          <LabField label="Mot de passe" error={errors.password?.message}>
            <input className={labInputClass()} type="password" autoComplete="current-password" {...register('password')} />
          </LabField>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <LabBtn type="submit" className="w-full" disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Connexion…' : 'Entrer'}
          </LabBtn>
          <LabDemoAccounts
            accounts={LAB_DEMO_ADMIN_ACCOUNTS}
            onPick={fillAndSubmitDemo}
            busyId={demoId}
            disabled={isSubmitting}
          />
          <p className="text-center text-xs text-white/45">
            <Link className="text-cyan-300" to={LAB_ROUTES.ROOT}>Retour au portail</Link>
          </p>
        </form>
      </div>
    </LabPublicFrame>
  );
}

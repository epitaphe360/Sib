import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { LAB_ROUTES } from '../routes';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe requis'),
});

export default function LabAdminLoginPage() {
  const navigate = useNavigate();
  const loginAdmin = useLabSessionStore((s) => s.loginAdmin);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <form
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          try {
            await loginAdmin(values.email, values.password);
            navigate(LAB_ROUTES.ADMIN_DASHBOARD);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Connexion impossible');
          }
        })}
      >
        <h1 className="text-xl font-semibold text-[#0b1f3a]">Connexion laboratoire</h1>
        <div>
          <Input type="email" placeholder="email@laboratoire.ma" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Input type="password" placeholder="Mot de passe" autoComplete="current-password" {...register('password')} />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Connexion…' : 'Entrer'}
        </Button>
      </form>
    </div>
  );
}

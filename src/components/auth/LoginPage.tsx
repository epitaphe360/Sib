import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader,
  Shield,
  Building2,
  Store,
  BarChart2,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // ✅ Par défaut activé pour meilleure UX
  const [error, setError] = useState('');
  const { login, loginWithGoogle, isLoading, isGoogleLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const showDemoLogins = import.meta.env.VITE_SHOW_DEMO_LOGINS === 'true';

  // ✅ CRITICAL FIX: Récupérer l'URL de redirection depuis les paramètres d'URL
  const redirectUrl = useMemo(() => {
    const param = searchParams.get('redirect');
    return param ? decodeURIComponent(param) : null;
  }, [searchParams]);

  // ✅ Helper function pour rediriger vers le bon dashboard après connexion
  const redirectToDashboard = (user: any) => {
    if (redirectUrl) {
      console.log('🔄 Redirection post-connexion vers:', redirectUrl);
      navigate(redirectUrl, { replace: true });
      return;
    }

    if (user?.type === 'security' || user?.email === 'service-clientele@sibs.com') {
      navigate(ROUTES.BADGE_PRINT_STATION);
    } else if (user?.email === 'marketing@sibs.com') {
      // Le compte marketing redirige vers son dashboard dédié
      navigate(ROUTES.MARKETING_DASHBOARD);
    } else if (user?.type === 'admin') {
      navigate(ROUTES.ADMIN_DASHBOARD);
    } else if (user?.type === 'partner') {
      navigate(ROUTES.PARTNER_DASHBOARD);
    } else if (user?.type === 'exhibitor') {
      navigate(ROUTES.EXHIBITOR_DASHBOARD);
    } else if (user?.type === 'visitor') {
      navigate(ROUTES.VISITOR_DASHBOARD);
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  // ✅ Fonction pour connexion rapide avec les comptes démo
  const handleDemoLogin = async (demoEmail: string, demoPassword: string, key: string) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setDemoLoading(key);
    
    try {
      await login(demoEmail, demoPassword, { rememberMe: true });
      const { user } = useAuthStore.getState();
      
      if (user) {
        // 🔴 CRITICAL: Block VIP visitors who haven't paid
        if (user.type === 'visitor' && (user.visitor_level === 'vip' || user.visitor_level === 'premium') && user.status === 'pending_payment') {
          await supabase.auth.signOut();
          setError(t('login.paymentRequired'));
          setTimeout(() => {
            navigate(ROUTES.VISITOR_SUBSCRIPTION, { state: { userId: user.id, email: user.email, paymentRequired: true } });
          }, 2000);
          return;
        }
        redirectToDashboard(user);
      }
    } catch (err: any) {
      setError(err.message || t('login.connectionError'));
    } finally {
      setDemoLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('login.fillAllFields'));
      return;
    }

    try {
      // ✅ Passer l'option rememberMe au login
      await login(email, password, { rememberMe });

      // ✅ Rediriger vers le dashboard approprié selon le type d'utilisateur
      const { user } = useAuthStore.getState();

      // 🔴 CRITICAL: Block VIP visitors who haven't paid
      if (user?.type === 'visitor' && (user?.visitor_level === 'vip' || user?.visitor_level === 'premium') && user?.status === 'pending_payment') {
        // Log out immediately
        await supabase.auth.signOut();

        // Show payment required error
        setError(t('login.paymentRequiredFull'));

        // Redirect to payment page after 2 seconds
        setTimeout(() => {
          navigate(ROUTES.VISITOR_SUBSCRIPTION, {
            state: {
              userId: user.id,
              email: user.email,
              name: user.name,
              paymentRequired: true
            }
          });
        }, 2000);

        return;
      }

      redirectToDashboard(user);
    } catch (err: unknown) {
      console.error('❌ Erreur login:', err);
      let errorMessage = err instanceof Error ? err.message : t('login.wrongCredentials');
      
      // Message plus clair selon le type d'erreur
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials') || err.message.includes('Identifiants incorrects')) {
          errorMessage = err.message;
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Veuillez confirmer votre adresse email avant de vous connecter. Vérifiez vos emails (y compris spam).';
        } else if (err.message.includes('Aucun compte trouvé')) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('login.googleError');
      setError(errorMessage);
    }
  };

  const handleLinkedInLogin = async () => {
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('login.linkedinError');
      setError(errorMessage);
    }
  };
  
  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center py-12 px-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none -z-0">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-8">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-5">
              <img
                src="/logo-sib2026.png"
                alt="SIB Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="sib-kicker mb-3 justify-center">SIB 2026</div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
              {t('login.title')}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/30 rounded-xl"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-danger-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-danger-700 dark:text-danger-300 text-sm">{error}</p>
                  {error.includes('Identifiants incorrects') && (
                    <p className="text-danger-600 dark:text-danger-400 text-xs mt-2 leading-relaxed">
                      Nouveau visiteur ? Vérifiez vos emails pour définir votre mot de passe avant de vous connecter.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-11 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-600/30"
                />
                {t('login.remember_me')}
              </label>

              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t('login.forgot_password')}
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-1.5" />
                  {t('login.connecting')}
                </>
              ) : (
                t('login.button')
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('login.noAccount')}{' '}
              <Link
                to={ROUTES.VISITOR_SUBSCRIPTION}
                className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t('login.createAccount')}
              </Link>
            </p>
          </div>

          {/* Demo logins */}
          {showDemoLogins && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
                    Connexion rapide
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { k: 'admin', email: 'admin@sibs.com', pwd: 'Sib2026!Admin', label: 'Admin', Icon: Shield, variant: 'primary' },
                  { k: 'partner', email: 'partenaire@sibs.com', pwd: 'Sib2026!Partner', label: 'Partenaire', Icon: Building2, variant: 'accent' },
                  { k: 'exhibitor', email: 'exposant@sibs.com', pwd: 'Sib2026!Expo', label: 'Exposant', Icon: Store, variant: 'primary' },
                  { k: 'marketing', email: 'marketing@sibs.com', pwd: 'Sib2026!Marketing', label: 'Marketing', Icon: BarChart2, variant: 'secondary' },
                ].map(({ k, email, pwd, label, Icon, variant }) => (
                  <Button
                    key={k}
                    type="button"
                    variant={variant as any}
                    size="sm"
                    onClick={() => handleDemoLogin(email, pwd, k)}
                    disabled={demoLoading !== null || isLoading}
                    className="w-full justify-center"
                  >
                    {demoLoading === k ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5 mr-1.5" />}
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

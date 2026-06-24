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
  Store,
  Users,
  Star,
  Link2,
  CheckCircle,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { OAuthService } from '../../services/oauthService';

type LoginMode = 'password' | 'magic';

export default function LoginPage() {
  const { t } = useTranslation();
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const showDemoLogins =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGINS === 'true';

  const redirectUrl = useMemo(() => {
    const param = searchParams.get('redirect');
    return param ? decodeURIComponent(param) : null;
  }, [searchParams]);

  const redirectToDashboard = (user: { type?: string; email?: string } | null) => {
    if (redirectUrl) {
      navigate(redirectUrl, { replace: true });
      return;
    }

    if (user?.type === 'security' || user?.email === 'service-clientele@sibs.com') {
      navigate(ROUTES.BADGE_PRINT_STATION);
    } else if (user?.email === 'marketing@sibs.com') {
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

  const handleDemoLogin = async (demoEmail: string, demoPassword: string, key: string) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setDemoLoading(key);

    try {
      await login(demoEmail, demoPassword, { rememberMe: true });
      const { user } = useAuthStore.getState();

      if (user) {
        if (
          user.type === 'visitor' &&
          (user.visitor_level === 'vip' || user.visitor_level === 'premium') &&
          user.status === 'pending_payment'
        ) {
          await supabase.auth.signOut();
          setError(t('login.paymentRequired'));
          setTimeout(() => {
            navigate(ROUTES.VISITOR_SUBSCRIPTION, {
              state: { userId: user.id, email: user.email, paymentRequired: true },
            });
          }, 2000);
          return;
        }
        redirectToDashboard(user);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('login.connectionError');
      setError(message);
    } finally {
      setDemoLoading(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('login.fillAllFields'));
      return;
    }

    try {
      await login(email, password, { rememberMe });
      const { user } = useAuthStore.getState();

      if (
        user?.type === 'visitor' &&
        (user?.visitor_level === 'vip' || user?.visitor_level === 'premium') &&
        user?.status === 'pending_payment'
      ) {
        await supabase.auth.signOut();
        setError(t('login.paymentRequiredFull'));
        setTimeout(() => {
          navigate(ROUTES.VISITOR_SUBSCRIPTION, {
            state: {
              userId: user.id,
              email: user.email,
              name: user.name,
              paymentRequired: true,
            },
          });
        }, 2000);
        return;
      }

      redirectToDashboard(user);
    } catch (err: unknown) {
      let errorMessage = err instanceof Error ? err.message : t('login.wrongCredentials');

      if (err instanceof Error) {
        if (
          err.message.includes('Invalid login credentials') ||
          err.message.includes('Identifiants incorrects')
        ) {
          errorMessage = err.message;
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage =
            'Veuillez confirmer votre adresse email avant de vous connecter. Vérifiez vos emails (y compris spam).';
        } else if (err.message.includes('Aucun compte trouvé')) {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email?.trim()) {
      setError(t('login.fillAllFields'));
      return;
    }

    setMagicLoading(true);
    try {
      await OAuthService.sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Impossible d\'envoyer le lien magique';
      setError(message);
    } finally {
      setMagicLoading(false);
    }
  };

  const switchLoginMode = (mode: LoginMode) => {
    setLoginMode(mode);
    setError('');
    if (mode === 'password') {
      setMagicLinkSent(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center py-12 px-6 relative overflow-hidden">
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
                      Nouveau visiteur ? Vérifiez vos emails pour définir votre mot de passe avant
                      de vous connecter.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Mode : mot de passe / lien magique */}
          <div
            className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-1 mb-5 bg-neutral-50 dark:bg-neutral-800/50"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={loginMode === 'password'}
              onClick={() => switchLoginMode('password')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-colors ${
                loginMode === 'password'
                  ? 'bg-white dark:bg-neutral-900 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              {t('login.mode_password')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loginMode === 'magic'}
              onClick={() => switchLoginMode('magic')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-colors ${
                loginMode === 'magic'
                  ? 'bg-white dark:bg-neutral-900 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              {t('login.mode_magic')}
            </button>
          </div>

          {loginMode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2"
                >
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
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2"
                >
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
                    autoComplete="current-password"
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
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
          ) : magicLinkSent ? (
            <div className="text-center py-4 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {t('login.magic_sent_title')}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                  {t('login.magic_sent_desc')}
                </p>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-2">
                  {email}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMagicLinkSent(false);
                  setError('');
                }}
              >
                {t('login.magic_back')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="space-y-5">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t('login.magic_desc')}
              </p>

              <div>
                <label
                  htmlFor="magic-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2"
                >
                  {t('login.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    id="magic-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={magicLoading}
              >
                {magicLoading ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-1.5" />
                    {t('login.magic_sending')}
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-1.5" />
                    {t('login.magic_send')}
                  </>
                )}
              </Button>
            </form>
          )}

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

          {showDemoLogins && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
                    {t('login.demo_accounts')}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  {
                    k: 'admin',
                    email: 'admin@sibs.com',
                    pwd: 'Sib2026!Admin',
                    label: t('login.demo_admin'),
                    Icon: Shield,
                    variant: 'primary',
                  },
                  {
                    k: 'exhibitor',
                    email: 'exposant@sibs.com',
                    pwd: 'Sib2026!Expo',
                    label: t('login.demo_exhibitors'),
                    Icon: Store,
                    variant: 'primary',
                  },
                  {
                    k: 'visitor',
                    email: 'visitor-free@test.sib2026.ma',
                    pwd: 'Demo2026!',
                    label: 'Visiteur',
                    Icon: Users,
                    variant: 'secondary',
                  },
                  {
                    k: 'visitor-vip',
                    email: 'visitor-vip@test.sib2026.ma',
                    pwd: 'Demo2026!',
                    label: 'Visiteur VIP',
                    Icon: Star,
                    variant: 'accent',
                  },
                ].map(({ k, email: demoEmail, pwd, label, Icon, variant }) => (
                  <Button
                    key={k}
                    type="button"
                    variant={variant as 'primary' | 'accent' | 'secondary'}
                    size="sm"
                    onClick={() => handleDemoLogin(demoEmail, pwd, k)}
                    disabled={demoLoading !== null || isLoading}
                    className="w-full justify-center"
                  >
                    {demoLoading === k ? (
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                    )}
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

import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Anchor,
  AlertCircle,
  Loader,
  Shield,
  Building2,
  Store,
  BarChart2,
  Users,
  Zap
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { MoroccanPattern, MoroccanArch } from '../ui/MoroccanDecor';

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
    } else if (user?.type === 'marketing' || user?.email === 'marketing@sibs.com') {
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

  const handleDemoLoginWithRedirect = async (demoEmail: string, demoPassword: string, key: string, redirectTo: string) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setDemoLoading(key);
    try {
      await login(demoEmail, demoPassword, { rememberMe: true });
      navigate(redirectTo, { replace: true });
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

      if (error) {throw error;}
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

      if (error) {throw error;}
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('login.linkedinError');
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sib-primary via-sib-secondary to-sib-accent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <MoroccanPattern className="opacity-10" color="white" scale={1.5} />

      {/* Decorative Arch at bottom */}
      <MoroccanArch className="text-white/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        <Card className="p-8 border-t-4 border-t-sib-gold shadow-2xl backdrop-blur-sm bg-white/95">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/logo-sib2026.png"
                alt="SIB Logo"
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {fallback.style.display = 'flex';}
                }}
              />
              <div className="items-center justify-center space-x-2 hidden">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Anchor className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">SIB</span>
                  <span className="text-sm text-gray-500 block leading-none">2026</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('login.title')}
            </h2>
            <p className="text-gray-600">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{error}</p>
                  {error.includes('Identifiants incorrects') && (
                    <p className="text-red-600 text-xs mt-2">
                      💡 Nouveau visiteur ? Vérifiez vos emails pour définir votre mot de passe avant de vous connecter.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t('login.remember_me')}
                </label>
              </div>

              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {t('login.forgot_password')}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  {t('login.connecting')}
                </>
              ) : (
                t('login.button')
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('login.noAccount')}{' '}
              <Link
                to={ROUTES.VISITOR_SUBSCRIPTION}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t('login.createAccount')}
              </Link>
            </p>
          </div>

          {/* Raccourcis connexion rapide - uniquement en mode démo */}
          {showDemoLogins && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">⚡ Connexion rapide</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin-test@test.sib2026.ma', 'Test@123456', 'admin')}
                  disabled={demoLoading !== null || isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {demoLoading === 'admin' ? <Loader className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('partner-gold@test.sib2026.ma', 'Test@123456', 'partner')}
                  disabled={demoLoading !== null || isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {demoLoading === 'partner' ? <Loader className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                  Partenaire
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('exhibitor-9m@test.sib2026.ma', 'Test@123456', 'exhibitor')}
                  disabled={demoLoading !== null || isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {demoLoading === 'exhibitor' ? <Loader className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
                  Exposant
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('marketing@sibs.com', 'Test@123456', 'marketing')}
                  disabled={demoLoading !== null || isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {demoLoading === 'marketing' ? <Loader className="h-4 w-4 animate-spin" /> : <BarChart2 className="h-4 w-4" />}
                  Marketing
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('visitor-free@test.sib2026.ma', 'Test@123456', 'visitor')}
                  disabled={demoLoading !== null || isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 transition-colors"
                >
                  {demoLoading === 'visitor' ? <Loader className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Visiteur Gratuit
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLoginWithRedirect('visitor-free@test.sib2026.ma', 'Test@123456', 'matching', ROUTES.PROFILE_MATCHING)}
                  disabled={demoLoading !== null || isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {demoLoading === 'matching' ? <Loader className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Matching IA
                </button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

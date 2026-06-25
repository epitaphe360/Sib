/**
 * Portail Service Clientèle — page autonome (connexion + inscription + impression).
 */
import { useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader,
  LogOut,
  Printer,
  Shield,
  UserPlus,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from '../components/ui/Button';
import OnSiteVisitorRegistration from './service-client/OnSiteVisitorRegistration';
import BadgePrintStationPage from './BadgePrintStationPage';

type Tab = 'registration' | 'print';

function isServiceClientUser(user: { type?: string; email?: string } | null): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase() ?? '';
  return (
    user.type === 'admin'
    || user.type === 'security'
    || email === 'service-clientele@sib.com'
    || email === 'service-clientele@sibs.com'
  );
}

function ServiceClientLogin() {
  const { t } = useTranslation();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Veuillez saisir votre email et mot de passe.');
      return;
    }
    try {
      await login(email.trim(), password, { rememberMe: true });
      const { user } = useAuthStore.getState();
      if (user && !isServiceClientUser(user)) {
        await useAuthStore.getState().logout();
        setError('Accès réservé au personnel service clientèle et administrateurs.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.connectionError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1B365D] to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sib-orange/20 mb-4">
            <Shield className="w-8 h-8 text-sib-orange" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Service Clientèle</h1>
          <p className="text-white/70 mt-2 text-sm">SIB 2026 — Inscription sur site · Impression badges</p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5"
        >
          <div>
            <label htmlFor="sc-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email professionnel
            </label>
            <input
              id="sc-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sib-orange focus:border-transparent"
              placeholder="service-clientele@sib.com"
            />
          </div>

          <div>
            <label htmlFor="sc-password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="sc-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sib-orange focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button type="submit" className="w-full bg-sib-orange hover:bg-sib-orange/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              'Accéder au portail'
            )}
          </Button>
        </form>

        <p className="text-center text-white/50 text-xs mt-4">
          Accès personnel du stand uniquement (mot de passe pro).
        </p>
        <p className="text-center text-white/40 text-xs mt-1">
          Les visiteurs n&apos;ont pas de mot de passe — ils utilisent un lien magique sur l&apos;app mobile.
        </p>
      </div>
    </div>
  );
}

function ServiceClientPortal() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('print');

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="no-print sticky top-0 z-50 bg-sib-navy text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold font-display">Service Clientèle SIB 2026</h1>
            <p className="text-sm text-white/70">Inscription sur site · Impression badges</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80 hidden sm:inline">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleLogout()}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('registration')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'registration' ? 'bg-sib-orange text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Inscription visiteur
          </button>
          <button
            type="button"
            onClick={() => setTab('print')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'print' ? 'bg-sib-orange text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Printer className="w-4 h-4" />
            Impression badges
          </button>
        </div>
      </header>

      <main className="flex-1">
        {tab === 'registration' ? (
          <div className="max-w-4xl mx-auto py-6 px-4">
            <OnSiteVisitorRegistration />
          </div>
        ) : (
          <BadgePrintStationPage embedded />
        )}
      </main>
    </div>
  );
}

export default function ServiceClientPortalPage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B365D]">
        <Loader className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user || !isServiceClientUser(user)) {
    return <ServiceClientLogin />;
  }

  return <ServiceClientPortal />;
}

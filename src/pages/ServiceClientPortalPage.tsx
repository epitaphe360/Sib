/**
 * Portail Service Clientèle — inscription sur site + impression badges (page dédiée).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Printer, UserPlus } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from '../components/ui/Button';
import VisitorFreeRegistration from './visitor/VisitorFreeRegistration';
import BadgePrintStationPage from './BadgePrintStationPage';

type Tab = 'registration' | 'print';

export default function ServiceClientPortalPage() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('print');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-sib-navy text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold font-display">Service Clientèle SIB 2026</h1>
            <p className="text-sm text-white/70">Inscription sur site · Impression badges</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80 hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => void handleLogout()} className="border-white/30 text-white hover:bg-white/10">
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
            <VisitorFreeRegistration embedded />
          </div>
        ) : (
          <BadgePrintStationPage embedded />
        )}
      </main>
    </div>
  );
}

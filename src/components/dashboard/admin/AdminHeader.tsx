import { motion } from 'framer-motion';
import { Shield, Clock, RefreshCw, CalendarDays, Zap, TrendingUp } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { User } from '../../../types';

interface AdminHeaderProps {
  user: User;
  adminMetrics: Record<string, number | unknown>;
  isLoading: boolean;
  onRefresh: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

const SIB_DATE = new Date('2026-11-25T00:00:00');

function useCountdown() {
  const now = new Date();
  const diff = SIB_DATE.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

export function AdminHeader({ user, isLoading, onRefresh, t }: AdminHeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const countdown = useCountdown();

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 40%, #2563eb 70%, #1e3a8a 100%)' }}>

        {/* Motif zellige en fond */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)`,
        }} />

        {/* Barre dorée animée */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-1 w-full origin-left"
          style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)' }}
        />

        <div className="px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
          {/* Titre + utilisateur */}
          <div className="flex items-center gap-5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="p-3.5 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-sm"
            >
              <Shield className="h-8 w-8 text-yellow-300" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {t('admin.dashboard_title')}
                </h1>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1 bg-green-400/20 border border-green-400/40 text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </motion.span>
              </div>
              <p className="text-blue-200 text-sm">
                Bonjour, <span className="font-semibold text-white">{user?.profile?.firstName || 'Administrateur'}</span> · {dateStr}
              </p>
            </div>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-white text-xs font-medium">{t('admin.system_operational')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-white/30 text-white hover:text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Compte à rebours salon */}
        {countdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-t border-white/10 px-8 py-4 flex flex-wrap items-center gap-6 bg-black/10"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-300" />
              <span className="text-blue-200 text-sm font-medium">Ouverture SIB 2026</span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { val: countdown.days, label: 'Jours' },
                { val: countdown.hours, label: 'Heures' },
                { val: countdown.minutes, label: 'Min' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 min-w-[48px]">
                    <span className="text-xl font-bold text-yellow-300 font-mono">{String(val).padStart(2, '0')}</span>
                  </div>
                  <span className="text-blue-300 text-[10px] uppercase tracking-wider mt-1 block">{label}</span>
                </div>
              ))}
              <span className="text-blue-200 text-sm ml-2">· El Jadida, Maroc</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}


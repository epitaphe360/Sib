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
  if (diff <= 0) {return null;}
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
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
      <div
        className="rounded-2xl overflow-hidden shadow-2xl relative"
        style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 60%, #f0f4fa 100%)', border: '1px solid rgba(30,58,95,0.12)', boxShadow: '0 4px 24px rgba(30,58,95,0.08)' }}
      >
        {/* Glow gold top-left */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(30,58,95,0.04) 0%, transparent 70%)' }} />

        {/* Barre dorée animée — shimmer */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-1.5 w-full origin-left animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 30%, #fef08a 50%, #fbbf24 70%, #f59e0b 100%)',
            backgroundSize: '200% auto',
          }}
        />

        <div className="px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          {/* Titre + utilisateur */}
          <div className="flex items-center gap-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="p-4 rounded-2xl bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 flex-shrink-0"
            >
              <Shield className="h-8 w-8 text-[#1e3a5f]" />
            </motion.div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#1e3a5f] tracking-tight">
                  {t('admin.dashboard_title')}
                </h1>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5 bg-green-400/20 border border-green-400/40 text-green-300 text-xs font-bold px-3 py-1 rounded-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </motion.span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                Bonjour, <span className="font-semibold text-[#1e3a5f]">{user?.profile?.firstName || 'Administrateur'}</span> • {dateStr}
              </p>
            </div>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
              <Zap className="h-4 w-4 text-[#1e3a5f]" />
              <span className="text-[#1e3a5f] text-xs font-medium">{t('admin.system_operational')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-[#1e3a5f]/20 text-[#1e3a5f] hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/10 bg-transparent text-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
            className="border-t px-10 py-6 flex flex-wrap items-center gap-8"
            style={{ borderColor: 'rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.04)' }}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-[#C9A84C]" />
              <span className="text-[#1e3a5f] text-sm font-medium">Ouverture SIB 2026</span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { val: countdown.days, label: 'Jours' },
                { val: countdown.hours, label: 'Heures' },
                { val: countdown.minutes, label: 'Min' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="bg-[#1e3a5f]/8 border border-[#1e3a5f]/15 rounded-xl px-3 py-1.5 min-w-[48px]">
                    <span className="text-xl font-bold text-[#C9A84C] font-mono">{String(val).padStart(2, '0')}</span>
                  </div>
                  <span className="text-gray-500 text-[10px] uppercase tracking-wider mt-1 block">{label}</span>
                </div>
              ))}
              <span className="text-gray-500 text-sm ml-2">· El Jadida, Maroc</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}


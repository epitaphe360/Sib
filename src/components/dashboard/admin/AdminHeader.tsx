import { motion } from 'framer-motion';
import { Shield, Server, BarChart3, Database, Activity } from 'lucide-react';
import { Button } from '../../ui/Button';
import { MoroccanPattern } from '../../ui/MoroccanDecor';
import type { User } from '../../../types';

interface AdminHeaderProps {
  user: User;
  adminMetrics: Record<string, number | unknown>;
  isLoading: boolean;
  onRefresh: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

export function AdminHeader({ user, adminMetrics: m, isLoading, onRefresh, t }: AdminHeaderProps) {
  const metrics = m as any;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="bg-gradient-to-r from-SIB-primary via-SIB-secondary to-SIB-accent rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
        <MoroccanPattern className="opacity-15" color="white" scale={0.8} />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <Shield className="h-10 w-10 text-SIB-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{t('admin.dashboard_title')}</h1>
              <p className="text-blue-100">{t('admin.welcome', { name: `${user?.profile?.firstName || 'Administrateur'} ${user?.profile?.lastName || ''}` })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">{t('admin.system_operational')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <Activity className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('actions.refresh')}
            </Button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: t('admin.system_uptime'), value: metrics.systemUptime > 0 ? `${metrics.systemUptime}%` : 'N/D', Icon: Server },
            { label: t('admin.api_calls_per_day'), value: metrics.apiCalls > 0 ? `${(metrics.apiCalls / 1000).toFixed(1)}K` : '0', Icon: BarChart3 },
            { label: t('admin.storage_used'), value: `${metrics.dataStorage} GB`, Icon: Database },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm mb-1">{label}</div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                </div>
                <Icon className="h-8 w-8 text-white/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

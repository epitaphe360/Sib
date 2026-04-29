import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Activity, Wifi } from 'lucide-react';

interface HealthItem {
  name: string;
  status: 'excellent' | 'good' | 'warning' | 'error';
  value: string;
  color?: string;
}

interface SystemHealthPanelProps {
  healthItems: HealthItem[];
}

const statusConfig = {
  excellent: { Icon: CheckCircle, bar: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20', label: 'Excellent', width: '95%' },
  good:      { Icon: CheckCircle, bar: 'bg-blue-400',    badge: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',    label: 'Bon',       width: '75%' },
  warning:   { Icon: AlertTriangle, bar: 'bg-amber-400', badge: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',  label: 'Attention', width: '50%' },
  error:     { Icon: XCircle,     bar: 'bg-red-400',     badge: 'text-red-400 bg-red-400/10 border border-red-400/20',      label: 'Erreur',    width: '20%' },
};

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = memo(({ healthItems }) => {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white shadow-sm"
      style={{ border: '1px solid rgba(30,58,95,0.1)' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(201,168,76,0.05)', borderBottom: '1px solid rgba(30,58,95,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Wifi className="h-5 w-5" style={{ color: '#C9A84C' }} />
          </motion.div>
          <span className="text-[#1e3a5f] font-bold text-sm tracking-wide">État du Système</span>
        </div>
        <span className="text-xs" style={{ color: 'rgba(201,168,76,0.6)' }}>Santé globale</span>
      </div>

      <div className="p-4 space-y-3">
        {healthItems.map((item, i) => {
          const cfg = statusConfig[item.status] || statusConfig.good;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-xl transition-all"
              style={{ border: '1px solid rgba(30,58,95,0.06)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,58,95,0.06)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <cfg.Icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{item.value}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                </div>
              </div>
              {/* Barre de progression */}
              <div className="h-1 rounded-full overflow-hidden bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: cfg.width }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.7 }}
                  className={`h-full ${cfg.bar} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

SystemHealthPanel.displayName = 'SystemHealthPanel';

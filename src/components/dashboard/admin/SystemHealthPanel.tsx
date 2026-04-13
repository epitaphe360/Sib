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
  excellent: { Icon: CheckCircle, bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Excellent', width: '95%' },
  good:      { Icon: CheckCircle, bar: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700',    label: 'Bon',       width: '75%' },
  warning:   { Icon: AlertTriangle, bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700',  label: 'Attention', width: '50%' },
  error:     { Icon: XCircle,     bar: 'bg-red-500',     badge: 'bg-red-100 text-red-700',      label: 'Erreur',    width: '20%' },
};

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = memo(({ healthItems }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Wifi className="h-5 w-5 text-yellow-300" />
          </motion.div>
          <span className="text-white font-bold text-sm">État du Système</span>
        </div>
        <span className="text-xs text-blue-200">Santé globale</span>
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
              className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <cfg.Icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{item.value}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                </div>
              </div>
              {/* Barre de progression */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  severity: 'success' | 'warning' | 'info' | 'error';
  adminUser: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  formatDate: (date: Date) => string;
}

const severityConfig = {
  success: {
    Icon: CheckCircle,
    bg: 'border-emerald-400/30',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    badge: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
    label: 'Succès',
  },
  info: {
    Icon: Info,
    bg: 'border-blue-400/30',
    dot: 'bg-blue-400',
    text: 'text-blue-400',
    badge: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    label: 'Info',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'border-amber-400/30',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    badge: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    label: 'Attention',
  },
  error: {
    Icon: AlertTriangle,
    bg: 'border-red-400/30',
    dot: 'bg-red-400',
    text: 'text-red-400',
    badge: 'text-red-400 bg-red-400/10 border border-red-400/20',
    label: 'Erreur',
  },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = memo(({ activities, formatDate }) => {
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
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Activity className="h-5 w-5" style={{ color: '#C9A84C' }} />
          </motion.div>
          <span className="text-[#1e3a5f] font-bold text-sm tracking-wide">Activité Récente</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </span>
      </div>

      <div className="divide-y divide-[#1e3a5f]/06 max-h-[340px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            </motion.div>
            <p className="text-sm text-gray-400">Aucune activité récente</p>
          </div>
        ) : (
          <AnimatePresence>
            {activities.map((activity, i) => {
              const cfg = severityConfig[activity.severity] || severityConfig.info;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-4 px-5 py-3.5 transition-colors border-l-2 ${cfg.bg}`}
                  style={{ cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(30,58,95,0.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${cfg.badge}`}>
                    <cfg.Icon className={`h-3.5 w-3.5 ${cfg.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug text-gray-700">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-300" />
                      <span className="text-xs text-gray-400">{formatDate(activity.timestamp)}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{activity.adminUser}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
});

ActivityFeed.displayName = 'ActivityFeed';

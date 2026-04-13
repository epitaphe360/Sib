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
    bg: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Succès',
  },
  info: {
    Icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Info',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Attention',
  },
  error: {
    Icon: AlertTriangle,
    bg: 'bg-red-50 border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    label: 'Erreur',
  },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = memo(({ activities, formatDate }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Activity className="h-5 w-5 text-yellow-300" />
          </motion.div>
          <span className="text-white font-bold text-sm">Activité Récente</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-green-300 bg-green-900/30 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      <div className="divide-y divide-gray-50 max-h-[340px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="h-10 w-10 text-gray-200 mx-auto mb-3" />
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
                  className={`flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors border-l-2 ${cfg.dot.replace('bg-', 'border-')}`}
                >
                  <div className={`p-1.5 rounded-lg ${cfg.badge} flex-shrink-0 mt-0.5`}>
                    <cfg.Icon className={`h-3.5 w-3.5 ${cfg.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium leading-snug">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{formatDate(activity.timestamp)}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-500">{activity.adminUser}</span>
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

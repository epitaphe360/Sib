import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '../../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  loading?: boolean;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  loading = false,
  delay = 0
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className={`w-12 h-12 ${iconBgColor} rounded-xl`}></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <motion.div
            className={`${iconBgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
            whileHover={{ rotate: 5 }}
          >
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </motion.div>
        </div>
        
        <motion.div
          className="text-3xl font-bold text-gray-900 mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: delay + 0.2 }}
        >
          {value}
        </motion.div>
        
        {change && (
          <div className="flex items-center space-x-1">
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
              className={`text-sm font-medium ${
                change.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
            </motion.div>
            <span className="text-sm text-gray-500">vs mois dernier</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

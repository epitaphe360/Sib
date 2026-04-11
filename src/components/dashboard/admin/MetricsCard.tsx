import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../../ui/Card';
import { motion } from 'framer-motion';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
  subtitle?: string;
  index?: number;
}

// OPTIMIZATION: Memoized metrics card component
export const MetricsCard: React.FC<MetricsCardProps> = memo(({
  title,
  value,
  icon: Icon,
  trend,
  color = 'text-blue-600',
  subtitle,
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </Card>
    </motion.div>
  );
});

MetricsCard.displayName = 'MetricsCard';

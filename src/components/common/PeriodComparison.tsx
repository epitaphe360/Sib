import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PeriodData {
  value: number;
  label: string;
}

interface PeriodComparisonProps {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
  title: string;
  icon?: React.ReactNode;
  format?: 'number' | 'percentage';
}

export const PeriodComparison: React.FC<PeriodComparisonProps> = ({
  currentPeriod,
  previousPeriod,
  title,
  icon,
  format = 'number'
}) => {
  const { growth, growthPercentage, trend } = useMemo(() => {
    const growth = currentPeriod.value - previousPeriod.value;
    const growthPercentage = previousPeriod.value === 0 
      ? (currentPeriod.value > 0 ? 100 : 0)
      : Math.round((growth / previousPeriod.value) * 100);
    
    const trend: 'up' | 'down' | 'neutral' = 
      growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral';

    return { growth, growthPercentage, trend };
  }, [currentPeriod.value, previousPeriod.value]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendBgColor = trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100';

  const formatValue = (value: number) => {
    if (format === 'percentage') return `${value}%`;
    return value.toLocaleString();
  };

  return (
    <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-indigo-100 rounded-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{currentPeriod.label}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 px-3 py-1 ${trendBgColor} rounded-full`}>
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className={`text-sm font-bold ${trendColor}`}>
            {trend === 'neutral' ? '0' : `${growth > 0 ? '+' : ''}${growthPercentage}`}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Valeur actuelle */}
        <div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatValue(currentPeriod.value)}
          </div>
          <div className="text-xs text-gray-500">
            Période actuelle
          </div>
        </div>

        {/* Barre de progression comparative */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{previousPeriod.label}</span>
            <span>{formatValue(previousPeriod.value)}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-gray-400'} rounded-full transition-all duration-500`}
              style={{ 
                width: `${previousPeriod.value === 0 ? 0 : Math.min(100, (currentPeriod.value / previousPeriod.value) * 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Détails de la variation */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Variation</span>
            <span className={`font-semibold ${trendColor}`}>
              {growth > 0 ? '+' : ''}{formatValue(growth)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Composant pour afficher plusieurs comparaisons de périodes
interface PeriodComparisonGridProps {
  comparisons: Array<{
    currentPeriod: PeriodData;
    previousPeriod: PeriodData;
    title: string;
    icon?: React.ReactNode;
    format?: 'number' | 'percentage';
  }>;
}

export const PeriodComparisonGrid: React.FC<PeriodComparisonGridProps> = ({ comparisons }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {comparisons.map((comparison, index) => (
      <PeriodComparison key={index} {...comparison} />
    ))}
  </div>
);

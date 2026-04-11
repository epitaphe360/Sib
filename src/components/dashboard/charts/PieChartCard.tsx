import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface PieChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  loading?: boolean;
  showPercentage?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
];

export function PieChartCard({
  title,
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  loading = false,
  showPercentage = true
}: PieChartCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-full mx-auto w-64"></div>
        </div>
      </Card>
    );
  }

  // Empty state: No data available or all values are 0
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (!data || data.length === 0 || total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
          <div className="flex flex-col items-center justify-center flex-1" style={{ minHeight: height }}>
            <div className="text-gray-400 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-sm font-medium text-gray-500">Aucune donnée disponible</p>
              <p className="text-xs text-gray-400 mt-1">Les statistiques apparaîtront dès qu'il y aura de l'activité</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  const renderLabel = (entry: any) => {
    if (!showPercentage) return '';
    const percent = total === 0 ? '0.0' : ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-6 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <ResponsiveContainer width="100%" height={height - 80}>
          <PieChart margin={{ top: 20, bottom: 10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderLabel}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1500}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Stats Summary - 3 colonnes pour équilibrer avec le graphique */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.map((item, index) => {
            const percent = total === 0 ? '0.0' : ((item.value / total) * 100).toFixed(1);
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div
                  className="w-2 h-2 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <p className="text-xs text-gray-600 font-medium">{item.name}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{item.value}</p>
                <p className="text-xs text-gray-500">({percent}%)</p>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

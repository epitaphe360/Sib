import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface BarChartCardProps {
  title: string;
  data: Array<{ name: string; value: number; [key: string]: string | number }>;
  dataKey?: string;
  colors?: string[];
  height?: number;
  loading?: boolean;
  horizontal?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
];

export function BarChartCard({
  title,
  data,
  dataKey = 'value',
  colors = DEFAULT_COLORS,
  height = 300,
  loading = false,
  horizontal = false
}: BarChartCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </Card>
    );
  }

  // Empty state: No data available or all values are 0
  const totalValue = data?.reduce((sum, item) => sum + (typeof item[dataKey] === 'number' ? item[dataKey] : 0), 0) || 0;

  if (!data || data.length === 0 || totalValue === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
          <div className="flex flex-col items-center justify-center" style={{ height }}>
            <div className="text-gray-400 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium text-gray-500">Aucune activité enregistrée</p>
              <p className="text-xs text-gray-400 mt-1">Les statistiques apparaîtront dès qu'il y aura de l'activité</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-6 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout={horizontal ? 'vertical' : 'horizontal'}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            {horizontal ? (
              <>
                <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  width={100}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#6b7280' }}
                />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar
              dataKey={dataKey}
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}


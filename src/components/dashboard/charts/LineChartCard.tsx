import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface LineChartCardProps {
  title: string;
  data: Array<{ name: string; [key: string]: string | number }>;
  dataKeys: Array<{ key: string; color: string; name: string }>;
  height?: number;
  showArea?: boolean;
  loading?: boolean;
}

export function LineChartCard({
  title,
  data,
  dataKeys,
  height = 300,
  showArea = false,
  loading = false
}: LineChartCardProps) {
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

  // Empty state: No data available
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
          <div className="flex flex-col items-center justify-center" style={{ height }}>
            <div className="text-gray-400 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium text-gray-500">Aucune donnée disponible</p>
              <p className="text-xs text-gray-400 mt-1">Les données apparaîtront ici une fois disponibles</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  const Chart = showArea ? AreaChart : LineChart;
  const ChartComponent = showArea ? Area : Line;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <Chart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              {dataKeys.map((dk) => (
                <linearGradient key={dk.key} id={`gradient-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dk.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={dk.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#111827' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            {dataKeys.map((dk) => (
              <ChartComponent
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                strokeWidth={3}
                fill={showArea ? `url(#gradient-${dk.key})` : undefined}
                name={dk.name}
                dot={{ fill: dk.color, r: 4 }}
                activeDot={{ r: 6, fill: dk.color }}
                animationDuration={1500}
              />
            ))}
          </Chart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}

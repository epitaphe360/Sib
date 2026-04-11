import { Calendar, Building2, Users, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { useTranslation } from '../../../hooks/useTranslation';

interface Stat { icon: React.ElementType; label: string; value: number; subtitle?: string; gradient: string; }

interface VisitorStatsGridProps {
  userLevel: string;
  appointmentsBooked: number;
  exhibitorsVisited: number;
  registeredEventsCount: number;
  connectionsRequested: number;
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function VisitorStatsGrid({
  userLevel,
  appointmentsBooked,
  exhibitorsVisited,
  registeredEventsCount,
  connectionsRequested,
}: VisitorStatsGridProps) {
  const { t } = useTranslation();
  const statItems: Stat[] = [
    ...(userLevel !== 'free' ? [{
      icon: Calendar,
      label: t('visitor.appointments_booked'),
      value: appointmentsBooked,
      subtitle: `${t('visitor.level_label')}: ${userLevel}`,
      gradient: 'from-blue-500 to-blue-600',
    }] : []),
    { icon: Building2, label: t('visitor.exhibitors_visited'), value: exhibitorsVisited, gradient: 'from-green-500 to-emerald-600' },
    { icon: Users, label: t('visitor.events_registered'), value: registeredEventsCount, gradient: 'from-purple-500 to-purple-600' },
    { icon: Network, label: t('common.connections'), value: connectionsRequested, gradient: 'from-orange-500 to-pink-600' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants}>
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-current group">
            <div className="flex items-center">
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtitle && <p className="text-xs text-gray-500">{stat.subtitle}</p>}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

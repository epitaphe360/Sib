import { Network, Calendar, Target, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface VisitorQuickActionsProps {
  userLevel: string;
  remaining: number;
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function VisitorQuickActions({ userLevel, remaining }: VisitorQuickActionsProps) {
  const { t } = useTranslation();
  if (userLevel === 'free') return null;
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('visitor.ai_networking')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('visitor.ai_networking_desc')}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Link to={ROUTES.NETWORKING}>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all">
                <Network className="h-4 w-4 mr-2" />{t('visitor.explore_network')}
              </Button>
            </Link>
            <Link to={ROUTES.PROFILE_MATCHING}>
              <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                <Target className="h-4 w-4 mr-2" />{t('visitor.configure_matching')}<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('visitor.schedule_appointment')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('visitor.schedule_appointment_desc')}</p>
            </div>
          </div>
          <Link to={`${ROUTES.NETWORKING}?action=schedule`}>
            <Button variant="outline" className="w-full border-2 hover:bg-gray-50" disabled={remaining <= 0}>
              <Calendar className="h-4 w-4 mr-2" />{t('visitor.program_appointment')}
            </Button>
          </Link>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">{t('visitor.appointments_remaining')}:</span>
            <Badge variant={remaining > 0 ? 'success' : 'error'}><strong>{remaining}</strong></Badge>
          </div>
          {remaining <= 0 && (
            <p className="text-sm text-red-600 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />{t('visitor.quota_reached', { level: userLevel })}
            </p>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

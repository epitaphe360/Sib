import { Network, Calendar, Target, ArrowRight, TrendingUp, Brain } from 'lucide-react';
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
  if (userLevel === 'free') {return null;}
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

      {/* Réseautage Avancé */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-[#1B365D]/10 rounded-lg">
              <Network className="h-5 w-5 text-[#1B365D]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('visitor.ai_networking')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('visitor.ai_networking_desc')}</p>
            </div>
          </div>
          <Link to={ROUTES.NETWORKING}>
            <Button className="w-full bg-[#1B365D] hover:bg-[#0F2034] text-white shadow-md transition-all">
              <Network className="h-4 w-4 mr-2" />{t('visitor.explore_network')}
            </Button>
          </Link>
        </Card>
      </motion.div>

      {/* Matching IA */}
      <motion.div variants={itemVariants}>
        <Card className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full ${
          userLevel === 'vip'
            ? 'bg-gradient-to-br from-[#1B365D]/5 to-[#C9A84C]/10 border-2 border-[#C9A84C]/40'
            : 'bg-white'
        }`}>
          <div className="flex items-start space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${userLevel === 'vip' ? 'bg-[#C9A84C]/20' : 'bg-purple-100'}`}>
              <Brain className={`h-5 w-5 ${userLevel === 'vip' ? 'text-[#C9A84C]' : 'text-purple-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('visitor.ai_matching_title', 'Matching IA')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('visitor.ai_matching_desc', 'Trouvez les exposants et partenaires les plus pertinents pour vous.')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link to={ROUTES.ADVANCED_MATCHING}>
              <Button className={`w-full font-bold shadow-md transition-all ${
                userLevel === 'vip'
                  ? 'bg-[#C9A84C] hover:bg-[#A88830] text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}>
                <Brain className="h-4 w-4 mr-2" />{t('visitor.access_ai_matching', 'Matching IA Avancé')}
              </Button>
            </Link>
            <Link to={ROUTES.PROFILE_MATCHING}>
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
                <Target className="h-4 w-4 mr-2" />{t('visitor.configure_matching')}<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Rendez-vous */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-[#2D6A4F]/10 rounded-lg">
              <Calendar className="h-5 w-5 text-[#2D6A4F]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('visitor.schedule_appointment')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('visitor.schedule_appointment_desc')}</p>
            </div>
          </div>
          <Link to={`${ROUTES.NETWORKING}?action=schedule`}>
            <Button variant="outline" className="w-full border-2 hover:bg-gray-50 mb-3" disabled={remaining <= 0}>
              <Calendar className="h-4 w-4 mr-2" />{t('visitor.program_appointment')}
            </Button>
          </Link>
          <div className="flex items-center justify-between text-sm">
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

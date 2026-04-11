import { MessageCircle, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface VisitorCommunicationCardsProps {
  userLevel: string;
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function VisitorCommunicationCards({ userLevel }: VisitorCommunicationCardsProps) {
  const { t } = useTranslation();
  if (userLevel === 'free') return null;
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('visitor.messaging')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('visitor.messaging_desc')}</p>
            </div>
          </div>
          <Link to={ROUTES.CHAT}>
            <Button variant="outline" className="w-full border-2 hover:bg-gray-50">
              <MessageCircle className="h-4 w-4 mr-2" />{t('visitor.open_messaging')}
            </Button>
          </Link>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('visitor.discover_exhibitors')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('visitor.discover_exhibitors_desc')}</p>
            </div>
          </div>
          <Link to={ROUTES.EXHIBITORS}>
            <Button variant="outline" className="w-full border-2 hover:bg-gray-50">
              <Building2 className="h-4 w-4 mr-2" />{t('visitor.view_exhibitors')}
            </Button>
          </Link>
        </Card>
      </motion.div>
    </motion.div>
  );
}

import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';

interface Activity {
  id: string;
  type: 'profile_view' | 'message' | 'appointment' | 'connection' | 'download';
  description: string;
  timestamp: string;
  userName?: string;
}

const TYPE_ICON: Record<string, string> = {
  profile_view: '👁️',
  message: '💬',
  appointment: '📅',
  connection: '🤝',
  download: '📥',
};

interface ExhibitorActivitySectionProps {
  activities: Activity[];
  onViewAll: () => void;
}

export function ExhibitorActivitySection({ activities, onViewAll }: ExhibitorActivitySectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg mr-3">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {t('exhibitor.activity_recent_title')}
        </h3>

        <div className="space-y-3">
          {activities.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {TYPE_ICON[activity.type] || '📌'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString('fr-FR')}
                </p>
              </div>
            </motion.div>
          ))}

          {activities.length === 0 && (
            <div className="text-center text-gray-500 py-4">{t('exhibitor.activity_none')}</div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700"
            onClick={onViewAll}
          >
            {t('exhibitor.activity_view_all')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

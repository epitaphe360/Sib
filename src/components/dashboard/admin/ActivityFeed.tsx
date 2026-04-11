import React, { memo } from 'react';
import { Activity, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  severity: 'success' | 'warning' | 'info' | 'error';
  adminUser: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  formatDate: (date: Date) => string;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    case 'error':
      return AlertTriangle;
    default:
      return Activity;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'success':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'info':
      return 'text-blue-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// OPTIMIZATION: Memoized activity feed component
export const ActivityFeed: React.FC<ActivityFeedProps> = memo(({
  activities,
  formatDate
}) => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Activité Récente
        </h3>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucune activité récente
            </p>
          ) : (
            activities.map((activity) => {
              const SeverityIcon = getSeverityIcon(activity.severity);
              const severityColor = getSeverityColor(activity.severity);

              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <SeverityIcon className={`h-5 w-5 ${severityColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {activity.adminUser}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  <Badge variant={activity.severity as any}>
                    {activity.severity}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
});

ActivityFeed.displayName = 'ActivityFeed';

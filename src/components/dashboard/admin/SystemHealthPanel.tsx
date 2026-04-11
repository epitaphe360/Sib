import React, { memo } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

interface HealthItem {
  name: string;
  status: 'excellent' | 'good' | 'warning' | 'error';
  value: string;
  color?: string;
}

interface SystemHealthPanelProps {
  healthItems: HealthItem[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'excellent':
      return CheckCircle;
    case 'good':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return XCircle;
    default:
      return Activity;
  }
};

const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'excellent':
      return 'success';
    case 'good':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

// OPTIMIZATION: Memoized system health panel component
export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = memo(({ healthItems }) => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          État du Système
        </h3>
        <div className="space-y-4">
          {healthItems.map((item) => {
            const StatusIcon = getStatusIcon(item.status);
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <StatusIcon
                    className={`h-5 w-5 ${item.color || 'text-gray-500'}`}
                  />
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.value}</span>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
});

SystemHealthPanel.displayName = 'SystemHealthPanel';

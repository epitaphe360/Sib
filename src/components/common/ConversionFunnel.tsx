import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp } from 'lucide-react';

interface FunnelStage {
  stage: string;
  count: number;
  color: string;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  title?: string;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  stages,
  title = 'Funnel de Conversion'
}) => {
  const maxValue = useMemo(() => Math.max(...stages.map(s => s.count), 1), [stages]);

  const stagesWithRates = useMemo(() => {
    return stages.map((stage, index) => {
      // Use maxValue as base so funnel works even if stage[0] is 0
      let rate = 0;
      if (maxValue > 0) {
        rate = Math.round((stage.count / maxValue) * 100);
      }

      const dropoff = index > 0 ? stages[index - 1].count - stage.count : 0;
      const dropoffRate = index > 0 && stages[index - 1].count > 0
        ? Math.round((dropoff / stages[index - 1].count) * 100)
        : 0;

      return {
        ...stage,
        rate,
        dropoff,
        dropoffRate,
        width: (stage.count / maxValue) * 100
      };
    });
  }, [stages, maxValue]);

  return (
    <Card className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <Badge variant="info" className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          {stagesWithRates[stagesWithRates.length - 1].rate}% conversion globale
        </Badge>
      </div>

      <div className="space-y-4">
        {stagesWithRates.map((stage, index) => (
          <div key={stage.stage}>
            {/* Étape du funnel */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success" size="sm">
                    {stage.rate}%
                  </Badge>
                  <span className="text-lg font-bold text-gray-900">
                    {stage.count.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full flex items-center justify-start px-3 transition-all duration-500 text-white font-semibold text-sm"
                  style={{
                    width: `${stage.width}%`,
                    backgroundColor: stage.color,
                    minWidth: stage.width > 0 ? '50px' : '0'
                  }}
                >
                  {stage.width > 15 && `${stage.count.toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {maxValue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Entrées totales</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {stagesWithRates[stagesWithRates.length - 1].count.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Conversions</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">
            {stagesWithRates[stagesWithRates.length - 1].rate}%
          </div>
          <div className="text-xs text-gray-500">Taux global</div>
        </div>
      </div>
    </Card>
  );
};

// Funnel prédéfini pour exposants
export const ExhibitorConversionFunnel: React.FC<{
  miniSiteViews: number;
  appointmentRequests: number;
  appointmentsConfirmed: number;
}> = ({ miniSiteViews, appointmentRequests, appointmentsConfirmed }) => {
  const stages: FunnelStage[] = [
    { stage: 'Vues Mini-Site', count: miniSiteViews, color: '#3b82f6' },
    { stage: 'Demandes RDV', count: appointmentRequests, color: '#f59e0b' },
    { stage: 'RDV Confirmés', count: appointmentsConfirmed, color: '#10b981' }
  ];

  return <ConversionFunnel stages={stages} title="Performance Commerciale" />;
};

// Funnel prédéfini pour visiteurs
export const VisitorEngagementFunnel: React.FC<{
  exhibitorsViewed: number;
  exhibitorsBookmarked: number;
  appointmentsSent: number;
  appointmentsConfirmed: number;
}> = ({ exhibitorsViewed, exhibitorsBookmarked, appointmentsSent, appointmentsConfirmed }) => {
  const stages: FunnelStage[] = [
    { stage: 'Exposants Consultés', count: exhibitorsViewed, color: '#3b82f6' },
    { stage: 'Mis en Favoris', count: exhibitorsBookmarked, color: '#8b5cf6' },
    { stage: 'Demandes RDV Envoyées', count: appointmentsSent, color: '#f59e0b' },
    { stage: 'RDV Confirmés', count: appointmentsConfirmed, color: '#10b981' }
  ];

  return <ConversionFunnel stages={stages} title="Engagement Visiteur" />;
};

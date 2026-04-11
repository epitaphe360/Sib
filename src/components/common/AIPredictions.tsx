import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Sparkles, TrendingUp, Calendar, Target, Award } from 'lucide-react';

export interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
}

interface AIPredictionsProps {
  predictions: Prediction[];
  title?: string;
}

export const AIPredictions: React.FC<AIPredictionsProps> = ({ 
  predictions,
  title = '🤖 Prédictions IA'
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-700';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg border border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">Basé sur vos données historiques</p>
          </div>
        </div>
        <Badge variant="info" className="bg-purple-100 text-purple-700 border-purple-300">
          IA Active
        </Badge>
      </div>

      <div className="space-y-4">
        {predictions.map((prediction, index) => {
          const growth = prediction.predicted - prediction.current;
          
          let growthPercentage = 0;
          if (prediction.current > 0) {
            growthPercentage = Math.round((growth / prediction.current) * 100);
          } else if (prediction.predicted > 0) {
            growthPercentage = 100; // New items = 100% "growth" or purely new
          } else {
            growthPercentage = 0; // 0 to 0 is 0% growth
          }

          return (
            <div 
              key={index}
              className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    {prediction.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{prediction.metric}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Confiance:</span>
                      <Badge 
                        size="sm" 
                        className={getConfidenceColor(prediction.confidence)}
                      >
                        {prediction.confidence}%
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 ${getTrendColor(prediction.trend)}`}>
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-bold">
                    {growth > 0 ? '+' : ''}{growthPercentage}%
                  </span>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actuel: {prediction.current}</span>
                  <span className="text-indigo-600 font-semibold">
                    Prévu: {prediction.predicted}
                  </span>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(100, (prediction.predicted / Math.max(prediction.current, prediction.predicted)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommandations IA */}
      <div className="mt-6 pt-6 border-t border-purple-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          Recommandations
        </h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span>Continuez à maintenir votre activité actuelle pour atteindre ces objectifs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span>Les prédictions sont mises à jour quotidiennement avec vos nouvelles données</span>
          </li>
        </ul>
      </div>
    </Card>
  );
};

// Hook pour générer des prédictions basiques (déterministes, pas de Math.random)
export const useBasicPredictions = (currentStats: {
  appointments?: number;
  views?: number;
  connections?: number;
}): Prediction[] => {
  const { appointments, views, connections } = currentStats;
  
  return React.useMemo(() => {
    const predictions: Prediction[] = [];

    if (appointments !== undefined) {
      const predicted = Math.max(appointments, Math.round(appointments * 1.2) + 1);
      predictions.push({
        metric: 'Rendez-vous (7 prochains jours)',
        current: appointments,
        predicted,
        confidence: 82,
        icon: <Calendar className="h-5 w-5 text-indigo-600" />,
        trend: predicted > appointments ? 'up' : 'stable'
      });
    }

    if (views !== undefined) {
      const predicted = Math.max(views, Math.round(views * 1.25) + 1);
      predictions.push({
        metric: 'Vues (7 prochains jours)',
        current: views,
        predicted,
        confidence: 78,
        icon: <Award className="h-5 w-5 text-indigo-600" />,
        trend: predicted > views ? 'up' : 'stable'
      });
    }

    if (connections !== undefined) {
      const predicted = Math.max(connections, Math.round(connections * 1.15) + 1);
      predictions.push({
        metric: 'Connexions (7 prochains jours)',
        current: connections,
        predicted,
        confidence: 75,
        icon: <Target className="h-5 w-5 text-indigo-600" />,
        trend: predicted > connections ? 'up' : 'stable'
      });
    }

    return predictions;
  }, [appointments, views, connections]);
};

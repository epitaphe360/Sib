import React from 'react';
import { motion } from 'framer-motion';
import { Check, Building2, TrendingUp, Crown, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EXHIBITOR_QUOTAS, ExhibitorLevel, getExhibitorQuotaConfig } from '../../config/exhibitorQuotas';

interface SubscriptionSelectorProps {
  selectedLevel?: ExhibitorLevel;
  onSelect: (level: ExhibitorLevel, area: number, price: number) => void;
}

export const SubscriptionSelector: React.FC<SubscriptionSelectorProps> = ({
  selectedLevel,
  onSelect
}) => {
  const levels = [
    {
      id: 'basic_9' as ExhibitorLevel,
      icon: Building2,
      color: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-300',
      popular: false
    },
    {
      id: 'standard_18' as ExhibitorLevel,
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-600',
      borderColor: 'border-blue-300',
      popular: true
    },
    {
      id: 'premium_36' as ExhibitorLevel,
      icon: Crown,
      color: 'from-orange-400 to-orange-600',
      borderColor: 'border-orange-300',
      popular: false
    },
    {
      id: 'elite_54plus' as ExhibitorLevel,
      icon: Sparkles,
      color: 'from-purple-400 to-purple-600',
      borderColor: 'border-purple-300',
      popular: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez votre abonnement exposant
        </h3>
        <p className="text-gray-600">
          Sélectionnez la surface de stand qui correspond à vos besoins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {levels.map((level, index) => {
          const config = getExhibitorQuotaConfig(level.id);
          const isSelected = selectedLevel === level.id;
          const Icon = level.icon;

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              {level.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="default" className="bg-blue-600 text-white px-4 py-1">
                    ⭐ Populaire
                  </Badge>
                </div>
              )}

              <Card
                data-testid={`subscription-card-${level.id}`}
                className={`
                  relative h-full cursor-pointer transition-all duration-300
                  ${isSelected
                    ? `ring-4 ring-blue-500 ${level.borderColor} scale-105`
                    : 'hover:scale-102 hover:shadow-xl'
                  }
                  ${level.popular ? 'border-2 border-blue-400' : ''}
                `}
                onClick={() => onSelect(level.id, config.maxArea || 54, config.estimatedPrice)}
              >
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="text-center">
                    <div className={`
                      inline-flex items-center justify-center w-16 h-16 rounded-full
                      bg-gradient-to-br ${level.color} mb-4
                    `}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 mb-2" data-testid={`subscription-name-${level.id}`}>
                      {config.displayName}
                    </h4>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-siports-primary" data-testid={`subscription-price-${level.id}`}>
                          Sur devis
                        </span>
                      </div>
                      <p className="text-sm text-gray-500" data-testid={`subscription-area-${level.id}`}>
                        {config.minArea === 0 ? 'Jusqu\'à' : 'À partir de'} {config.maxArea || '54+'}m²
                      </p>
                    </div>
                  </div>

                  {/* Quotas principaux */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {config.quotas.appointments === 0 ? (
                            <span className="text-red-600">❌ Aucun RDV B2B</span>
                          ) : config.quotas.appointments === -1 ? (
                            <span className="text-green-600">🎯 RDV B2B illimités</span>
                          ) : (
                            <span>{config.quotas.appointments} RDV B2B max</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {config.quotas.teamMembers} badges exposant
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {config.quotas.demoSessions === -1
                            ? 'Démos illimitées'
                            : `${config.quotas.demoSessions} sessions démo`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {config.quotas.leadScans === -1
                            ? 'Scans badges illimités'
                            : `${config.quotas.leadScans} scans/jour`
                          }
                        </p>
                      </div>
                    </div>

                    {config.quotas.meetingRoomHours > 0 && (
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            {config.quotas.meetingRoomHours === -1
                              ? 'Salle réunion dédiée'
                              : `${config.quotas.meetingRoomHours}h salle réunion`
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {config.quotas.liveStreaming && (
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            Live streaming autorisé
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 bg-blue-600 rounded-full p-2"
                    >
                      <Check className="h-5 w-5 text-white" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info complémentaires */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="bg-blue-600 rounded-full p-2">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">
              💡 Informations importantes
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les prix affichés sont estimatifs et peuvent varier selon l'emplacement</li>
              <li>• Stand Basic (9m²) : <strong className="text-red-600">Aucun RDV B2B inclus</strong> (montée de gamme recommandée)</li>
              <li>• Tous les stands incluent : WiFi, électricité, mobilier de base, listing annuaire</li>
              <li>• Le paiement se fait par virement bancaire après validation de votre inscription</li>
              <li>• Accès au tableau de bord après validation du paiement par notre équipe</li>
            </ul>
          </div>
        </div>
      </div>

      {selectedLevel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-green-800">
            <Check className="h-5 w-5 text-green-600" />
            <p className="font-medium">
              Abonnement sélectionné : {getExhibitorQuotaConfig(selectedLevel).displayName}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

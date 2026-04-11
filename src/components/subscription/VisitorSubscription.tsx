import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface VisitorSubscriptionProps {
  currentLevel: string;
  onUpgrade: (level: string) => void;
}

export default function VisitorSubscription({ currentLevel, onUpgrade }: VisitorSubscriptionProps) {
  const { t } = useTranslation();

  const features = {
    free: ['Accès au salon', 'Liste des exposants', 'Plan du salon'],
    vip: ['Accès VIP Lounge', 'Rencontres exclusives', 'Badge VIP', 'Conciergerie', 'Parking réservé', '10 Rendez-vous B2B', 'Soirée Gala', 'Déjeuners Networking']
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mon Abonnement</h2>
        <Badge variant={currentLevel === 'vip' ? 'destructive' : 'secondary'}>
          {currentLevel.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE */}
        <Card className={`p-6 border-2 ${currentLevel === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-blue-500" />
            <h3 className="font-bold text-lg">Gratuit</h3>
          </div>
          <ul className="space-y-2 mb-6">
            {features.free.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" /> {f}
              </li>
            ))}
          </ul>
          {currentLevel === 'free' ? (
            <Button disabled className="w-full">Actuel</Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>Inclus</Button>
          )}
        </Card>

        {/* VIP */}
        <Card className={`p-6 border-2 ${currentLevel === 'vip' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h3 className="font-bold text-lg">VIP</h3>
          </div>
          <ul className="space-y-2 mb-6">
            {features.vip.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" /> {f}
              </li>
            ))}
          </ul>
          {currentLevel === 'vip' ? (
            <Button disabled className="w-full">Actuel</Button>
          ) : (
            <Button onClick={() => onUpgrade('vip')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
              Devenir VIP
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}

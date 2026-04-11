import React, { useEffect, useCallback, memo } from 'react';
import { useNetworkingStore } from '@/store/networkingStore';
import { Card } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loader2, UserX, WifiOff } from 'lucide-react';
import useAuthStore from '@/store/authStore';

// OPTIMIZATION: Memoized RecommendationList to prevent unnecessary re-renders
const RecommendationList: React.FC = memo(() => {
  const { user } = useAuthStore();
  const { recommendations, isLoading, error, fetchRecommendations, markAsContacted } = useNetworkingStore();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user, fetchRecommendations]);

  // OPTIMIZATION: Memoized callback
  const handleMarkAsContacted = useCallback((userId: string) => {
    markAsContacted(userId);
  }, [markAsContacted]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Génération des recommandations IA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-destructive">
        <WifiOff className="h-12 w-12" />
        <p className="mt-4 text-lg text-center">Impossible de charger les recommandations.</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => fetchRecommendations()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <UserX className="h-12 w-12" />
        <p className="mt-4 text-lg text-center">Aucune recommandation disponible pour le moment.</p>
        <p className="text-sm">Revenez plus tard pour de nouvelles opportunités de réseautage.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recommendations.map(rec => (
        <Card key={rec.recommendedUserId} className="flex flex-col" padding="none">
          <div className="p-6 flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={rec.recommendedUser?.profile?.avatar} alt={rec.recommendedUser?.name || ''} />
              <AvatarFallback>{rec.recommendedUser?.name?.substring(0, 2)?.toUpperCase() || 'UN'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{rec.recommendedUser?.name || 'Utilisateur'}</h3>
              <p className="text-sm text-muted-foreground">{rec.recommendedUser?.profile?.company || ''}</p>
              <Badge variant="default" className="mt-1">{rec.recommendedUser?.type || 'visitor'}</Badge>
            </div>
          </div>
          <div className="p-6 pt-0 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm mb-4">{rec.recommendedUser?.profile?.bio || ''}</p>
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Principales raisons de se connecter :</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {rec.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-primary">Score de compatibilité :</span>
                <span className="text-lg font-bold text-primary">{rec.score.toFixed(0)}%</span>
              </div>
              <Button
                className="w-full"
                onClick={() => handleMarkAsContacted(rec.recommendedUserId)}
                disabled={rec.contacted}
              >
                {rec.contacted ? 'Contacté' : 'Initier le contact'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
});

export default RecommendationList;

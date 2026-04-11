import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';

interface VisitorLevelGuardProps {
  children: React.ReactNode;
  requiredLevel?: 'premium' | 'vip';
  fallbackRoute?: string;
  showToast?: boolean;
}

/**
 * Guard component that protects routes based on visitor level
 * FREE visitors are redirected to badge page only
 * Only PREMIUM/VIP visitors can access dashboard and features
 */
export function VisitorLevelGuard({
  children,
  requiredLevel = 'premium',
  fallbackRoute = ROUTES.BADGE,
  showToast = true
}: VisitorLevelGuardProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Si c'est un visiteur
    if (user.type === 'visitor') {
      const visitorLevel = user.visitor_level || 'free';

      // Si le niveau requis n'est pas atteint
      if (visitorLevel === 'free' && requiredLevel) {
        if (showToast) {
          toast.error(
            'Accès réservé aux Pass Premium VIP',
            {
              description: 'Passez au Pass Premium pour accéder à toutes les fonctionnalités du salon.',
              duration: 5000,
              action: {
                label: 'Voir les offres',
                onClick: () => navigate(ROUTES.VISITOR_SUBSCRIPTION)
              }
            }
          );
        }
        navigate(fallbackRoute, { replace: true });
      }
    }
  }, [user, requiredLevel, fallbackRoute, showToast, navigate]);

  // Si c'est un visiteur FREE, ne rien afficher (redirection en cours)
  if (user?.type === 'visitor' && (user.visitor_level === 'free' || !user.visitor_level)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to check if current user is a FREE visitor
 */
export function useIsFreeVisitor(): boolean {
  const { user } = useAuthStore();
  return user?.type === 'visitor' && (user.visitor_level === 'free' || !user.visitor_level);
}

/**
 * Hook to check if current user is a VIP visitor
 */
export function useIsVipVisitor(): boolean {
  const { user } = useAuthStore();
  return user?.type === 'visitor' && (user.visitor_level === 'premium' || user.visitor_level === 'vip');
}

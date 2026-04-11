import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { PartnerTier, PartnerTierConfig, comparePartnerTiers, getPartnerTierConfig, hasPartnerAccess } from '../../config/partnerTiers';

interface PartnerTierGuardProps {
  children: ReactNode;
  requiredTier?: PartnerTier;
  minimumTier?: PartnerTier;
  quotaType?: string;
  fallbackRoute?: string;
  showToast?: boolean;
  customMessage?: string;
}

/**
 * Guard pour protéger les routes selon le niveau partenaire
 *
 * Utilisation:
 * - requiredTier: Niveau exact requis
 * - minimumTier: Niveau minimum requis (ex: silver ou supérieur)
 *
 * @example
 * // Require exact tier
 * <PartnerTierGuard requiredTier="platinum">
 *   <platinumOnlyFeature />
 * </PartnerTierGuard>
 *
 * @example
 * // Require minimum tier (silver, gold, or platinum)
 * <PartnerTierGuard minimumTier="silver">
 *   <PremiumFeature />
 * </PartnerTierGuard>
 */
export function PartnerTierGuard({
  children,
  requiredTier,
  minimumTier,
  quotaType,
  fallbackRoute = ROUTES.PARTNER_DASHBOARD,
  showToast = true,
  customMessage
}: PartnerTierGuardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      if (showToast) {
        toast.error('Accès refusé', {
          description: 'Vous devez être connecté pour accéder à cette page.'
        });
      }
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    // Vérifier que l'utilisateur est un partenaire
    if (user.type !== 'partner') {
      if (showToast) {
        toast.error('Accès refusé', {
          description: 'Cette page est réservée aux partenaires.'
        });
      }
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
      return;
    }

    // Récupérer le niveau partenaire (depuis le profil ou la base de données)
    const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'museum') as PartnerTier;

    // Vérification du niveau requis exact
    if (requiredTier && partnerTier !== requiredTier) {
      const requiredConfig = getPartnerTierConfig(requiredTier);

      if (showToast) {
        toast.error('Accès réservé', {
          description: customMessage || `Cette fonctionnalité est réservée aux partenaires ${requiredConfig.displayName}.`,
          action: {
            label: 'Voir les offres',
            onClick: () => navigate(ROUTES.PARTNER_PROFILE)
          }
        });
      }
      navigate(fallbackRoute, { replace: true });
      return;
    }

    // Vérification du niveau minimum
    if (minimumTier) {
      const comparison = comparePartnerTiers(partnerTier, minimumTier);

      // Si le niveau actuel est inférieur au minimum requis
      if (comparison < 0) {
        const minimumConfig = getPartnerTierConfig(minimumTier);

        if (showToast) {
          toast.error('Accès réservé', {
            description: customMessage || `Cette fonctionnalité nécessite au minimum le niveau ${minimumConfig.displayName}.`,
            action: {
              label: 'Upgrader',
              onClick: () => navigate(ROUTES.PARTNER_PROFILE)
            }
          });
        }
        navigate(fallbackRoute, { replace: true });
        return;
      }
    }

    // Vérification de quota spécifique (si fourni)
    if (quotaType && user.type === 'partner') {
      const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'museum') as PartnerTier;

      // Vérifier si le tier a accès à ce quota
      const hasAccess = hasPartnerAccess(partnerTier, quotaType as keyof PartnerTierConfig['quotas']);

      if (!hasAccess) {
        toast({
          title: 'Accès restreint',
          description: customMessage || `Votre niveau ${partnerTier} n'a pas accès à cette fonctionnalité. Veuillez upgrader votre compte.`,
          variant: 'destructive',
          action: {
            label: 'Upgrader',
            onClick: () => navigate(ROUTES.PARTNER_PROFILE)
          }
        });
        navigate(fallbackRoute, { replace: true });
        return;
      }

      // Note: La vérification de l'utilisation actuelle vs quota max
      // nécessite une requête DB et sera implémentée au niveau du composant
      // qui utilise PartnerTierGuard, pas ici pour éviter les requêtes multiples
    }
  }, [user, requiredTier, minimumTier, quotaType, fallbackRoute, showToast, customMessage, navigate]);

  // Si toutes les vérifications passent, afficher le contenu
  if (!user || user.type !== 'partner') {
    return null;
  }

  if (requiredTier) {
    const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'museum') as PartnerTier;
    if (partnerTier !== requiredTier) {
      return null;
    }
  }

  if (minimumTier) {
    const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'museum') as PartnerTier;
    const comparison = comparePartnerTiers(partnerTier, minimumTier);
    if (comparison < 0) {
      return null;
    }
  }

  return <>{children}</>;
}

/**
 * Hook pour vérifier le niveau partenaire
 */
export function usePartnerTier() {
  const { user } = useAuthStore();

  if (!user || user.type !== 'partner') {
    return null;
  }

  return (user.partner_tier || user.profile?.partner_tier || 'museum') as PartnerTier;
}

/**
 * Hook pour vérifier l'accès à une fonctionnalité
 */
export function usePartnerAccess(minimumTier?: PartnerTier, requiredTier?: PartnerTier): boolean {
  const currentTier = usePartnerTier();

  if (!currentTier) return false;

  if (requiredTier) {
    return currentTier === requiredTier;
  }

  if (minimumTier) {
    return comparePartnerTiers(currentTier, minimumTier) >= 0;
  }

  return true;
}

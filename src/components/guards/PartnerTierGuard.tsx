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
 * Guard pour prot�ger les routes selon le niveau partenaire
 *
 * Utilisation:
 * - requiredTier: Niveau exact requis
 * - minimumTier: Niveau minimum requis (ex: silver ou sup�rieur)
 *
 * @example
 * // Require exact tier
 * <PartnerTierGuard requiredTier="official_sponsor">
 *   <OfficialSponsorOnlyFeature />
 * </PartnerTierGuard>
 *
 * @example
 * // Require minimum tier (silver, gold, or official_sponsor)
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
    // V�rifier que l'utilisateur est connect�
    if (!user) {
      if (showToast) {
        toast.error('Acc�s refus�', {
          description: 'Vous devez �tre connect� pour acc�der � cette page.'
        });
      }
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    // V�rifier que l'utilisateur est un partenaire
    if (user.type !== 'partner') {
      if (showToast) {
        toast.error('Acc�s refus�', {
          description: 'Cette page est r�serv�e aux partenaires.'
        });
      }
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
      return;
    }

    // R�cup�rer le niveau partenaire (depuis le profil ou la base de donn�es)
    const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'partner') as PartnerTier;

    // V�rification du niveau requis exact
    if (requiredTier && partnerTier !== requiredTier) {
      const requiredConfig = getPartnerTierConfig(requiredTier);

      if (showToast) {
        toast.error('Acc�s r�serv�', {
          description: customMessage || `Cette fonctionnalit� est r�serv�e aux partenaires ${requiredConfig.displayName}.`,
          action: {
            label: 'Voir les offres',
            onClick: () => navigate(ROUTES.PARTNER_PROFILE)
          }
        });
      }
      navigate(fallbackRoute, { replace: true });
      return;
    }

    // V�rification du niveau minimum
    if (minimumTier) {
      const comparison = comparePartnerTiers(partnerTier, minimumTier);

      // Si le niveau actuel est inf�rieur au minimum requis
      if (comparison < 0) {
        const minimumConfig = getPartnerTierConfig(minimumTier);

        if (showToast) {
          toast.error('Acc�s r�serv�', {
            description: customMessage || `Cette fonctionnalit� n�cessite au minimum le niveau ${minimumConfig.displayName}.`,
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

    // V�rification de quota sp�cifique (si fourni)
    if (quotaType && user.type === 'partner') {
      const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'partner') as PartnerTier;

      // V�rifier si le tier a acc�s � ce quota
      const hasAccess = hasPartnerAccess(partnerTier, quotaType as keyof PartnerTierConfig['quotas']);

      if (!hasAccess) {
        toast({
          title: 'Acc�s restreint',
          description: customMessage || `Votre niveau ${partnerTier} n'a pas acc�s � cette fonctionnalit�. Veuillez upgrader votre compte.`,
          variant: 'destructive',
          action: {
            label: 'Upgrader',
            onClick: () => navigate(ROUTES.PARTNER_PROFILE)
          }
        });
        navigate(fallbackRoute, { replace: true });
        return;
      }

      // Note: La v�rification de l'utilisation actuelle vs quota max
      // n�cessite une requ�te DB et sera impl�ment�e au niveau du composant
      // qui utilise PartnerTierGuard, pas ici pour �viter les requ�tes multiples
    }
  }, [user, requiredTier, minimumTier, quotaType, fallbackRoute, showToast, customMessage, navigate]);

  // Si toutes les v�rifications passent, afficher le contenu
  if (!user || user.type !== 'partner') {
    return null;
  }

  if (requiredTier) {
    const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'partner') as PartnerTier;
    if (partnerTier !== requiredTier) {
      return null;
    }
  }

  if (minimumTier) {
    const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'partner') as PartnerTier;
    const comparison = comparePartnerTiers(partnerTier, minimumTier);
    if (comparison < 0) {
      return null;
    }
  }

  return <>{children}</>;
}

/**
 * Hook pour v�rifier le niveau partenaire
 */
export function usePartnerTier() {
  const { user } = useAuthStore();

  if (!user || user.type !== 'partner') {
    return null;
  }

  return (user.partner_tier || user.profile?.partner_tier || 'partner') as PartnerTier;
}

/**
 * Hook pour v�rifier l'acc�s � une fonctionnalit�
 */
export function usePartnerAccess(minimumTier?: PartnerTier, requiredTier?: PartnerTier): boolean {
  const currentTier = usePartnerTier();

  if (!currentTier) {return false;}

  if (requiredTier) {
    return currentTier === requiredTier;
  }

  if (minimumTier) {
    return comparePartnerTiers(currentTier, minimumTier) >= 0;
  }

  return true;
}


import { useMemo } from 'react';
import useAuthStore from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { getVisitorQuota, calculateRemainingQuota } from '../config/quotas';

interface VisitorQuotaInfo {
  level: string;
  total: number;
  used: number;
  remaining: number;
  canBook: boolean;
}

/**
 * Hook personnalisé pour gérer les quotas de rendez-vous des visiteurs
 * Centralise la logique de calcul des quotas selon le niveau du visiteur
 */
export const useVisitorQuota = (): VisitorQuotaInfo => {
  const { user } = useAuthStore();
  const { appointments } = useAppointmentStore();

  return useMemo(() => {
    const level = user?.visitor_level || 'free';
    const total = getVisitorQuota(level);

    // Compter TOUS les rendez-vous actifs (pending + confirmed) pour éviter contournement du quota
    const used = appointments.filter(
      (a) => a.visitorId === user?.id && (a.status === 'confirmed' || a.status === 'pending')
    ).length;

    const remaining = calculateRemainingQuota(level, used);
    const canBook = remaining > 0;

    return {
      level,
      total,
      used,
      remaining,
      canBook
    };
  }, [user?.id, user?.visitor_level, appointments]);
};

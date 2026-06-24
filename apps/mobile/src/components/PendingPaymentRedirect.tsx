import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resolveVipPaymentRedirectId } from '../services/payment';

/** Visiteur VIP en attente de paiement → page paiement au lieu de l'accueil. */
export function PendingPaymentRedirect() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.status !== 'pending_payment') return;
    let cancelled = false;
    void resolveVipPaymentRedirectId(user.id).then((id) => {
      if (!cancelled && id) router.replace(`/payment/${id}` as never);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.status]);

  return null;
}

import { useEffect, useState } from 'react';
import { formatVisitorAmount } from '../config/visitorBankTransferConfig';
import { fetchVipPassPricing, VipPassPricing } from '../services/visitorLevelService';

export function useVisitorPassPricing() {
  const [pricing, setPricing] = useState<VipPassPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchVipPassPricing()
      .then((p) => {
        if (!cancelled) {
          setPricing(p);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Impossible de charger le tarif VIP');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    pricing,
    loading,
    error,
    price: pricing?.price ?? null,
    formattedPrice: pricing ? formatVisitorAmount(pricing.price, pricing.currency) : null,
  };
}

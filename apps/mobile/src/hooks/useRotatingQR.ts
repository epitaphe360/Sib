import { useCallback, useEffect, useState } from 'react';
import { generateSecureQRCode } from '../api/qr';
import { loadCachedQR, saveCachedQR } from '../lib/badgeCache';

const ROTATION_MS = 30_000;

export function useRotatingQR(userId: string | undefined) {
  const [qrValue, setQrValue] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const { qrData, expiresAt: exp } = await generateSecureQRCode(userId);
      setQrValue(qrData);
      setExpiresAt(exp);
      setError(null);
      setUsingCache(false);
      await saveCachedQR(qrData, exp);
    } catch (e) {
      const cached = await loadCachedQR();
      if (cached?.qrData) {
        setQrValue(cached.qrData);
        setExpiresAt(new Date(cached.expiresAt));
        setUsingCache(true);
        setError('Mode hors ligne — QR en cache');
      } else {
        setError(e instanceof Error ? e.message : 'Erreur QR');
      }
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, ROTATION_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { qrValue, expiresAt, error, refresh, usingCache };
}

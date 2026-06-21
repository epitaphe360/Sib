import { useCallback, useEffect, useRef, useState } from 'react';
import { buildStaticParticipantQR } from '../api/badgeLookup';
import { generateSecureQRCode } from '../api/qr';
import { loadCachedQR, saveCachedQR } from '../lib/badgeCache';
import type { UserBadge } from '../types';

const ROTATION_MS = 30_000;

export function useRotatingQR(userId: string | undefined, badge?: UserBadge | null) {
  const [qrValue, setQrValue] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const cancelledRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const { qrData, expiresAt: exp } = await generateSecureQRCode(userId);
      if (cancelledRef.current) return;
      setQrValue(qrData);
      setExpiresAt(exp);
      setError(null);
      setUsingCache(false);
      await saveCachedQR(qrData, exp);
    } catch (e) {
      if (cancelledRef.current) return;
      const cached = await loadCachedQR();
      if (cancelledRef.current) return;
      const stillValid = cached?.qrData && new Date(cached.expiresAt).getTime() > Date.now();
      if (stillValid) {
        setQrValue(cached.qrData);
        setExpiresAt(new Date(cached.expiresAt));
        setUsingCache(true);
        setError('Mode hors ligne — QR en cache');
      } else if (badge) {
        setQrValue(buildStaticParticipantQR(badge));
        setExpiresAt(null);
        setUsingCache(false);
        setError(e instanceof Error ? e.message : 'Erreur QR');
      } else {
        setUsingCache(false);
        setError(e instanceof Error ? e.message : 'Erreur QR');
      }
    }
  }, [userId, badge]);

  useEffect(() => {
    cancelledRef.current = false;
    refresh();
    const id = setInterval(refresh, ROTATION_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [refresh]);

  return { qrValue, expiresAt, error, refresh, usingCache };
}

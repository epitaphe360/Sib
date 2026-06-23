import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerForPushNotifications, subscribeToUserEvents } from '../services/push';

export function usePushNotifications() {
  const { user } = useAuth();
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    registerForPushNotifications(user.id).catch(() => {
      // Permissions refusées ou simulateur
    });

    subscribeToUserEvents(user.id, user.type)
      .then((unsubscribe) => {
        if (cancelled) {
          unsubscribe();
        } else {
          cleanupRef.current = unsubscribe;
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = undefined;
    };
  }, [user?.id, user?.type]);
}

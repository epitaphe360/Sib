import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerForPushNotifications, subscribeToUserEvents } from '../services/push';

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    registerForPushNotifications(user.id).catch(() => {
      // Permissions refusées ou simulateur
    });
    const unsubscribe = subscribeToUserEvents(user.id, user.type);
    return unsubscribe;
  }, [user?.id, user?.type]);
}
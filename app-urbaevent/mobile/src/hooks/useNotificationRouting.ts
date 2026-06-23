import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoleGroup } from '../navigation/roleConfig';
import type { UserType } from '../types';

function routeFromNotification(
  data: Record<string, unknown> | undefined,
  userType: UserType | string | undefined
) {
  if (!data?.screen) return;
  const screen = String(data.screen);
  const group = getRoleGroup(userType);

  switch (screen) {
    case 'appointments':
      if (group === 'exhibitor') {
        router.push('/(exhibitor)/(tabs)/appointments' as never);
      } else if (group === 'staff') {
        router.push('/(staff)/(tabs)' as never);
      } else {
        router.push('/(visitor)/appointments' as never);
      }
      break;
    case 'messages':
      if (group === 'exhibitor') {
        router.push('/(exhibitor)/(tabs)/messages' as never);
      } else {
        router.push('/(visitor)/messages' as never);
      }
      if (data.conversationId) {
        const id = String(data.conversationId);
        if (group === 'exhibitor') {
          router.push(`/(exhibitor)/messages/${id}` as never);
        } else {
          router.push(`/(visitor)/messages/${id}` as never);
        }
      }
      break;
    case 'networking':
      if (group === 'visitor') {
        router.push('/(visitor)/networking' as never);
      }
      break;
    case 'scanner':
      if (group === 'staff') {
        router.push('/(staff)/scanner' as never);
      }
      break;
    case 'payments':
      if (group === 'staff') {
        router.push('/(staff)/payments' as never);
      }
      break;
    case 'badge':
      if (group === 'exhibitor') {
        router.push('/(exhibitor)/(tabs)/badge' as never);
      } else if (group === 'service_client') {
        router.push('/(service-client)/(tabs)' as never);
      } else {
        router.push('/(visitor)/(tabs)/badge' as never);
      }
      break;
    default:
      break;
  }
}

export function useNotificationRouting() {
  const { user } = useAuth();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      routeFromNotification(data, user?.type);
    });
    return () => sub.remove();
  }, [user?.type]);

  useEffect(() => {
    if (!user) return;
    const group = getRoleGroup(user.type);
    if (group === 'staff' && user.type === 'security') {
      Notifications.setBadgeCountAsync(0).catch(() => undefined);
    }
  }, [user]);
}

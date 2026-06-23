import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { PLATFORM } from '../config/platform';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function sendServerPush(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  try {
    await supabase.functions.invoke('send-expo-push', {
      body: { userId, title, body, data },
    });
  } catch {
    /* fallback local si push serveur indisponible */
  }
}

async function showLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null,
  });
}

async function notifyUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  await sendServerPush(userId, title, body, data);
  await showLocalNotification(title, body, data);
}

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: PLATFORM.name,
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  if (!projectId || projectId === 'REPLACE_AFTER_eas_init') {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenData.data;

  await supabase.from('notifications_devices').upsert(
    {
      user_id: userId,
      device_token: token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      browser_name: PLATFORM.scannerDevice,
      updated_at: new Date().toISOString(),
      is_active: true,
    },
    { onConflict: 'user_id,device_token' },
  );

  return token;
}

let activeChannel: RealtimeChannel | null = null;

/** Écoute Supabase realtime + push serveur Expo (FCM/APNs via Expo Push API). */
export async function subscribeToUserEvents(userId: string, userType: string): Promise<() => void> {
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }

  let exhibitorTableId: string | null = null;
  if (userType === 'exhibitor') {
    const { data } = await supabase.from('exhibitors').select('id').eq('user_id', userId).maybeSingle();
    exhibitorTableId = (data?.id as string) ?? null;
  }

  const channel = supabase.channel(`mobile-events-${userId}`);

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'appointments', filter: `visitor_id=eq.${userId}` },
    () => notifyUser(userId, 'Nouveau RDV', 'Un rendez-vous a été créé ou mis à jour', { screen: 'appointments' }),
  );

  channel.on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'appointments', filter: `visitor_id=eq.${userId}` },
    (payload) => {
      const status = (payload.new as { status?: string }).status;
      if (status === 'confirmed') {
        notifyUser(userId, 'RDV confirmé', 'Votre rendez-vous a été accepté', { screen: 'appointments' });
      }
    },
  );

  if (userType === 'exhibitor' && exhibitorTableId) {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'appointments' },
      (payload) => {
        const row = payload.new as { exhibitor_id?: string; status?: string };
        if (row.exhibitor_id === exhibitorTableId) {
          notifyUser(userId, 'Demande de RDV', 'Un visiteur souhaite un rendez-vous');
        }
      },
    );
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'exhibitor_leads', filter: `exhibitor_user_id=eq.${userId}` },
      () => notifyUser(userId, 'Nouveau contact', 'Badge scanné au stand'),
    );
  }

  if (userType === 'visitor') {
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'payment_requests', filter: `user_id=eq.${userId}` },
      (payload) => {
        const row = payload.new as { status?: string };
        if (row.status === 'approved') {
          notifyUser(userId, 'Pass VIP activé', 'Votre paiement a été validé', { screen: 'badge' });
        }
      },
    );
  }

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'connections', filter: `addressee_id=eq.${userId}` },
    () => notifyUser(userId, 'Réseautage', 'Nouvelle demande de connexion', { screen: 'networking' }),
  );

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
    (payload) => {
      const row = payload.new as { content?: string; conversation_id?: string };
      notifyUser(userId, 'Nouveau message', (row.content ?? '').slice(0, 80), {
        screen: 'messages',
        conversationId: row.conversation_id,
      });
    },
  );

  if (userType === 'admin') {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'payment_requests', filter: 'status=eq.pending' },
      () => notifyUser(userId, 'Paiement VIP', 'Nouvelle demande de validation en attente'),
    );
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'registration_requests' },
      () => notifyUser(userId, 'Inscription', 'Nouvelle demande en attente de validation'),
    );
  }

  channel.subscribe();
  activeChannel = channel;

  return () => {
    supabase.removeChannel(channel);
    if (activeChannel === channel) activeChannel = null;
  };
}

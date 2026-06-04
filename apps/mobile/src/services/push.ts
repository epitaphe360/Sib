import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
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

async function showLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null,
  });
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
      name: 'UrbaEvent',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const tokenData = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  await supabase.from('notifications_devices').upsert(
    {
      user_id: userId,
      device_token: token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      browser_name: 'UrbaEvent Mobile',
      updated_at: new Date().toISOString(),
      is_active: true,
    },
    { onConflict: 'user_id,device_token' }
  );

  return token;
}

let activeChannel: RealtimeChannel | null = null;

/** Écoute Supabase realtime pour RDV, messages et paiements VIP (MVP salon). */
export function subscribeToUserEvents(userId: string, userType: string): () => void {
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }

  const channel = supabase.channel(`mobile-events-${userId}`);

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'appointments', filter: `visitor_id=eq.${userId}` },
    () => showLocalNotification('Nouveau RDV', 'Un rendez-vous a été créé ou mis à jour')
  );

  channel.on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'appointments', filter: `visitor_id=eq.${userId}` },
    (payload) => {
      const status = (payload.new as { status?: string }).status;
      if (status === 'confirmed') {
        showLocalNotification('RDV confirmé', 'Votre rendez-vous a été accepté');
      }
    }
  );

  if (userType === 'exhibitor') {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'appointments' },
      (payload) => {
        const row = payload.new as { exhibitor_id?: string; status?: string };
        if (row.exhibitor_id === userId) {
          showLocalNotification('Demande de RDV', 'Un visiteur souhaite un rendez-vous');
        }
      }
    );
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'exhibitor_leads', filter: `exhibitor_user_id=eq.${userId}` },
      () => showLocalNotification('Nouveau contact', 'Badge scanné au stand')
    );
  }

  if (userType === 'visitor') {
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'payment_requests', filter: `user_id=eq.${userId}` },
      (payload) => {
        const row = payload.new as { status?: string };
        if (row.status === 'approved') {
          showLocalNotification('Pass VIP activé', 'Votre paiement a été validé');
        }
      }
    );
  }

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'connections', filter: `to_user_id=eq.${userId}` },
    () => showLocalNotification('Réseautage', 'Nouvelle demande de connexion')
  );

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
    (payload) => {
      const content = (payload.new as { content?: string }).content ?? '';
      showLocalNotification('Nouveau message', content.slice(0, 80));
    }
  );

  if (userType === 'admin') {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'payment_requests', filter: 'status=eq.pending' },
      () => showLocalNotification('Paiement VIP', 'Nouvelle demande de validation en attente')
    );
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'registration_requests' },
      () => showLocalNotification('Inscription', 'Nouvelle demande en attente de validation')
    );
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'payment_requests' },
      (payload) => {
        const row = payload.new as { user_id?: string; status?: string };
        if (row.user_id === userId && row.status === 'approved') {
          showLocalNotification('Pass VIP activé', 'Votre paiement a été validé');
        }
      }
    );
  }

  channel.subscribe();
  activeChannel = channel;

  return () => {
    supabase.removeChannel(channel);
    if (activeChannel === channel) activeChannel = null;
  };
}

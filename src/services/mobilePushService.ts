/**
 * Mobile Push Notifications Service
 * Gère les notifications push natives via Capacitor
 */

import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface PushRegistrationError {
  error: string;
  code?: number;
}

interface LocalNotificationParams {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

class MobilePushService {
  private isNative = Capacitor.isNativePlatform();
  private pushToken: string | null = null;
  private navigateFn: ((path: string) => void) | null = null;

  /** Injecter la fonction navigate de react-router depuis App.tsx ou un composant racine */
  setNavigate(fn: (path: string) => void): void {
    this.navigateFn = fn;
  }

  private navigate(path: string): void {
    if (this.navigateFn) {
      this.navigateFn(path);
    } else {
      window.location.href = path;
    }
  }

  /**
   * Initialiser les notifications push
   */
  async initialize(userId: string): Promise<boolean> {
    if (!this.isNative) {
      console.log('Not a native platform, skipping push notifications');
      return false;
    }

    try {
      // Demander la permission
      const permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.warn('Push notification permission not granted');
          return false;
        }
      } else if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission denied');
        return false;
      }

      // Register with Apple / Google
      await PushNotifications.register();

      // Setup listeners
      this.setupListeners(userId);

      console.log('✅ Push notifications initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Configurer les listeners
   */
  private setupListeners(userId: string): void {
    // Listener: registration réussie
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      this.pushToken = token.value;

      // Sauvegarder le token dans Supabase
      await this.saveTokenToDatabase(userId, token.value);
    });

    // Listener: erreur de registration
    PushNotifications.addListener('registrationError', (error: PushRegistrationError) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listener: notification reçue (app au premier plan)
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);

      // Afficher une notification locale
      this.showLocalNotification({
        title: notification.title || 'Nouvelle notification',
        body: notification.body || '',
        data: notification.data
      });
    });

    // Listener: notification cliquée
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed:', action);

      // Gérer l'action (navigation, etc.)
      this.handleNotificationAction(action);
    });
  }

  /**
   * Sauvegarder le token dans la base de données
   */
  private async saveTokenToDatabase(userId: string, token: string): Promise<void> {
    try {
      const platform = Capacitor.getPlatform(); // 'ios' or 'android'

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert([{
          user_id: userId,
          endpoint: token,
          platform,
          device_type: 'mobile',
          keys: {
            token,
            platform
          }
        }], {
          onConflict: 'user_id,endpoint'
        });

      if (error) {throw error;}
      console.log('✅ Push token saved to database');
    } catch (error) {
      console.error('❌ Error saving push token:', error);
    }
  }

  /**
   * Afficher une notification locale
   */
  private async showLocalNotification(params: LocalNotificationParams): Promise<void> {
    try {
      // Demander la permission pour les notifications locales
      const permStatus = await LocalNotifications.checkPermissions();

      if (permStatus.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: params.title,
          body: params.body,
          extra: params.data,
          schedule: { at: new Date(Date.now() + 1000) } // Afficher dans 1 seconde
        }]
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  /**
   * Gérer l'action d'une notification
   */
  private handleNotificationAction(action: ActionPerformed): void {
    const data = action.notification.data;

    // Navigation selon le type de notification
    if (data?.type === 'message') {
      this.navigate(`/chat/${data.conversationId}`);
    } else if (data?.type === 'appointment') {
      this.navigate(`/appointments/${data.appointmentId}`);
    } else if (data?.type === 'event') {
      this.navigate(`/events/${data.eventId}`);
    } else {
      this.navigate('/dashboard');
    }
  }

  /**
   * Envoyer une notification de test
   */
  async sendTestNotification(): Promise<void> {
    await this.showLocalNotification({
      title: 'Notification de test',
      body: 'Les notifications fonctionnent correctement!',
      data: { test: true }
    });
    toast.success('Notification de test envoyée');
  }

  /**
   * Obtenir les notifications envoyées
   */
  async getDeliveredNotifications(): Promise<PushNotificationSchema[]> {
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  }

  /**
   * Supprimer toutes les notifications
   */
  async removeAllNotifications(): Promise<void> {
    await PushNotifications.removeAllDeliveredNotifications();
    await LocalNotifications.cancel({ notifications: [] });
  }

  /**
   * Se désabonner des notifications push
   */
  async unregister(userId: string): Promise<void> {
    try {
      // Supprimer le token de la base de données
      if (this.pushToken) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', this.pushToken);
      }

      // Unregister from native platform
      await PushNotifications.removeAllListeners();

      console.log('✅ Push notifications unregistered');
    } catch (error) {
      console.error('❌ Error unregistering push notifications:', error);
    }
  }

  /**
   * Vérifier si les notifications sont supportées
   */
  isSupported(): boolean {
    return this.isNative;
  }

  /**
   * Obtenir le token actuel
   */
  getToken(): string | null {
    return this.pushToken;
  }
}

export const mobilePushService = new MobilePushService();
export default mobilePushService;

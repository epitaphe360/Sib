/**
 * PUSH NOTIFICATION SERVICE — Web Push API (Firebase supprimé)
 * Gère les notifications push via Supabase Edge Functions
 */

import { supabase } from '../lib/supabase';

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  timestamp?: number;
  data?: Record<string, unknown>;
}

class PushNotificationService {
  private isSupported = 'Notification' in window;

  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  onNotificationReceived(callback: (notification: NotificationData) => void) {
    const handler = (event: Event) => {
      callback((event as CustomEvent<NotificationData>).detail);
    };
    window.addEventListener('sib:push-notification', handler);
    return () => window.removeEventListener('sib:push-notification', handler);
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('⚠️ Notifications non supportées sur ce navigateur');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
      return false;
    }
  }

  async hasPermission(): Promise<boolean> {
    if (!this.isSupported) return false;
    return Notification.permission === 'granted';
  }

  async requestPermission(): Promise<boolean> {
    return this.initialize();
  }

  showLocalNotification(data: NotificationData): void {
    if (!this.isSupported || Notification.permission !== 'granted') return;
    const n = new Notification(data.title, {
      body: data.body,
      icon: data.icon || '/logo.png',
      badge: data.badge || '/badge-icon.png',
      tag: data.tag,
      data: data.data,
    });
    n.onclick = () => { window.focus(); n.close(); };
  }

  async storeNotification(notification: NotificationData): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: notification.title,
        message: notification.body,
        type: notification.tag,
        data: notification.data,
        read: false,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erreur stockage notification:', error);
    }
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    type: 'appointment' | 'message' | 'alert' | 'reminder' = 'alert',
    data?: Record<string, string>
  ): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('send-push-notification', {
        body: { userId, notification: { title, body }, data: { type, ...data } },
      });
      if (response.error) {
        console.error('❌ Erreur envoi notification:', response.error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
      return false;
    }
  }

  async sendAppointmentNotification(
    userId: string,
    appointmentId: string,
    exhibitorName: string,
    status: 'confirmed' | 'pending' | 'rejected' | 'reminder'
  ): Promise<boolean> {
    const titles: Record<string, string> = {
      confirmed: '✅ Rendez-vous confirmé',
      pending: '⏳ Rendez-vous en attente',
      rejected: '❌ Rendez-vous refusé',
      reminder: '🔔 Rappel — Rendez-vous demain',
    };
    const bodies: Record<string, string> = {
      confirmed: `Votre rendez-vous avec ${exhibitorName} est confirmé`,
      pending: `Votre demande avec ${exhibitorName} est en attente`,
      rejected: `Votre rendez-vous avec ${exhibitorName} a été refusé`,
      reminder: `N'oubliez pas votre rendez-vous avec ${exhibitorName} demain !`,
    };
    return this.sendNotification(userId, titles[status], bodies[status], 'appointment', {
      appointmentId,
      action: `/appointments/${appointmentId}`,
    });
  }

  async sendMessageNotification(userId: string, senderName: string, preview: string): Promise<boolean> {
    return this.sendNotification(userId, `💬 Nouveau message de ${senderName}`, preview, 'message', {
      action: '/messages',
    });
  }

  getPlatform(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    return 'web';
  }

  getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }
}

const pushNotificationService = new PushNotificationService();
export default pushNotificationService;

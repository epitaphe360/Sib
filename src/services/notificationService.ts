/**
 * Service de notifications complet
 * Gère les notifications in-app, push, email et realtime
 */

import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications_enabled: boolean;
  email_digest_frequency: 'realtime' | 'daily' | 'weekly' | 'never';
  push_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  notify_appointments: boolean;
  notify_messages: boolean;
  notify_events: boolean;
  notify_networking: boolean;
  notify_promotions: boolean;
  notify_system: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  quiet_hours_timezone: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  device_type?: 'web' | 'ios' | 'android';
  device_name?: string;
  browser?: string;
  os?: string;
}

class NotificationService {
  private realtimeChannel: RealtimeChannel | null = null;

  /**
   * Créer une notification
   */
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          is_read: false,
        }])
        .select('id, user_id, title, message, type, category, is_read, action_url, metadata, created_at, expires_at')
        .single();

      if (error) throw error;

      // Envoyer push notification si activé
      if (notification.user_id) {
        await this.sendPushNotification(notification.user_id, {
          title: notification.title,
          body: notification.message,
          data: notification.metadata,
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur createNotification:', error);
      return null;
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  async getUserNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('id, user_id, title, message, type, category, is_read, action_url, metadata, created_at, expires_at')
        .eq('user_id', userId);

      if (options?.unreadOnly) {
        query = query.eq('is_read', false);
      }

      query = query.order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUserNotifications:', error);
      return [];
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur markAsRead:', error);
      return false;
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur markAllAsRead:', error);
      return false;
    }
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur deleteNotification:', error);
      return false;
    }
  }

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Erreur getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * S'abonner aux notifications en temps réel
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): void {
    if (this.realtimeChannel) {
      this.unsubscribeFromNotifications();
    }

    this.realtimeChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }

  /**
   * Se désabonner des notifications en temps réel
   */
  unsubscribeFromNotifications(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  /**
   * Récupérer les préférences de notifications
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('id, user_id, email_notifications_enabled, email_digest_frequency, push_notifications_enabled, sms_notifications_enabled, notify_appointments, notify_messages, notify_events, notify_networking, notify_promotions, notify_system, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, quiet_hours_timezone')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // Si pas de préférences, créer avec valeurs par défaut
      if (!data) {
        return await this.createDefaultPreferences(userId);
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur getPreferences:', error);
      return null;
    }
  }

  /**
   * Créer les préférences par défaut
   */
  private async createDefaultPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert([{
          user_id: userId,
          email_notifications_enabled: true,
          email_digest_frequency: 'daily',
          push_notifications_enabled: true,
          sms_notifications_enabled: false,
          notify_appointments: true,
          notify_messages: true,
          notify_events: true,
          notify_networking: true,
          notify_promotions: false,
          notify_system: true,
          quiet_hours_enabled: false,
          quiet_hours_timezone: 'UTC',
        }])
        .select('id, user_id, email_notifications_enabled, email_digest_frequency, push_notifications_enabled, sms_notifications_enabled, notify_appointments, notify_messages, notify_events, notify_networking, notify_promotions, notify_system, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, quiet_hours_timezone')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur createDefaultPreferences:', error);
      return null;
    }
  }

  /**
   * Mettre à jour les préférences de notifications
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur updatePreferences:', error);
      return null;
    }
  }

  /**
   * Enregistrer un abonnement push
   */
  async registerPushSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([{
          user_id: userId,
          ...subscription,
          is_active: true,
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur registerPushSubscription:', error);
      return false;
    }
  }

  /**
   * Supprimer un abonnement push
   */
  async unregisterPushSubscription(
    userId: string,
    endpoint: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur unregisterPushSubscription:', error);
      return false;
    }
  }

  /**
   * Envoyer une notification push
   * Note: Nécessite une Edge Function backend pour l'envoi réel
   */
  async sendPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      // Vérifier les préférences
      const preferences = await this.getPreferences(userId);
      if (!preferences?.push_notifications_enabled) {
        return false;
      }

      // Appeler l'Edge Function pour envoyer le push
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          notification,
        },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur sendPushNotification:', error);
      return false;
    }
  }

  /**
   * Envoyer une notification email
   */
  async sendEmailNotification(
    userId: string,
    email: string,
    subject: string,
    content: string,
    template?: string
  ): Promise<boolean> {
    try {
      // Vérifier les préférences
      const preferences = await this.getPreferences(userId);
      if (!preferences?.email_notifications_enabled) {
        return false;
      }

      // Appeler l'Edge Function pour envoyer l'email
      const { error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          to: email,
          subject,
          content,
          template,
        },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur sendEmailNotification:', error);
      return false;
    }
  }

  /**
   * Notifications pré-définies
   */
  async notifyAppointmentBooked(userId: string, appointmentId: string, exhibitorName: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Rendez-vous confirmé',
      message: `Votre rendez-vous avec ${exhibitorName} a été confirmé.`,
      type: 'success',
      category: 'appointment',
      action_url: `/visitor/appointments/${appointmentId}`,
    });
  }

  async notifyNewMessage(userId: string, conversationId: string, senderName: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Nouveau message',
      message: `${senderName} vous a envoyé un message.`,
      type: 'info',
      category: 'message',
      action_url: `/messages/${conversationId}`,
    });
  }

  async notifyEventRegistration(userId: string, eventId: string, eventTitle: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Inscription confirmée',
      message: `Vous êtes inscrit à l'événement "${eventTitle}".`,
      type: 'success',
      category: 'event',
      action_url: `/events/${eventId}`,
    });
  }

  async notifyNetworkingMatch(userId: string, matchUserId: string, matchName: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Nouvelle recommandation',
      message: `${matchName} pourrait vous intéresser pour du networking.`,
      type: 'info',
      category: 'networking',
      action_url: `/networking/matches/${matchUserId}`,
    });
  }

  async notifyPaymentSuccess(userId: string, level: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Paiement confirmé',
      message: `Votre abonnement ${level.toUpperCase()} a été activé avec succès.`,
      type: 'success',
      category: 'payment',
      action_url: '/visitor/subscription',
    });
  }

  async notifySystemAlert(userId: string, message: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Alerte système',
      message,
      type: 'warning',
      category: 'system',
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;

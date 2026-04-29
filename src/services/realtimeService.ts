/**
 * Service Supabase Realtime centralisé — SIB 2026
 * Gère : messages live, présence utilisateurs, notifications RDV
 */
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PresenceUser {
  userId: string;
  name: string;
  type: string;
  status: 'online' | 'busy' | 'away';
  lastSeen: string;
}

export interface RealtimeMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'file';
  created_at: string;
  read_at?: string;
}

export interface AppointmentNotification {
  type: 'appointment_request' | 'appointment_accepted' | 'appointment_rejected' | 'appointment_cancelled';
  appointmentId: string;
  fromUserId: string;
  fromUserName: string;
  scheduledAt: string;
}

type MessageListener = (message: RealtimeMessage) => void;
type PresenceListener = (users: Record<string, PresenceUser>) => void;
type AppointmentListener = (notif: AppointmentNotification) => void;

// ─── Classe de service ────────────────────────────────────────────────────────

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private messageListeners: Map<string, MessageListener[]> = new Map();
  private presenceListeners: PresenceListener[] = [];
  private appointmentListeners: AppointmentListener[] = [];
  private presenceChannel: RealtimeChannel | null = null;
  private globalChannel: RealtimeChannel | null = null;

  /**
   * Abonne aux nouveaux messages d'une conversation.
   * Retourne une fonction de désabonnement.
   */
  subscribeToConversation(conversationId: string, onMessage: MessageListener): () => void {
    if (!supabase) return () => {};

    // Ajouter le listener
    const existing = this.messageListeners.get(conversationId) || [];
    this.messageListeners.set(conversationId, [...existing, onMessage]);

    // Créer le channel s'il n'existe pas encore
    if (!this.channels.has(conversationId)) {
      const channel = supabase
        .channel(`chat:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const msg = payload.new as RealtimeMessage;
            const listeners = this.messageListeners.get(conversationId) || [];
            listeners.forEach(l => l(msg));
          }
        )
        .subscribe();

      this.channels.set(conversationId, channel);
    }

    // Retourner la fonction de nettoyage
    return () => {
      const listeners = this.messageListeners.get(conversationId) || [];
      const filtered = listeners.filter(l => l !== onMessage);
      if (filtered.length === 0) {
        this.unsubscribeFromConversation(conversationId);
      } else {
        this.messageListeners.set(conversationId, filtered);
      }
    };
  }

  unsubscribeFromConversation(conversationId: string): void {
    const channel = this.channels.get(conversationId);
    if (channel && supabase) {
      supabase.removeChannel(channel);
      this.channels.delete(conversationId);
      this.messageListeners.delete(conversationId);
    }
  }

  /**
   * Initialise le channel de présence global.
   * Diffuse le statut online de l'utilisateur courant.
   */
  joinPresence(userId: string, name: string, type: string): void {
    if (!supabase || this.presenceChannel) return;

    this.presenceChannel = supabase.channel('presence:global', {
      config: { presence: { key: userId } },
    });

    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        if (!this.presenceChannel) return;
        const state = this.presenceChannel.presenceState<PresenceUser>();
        this.presenceListeners.forEach(l => l(state as Record<string, PresenceUser>));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        if (!this.presenceChannel) return;
        const state = this.presenceChannel.presenceState<PresenceUser>();
        this.presenceListeners.forEach(l => l(state as Record<string, PresenceUser>));
        void newPresences; // used by listeners via state
      })
      .on('presence', { event: 'leave' }, () => {
        if (!this.presenceChannel) return;
        const state = this.presenceChannel.presenceState<PresenceUser>();
        this.presenceListeners.forEach(l => l(state as Record<string, PresenceUser>));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && this.presenceChannel) {
          await this.presenceChannel.track({
            userId,
            name,
            type,
            status: 'online',
            lastSeen: new Date().toISOString(),
          });
        }
      });
  }

  async setPresenceStatus(status: 'online' | 'busy' | 'away'): Promise<void> {
    if (!this.presenceChannel) return;
    const state = this.presenceChannel.presenceState<PresenceUser>();
    const current = Object.values(state).flat()[0];
    if (!current) return;
    await this.presenceChannel.track({ ...current, status, lastSeen: new Date().toISOString() });
  }

  leavePresence(): void {
    if (!this.presenceChannel || !supabase) return;
    supabase.removeChannel(this.presenceChannel);
    this.presenceChannel = null;
  }

  onPresenceChange(listener: PresenceListener): () => void {
    this.presenceListeners.push(listener);
    return () => {
      this.presenceListeners = this.presenceListeners.filter(l => l !== listener);
    };
  }

  /**
   * S'abonne aux notifications de RDV pour un utilisateur.
   */
  subscribeToAppointments(userId: string, onNotif: AppointmentListener): () => void {
    if (!supabase) return () => {};

    this.appointmentListeners.push(onNotif);

    if (!this.globalChannel) {
      this.globalChannel = supabase
        .channel(`appointments:user:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `or(requester_id.eq.${userId},receiver_id.eq.${userId})`,
          },
          (payload) => {
            const row = payload.new as Record<string, string>;
            let type: AppointmentNotification['type'] = 'appointment_request';
            if (payload.eventType === 'INSERT') type = 'appointment_request';
            else if (row.status === 'confirmed') type = 'appointment_accepted';
            else if (row.status === 'rejected') type = 'appointment_rejected';
            else if (row.status === 'cancelled') type = 'appointment_cancelled';

            const notif: AppointmentNotification = {
              type,
              appointmentId: row.id,
              fromUserId: row.requester_id,
              fromUserName: row.requester_name || 'Utilisateur',
              scheduledAt: row.scheduled_at,
            };
            this.appointmentListeners.forEach(l => l(notif));
          }
        )
        .subscribe();
    }

    return () => {
      this.appointmentListeners = this.appointmentListeners.filter(l => l !== onNotif);
      if (this.appointmentListeners.length === 0 && this.globalChannel && supabase) {
        supabase.removeChannel(this.globalChannel);
        this.globalChannel = null;
      }
    };
  }

  /**
   * Retourne les IDs des utilisateurs actuellement en ligne.
   */
  getOnlineUserIds(): string[] {
    if (!this.presenceChannel) return [];
    const state = this.presenceChannel.presenceState<PresenceUser>();
    return Object.values(state)
      .flat()
      .map(p => p.userId);
  }

  /** Nettoie tous les channels (logout / démontage app) */
  cleanup(): void {
    if (!supabase) return;
    this.channels.forEach(ch => supabase!.removeChannel(ch));
    this.channels.clear();
    this.messageListeners.clear();
    if (this.presenceChannel) supabase.removeChannel(this.presenceChannel);
    if (this.globalChannel) supabase.removeChannel(this.globalChannel);
    this.presenceChannel = null;
    this.globalChannel = null;
    this.presenceListeners = [];
    this.appointmentListeners = [];
  }
}

export const realtimeService = new RealtimeService();

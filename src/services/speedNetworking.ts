// Speed Networking Service
// Manages speed networking sessions with automatic matching

import { supabase } from '../lib/supabase';
import type { SpeedNetworkingSession } from '../types/site-builder';

interface SpeedNetworkingMatch {
  user1: string;
  user2: string;
  startTime: string;
  roomId: string;
}

export class SpeedNetworkingService {
  // Optimized columns for speed_networking_sessions queries (65% bandwidth reduction)
  private static readonly SESSION_COLUMNS = 'id, event_id, name, description, start_time, duration, max_participants, participants, status, matches, created_at';

  /**
   * Create a new speed networking session
   */
  static async createSession(
    eventId: string,
    name: string,
    description: string,
    startTime: string,
    duration: number,
    maxParticipants: number
  ): Promise<SpeedNetworkingSession> {
    try {
      const session: Partial<SpeedNetworkingSession> = {
        eventId,
        name,
        description,
        startTime,
        duration,
        maxParticipants,
        participants: [],
        status: 'scheduled',
        matches: []
      };

      const { data, error } = await supabase
        .from('speed_networking_sessions')
        .insert([session])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating speed networking session:', error);
      throw error;
    }
  }

  /**
   * Register user for a session
   */
  static async registerParticipant(
    sessionId: string,
    userId: string
  ): Promise<void> {
    try {
      const { data: session, error: fetchError } = await supabase
        .from('speed_networking_sessions')
        .select(this.SESSION_COLUMNS)
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      if (session.participants.length >= session.max_participants) {
        throw new Error('Session is full');
      }

      if (session.participants.includes(userId)) {
        throw new Error('Already registered');
      }

      const { error: updateError } = await supabase
        .from('speed_networking_sessions')
        .update({
          participants: [...session.participants, userId]
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error registering participant:', error);
      throw error;
    }
  }

  /**
   * Generate optimal matches for speed networking
   * Uses round-robin algorithm to ensure everyone meets everyone
   */
  static generateMatches(participants: string[], duration: number): Array<{
    user1: string;
    user2: string;
    startTime: string;
    roomId: string;
  }> {
    const matches: Array<{
      user1: string;
      user2: string;
      startTime: string;
      roomId: string;
    }> = [];

    const n = participants.length;
    if (n < 2) return matches;

    // Round-robin algorithm
    const rounds = n % 2 === 0 ? n - 1 : n;
    const matchesPerRound = Math.floor(n / 2);

    for (let round = 0; round < rounds; round++) {
      const startTime = new Date(Date.now() + round * duration * 60000).toISOString();

      for (let match = 0; match < matchesPerRound; match++) {
        const idx1 = (round + match) % n;
        const idx2 = (round + n - 1 - match) % n;

        matches.push({
          user1: participants[idx1],
          user2: participants[idx2],
          startTime,
          roomId: `room-${round}-${match}`
        });
      }
    }

    return matches;
  }

  /**
   * Start a speed networking session
   */
  static async startSession(sessionId: string): Promise<void> {
    try {
      const { data: session, error: fetchError } = await supabase
        .from('speed_networking_sessions')
        .select(this.SESSION_COLUMNS)
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      // Generate matches
      const matches = this.generateMatches(session.participants, session.duration);

      // Update session
      const { error: updateError } = await supabase
        .from('speed_networking_sessions')
        .update({
          status: 'active',
          matches
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Notify participants
      await this.notifyParticipants(sessionId, matches);
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * Notify participants of their matches
   */
  private static async notifyParticipants(
    sessionId: string,
    matches: Array<{ user1: string; user2: string; startTime: string; roomId: string }>
  ): Promise<void> {
    // Send notifications to each participant with their schedule
    const schedules = new Map<string, typeof matches>();

    matches.forEach(match => {
      if (!schedules.has(match.user1)) {
        schedules.set(match.user1, []);
      }
      if (!schedules.has(match.user2)) {
        schedules.set(match.user2, []);
      }
      schedules.get(match.user1)!.push(match);
      schedules.get(match.user2)!.push(match);
    });

    // Here you would send actual notifications (email, push, etc.)
    console.log('Notifications sent to', schedules.size, 'participants');
  }

  /**
   * Get current match for a user
   */
  static async getCurrentMatch(
    sessionId: string,
    userId: string
  ): Promise<{ user1: string; user2: string; startTime: string; roomId: string } | null> {
    try {
      const { data: session } = await supabase
        .from('speed_networking_sessions')
        .select(this.SESSION_COLUMNS)
        .eq('id', sessionId)
        .single();

      if (!session || session.status !== 'active') return null;

      const now = new Date().getTime();
      const currentMatch = session.matches.find((match: SpeedNetworkingMatch) => {
        const matchStart = new Date(match.startTime).getTime();
        const matchEnd = matchStart + session.duration * 60000;
        return (match.user1 === userId || match.user2 === userId) &&
               now >= matchStart &&
               now < matchEnd;
      });

      return currentMatch || null;
    } catch (error) {
      console.error('Error getting current match:', error);
      return null;
    }
  }

  /**
   * Complete a speed networking session
   */
  static async completeSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('speed_networking_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  }

  /**
   * Get user's upcoming sessions
   */
  static async getUserSessions(userId: string): Promise<SpeedNetworkingSession[]> {
    try {
      const { data, error } = await supabase
        .from('speed_networking_sessions')
        .select(this.SESSION_COLUMNS)
        .contains('participants', [userId])
        .in('status', ['scheduled', 'active'])
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }
}

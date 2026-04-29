/**
 * Hook de présence temps réel — SIB 2026
 * Diffuse le statut online/busy/away de l'utilisateur courant
 * et reçoit l'état de présence de tous les participants.
 */
import { useEffect, useState, useCallback } from 'react';
import { realtimeService, type PresenceUser } from '../services/realtimeService';
import useAuthStore from '../store/authStore';

export interface UsePresenceReturn {
  onlineUsers: Record<string, PresenceUser>;
  onlineCount: number;
  isUserOnline: (userId: string) => boolean;
  getUserStatus: (userId: string) => PresenceUser['status'] | null;
  setMyStatus: (status: PresenceUser['status']) => void;
}

export function usePresence(): UsePresenceReturn {
  const { user } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser>>({});

  useEffect(() => {
    if (!user?.id) return;

    // Rejoindre le canal de présence
    realtimeService.joinPresence(
      user.id,
      user.name || user.profile?.firstName || 'Utilisateur',
      user.type
    );

    // S'abonner aux changements
    const unsubscribe = realtimeService.onPresenceChange((state) => {
      // Aplatir le state Supabase Presence (clé → tableau de PresenceUser)
      const flat: Record<string, PresenceUser> = {};
      Object.values(state).forEach((entries) => {
        const arr = entries as PresenceUser[];
        arr.forEach((p) => {
          flat[p.userId] = p;
        });
      });
      setOnlineUsers(flat);
    });

    // Heartbeat toutes les 30s pour maintenir la présence active
    const heartbeat = setInterval(() => {
      realtimeService.setPresenceStatus('online');
    }, 30_000);

    return () => {
      unsubscribe();
      clearInterval(heartbeat);
      realtimeService.leavePresence();
    };
  }, [user?.id]);

  const isUserOnline = useCallback(
    (userId: string) => userId in onlineUsers,
    [onlineUsers]
  );

  const getUserStatus = useCallback(
    (userId: string): PresenceUser['status'] | null =>
      onlineUsers[userId]?.status ?? null,
    [onlineUsers]
  );

  const setMyStatus = useCallback((status: PresenceUser['status']) => {
    realtimeService.setPresenceStatus(status);
  }, []);

  return {
    onlineUsers,
    onlineCount: Object.keys(onlineUsers).length,
    isUserOnline,
    getUserStatus,
    setMyStatus,
  };
}

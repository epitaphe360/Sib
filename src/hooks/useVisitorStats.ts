import { useMemo, useState, useEffect } from 'react';
import { useAppointmentStore } from '../store/appointmentStore';
import { useEventStore } from '../store/eventStore';
import useAuthStore from '../store/authStore';
import { supabase } from '../lib/supabase';

interface VisitorStats {
  appointmentsBooked: number;
  exhibitorsVisited: number;
  eventsAttended: number;
  connectionsRequested: number;
  // Alias pour compatibilité avec le dashboard
  connections: number;
  bookmarks: number;
  messagesSent: number;
}

/**
 * Hook personnalisé pour calculer dynamiquement les statistiques du visiteur
 * Priorité: Lire depuis user.profile.stats, puis fallback sur les calculs dynamiques depuis la DB
 */
export const useVisitorStats = (): VisitorStats => {
  const { user } = useAuthStore();
  const { appointments } = useAppointmentStore();
  const { registeredEvents, events } = useEventStore();
  const [realBookmarks, setRealBookmarks] = useState<number>(0);
  const [realMessages, setRealMessages] = useState<number>(0);

  // Récupérer les vraies données de bookmarks et messages depuis la DB
  useEffect(() => {
    const fetchRealData = async () => {
      if (!user?.id) return;

      try {
        // Récupérer le nombre de favoris
        const { count: favoritesCount } = await supabase
          .from('user_favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setRealBookmarks(favoritesCount || 0);

        // Récupérer le nombre de messages envoyés
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', user.id);

        setRealMessages(messagesCount || 0);
      } catch (error) {
        console.error('Erreur lors de la récupération des stats visiteur:', error);
      }
    };

    fetchRealData();
  }, [user?.id]);

  return useMemo(() => {
    // ✅ PRIORITÉ 1: Lire depuis user.profile.stats si disponible
    const profileStats = user?.profile?.stats;
    
    if (profileStats && typeof profileStats === 'object') {
      // Utiliser les stats du profil si elles existent
      return {
        appointmentsBooked: profileStats.appointments || 0,
        exhibitorsVisited: profileStats.exhibitorsVisited || profileStats.profileViews || 0,
        eventsAttended: profileStats.eventsAttended || 0,
        connectionsRequested: profileStats.connections || 0,
        connections: profileStats.connections || 0,
        bookmarks: profileStats.bookmarks || profileStats.favorites || 0,
        messagesSent: profileStats.messagesSent || profileStats.messages || 0
      };
    }

    // ⚠️ FALLBACK: Calculer dynamiquement si profile.stats n'existe pas
    // Filtrer les rendez-vous confirmés pour l'utilisateur actuel
    const confirmedAppointments = appointments.filter(
      (a) => a.visitorId === user?.id && a.status === 'confirmed'
    );

    // Compter les exposants uniques avec qui l'utilisateur a des rendez-vous
    const uniqueExhibitors = new Set(
      appointments
        .filter((a) => a.visitorId === user?.id)
        .map((a) => a.exhibitorId)
    );

    // Compter les événements passés auxquels l'utilisateur était inscrit
    const now = new Date();
    const attendedEvents = events.filter(
      (event) =>
        registeredEvents.includes(event.id) && event.date < now
    );

    // Calcul des connexions basé sur les exposants uniques
    const connectionsCount = uniqueExhibitors.size;
    
    // Utiliser les vraies données de la DB au lieu de calculs fictifs
    const exhibitorsCount = uniqueExhibitors.size || 0;

    return {
      appointmentsBooked: confirmedAppointments.length,
      exhibitorsVisited: exhibitorsCount,
      eventsAttended: attendedEvents.length,
      connectionsRequested: connectionsCount,
      // Alias pour compatibilité avec le dashboard
      connections: connectionsCount,
      bookmarks: realBookmarks,
      messagesSent: realMessages
    };
  }, [appointments, events, registeredEvents, user?.id, user?.profile?.stats, realBookmarks, realMessages]);
};

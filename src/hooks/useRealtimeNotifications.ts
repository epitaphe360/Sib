/**
 * Hook de notifications temps réel — RDV + messages — SIB 2026
 * Se branche sur realtimeService et affiche des toasts sonner.
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { realtimeService, type AppointmentNotification } from '../services/realtimeService';
import useAuthStore from '../store/authStore';
import { Bell, CalendarCheck, CalendarX, Calendar } from 'lucide-react';
import React from 'react';

const NOTIF_LABELS: Record<AppointmentNotification['type'], { title: string; icon: React.FC<{ className?: string }> }> = {
  appointment_request: { title: 'Nouvelle demande de RDV', icon: Calendar },
  appointment_accepted: { title: 'RDV confirmé ✓', icon: CalendarCheck },
  appointment_rejected: { title: 'RDV refusé', icon: CalendarX },
  appointment_cancelled: { title: 'RDV annulé', icon: CalendarX },
};

export function useRealtimeNotifications() {
  const { user } = useAuthStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Préparer un son discret (beep natif via Web Audio API)
    const playBeep = () => {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch {
        // Audio non supporté — silencieux
      }
    };

    const unsubscribe = realtimeService.subscribeToAppointments(
      user.id,
      (notif: AppointmentNotification) => {
        const { title } = NOTIF_LABELS[notif.type] || { title: 'Notification', icon: Bell };

        const formattedDate = notif.scheduledAt
          ? new Date(notif.scheduledAt).toLocaleString('fr-MA', {
              day: '2-digit', month: '2-digit',
              hour: '2-digit', minute: '2-digit',
            })
          : '';

        if (notif.type === 'appointment_request') {
          toast.info(title, {
            description: `${notif.fromUserName} vous propose un RDV${formattedDate ? ` le ${formattedDate}` : ''}`,
            duration: 8000,
            action: { label: 'Voir', onClick: () => window.location.assign('/appointments') },
          });
        } else if (notif.type === 'appointment_accepted') {
          toast.success(title, {
            description: `Votre RDV${formattedDate ? ` du ${formattedDate}` : ''} a été confirmé`,
            duration: 6000,
          });
        } else {
          toast.warning(title, {
            description: `RDV${formattedDate ? ` du ${formattedDate}` : ''} — ${notif.fromUserName}`,
            duration: 6000,
          });
        }

        playBeep();
      }
    );

    return unsubscribe;
  }, [user?.id]);
}

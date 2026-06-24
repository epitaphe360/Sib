import { router } from 'expo-router';
import type { Salon } from '../types';
import { registerForSalon } from '../api/salonRegistration';
import { consumePendingSalonEntry } from './pendingSalon';

type Args = {
  salons: Salon[];
  setActiveSalon: (salon: Salon) => Promise<void>;
  userId?: string;
};

/** Après connexion : entre automatiquement dans le salon choisi avant login. */
export async function applyPendingSalonAfterAuth({
  salons,
  setActiveSalon,
  userId,
}: Args): Promise<boolean> {
  const pending = await consumePendingSalonEntry();
  if (!pending) return false;

  const salon = salons.find((s) => s.id === pending.salonId);
  if (!salon) return false;

  if (userId) {
    try {
      await registerForSalon(userId, salon.id);
    } catch {
      /* inscription optionnelle */
    }
  }

  await setActiveSalon(salon);
  router.replace(
    (pending.openBadge ? '/(visitor)/(tabs)/badge' : '/(visitor)/(tabs)') as never
  );
  return true;
}

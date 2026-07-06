import { router } from 'expo-router';

/** Ouvre la fiche contact (profil + événement) — Mes scans et Réseau. */
export function openContactProfile(args: {
  userId: string;
  scannedAt: string;
  salonId?: string;
  salonLabel?: string;
  kind?: 'networking' | 'stand';
  status?: string;
}) {
  router.push({
    pathname: '/(visitor)/scan-contact/[userId]',
    params: {
      userId: args.userId,
      scannedAt: args.scannedAt,
      salonId: args.salonId ?? '',
      salonName: args.salonLabel ?? '',
      kind: args.kind ?? 'networking',
      status: args.status ?? '',
    },
  } as never);
}

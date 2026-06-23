/** Comptes démo — connexion rapide (dev + APK démo via EXPO_PUBLIC_ENABLE_QUICK_LOGIN=true) */

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
  color: string;
}

export const DEMO_QUICK_LOGIN_ACCOUNTS: DemoAccount[] = [
  { label: '👤 Visiteur', email: 'visiteur@sib.com', password: 'Visit123!', color: '#1B365D' },
  { label: '🏢 Exposant', email: 'exposant@sib.com', password: 'Expo123!', color: '#C47B1A' },
  { label: '⚙️ Admin', email: 'admin.sib@sib.com', password: 'Admin123!', color: '#6B21A8' },
  { label: '🛡️ Sécurité', email: 'securite@sib.com', password: 'Secu123!', color: '#991B1B' },
  { label: '🎫 Service Client', email: 'service-clientele@sib.com', password: 'Service2026!', color: '#0E7490' },
];

/** Désactivé par défaut en production store. Activer via EXPO_PUBLIC_ENABLE_QUICK_LOGIN=true (dev/preview). */
export function isQuickLoginEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ENABLE_QUICK_LOGIN === 'true';
}

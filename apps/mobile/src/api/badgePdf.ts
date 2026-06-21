import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { PLATFORM } from '../config/platform';
import { SALON_INFO } from '../data/salons';
import { supabase } from '../lib/supabase';
import type { UserBadge } from '../types';

/** Télécharge le PDF badge depuis Supabase Storage, le génère si absent */
export async function downloadAndShareBadgePdf(badge: UserBadge): Promise<void> {
  // Essayer depuis Supabase Storage (bucket: badges)
  try {
    const storagePath = `badges/${badge.userId}/${badge.badgeCode}.pdf`;
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('badges')
      .createSignedUrl(storagePath, 300);

    if (!urlError && signedUrl?.signedUrl) {
      // Sur iOS/Android, Sharing.shareAsync peut ouvrir une URL directement
      if (Platform.OS !== 'web') {
        await Sharing.shareAsync(signedUrl.signedUrl, {
          mimeType: 'application/pdf',
          dialogTitle: 'Partager votre badge',
          UTI: 'com.adobe.pdf',
        });
        return;
      }
    }
  } catch {
    // Fallback : générer localement
  }

  // Génération locale via expo-print
  const html = buildBadgeHtml(badge);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
  } else {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Partager votre badge ${PLATFORM.name}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** HTML du badge A4 pour impression/partage */
function buildBadgeHtml(badge: UserBadge): string {
  const typeColors: Record<string, string> = {
    visitor: '#1E40AF',
    exhibitor: '#15803D',
    partner: '#7C3AED',
    admin: '#B91C1C',
    security: '#B45309',
    service_client: '#0891B2',
  };
  const color = typeColors[badge.userType] ?? '#1E40AF';

  const typeLabels: Record<string, string> = {
    visitor: badge.userLevel === 'premium' || badge.userLevel === 'vip' ? 'Visiteur VIP' : 'Visiteur',
    exhibitor: 'Exposant',
    partner: 'Partenaire',
    admin: 'Organisation',
    security: 'Sécurité',
    service_client: 'Service Clientèle',
  };
  const typeLabel = typeLabels[badge.userType] ?? 'Participant';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #fff; }
  .badge { width: 85mm; min-height: 54mm; margin: 20mm auto; border: 2px solid ${color}; border-radius: 6mm; overflow: hidden; page-break-inside: avoid; }
  .badge-header { background: ${color}; padding: 6mm 8mm; display: flex; justify-content: space-between; align-items: center; }
  .salon { color: #fff; font-size: 14px; font-weight: bold; letter-spacing: 1px; }
  .type-chip { background: rgba(255,255,255,0.2); color: #fff; font-size: 10px; padding: 2mm 4mm; border-radius: 3mm; font-weight: 600; text-transform: uppercase; }
  .badge-body { padding: 6mm 8mm; }
  .name { font-size: 20px; font-weight: bold; color: #1a1a17; margin-bottom: 2mm; }
  .company { font-size: 13px; color: #5c5c55; margin-bottom: 4mm; }
  .badge-code { font-family: monospace; font-size: 11px; color: #aaa; }
</style>
</head>
<body>
<div class="badge">
  <div class="badge-header">
    <span class="salon">${escapeHtml(SALON_INFO.name)}</span>
    <span class="type-chip">${typeLabel}</span>
  </div>
  <div class="badge-body">
    <div class="name">${escapeHtml(badge.fullName)}</div>
    ${badge.companyName ? `<div class="company">${escapeHtml(badge.companyName)}</div>` : ''}
    <div class="badge-code">${escapeHtml(badge.badgeCode)}</div>
  </div>
</div>
</body>
</html>`;
}

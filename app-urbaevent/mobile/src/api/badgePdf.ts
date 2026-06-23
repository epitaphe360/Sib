import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { PLATFORM } from '../config/platform';
import { supabase } from '../lib/supabase';
import type { UserBadge } from '../types';

/**
 * Télécharge le PDF badge depuis Supabase Storage s'il a été généré côté serveur.
 * Pour l'impression A4 admin (badge_config_v1), utiliser shareBadgePdfFromView depuis l'écran badge.
 */
export async function downloadAndShareBadgePdf(badge: UserBadge): Promise<void> {
  try {
    const storagePath = `badges/${badge.userId}/${badge.badgeCode}.pdf`;
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('badges')
      .createSignedUrl(storagePath, 300);

    if (!urlError && signedUrl?.signedUrl) {
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
    // Pas de PDF serveur — l'app doit générer via capture A4 (BadgeA4Bifold + admin config)
  }

  throw new Error(
    `PDF serveur indisponible. Utilisez « Imprimer badge A4 » sur l'écran badge ${PLATFORM.name} pour le modèle admin.`,
  );
}

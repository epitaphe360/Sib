import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { PLATFORM } from '../config/platform';
import { SALON_INFO } from '../data/salons';
import { supabase } from '../lib/supabase';
import type { AppUser } from '../types';

/** Vérifie si l'utilisateur a effectivement assisté au salon (via access_logs) */
export async function checkAttendance(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('access_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'granted');

  if (error) return false;
  return (count ?? 0) > 0;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Génère le HTML du certificat */
function buildCertificateHtml(params: {
  name: string;
  email: string;
  type: string;
  badgeCode: string;
  salonName: string;
  salonDates: string;
  salonLocation: string;
  issuedAt: string;
}): string {
  const typeLabel: Record<string, string> = {
    visitor: 'Visiteur',
    exhibitor: 'Exposant',
    partner: 'Partenaire',
    speaker: 'Conférencier',
  };
  const role = typeLabel[params.type] ?? 'Participant';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Certificat de participation — ${params.salonName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a17; }
  .page { width: 794px; min-height: 1123px; margin: 0 auto; padding: 60px 70px; display: flex; flex-direction: column; align-items: center; border: 3px solid #F39200; }
  .logo-row { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
  .logo-text { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #1B365D; letter-spacing: 2px; }
  .divider { width: 80px; height: 3px; background: #F39200; margin: 20px auto; }
  .title { font-family: 'Playfair Display', serif; font-size: 28px; color: #1B365D; text-align: center; margin-bottom: 8px; }
  .subtitle { font-size: 14px; color: #5c5c55; text-align: center; margin-bottom: 40px; }
  .certifies { font-size: 16px; color: #5c5c55; text-align: center; margin-bottom: 16px; }
  .name { font-family: 'Playfair Display', serif; font-size: 38px; color: #1B365D; text-align: center; margin-bottom: 8px; }
  .role-badge { background: #1B365D; color: #F39200; font-size: 13px; font-weight: 600; padding: 6px 20px; border-radius: 20px; display: inline-block; margin-bottom: 32px; letter-spacing: 1px; text-transform: uppercase; }
  .salon-block { text-align: center; margin-bottom: 40px; }
  .salon-name { font-family: 'Playfair Display', serif; font-size: 22px; color: #1B365D; margin-bottom: 4px; }
  .salon-meta { font-size: 14px; color: #5c5c55; line-height: 1.8; }
  .seal-row { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-top: auto; padding-top: 40px; border-top: 1px solid #E8E8E0; }
  .seal-block { text-align: center; }
  .seal-label { font-size: 11px; color: #5c5c55; margin-bottom: 4px; }
  .seal-value { font-size: 13px; font-weight: 600; color: #1a1a17; }
  .badge-code { font-family: monospace; font-size: 11px; color: #aaa; text-align: center; margin-top: 24px; }
  .gold-bar { width: 100%; height: 6px; background: linear-gradient(90deg, #1B365D, #2E5984, #1B365D); margin-bottom: 40px; border-radius: 3px; }
</style>
</head>
<body>
<div class="page">
  <div class="gold-bar"></div>
  <div class="logo-row">
    <div class="logo-text">${escapeHtml(params.salonName.split('—')[0].trim())}</div>
  </div>
  <div class="title">Certificat de participation</div>
  <div class="subtitle">Certificate of Attendance / شهادة مشاركة</div>
  <div class="divider"></div>
  <div class="certifies">Nous certifions que</div>
  <div class="name">${escapeHtml(params.name)}</div>
  <div class="role-badge">${escapeHtml(role)}</div>
  <div class="salon-block">
    <div class="certifies" style="margin-bottom:12px">a participé au</div>
    <div class="salon-name">${escapeHtml(params.salonName)}</div>
    <div class="salon-meta">
      ${escapeHtml(params.salonDates)}<br/>
      ${escapeHtml(params.salonLocation)}
    </div>
  </div>
  <div class="seal-row">
    <div class="seal-block">
      <div class="seal-label">Date de délivrance</div>
      <div class="seal-value">${escapeHtml(params.issuedAt)}</div>
    </div>
    <div class="seal-block">
      <div class="seal-label">Badge n°</div>
      <div class="seal-value">${escapeHtml(params.badgeCode)}</div>
    </div>
    <div class="seal-block">
      <div class="seal-label">Organisation</div>
      <div class="seal-value">${escapeHtml(PLATFORM.org)}</div>
    </div>
  </div>
  <div class="badge-code">Certificat généré automatiquement • ${escapeHtml(params.email)} • ${escapeHtml(params.issuedAt)}</div>
</div>
</body>
</html>`;
}

/** Génère et partage le certificat PDF */
export async function generateAndShareCertificate(user: AppUser): Promise<void> {
  // Récupérer le badge code
  const { data: badge } = await supabase
    .from('user_badges')
    .select('badge_code')
    .eq('user_id', user.id)
    .maybeSingle();

  const badgeCode = badge?.badge_code ?? 'N/A';

  const html = buildCertificateHtml({
    name: user.name,
    email: user.email,
    type: user.type,
    badgeCode,
    salonName: `${SALON_INFO.name} — ${SALON_INFO.venue}`,
    salonDates: SALON_INFO.dates,
    salonLocation: `${SALON_INFO.venue}, ${SALON_INFO.city}`,
    issuedAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  });

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
  } else {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Partager le certificat',
      UTI: 'com.adobe.pdf',
    });
  }
}

/** Sauvegarde une demande de certificat en base */
export async function requestCertificate(userId: string): Promise<void> {
  const hasAttended = await checkAttendance(userId);
  if (!hasAttended) throw new Error('Aucune présence au salon enregistrée');

  await supabase.from('certificates').upsert([{
    user_id: userId,
    issued_at: new Date().toISOString(),
    status: 'valid',
  }], { onConflict: 'user_id' });
}

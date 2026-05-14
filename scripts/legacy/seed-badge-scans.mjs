/**
 * Seed de données de démo pour badge_scans
 * Usage: node seed-badge-scans.mjs
 *
 * - Récupère les exposants existants (pas besoin de team_members)
 * - Récupère des visiteurs existants en BDD
 * - Insère des scans variés sur les 7 derniers jours pour chaque exposant
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Charger les variables depuis .env
const envLines = readFileSync('.env', 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) env[m[1]] = m[2].trim();
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Variables VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function hoursAgo(h) { const d = new Date(); d.setHours(d.getHours() - h); return d.toISOString(); }
function uid() { return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const LOCATIONS = ['Entrée A', 'Entrée B', 'Stand B12', 'Espace conférence', 'Hall principal', 'Accueil VIP'];
const BADGE_TYPES = ['visitor', 'visitor', 'visitor', 'visitor', 'vip', 'press', 'exhibitor'];

// ─── Récupérer les exposants ──────────────────────────────────────────────────

const { data: exhibitorUsers, error: exErr } = await supabase
  .from('users')
  .select('id, name')
  .eq('type', 'exhibitor')
  .limit(10);

if (exErr || !exhibitorUsers?.length) {
  console.error('❌ Aucun utilisateur exposant trouvé:', exErr?.message);
  process.exit(1);
}

console.log(`✅ ${exhibitorUsers.length} exposant(s) trouvé(s)`);

// ─── Récupérer des visiteurs ──────────────────────────────────────────────────

// On ne fait pas de requête visitors puisqu'on utilise null
const visitors = null;
console.log(`👤 Pool de visiteurs: anonymes (visitor_id null — FK vers auth.users)`);

// visitor_id référence auth.users (pas public.users) — on utilise null pour les scans de démo
const visitorPool = Array(20).fill(null);

console.log(`👤 Pool de visiteurs: anonymes (visitor_id null — FK vers auth.users)`);

// ─── Supprimer les anciens scans de démo ─────────────────────────────────────

const exhibitorIds = exhibitorUsers.map(u => u.id);

const { error: delErr } = await supabase
  .from('badge_scans')
  .delete()
  .in('scanned_by', exhibitorIds);

if (delErr) {
  console.warn('⚠️  Suppression anciens scans:', delErr.message);
} else {
  console.log('🗑️  Anciens scans de démo supprimés');
}

await sleep(500);

// ─── Générer les scans ────────────────────────────────────────────────────────

function makeScan(scannerId, daysBack) {
  const scanDate = new Date();
  scanDate.setDate(scanDate.getDate() - daysBack);
  scanDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
  return {
    id: uid(),
    visitor_id: randomItem(visitorPool),
    scanned_by: scannerId,
    scanned_at: scanDate.toISOString(),
    location: randomItem(LOCATIONS),
    badge_type: randomItem(BADGE_TYPES),
  };
}

const allScans = [];
let totalInserted = 0;

// Pour chaque exposant: générer entre 8 et 15 scans sur 7 jours
for (const expo of exhibitorUsers) {
  const count = 8 + Math.floor(Math.random() * 8);
  const scans = [];

  for (let i = 0; i < count; i++) {
    scans.push(makeScan(expo.id, Math.floor(Math.random() * 7)));
  }

  // 2-3 scans aujourd'hui pour les stats
  const todayCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < todayCount; i++) {
    scans.push({
      id: uid(),
      visitor_id: randomItem(visitorPool),
      scanned_by: expo.id,
      scanned_at: hoursAgo(Math.floor(Math.random() * 6) + 1),
      location: randomItem(LOCATIONS),
      badge_type: randomItem(BADGE_TYPES),
    });
  }

  allScans.push({ expo, scans });
}

// ─── Insérer en lot ───────────────────────────────────────────────────────────

const flatScans = allScans.flatMap(g => g.scans);
console.log(`\n📋 Scans à insérer: ${flatScans.length}`);

const { error: insErr, data: inserted } = await supabase
  .from('badge_scans')
  .insert(flatScans)
  .select('id');

if (insErr) {
  console.error('❌ Erreur insertion:', insErr.message);
  if (insErr.code === '42P01') {
    console.error('\n⚠️  La table badge_scans n\'existe pas encore.');
    console.error('   Exécutez d\'abord la migration dans le SQL Editor Supabase:');
    console.error('   migrations/20260505_create_badge_scans.sql\n');
  }
  process.exit(1);
}

console.log(`\n✅ ${inserted?.length ?? flatScans.length} scans insérés avec succès !`);
console.log('\nRépartition par exposant:');
for (const { expo, scans } of allScans) {
  console.log(`  ${expo.name.slice(0, 40).padEnd(40)} → ${scans.length} scans`);
}
console.log('\n👉 Ouvrez http://localhost:9323/exhibitor/scans pour voir les données');

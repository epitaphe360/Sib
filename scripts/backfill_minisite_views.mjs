#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Veuillez définir VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DRY_RUN = process.argv.includes('--dry-run');
const FROM_PROFILE_STATS = process.argv.includes('--from-profile-stats');
const BATCH_SIZE = 500; // insérer par lots pour éviter trop gros payloads

async function backfillFromMiniSites() {
  console.log('🚀 Backfill depuis `mini_sites.view_count` démarré' + (DRY_RUN ? ' (dry-run)' : ''));

  const { data: sites, error } = await supabase
    .from('mini_sites')
    .select('exhibitor_id, view_count')
    .gt('view_count', 0);

  if (error) {
    console.error('❌ Erreur lecture mini_sites:', error.message || error);
    process.exit(1);
  }

  if (!sites || sites.length === 0) {
    console.log('✅ Aucun mini-site avec view_count > 0 trouvé. Rien à faire.');
    return 0;
  }

  let totalInserted = 0;

  for (const s of sites) {
    const exhibitorId = s.exhibitor_id;
    const targetCount = s.view_count || 0;

    // Compter les lignes déjà présentes
    const { count: existingCount } = await supabase
      .from('minisite_views')
      .select('*', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitorId);

    const have = existingCount || 0;
    const delta = targetCount - have;

    if (delta <= 0) {
      console.log(`— ${exhibitorId}: déjà ${have}/${targetCount} (rien à ajouter)`);
      continue;
    }

    console.log(`— ${exhibitorId}: besoin d'ajouter ${delta} lignes (actuel ${have} → cible ${targetCount})`);

    if (DRY_RUN) continue;

    // Préparer et insérer par batch
    const rows = makeRows(exhibitorId, delta);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await supabase.from('minisite_views').insert(chunk);
      if (insertErr) { console.error(`❌ Erreur insertion pour ${exhibitorId}:`, insertErr.message || insertErr); break; }
      totalInserted += chunk.length;
      console.log(`   ✔️ Inserted ${chunk.length} rows for ${exhibitorId}`);
    }
  }

  return totalInserted;
}

async function backfillFromProfileStats() {
  console.log('🚀 Backfill depuis `users.profile.stats.miniSiteViews` démarré' + (DRY_RUN ? ' (dry-run)' : ''));

  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, profile')
    .eq('type', 'exhibitor')
    .limit(1000);

  if (error) {
    console.error('❌ Erreur lecture users:', error.message || error);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('✅ Aucun utilisateur exposant trouvé. Rien à faire.');
    return 0;
  }

  let totalInserted = 0;

  for (const u of users) {
    const exhibitorId = u.id;
    const statsCount = u.profile?.stats?.miniSiteViews || 0;
    if (!statsCount || statsCount <= 0) {
      console.log(`— ${u.name || exhibitorId}: stats miniSiteViews absente ou nulle`);
      continue;
    }

    // Compter les lignes déjà présentes
    const { count: existingCount } = await supabase
      .from('minisite_views')
      .select('*', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitorId);

    const have = existingCount || 0;
    const delta = statsCount - have;

    if (delta <= 0) {
      console.log(`— ${u.name || exhibitorId}: déjà ${have}/${statsCount} (rien à ajouter)`);
      continue;
    }

    console.log(`— ${u.name || exhibitorId}: besoin d'ajouter ${delta} lignes (actuel ${have} → cible ${statsCount})`);

    if (DRY_RUN) continue;

    const rows = makeRows(exhibitorId, delta);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await supabase.from('minisite_views').insert(chunk);
      if (insertErr) { console.error(`❌ Erreur insertion pour ${exhibitorId}:`, insertErr.message || insertErr); break; }
      totalInserted += chunk.length;
      console.log(`   ✔️ Inserted ${chunk.length} rows for ${exhibitorId}`);
    }
  }

  return totalInserted;
}

function makeRows(exhibitorId, delta) {
  const rows = [];
  const now = Date.now();
  for (let i = 0; i < delta; i++) {
    const offset = Math.floor(Math.random() * 60 * 60 * 24 * 30); // up to 30 days
    rows.push({ exhibitor_id: exhibitorId, viewer_id: null, page_viewed: 'home', viewed_at: new Date(now - offset * 1000).toISOString() });
  }
  return rows;
}

async function main() {
  try {
    let total = 0;
    if (FROM_PROFILE_STATS) {
      total += await backfillFromProfileStats();
    } else {
      total += await backfillFromMiniSites();
    }

    console.log(`\n✨ Backfill terminé — Total inséré : ${total} (dry-run=${DRY_RUN})`);
  } catch (err) {
    console.error('❌ Erreur backfill:', err);
    process.exit(1);
  }
}

main();

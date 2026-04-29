#!/usr/bin/env node
/**
 * Génération des embeddings vectoriels pour tous les exposants — SIB 2026
 *
 * Lit la table `exhibitors`, génère un embedding via OpenAI text-embedding-3-small
 * pour chaque exposant qui n'en a pas encore (ou dont la fiche a été modifiée),
 * et stocke le vecteur dans la colonne `embedding`.
 *
 * Variables d'environnement requises (.env) :
 *   VITE_SUPABASE_URL          (ou SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY  (jamais côté client)
 *   OPENAI_API_KEY             (clé OpenAI)
 *
 * Usage :
 *   node scripts/generate-exhibitor-embeddings.cjs
 *   node scripts/generate-exhibitor-embeddings.cjs --force   # régénère tout
 *   node scripts/generate-exhibitor-embeddings.cjs --batch=10
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let OPENAI_KEY = process.env.OPENAI_API_KEY;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const BATCH_ARG = args.find(a => a.startsWith('--batch='));
const BATCH_SIZE = BATCH_ARG ? parseInt(BATCH_ARG.split('=')[1], 10) : 5;

// ─── Validation ────────────────────────────────────────────────────────────────
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Variables manquantes : VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Fallback : récupérer OPENAI_API_KEY depuis app_settings si absent du .env
async function resolveOpenAiKey() {
  if (OPENAI_KEY) return OPENAI_KEY;
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'OPENAI_API_KEY')
    .maybeSingle();
  if (!error && data?.value) {
    console.log('🔑 OPENAI_API_KEY chargée depuis app_settings (Admin Config)');
    OPENAI_KEY = data.value;
    return OPENAI_KEY;
  }
  console.error('❌ OPENAI_API_KEY introuvable (ni .env ni app_settings)');
  console.error('   → Ajouter via /admin/config section "Intelligence Artificielle"');
  console.error('   → Ou définir OPENAI_API_KEY dans .env');
  process.exit(1);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Construit le texte à vectoriser à partir d'une fiche exposant.
 * On combine les champs les plus discriminants pour le matching B2B.
 */
function buildEmbeddingText(exhibitor) {
  const parts = [
    exhibitor.company_name,
    exhibitor.sector,
    exhibitor.category,
    exhibitor.description,
    exhibitor.tagline,
    Array.isArray(exhibitor.services) ? exhibitor.services.join(', ') : '',
    Array.isArray(exhibitor.tags) ? exhibitor.tags.join(', ') : '',
    exhibitor.contact_info?.country ? `Pays : ${exhibitor.contact_info.country}` : '',
  ].filter(Boolean);
  return parts.join(' — ').slice(0, 8000);
}

/**
 * Appelle OpenAI pour vectoriser un texte (1536 dimensions).
 */
async function embedText(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI ${response.status}: ${err.slice(0, 200)}`);
  }
  const json = await response.json();
  return json.data[0].embedding;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await resolveOpenAiKey();
  console.log('🔍 Récupération des exposants...');

  let query = supabase
    .from('exhibitors')
    .select('id, company_name, sector, category, description, tagline, services, tags, contact_info, embedding');

  if (!FORCE) {
    query = query.is('embedding', null);
  }

  const { data: exhibitors, error } = await query;

  if (error) {
    console.error('❌ Erreur lecture exposants :', error.message);
    process.exit(1);
  }

  if (!exhibitors || exhibitors.length === 0) {
    console.log('✅ Aucun exposant à traiter (tous ont déjà un embedding).');
    console.log('   Utiliser --force pour tout régénérer.');
    return;
  }

  console.log(`📊 ${exhibitors.length} exposant(s) à vectoriser (batch de ${BATCH_SIZE})`);
  console.log(`💰 Coût estimé : ~$${(exhibitors.length * 0.000075).toFixed(4)} USD\n`);

  let success = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < exhibitors.length; i += BATCH_SIZE) {
    const batch = exhibitors.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (exhibitor) => {
      try {
        const text = buildEmbeddingText(exhibitor);
        if (!text || text.length < 5) {
          console.log(`⚠️  ${exhibitor.company_name || exhibitor.id} — fiche vide, skip`);
          failed++;
          return;
        }

        const embedding = await embedText(text);

        const { error: updateErr } = await supabase
          .from('exhibitors')
          .update({
            embedding,
            embedding_updated_at: new Date().toISOString(),
          })
          .eq('id', exhibitor.id);

        if (updateErr) throw new Error(updateErr.message);

        success++;
        console.log(`✅ ${exhibitor.company_name} (${success}/${exhibitors.length})`);
      } catch (err) {
        failed++;
        console.error(`❌ ${exhibitor.company_name || exhibitor.id} — ${err.message}`);
      }
    }));

    // Anti-rate-limit OpenAI : pause 1s entre les batchs
    if (i + BATCH_SIZE < exhibitors.length) {
      await sleep(1000);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Réussis : ${success}`);
  console.log(`❌ Échoués : ${failed}`);
  console.log(`⏱️  Durée  : ${durationSec}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});

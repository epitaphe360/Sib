/**
 * Script pour traduire automatiquement les partenaires FR → EN dans Supabase
 * Remplit les colonnes name_en, category_en, description_en, sector_en
 *
 * Utilisation: node scripts/translate-partners.mjs
 * Options:
 *   --force    Retraduit même les partenaires déjà traduits
 *   --dry-run  Affiche les traductions sans écrire dans la DB
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');

// Délai entre requêtes MyMemory pour éviter le rate limiting
const DELAY_MS = 350;

/**
 * Traduit un texte FR → EN via l'API MyMemory (gratuite, sans clé)
 */
async function translateText(text) {
  if (!text || text.trim() === '') return '';

  // Découper en morceaux de 400 chars (limite MyMemory)
  const chunks = splitText(text, 400);
  const translated = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i].trim();
    if (!chunk) { translated.push(''); continue; }

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=fr|en`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (res.ok) {
        const data = await res.json();
        translated.push(data?.responseData?.translatedText || chunk);
      } else {
        console.warn(`    ⚠️  MyMemory HTTP ${res.status}, conserve l'original`);
        translated.push(chunk);
      }
    } catch (err) {
      console.warn(`    ⚠️  Erreur réseau: ${err.message}, conserve l'original`);
      translated.push(chunk);
    }

    if (i < chunks.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  return translated.join(' ');
}

function splitText(text, maxLen) {
  if (!text || text.length <= maxLen) return [text];
  const chunks = [];
  const sentences = text.split(/([.!?]\s+)/);
  let current = '';
  for (const s of sentences) {
    if ((current + s).length <= maxLen) {
      current += s;
    } else {
      if (current) chunks.push(current.trim());
      current = s;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.length ? chunks : [text.substring(0, maxLen)];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Traduction automatique des partenaires SIB\n');
  if (DRY_RUN) console.log('🧪 MODE DRY-RUN — aucune écriture en DB\n');
  if (FORCE)   console.log('💪 MODE FORCE — retraduit tous les partenaires\n');

  // 1. Récupérer tous les partenaires
  console.log('📥 Récupération des partenaires depuis Supabase...');
  const { data: partners, error } = await supabase
    .from('partners')
    .select('id, company_name, name_en, category, category_en, description, description_en, sector, sector_en')
    .order('company_name');

  if (error) {
    console.error('❌ Erreur Supabase:', error.message);
    process.exit(1);
  }

  console.log(`✅ ${partners.length} partenaires trouvés\n`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < partners.length; i++) {
    const p = partners[i];
    const prefix = `[${String(i + 1).padStart(2, '0')}/${partners.length}]`;

    // Skip si déjà traduit (sauf --force)
    const alreadyDone = !FORCE && p.description_en && p.description_en.trim() !== '';
    if (alreadyDone) {
      console.log(`${prefix} ⏭️  ${p.company_name} — déjà traduit`);
      skipped++;
      continue;
    }

    console.log(`${prefix} 🔄 ${p.company_name}`);

    try {
      const updates = {};

      if (!p.name_en || FORCE) {
        process.stdout.write('    nom...');
        updates.name_en = await translateText(p.company_name);
        console.log(` "${updates.name_en}"`);
        await sleep(DELAY_MS);
      }

      if (!p.category_en || FORCE) {
        process.stdout.write('    catégorie...');
        updates.category_en = await translateText(p.category);
        console.log(` "${updates.category_en}"`);
        await sleep(DELAY_MS);
      }

      if (!p.sector_en || FORCE) {
        process.stdout.write('    secteur...');
        updates.sector_en = await translateText(p.sector);
        console.log(` "${updates.sector_en}"`);
        await sleep(DELAY_MS);
      }

      if (!p.description_en || FORCE) {
        process.stdout.write('    description...');
        updates.description_en = await translateText(p.description);
        console.log(` (${updates.description_en.length} chars)`);
        await sleep(DELAY_MS);
      }

      if (Object.keys(updates).length === 0) {
        console.log('    ✅ Rien à mettre à jour');
        skipped++;
        continue;
      }

      if (!DRY_RUN) {
        const { error: updateError } = await supabase
          .from('partners')
          .update(updates)
          .eq('id', p.id);

        if (updateError) {
          console.error(`    ❌ Erreur update: ${updateError.message}`);
          errors++;
          continue;
        }
      }

      console.log('    ✅ Sauvegardé\n');
      success++;

    } catch (err) {
      console.error(`    ❌ Erreur: ${err.message}`);
      errors++;
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`📊 Résultats:`);
  console.log(`   ✅ Traduits  : ${success}`);
  console.log(`   ⏭️  Ignorés   : ${skipped}`);
  console.log(`   ❌ Erreurs   : ${errors}`);
  console.log('─'.repeat(50));

  if (DRY_RUN) {
    console.log('\n🧪 Dry-run terminé. Relancez sans --dry-run pour écrire en DB.');
  } else {
    console.log('\n🎉 Traduction terminée ! Rechargez la page pour voir les résultats.');
  }
}

main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});

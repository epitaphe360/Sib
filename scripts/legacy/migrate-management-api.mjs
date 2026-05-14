/**
 * Migration via l'API Management Supabase
 * Utilise POST https://api.supabase.com/v1/projects/{ref}/database/query
 * Nécessite le Personal Access Token (SUPABASE_ACCESS_TOKEN)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = 'sbyizudifmqakzxjlndr';
const ACCESS_TOKEN = 'sbp_efaf677c6e29b3626871762d913f63408ad9465c';
const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');

const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function execSQL(sql, filename) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  console.log('🔍 Test connexion Management API...');
  const test = await execSQL('SELECT 1 as ok');
  if (test.status !== 200) {
    console.error('❌ Connexion échouée:', test.status, JSON.stringify(test.data));
    process.exit(1);
  }
  console.log('✅ Connexion OK\n');

  // Table de suivi des migrations
  await execSQL(`
    CREATE TABLE IF NOT EXISTS _sib_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Récupérer les migrations déjà appliquées
  const trackRes = await execSQL('SELECT filename FROM _sib_migrations ORDER BY filename');
  const alreadyApplied = new Set((trackRes.data || []).map(r => r.filename));

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📋 ${files.length} migrations trouvées, ${alreadyApplied.size} déjà appliquées\n`);

  let applied = 0, skipped = 0, errors = 0;

  for (const file of files) {
    if (alreadyApplied.has(file)) {
      console.log(`⏭️  [SKIP] ${file}`);
      skipped++;
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    const res = await execSQL(sql, file);

    const body = JSON.stringify(res.data);
    const isError = res.status >= 300 && !body.includes('already exists') && !body.includes('duplicate');
    const isAlreadyExists = body.includes('already exists') || body.includes('duplicate');

    if (isAlreadyExists) {
      console.log(`⚠️  [EXISTS] ${file}`);
      // Marquer comme appliquée quand même
      await execSQL(`INSERT INTO _sib_migrations (filename) VALUES ('${file.replace(/'/g, "''")}') ON CONFLICT (filename) DO NOTHING`);
      skipped++;
    } else if (isError) {
      console.log(`❌ [ERROR] ${file}: ${body.substring(0, 150)}`);
      errors++;
    } else {
      console.log(`✅ [OK] ${file}`);
      await execSQL(`INSERT INTO _sib_migrations (filename) VALUES ('${file.replace(/'/g, "''")}') ON CONFLICT (filename) DO NOTHING`);
      applied++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Appliquées : ${applied}`);
  console.log(`⏭️  Ignorées  : ${skipped}`);
  console.log(`❌ Erreurs   : ${errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (errors > 0) process.exit(1);
}

run().catch(err => {
  console.error('💥 Erreur fatale:', err.message);
  process.exit(1);
});

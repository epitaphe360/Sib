/**
 * Script de migration SQL — applique tous les fichiers .sql sur Supabase
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

const DB_URL = 'postgresql://postgres:WZiG!G3RfqiDY8H@db.sbyizudifmqakzxjlndr.supabase.co:5432/postgres';
const MIGRATIONS_DIR = path.join(__dirname, '..', 'siportv3_source', 'supabase', 'migrations');

const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  console.log('📦 Connexion à Supabase...');
  await client.connect();
  console.log('✅ Connecté\n');

  // Table de suivi des migrations
  await client.query(`
    CREATE TABLE IF NOT EXISTS _sib_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📋 ${files.length} migrations trouvées\n`);

  let applied = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    // Vérifier si déjà appliquée
    const { rows } = await client.query(
      'SELECT id FROM _sib_migrations WHERE filename = $1',
      [file]
    );

    if (rows.length > 0) {
      console.log(`⏭️  [SKIP] ${file}`);
      skipped++;
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO _sib_migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`✅ [OK]   ${file}`);
      applied++;
    } catch (err) {
      await client.query('ROLLBACK');
      // Certaines migrations peuvent échouer si objets déjà existants (idempotent)
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        await client.query(
          'INSERT INTO _sib_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
          [file]
        );
        console.log(`⚠️  [DUP]  ${file} — objet existant, ignoré`);
        skipped++;
      } else {
        console.error(`❌ [ERR]  ${file}\n         ${err.message.substring(0, 120)}`);
        errors++;
      }
    }
  }

  await client.end();

  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Appliquées : ${applied}`);
  console.log(`⏭️  Ignorées   : ${skipped}`);
  console.log(`❌ Erreurs    : ${errors}`);
  console.log('─'.repeat(60));

  if (errors > 0) process.exit(1);
}

run().catch(err => {
  console.error('Erreur fatale:', err.message);
  process.exit(1);
});

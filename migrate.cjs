/**
 * Script de migration SQL Supabase (CommonJS)
 */
const { Client } = require('./node_modules/pg');
const fs = require('fs');
const path = require('path');

// On essaie en priorité l'adresse IPv6 résolue par Resolve-DnsName
// L'hôte DNS n'est accessible que via IPv6 depuis cette machine
const DB_CONFIG = {
  host: '2a05:d012:42e:5714:bff4:8ca9:f8d0:32e7',
  port: 5432,
  user: 'postgres',
  password: 'WZiG!G3RfqiDY8H',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
};

const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');

async function run() {
  console.log('📦 Connexion à Supabase...');
  const client = new Client(DB_CONFIG);

  try {
    await client.connect();
    console.log('✅ Connecté\n');
  } catch (err) {
    console.error('❌ Erreur connexion:', err.message);
    console.log('\n💡 La connexion directe PostgreSQL est peut-être bloquée.');
    console.log('   Les migrations peuvent être appliquées via le Dashboard Supabase :');
    console.log('   https://supabase.com/dashboard/project/sbyizudifmqakzxjlndr/editor');
    process.exit(1);
  }

  // Table de suivi
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

  console.log(`📋 ${files.length} migrations à traiter\n`);

  let applied = 0, skipped = 0, errors = 0;

  for (const file of files) {
    const { rows } = await client.query(
      'SELECT id FROM _sib_migrations WHERE filename = $1', [file]
    );
    if (rows.length > 0) { process.stdout.write(`⏭️  ${file}\n`); skipped++; continue; }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _sib_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      process.stdout.write(`✅ ${file}\n`);
      applied++;
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        await client.query('INSERT INTO _sib_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
        process.stdout.write(`⚠️  ${file} [existant]\n`);
        skipped++;
      } else {
        process.stdout.write(`❌ ${file}\n   ${err.message.substring(0, 100)}\n`);
        errors++;
      }
    }
  }

  await client.end();
  console.log(`\n✅ Appliquées: ${applied}  ⏭️  Ignorées: ${skipped}  ❌ Erreurs: ${errors}`);
  if (errors > 0) process.exit(1);
}

run();

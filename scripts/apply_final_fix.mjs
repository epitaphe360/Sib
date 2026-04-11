#!/usr/bin/env node
// Script ESM pour appliquer supabase/final_fix.sql via une connexion Postgres
// Usage: set DATABASE_URL env var (ex: postgres://user:pass@host:5432/dbname)
//        or put DATABASE_URL in a .env file and run: node scripts/apply_final_fix.mjs

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.join(__dirname, '..', 'supabase', 'final_fix.sql');
if (!fs.existsSync(sqlPath)) {
  console.error('Impossible de trouver supabase/final_fix.sql à :', sqlPath);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Configurez la variable d\'environnement DATABASE_URL avant d\'exécuter ce script.');
  console.error('Exemple: export DATABASE_URL="postgres://user:pass@host:5432/dbname"');
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('Connecté à la base PostgreSQL');

    // Exécute le fichier SQL complet
    await client.query('BEGIN');
    console.log('BEGIN;');

    // Split by semicolon is naive, but final_fix.sql uses a single transaction; execute whole file.
    await client.query(sql);

    await client.query('COMMIT');
    console.log('COMMIT;');
    console.log('Le script final_fix.sql a été appliqué avec succès.');
  } catch (err) {
    console.error('Erreur lors de l\'exécution du script:', err.message || err);
    try {
      await client.query('ROLLBACK');
      console.log('ROLLBACK exécuté');
    } catch (rbErr) {
      console.error('Échec du ROLLBACK:', rbErr.message || rbErr);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

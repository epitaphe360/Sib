/**
 * Migration via API REST Supabase (HTTPS, pas de connexion directe PostgreSQL)
 * Utilise l'endpoint /rest/v1/rpc pour créer une fonction SQL temporaire puis l'exécuter
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNieWl6dWRpZm1xYWt6eGpsbmRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkxODcwMSwiZXhwIjoyMDkxNDk0NzAxfQ.-dbIT8rJ1cDoP-USJejVZku6R5MCg_UXvnuEHY1--cY';
const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');

function apiRequest(methods, urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(PROJECT_URL + urlPath);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: methods,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, data: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function execSQL(sql) {
  // Appel via la fonction exec_sql si elle existe, sinon via /pg endpoint
  const res = await apiRequest('POST', '/rest/v1/rpc/exec_sql', { sql_query: sql });
  if (res.status === 404) {
    // Essai via l'endpoint /pg/query (Supabase Platform)
    const res2 = await apiRequest('POST', '/pg/query', { query: sql });
    return res2;
  }
  return res;
}

async function run() {
  console.log('🔍 Test de connexion API Supabase...');
  const test = await apiRequest('GET', '/rest/v1/', null);
  if (test.status >= 400) {
    // Essai sans trailing slash
    const test2 = await apiRequest('GET', '/rest/v1/profiles?limit=1', null);
    if (test2.status >= 500) {
      console.error('❌ API non accessible:', test.status, JSON.stringify(test.data).substring(0, 100));
      process.exit(1);
    }
  }
  console.log('✅ API accessible (status:', test.status, ')\n');

  // Créer d'abord la fonction exec_sql
  const createFn = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$;
  `;

  // Essai via pg/query d'abord
  console.log('📝 Création de la fonction exec_sql...');
  const fnRes = await apiRequest('POST', '/pg/query', { query: createFn });
  if (fnRes.status === 404) {
    console.log('⚠️  /pg/query non disponible, tentative via migration directe...\n');
    await runMigrationsViaBatch();
    return;
  }
  console.log('✅ Fonction créée\n');

  await runMigrationsWithFn();
}

async function runMigrationsViaBatch() {
  // Combiner toutes les migrations en un seul appel fetchable
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  console.log(`📋 Import de ${files.length} migrations...\n`);
  
  let applied = 0, errors = 0;
  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    const res = await apiRequest('POST', '/pg/query', { query: sql });
    if (res.status === 200 || res.status === 201) {
      console.log(`✅ ${file}`);
      applied++;
    } else if (res.data && (String(res.data).includes('already exists') || String(res.data).includes('duplicate'))) {
      console.log(`⚠️  ${file} [existant]`);
    } else {
      console.log(`❌ ${file}: ${JSON.stringify(res.data).substring(0, 100)}`);
      errors++;
    }
  }
  console.log(`\n✅ ${applied} appliquées, ❌ ${errors} erreurs`);
}

async function runMigrationsWithFn() {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  console.log(`📋 ${files.length} migrations à appliquer\n`);

  // Créer table de suivi
  await execSQL(`
    CREATE TABLE IF NOT EXISTS _sib_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  let applied = 0, skipped = 0, errors = 0;

  for (const file of files) {
    // Vérifier si déjà appliquée
    const checkRes = await apiRequest('GET', `/rest/v1/_sib_migrations?filename=eq.${encodeURIComponent(file)}&select=id`, null);
    if (checkRes.status === 200 && Array.isArray(checkRes.data) && checkRes.data.length > 0) {
      console.log(`⏭️  ${file}`);
      skipped++;
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    const res = await execSQL(sql);

    if (res.status === 200 || res.status === 204) {
      await apiRequest('POST', '/rest/v1/_sib_migrations', { filename: file });
      console.log(`✅ ${file}`);
      applied++;
    } else {
      const errMsg = JSON.stringify(res.data);
      if (errMsg.includes('already exists') || errMsg.includes('duplicate')) {
        await apiRequest('POST', '/rest/v1/_sib_migrations', { filename: file });
        console.log(`⚠️  ${file} [existant]`);
        skipped++;
      } else {
        console.log(`❌ ${file}: ${errMsg.substring(0, 100)}`);
        errors++;
      }
    }
  }

  console.log(`\n✅ ${applied} appliquées  ⏭️  ${skipped} ignorées  ❌ ${errors} erreurs`);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });

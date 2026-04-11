// Script pour créer les tables via l'API PostgreSQL de Supabase
// Usage: node scripts/supabase_create_tables_direct.mjs

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

// Tenter d'utiliser la fonction pg_query si disponible (certains projets Supabase l'ont)
async function tryPgQuery(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/pg_query`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });
    
    const text = await res.text();
    if (res.ok) {
      console.log('✅ pg_query réussi');
      return { success: true, data: text };
    }
    console.log(`pg_query: ${res.status} - ${text}`);
    return { success: false };
  } catch (e) {
    console.log('pg_query non disponible');
    return { success: false };
  }
}

// Créer une table via insertion directe si elle n'existe pas
async function ensureTableViaREST(tableName) {
  const checkUrl = `${SUPABASE_URL}/rest/v1/${tableName}?select=count&limit=0`;
  
  try {
    const res = await fetch(checkUrl, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    if (res.ok) {
      console.log(`✅ ${tableName} existe déjà`);
      return true;
    }
    
    console.log(`❌ ${tableName} n'existe pas (${res.status})`);
    return false;
  } catch (e) {
    console.log(`❌ ${tableName} erreur: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Vérification et création des tables ===\n');
  
  const tables = ['profile_views', 'downloads', 'minisite_views'];
  const missing = [];
  
  for (const table of tables) {
    const exists = await ensureTableViaREST(table);
    if (!exists) missing.push(table);
  }
  
  if (missing.length === 0) {
    console.log('\n✅ Toutes les tables existent!');
    return;
  }
  
  console.log(`\n⚠️  Tables manquantes: ${missing.join(', ')}`);
  
  // Essayer pg_query
  const testResult = await tryPgQuery("SELECT 1 as test");
  
  if (!testResult.success) {
    console.log('\n📋 Créez les tables manuellement avec ce SQL:');
    console.log('   Supabase Dashboard > SQL Editor\n');
    
    if (missing.includes('profile_views')) {
      console.log(`
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID,
  viewed_user_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_select" ON profile_views FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON profile_views FOR INSERT WITH CHECK (true);
`);
    }
    
    if (missing.includes('downloads')) {
      console.log(`
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  downloader_id UUID,
  document_type VARCHAR(50) DEFAULT 'catalog',
  document_name VARCHAR(255),
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_select" ON downloads FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON downloads FOR INSERT WITH CHECK (true);
`);
    }
    
    if (missing.includes('minisite_views')) {
      console.log(`
CREATE TABLE minisite_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id UUID NOT NULL,
  viewer_id UUID,
  page_viewed VARCHAR(100) DEFAULT 'home',
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_select" ON minisite_views FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON minisite_views FOR INSERT WITH CHECK (true);
`);
    }
  }
}

main().catch(console.error);

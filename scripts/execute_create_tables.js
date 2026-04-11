// Script pour créer les tables manquantes via pg_query de Supabase
// Usage: SUPABASE_URL=xxx SUPABASE_KEY=xxx node scripts/execute_create_tables.js

const SQL_COMMANDS = [
  // 1. TABLE PROFILE_VIEWS
  `CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id UUID,
    viewed_user_id UUID NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_user_id)`,
  
  `ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY`,
  
  `DROP POLICY IF EXISTS "profile_views_select" ON profile_views`,
  `CREATE POLICY "profile_views_select" ON profile_views FOR SELECT USING (true)`,
  
  `DROP POLICY IF EXISTS "profile_views_insert" ON profile_views`,
  `CREATE POLICY "profile_views_insert" ON profile_views FOR INSERT WITH CHECK (true)`,
  
  // 2. TABLE DOWNLOADS
  `CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    downloader_id UUID,
    document_type VARCHAR(50) DEFAULT 'catalog',
    document_name VARCHAR(255),
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id)`,
  
  `ALTER TABLE downloads ENABLE ROW LEVEL SECURITY`,
  
  `DROP POLICY IF EXISTS "downloads_select" ON downloads`,
  `CREATE POLICY "downloads_select" ON downloads FOR SELECT USING (true)`,
  
  `DROP POLICY IF EXISTS "downloads_insert" ON downloads`,
  `CREATE POLICY "downloads_insert" ON downloads FOR INSERT WITH CHECK (true)`,
  
  // 3. TABLE MINISITE_VIEWS
  `CREATE TABLE IF NOT EXISTS minisite_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibitor_id UUID NOT NULL,
    viewer_id UUID,
    page_viewed VARCHAR(100) DEFAULT 'home',
    viewed_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_minisite_views_exhibitor ON minisite_views(exhibitor_id)`,
  
  `ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY`,
  
  `DROP POLICY IF EXISTS "minisite_views_select" ON minisite_views`,
  `CREATE POLICY "minisite_views_select" ON minisite_views FOR SELECT USING (true)`,
  
  `DROP POLICY IF EXISTS "minisite_views_insert" ON minisite_views`,
  `CREATE POLICY "minisite_views_insert" ON minisite_views FOR INSERT WITH CHECK (true)`
];

async function executeSQLviaRPC(supabaseUrl, supabaseKey, sql) {
  // Méthode 1: Via fonction RPC sql_query si disponible
  const rpcUrl = `${supabaseUrl}/rest/v1/rpc/sql_query`;
  
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (res.ok) {
      return { success: true, method: 'rpc' };
    }
  } catch (e) {
    // Continue
  }
  
  return { success: false };
}

async function checkTableExists(supabaseUrl, supabaseKey, tableName) {
  const url = `${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/json'
      }
    });
    
    return res.ok;
  } catch (e) {
    return false;
  }
}

(async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
  }

  console.log('=== Création des tables manquantes ===\n');
  
  // Vérifier l'état actuel
  const tables = ['profile_views', 'downloads', 'minisite_views'];
  
  console.log('État actuel des tables:');
  for (const table of tables) {
    const exists = await checkTableExists(supabaseUrl, supabaseKey, table);
    console.log(`  ${table}: ${exists ? '✅ existe' : '❌ manquante'}`);
  }
  
  console.log('\n⚠️  Les tables doivent être créées manuellement dans Supabase Dashboard.');
  console.log('\n📋 Copiez et exécutez ce SQL dans Supabase > SQL Editor:\n');
  
  const fullSQL = `
-- ==============================================
-- CRÉATION DES TABLES MANQUANTES POUR SIPORT
-- Exécuter dans: Supabase Dashboard > SQL Editor
-- ==============================================

-- 1. TABLE PROFILE_VIEWS (analytics des vues de profil)
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID,
  viewed_user_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_user_id);
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_views_select" ON profile_views;
CREATE POLICY "profile_views_select" ON profile_views FOR SELECT USING (true);
DROP POLICY IF EXISTS "profile_views_insert" ON profile_views;
CREATE POLICY "profile_views_insert" ON profile_views FOR INSERT WITH CHECK (true);

-- 2. TABLE DOWNLOADS (téléchargements de documents)
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  downloader_id UUID,
  document_type VARCHAR(50) DEFAULT 'catalog',
  document_name VARCHAR(255),
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "downloads_select" ON downloads;
CREATE POLICY "downloads_select" ON downloads FOR SELECT USING (true);
DROP POLICY IF EXISTS "downloads_insert" ON downloads;
CREATE POLICY "downloads_insert" ON downloads FOR INSERT WITH CHECK (true);

-- 3. TABLE MINISITE_VIEWS (vues des mini-sites exposants)
CREATE TABLE IF NOT EXISTS minisite_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id UUID NOT NULL,
  viewer_id UUID,
  page_viewed VARCHAR(100) DEFAULT 'home',
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_minisite_views_exhibitor ON minisite_views(exhibitor_id);
ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "minisite_views_select" ON minisite_views;
CREATE POLICY "minisite_views_select" ON minisite_views FOR SELECT USING (true);
DROP POLICY IF EXISTS "minisite_views_insert" ON minisite_views;
CREATE POLICY "minisite_views_insert" ON minisite_views FOR INSERT WITH CHECK (true);

-- Vérification
SELECT 'Tables créées avec succès!' as status;
`;

  console.log(fullSQL);
  
  console.log('\n=== Instructions ===');
  console.log('1. Allez sur https://supabase.com/dashboard');
  console.log('2. Sélectionnez le projet: eqjoqgpbxhsfgcovipgu');
  console.log('3. Cliquez sur "SQL Editor" dans le menu de gauche');
  console.log('4. Collez le SQL ci-dessus et cliquez sur "Run"');
})();

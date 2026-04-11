// Script pour créer les tables manquantes: profile_views, downloads, minisite_views
// Usage: SUPABASE_URL=xxx SUPABASE_KEY=xxx node scripts/create_missing_tables.js

async function executeSQL(supabaseUrl, supabaseKey, sql) {
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/exec_sql`;
  
  // Essayer d'abord avec la fonction RPC (si elle existe)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (res.ok) {
      return { success: true };
    }
  } catch (e) {
    // Ignore, on essaie autrement
  }
  
  return { success: false, message: 'RPC non disponible' };
}

async function createTableViaRest(supabaseUrl, supabaseKey, tableName, testInsert) {
  // Tester si la table existe déjà
  const checkUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}?select=*&limit=1`;
  
  try {
    const res = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/json'
      }
    });
    
    if (res.ok) {
      console.log(`✅ Table ${tableName} existe déjà`);
      return { exists: true, created: false };
    }
    
    console.log(`❌ Table ${tableName} n'existe pas (HTTP ${res.status})`);
    return { exists: false, created: false };
  } catch (err) {
    console.error(`Erreur lors de la vérification de ${tableName}:`, err.message);
    return { exists: false, created: false, error: err.message };
  }
}

async function insertTestData(supabaseUrl, supabaseKey, tableName, data) {
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    
    if (res.ok || res.status === 201) {
      console.log(`✅ Données insérées dans ${tableName}`);
      return { success: true };
    }
    
    const text = await res.text();
    console.log(`⚠️ Insertion dans ${tableName}: HTTP ${res.status} - ${text}`);
    return { success: false, status: res.status, body: text };
  } catch (err) {
    console.error(`Erreur lors de l'insertion dans ${tableName}:`, err.message);
    return { success: false, error: err.message };
  }
}

(async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables.');
    process.exit(1);
  }

  console.log('=== Vérification des tables manquantes ===\n');

  const tables = ['profile_views', 'downloads', 'minisite_views', 'activities'];
  
  for (const table of tables) {
    await createTableViaRest(supabaseUrl, supabaseKey, table);
  }

  console.log('\n=== Instructions pour créer les tables manquantes ===');
  console.log('\nAllez dans Supabase Dashboard > SQL Editor et exécutez ce SQL:\n');
  
  const sql = `
-- =====================================================
-- TABLES MANQUANTES POUR SIPORT
-- Exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. TABLE PROFILE_VIEWS (vues de profil)
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own profile views"
  ON profile_views FOR SELECT
  USING (viewed_user_id = auth.uid() OR viewer_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Anyone can insert profile views"
  ON profile_views FOR INSERT
  WITH CHECK (true);

-- 2. TABLE DOWNLOADS (téléchargements de documents)
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  downloader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_type VARCHAR(50) DEFAULT 'catalog',
  document_name VARCHAR(255),
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_downloader ON downloads(downloader_id);
CREATE INDEX IF NOT EXISTS idx_downloads_at ON downloads(downloaded_at);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own downloads"
  ON downloads FOR SELECT
  USING (user_id = auth.uid() OR downloader_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Anyone can insert downloads"
  ON downloads FOR INSERT
  WITH CHECK (true);

-- 3. TABLE MINISITE_VIEWS (vues des mini-sites exposants)
CREATE TABLE IF NOT EXISTS minisite_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_viewed VARCHAR(100) DEFAULT 'home',
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_minisite_views_exhibitor ON minisite_views(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_viewer ON minisite_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_at ON minisite_views(viewed_at);

ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own minisite views"
  ON minisite_views FOR SELECT
  USING (exhibitor_id = auth.uid() OR viewer_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Anyone can insert minisite views"
  ON minisite_views FOR INSERT
  WITH CHECK (true);

-- 4. TABLE ACTIVITIES (activités récentes) - si elle n'existe pas
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own activities"
  ON activities FOR SELECT
  USING (user_id = auth.uid() OR actor_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Anyone can insert activities"
  ON activities FOR INSERT
  WITH CHECK (true);

-- Confirmation
SELECT 'Tables créées avec succès!' as message;
`;

  console.log(sql);
  
  console.log('\n=== FIN ===');
})();

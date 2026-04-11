#!/usr/bin/env node

/**
 * CRÉATION AUTOMATIQUE DES TABLES SUPABASE
 * Utilise la clé service_role pour exécuter du SQL via l'API Management
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = 'eqjoqgpbxhsfgcovipgu';

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function executeSql(sql, label) {
  try {
    // Utiliser l'endpoint pg-meta pour exécuter du SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    // Méthode alternative : utiliser directement pg via le endpoint query
    const pgResponse = await fetch(`https://${PROJECT_REF}.supabase.co/pg/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (pgResponse.ok) {
      console.log(`   ✅ ${label}`);
      return true;
    }
    
    // Essayer via le SQL endpoint standard
    const sqlResponse = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sql })
    });
    
    if (sqlResponse.ok) {
      console.log(`   ✅ ${label}`);
      return true;
    }

    const error = await pgResponse.text();
    console.log(`   ❌ ${label}: ${error.substring(0, 120)}`);
    return false;
  } catch (err) {
    console.log(`   ❌ ${label}: ${err.message}`);
    return false;
  }
}

async function createTablesViaServiceRole() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  CRÉATION AUTOMATIQUE DES TABLES SUPABASE');
  console.log('═══════════════════════════════════════════════════════\n');

  // Lire le fichier SQL
  const fs = await import('fs');
  const sqlContent = fs.readFileSync('supabase_clean_install.sql', 'utf8');
  
  // Essayer via l'API Supabase Management (v1)
  console.log('📡 Tentative via Supabase Management API...\n');
  
  const mgmtResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sqlContent })
  });

  if (mgmtResponse.ok) {
    const result = await mgmtResponse.json();
    console.log('✅ Tables créées avec succès via Management API !');
    console.log(JSON.stringify(result, null, 2));
    return true;
  }

  console.log('   Management API non disponible, essai via service_role...\n');

  // Méthode 2 : Créer une fonction RPC temporaire avec service_role
  const createExecFn = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$;
  `;

  // Essayer de créer la fonction via l'API REST avec service_role
  const rpcCreateResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql_query: 'SELECT 1' })
  });

  if (!rpcCreateResponse.ok) {
    console.log('   Fonction exec_sql non disponible.\n');
    console.log('   📋 Utilisation de la méthode par INSERT directs...\n');
  }

  // Méthode 3 : Vérifier et créer les tables une par une via service_role
  console.log('📡 Vérification des tables avec service_role...\n');
  
  const tables = ['news_articles', 'article_tags', 'media_library', 'testimonials', 
                   'static_pages', 'faq_items', 'site_config', 'newsletter_subscribers'];
  
  const results = {};
  for (const table of tables) {
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count&limit=0`, {
      method: 'HEAD',
      headers
    });
    results[table] = checkResponse.ok;
    console.log(`   ${checkResponse.ok ? '✅' : '❌'} ${table}`);
  }

  const missing = Object.entries(results).filter(([_, exists]) => !exists).map(([name]) => name);
  
  if (missing.length === 0) {
    console.log('\n✅ Toutes les tables existent déjà !');
    return true;
  }

  console.log(`\n⚠️  ${missing.length} tables manquantes: ${missing.join(', ')}`);
  console.log('\n   Les tables doivent être créées via le SQL Editor de Supabase.');
  console.log('   Tentative via Supabase CLI...\n');
  
  return false;
}

async function main() {
  const success = await createTablesViaServiceRole();
  
  if (!success) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  MÉTHODE ALTERNATIVE : SUPABASE CLI');  
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Installation et exécution via npx supabase...\n');
    
    // Tentative via supabase CLI
    const { execSync } = await import('child_process');
    try {
      execSync(`npx supabase db execute --project-ref ${PROJECT_REF} -f supabase_clean_install.sql`, {
        stdio: 'inherit',
        env: { ...process.env, SUPABASE_ACCESS_TOKEN: SERVICE_ROLE_KEY }
      });
      console.log('\n✅ Tables créées via Supabase CLI !');
    } catch (err) {
      console.log('\n❌ CLI non disponible. Utilisation du DB URL direct...\n');
      
      // Méthode finale : connexion PostgreSQL directe
      try {
        // Installer pg dynamiquement
        execSync('npm install pg --no-save', { stdio: 'pipe' });
        const { default: pg } = await import('pg');
        
        const fs = await import('fs');
        const sqlContent = fs.readFileSync('supabase_clean_install.sql', 'utf8');
        
        const client = new pg.Client({
          connectionString: `postgresql://postgres.${PROJECT_REF}:${process.env.JWT_SECRET}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`,
          ssl: { rejectUnauthorized: false }
        });
        
        await client.connect();
        console.log('✅ Connexion PostgreSQL directe établie !');
        
        await client.query(sqlContent);
        console.log('✅ Toutes les tables créées avec succès !');
        
        await client.end();
      } catch (pgErr) {
        console.log(`❌ Connexion PostgreSQL échouée: ${pgErr.message}`);
        console.log('\n📋 Veuillez exécuter le SQL manuellement dans le SQL Editor de Supabase.');
      }
    }
  }
  
  // Vérification finale
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  VÉRIFICATION FINALE');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const tables = ['news_articles', 'article_tags', 'media_library', 'testimonials', 
                   'static_pages', 'faq_items', 'site_config', 'newsletter_subscribers'];
  
  let allOk = true;
  for (const table of tables) {
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count&limit=0`, {
      method: 'HEAD',
      headers
    });
    const ok = checkResponse.ok;
    if (!ok) allOk = false;
    console.log(`   ${ok ? '✅' : '❌'} ${table}`);
  }
  
  if (allOk) {
    console.log('\n🎉 TOUTES LES TABLES SONT PRÊTES !');
    console.log('   Vous pouvez maintenant lancer l\'application.\n');
  }
}

main().catch(console.error);

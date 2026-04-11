#!/usr/bin/env node

/**
 * Découvrir le schéma réel des tables Supabase
 */
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

async function getColumns(table) {
  // GET avec select=* et limit=0 pour voir les headers/colonnes
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=0`, {
    method: 'GET',
    headers: {
      ...headers,
      'Prefer': 'count=exact'
    }
  });
  
  console.log(`\n📋 ${table} (status: ${res.status}):`);
  
  if (res.ok) {
    // Try to get an empty row to see column structure
    const data = await res.json();
    const count = res.headers.get('content-range');
    console.log(`   Count: ${count}`);
    
    // Try OPTIONS to get columns
    const optRes = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'OPTIONS',
      headers
    });
    
    if (optRes.ok) {
      const defs = await optRes.json();
      if (defs && defs.definitions && defs.definitions[table]) {
        const props = defs.definitions[table].properties;
        const cols = Object.keys(props);
        console.log(`   Colonnes (${cols.length}): ${cols.join(', ')}`);
      }
    }
  } else {
    const error = await res.text();
    console.log(`   Erreur: ${error.substring(0, 200)}`);
  }
}

// Test INSERT with service_role
async function testInsert() {
  console.log('\n\n🧪 TEST INSERT avec service_role:');
  
  const testData = {
    title: 'TEST_DELETE_ME',
    slug: 'test-delete-me-' + Date.now(),
    excerpt: 'Test',
    content: 'Test content',
    category: 'actualite',
    is_published: true
  };
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/news_articles`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(testData)
  });
  
  console.log(`   Status: ${res.status}`);
  const body = await res.text();
  console.log(`   Response: ${body.substring(0, 300)}`);
  
  if (res.ok) {
    // Supprimer le test
    const data = JSON.parse(body);
    if (data[0]?.id) {
      await fetch(`${SUPABASE_URL}/rest/v1/news_articles?id=eq.${data[0].id}`, {
        method: 'DELETE',
        headers
      });
      console.log('   ✅ Test INSERT/DELETE réussi !');
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  DÉCOUVERTE SCHÉMA SUPABASE');
  console.log('═══════════════════════════════════════════════════════');

  const tables = ['news_articles', 'media_library', 'static_pages', 'testimonials'];
  
  for (const table of tables) {
    await getColumns(table);
  }
  
  await testInsert();
}

main().catch(console.error);

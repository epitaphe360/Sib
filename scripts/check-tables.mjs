#!/usr/bin/env node

/**
 * VÉRIFICATION DES TABLES SUPABASE
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

async function checkTable(tableName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ ${tableName} - EXISTS (${data.length} rows visible)`);
      return true;
    } else {
      const error = await response.text();
      console.log(`✗ ${tableName} - ${error.substring(0, 100)}`);
      return false;
    }
  } catch (err) {
    console.log(`✗ ${tableName} - ERROR: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  VÉRIFICATION DES TABLES SUPABASE');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const tables = [
    'news_articles',
    'article_tags',
    'media_library',
    'testimonials',
    'static_pages',
    'faq_items',
    'site_config',
    'newsletter_subscribers'
  ];
  
  for (const table of tables) {
    await checkTable(table);
  }
  
  console.log('\n');
}

main().catch(console.error);

#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('=== SCHEMA mini_sites ===');
  
  // Method 1: Try to insert empty and read error
  const { data: d1, error: e1 } = await supabase.from('mini_sites').select('*').limit(1);
  if (e1) {
    console.log('Erreur select mini_sites:', e1.message);
  } else {
    if (d1 && d1.length > 0) {
      console.log('Colonnes mini_sites:', Object.keys(d1[0]));
      console.log('Exemple:', JSON.stringify(d1[0], null, 2));
    } else {
      console.log('Table mini_sites vide. Test insert minimal...');
      
      // Try with different column sets to discover schema
      const testSets = [
        { exhibitor_id: '00000000-0000-0000-0000-000000000001' },
        { exhibitor_id: '00000000-0000-0000-0000-000000000001', slug: 'test' },
        { exhibitor_id: '00000000-0000-0000-0000-000000000001', name: 'test' },
        { exhibitor_id: '00000000-0000-0000-0000-000000000001', title: 'test' },
      ];
      
      for (const testData of testSets) {
        const { error } = await supabase.from('mini_sites').insert(testData);
        console.log(`Test ${JSON.stringify(Object.keys(testData))}:`, error?.message || 'SUCCESS');
      }
    }
  }

  console.log('\n=== SCHEMA exhibitors ===');
  const { data: d2, error: e2 } = await supabase.from('exhibitors').select('*').limit(1);
  if (e2) {
    console.log('Erreur select exhibitors:', e2.message);
  } else if (d2 && d2.length > 0) {
    console.log('Colonnes exhibitors:', Object.keys(d2[0]));
    console.log('Exemple:', JSON.stringify(d2[0], null, 2));
  }

  // Use information_schema to get actual columns
  console.log('\n=== INFORMATION_SCHEMA mini_sites ===');
  const { data: cols, error: colsErr } = await supabase
    .rpc('get_table_columns', { table_name_param: 'mini_sites' });
  
  if (colsErr) {
    console.log('RPC not available, trying raw SQL via REST...');
    
    // Alternative: query using PostgREST
    const response = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites?select=*&limit=0`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    });
    
    // Check content-type header for column info
    const contentRange = response.headers.get('content-range');
    console.log('Content-Range:', contentRange);
    
    // Try to get columns from OpenAPI spec
    const specResponse = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_SERVICE_ROLE_KEY}`);
    const spec = await specResponse.json();
    
    if (spec.definitions && spec.definitions.mini_sites) {
      console.log('\nMini_sites schema from OpenAPI:');
      const props = spec.definitions.mini_sites.properties;
      for (const [col, def] of Object.entries(props)) {
        console.log(`  ${col}: ${def.type || def.format || JSON.stringify(def)}`);
      }
    } else {
      console.log('mini_sites definition not found in OpenAPI spec');
      console.log('Available tables:', Object.keys(spec.definitions || {}));
    }
    
    // Also check exhibitors schema
    if (spec.definitions && spec.definitions.exhibitors) {
      console.log('\nExhibitors schema from OpenAPI:');
      const props = spec.definitions.exhibitors.properties;
      for (const [col, def] of Object.entries(props)) {
        console.log(`  ${col}: ${def.type || def.format || JSON.stringify(def)}`);
      }
    }
  } else {
    console.log('Columns:', cols);
  }
}

main().catch(console.error);

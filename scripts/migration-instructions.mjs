/**
 * Script pour appliquer la migration partners via l'API Supabase
 * Ce script ajoute les colonnes nécessaires pour la page partenaire enrichie
 */

import https from 'https';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

// Les colonnes à ajouter
const columns = [
  { name: 'mission', type: 'text', default: null },
  { name: 'vision', type: 'text', default: null },
  { name: 'values_list', type: 'jsonb', default: '[]' },
  { name: 'certifications', type: 'jsonb', default: '[]' },
  { name: 'awards', type: 'jsonb', default: '[]' },
  { name: 'social_media', type: 'jsonb', default: '{}' },
  { name: 'key_figures', type: 'jsonb', default: '[]' },
  { name: 'testimonials', type: 'jsonb', default: '[]' },
  { name: 'news', type: 'jsonb', default: '[]' },
  { name: 'expertise', type: 'jsonb', default: '[]' },
  { name: 'clients', type: 'jsonb', default: '[]' },
  { name: 'video_url', type: 'text', default: null },
  { name: 'gallery', type: 'jsonb', default: '[]' },
  { name: 'established_year', type: 'integer', default: null },
  { name: 'employees', type: 'text', default: null },
  { name: 'country', type: 'text', default: "'Maroc'" }
];

console.log('='.repeat(60));
console.log('MIGRATION MANUELLE REQUISE');
console.log('='.repeat(60));
console.log('\nLes colonnes doivent être ajoutées manuellement via Supabase Dashboard.\n');
console.log('ÉTAPES:');
console.log('1. Ouvrez: https://supabase.com/dashboard/project/eqjoqgpbxhsfgcovipgu/sql/new');
console.log('2. Copiez et exécutez le SQL ci-dessous:\n');
console.log('-'.repeat(60));

// Générer le SQL
let sql = '-- Migration: Enrichir la table partners\n\n';
columns.forEach(col => {
  if (col.default !== null) {
    sql += `ALTER TABLE partners ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} DEFAULT '${col.default}'::${col.type};\n`;
  } else {
    sql += `ALTER TABLE partners ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};\n`;
  }
});

console.log(sql);
console.log('-'.repeat(60));
console.log('\n3. Cliquez sur "Run" (F5)');
console.log('4. Une fois terminé, exécutez: node scripts/populate-partners-data.mjs\n');

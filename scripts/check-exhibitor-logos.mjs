import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n=== VÉRIFICATION DES LOGOS EXPOSANTS ===\n');

const { data: exhibitors, error } = await supabaseAdmin
  .from('exhibitors')
  .select('id, company_name, logo_url, sector')
  .order('company_name');

if (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

console.log(`Total exposants: ${exhibitors.length}\n`);

for (const exhibitor of exhibitors) {
  console.log('─'.repeat(70));
  console.log(`\n🏢 ${exhibitor.company_name}`);
  console.log(`   ID: ${exhibitor.id}`);
  console.log(`   Secteur: ${exhibitor.sector || 'N/A'}`);
  console.log(`   Logo URL: ${exhibitor.logo_url || '❌ MANQUANT'}`);
  
  if (exhibitor.logo_url) {
    // Vérifier si c'est une URL valide
    try {
      new URL(exhibitor.logo_url);
      console.log(`   ✅ URL valide`);
    } catch {
      console.log(`   ⚠️ URL INVALIDE`);
    }
  }
}

console.log('\n' + '─'.repeat(70));

// Compter les problèmes
const withoutLogo = exhibitors.filter(e => !e.logo_url);
const withInvalidUrl = exhibitors.filter(e => {
  if (!e.logo_url) return false;
  try {
    new URL(e.logo_url);
    return false;
  } catch {
    return true;
  }
});

console.log(`\n📊 STATISTIQUES:`);
console.log(`   Total: ${exhibitors.length}`);
console.log(`   Sans logo: ${withoutLogo.length}`);
console.log(`   URL invalide: ${withInvalidUrl.length}`);

if (withoutLogo.length > 0) {
  console.log(`\n⚠️ Exposants sans logo:`);
  withoutLogo.forEach(e => console.log(`   - ${e.company_name}`));
}

if (withInvalidUrl.length > 0) {
  console.log(`\n⚠️ Exposants avec URL invalide:`);
  withInvalidUrl.forEach(e => console.log(`   - ${e.company_name}: ${e.logo_url}`));
}

console.log('\n');

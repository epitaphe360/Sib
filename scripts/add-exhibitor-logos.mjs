import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n=== AJOUT DES LOGOS EXPOSANTS ===\n');

// Logos placeholder basés sur le secteur
const logoMappings = {
  'TechMarine Solutions': 'https://ui-avatars.com/api/?name=TechMarine+Solutions&background=0D47A1&color=fff&size=200&bold=true',
  'Maritime Operations': 'https://ui-avatars.com/api/?name=Maritime+Operations&background=1565C0&color=fff&size=200&bold=true',
  'Global Shipping Alliance': 'https://ui-avatars.com/api/?name=Global+Shipping&background=1976D2&color=fff&size=200&bold=true',
  'OceanLogistics Pro': 'https://ui-avatars.com/api/?name=OceanLogistics&background=1E88E5&color=fff&size=200&bold=true',
  'PortTech Industries': 'https://ui-avatars.com/api/?name=PortTech&background=2196F3&color=fff&size=200&bold=true',
};

// Récupérer tous les exposants
const { data: exhibitors, error } = await supabaseAdmin
  .from('exhibitors')
  .select('id, company_name, logo_url');

if (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

console.log(`Total exposants: ${exhibitors.length}\n`);

let updated = 0;
let skipped = 0;

for (const exhibitor of exhibitors) {
  // Si l'exposant a déjà un logo, on le garde
  if (exhibitor.logo_url) {
    console.log(`⏭️  ${exhibitor.company_name} - Logo existant conservé`);
    skipped++;
    continue;
  }

  // Déterminer le logo à utiliser
  let logoUrl = logoMappings[exhibitor.company_name];
  
  if (!logoUrl) {
    // Logo générique basé sur le nom
    const name = exhibitor.company_name || 'Company';
    logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=424242&color=fff&size=200&bold=true`;
  }

  // Mettre à jour l'exposant
  const { error: updateError } = await supabaseAdmin
    .from('exhibitors')
    .update({ logo_url: logoUrl })
    .eq('id', exhibitor.id);

  if (updateError) {
    console.error(`❌ ${exhibitor.company_name} - Erreur: ${updateError.message}`);
  } else {
    console.log(`✅ ${exhibitor.company_name || exhibitor.id}`);
    console.log(`   Logo: ${logoUrl}`);
    updated++;
  }
}

console.log('\n' + '─'.repeat(70));
console.log(`\n📊 RÉSUMÉ:`);
console.log(`   Mis à jour: ${updated}`);
console.log(`   Ignorés (déjà présents): ${skipped}`);
console.log(`   Total: ${exhibitors.length}`);
console.log('\n✅ Opération terminée!\n');

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function fixNullVisitorLevels() {
  console.log('🔍 Recherche des visiteurs avec visitor_level = null...\n');

  // Trouver les visiteurs avec null
  const { data: nullVisitors, error: searchError } = await supabase
    .from('users')
    .select('id, name, email, visitor_level, type')
    .eq('type', 'visitor')
    .is('visitor_level', null);

  if (searchError) {
    console.error('❌ Erreur:', searchError);
    return;
  }

  if (nullVisitors.length === 0) {
    console.log('✅ Aucun visiteur avec visitor_level = null');
    return;
  }

  console.log(`⚠️  Trouvé ${nullVisitors.length} visiteur(s) avec visitor_level = null:\n`);
  nullVisitors.forEach(v => {
    console.log(`  📌 ${v.name} (${v.email})`);
  });

  console.log(`\n🔧 Correction: Setting visitor_level = 'free'...\n`);

  // Mettre à jour tous les null à 'free'
  const { error: updateError, data: updated } = await supabase
    .from('users')
    .update({ visitor_level: 'free' })
    .eq('type', 'visitor')
    .is('visitor_level', null)
    .select();

  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour:', updateError);
    return;
  }

  console.log(`✅ ${updated.length} visiteur(s) corrigé(s)`);
  updated.forEach(v => {
    console.log(`  ✓ ${v.name} → visitor_level = '${v.visitor_level}'`);
  });
}

fixNullVisitorLevels().catch(console.error);

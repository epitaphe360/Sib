import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function fixVisitorFreeQuota() {
  console.log('🔍 Vérification des visiteurs FREE avec des rendez-vous...\n');

  // 1. Récupérer tous les visiteurs FREE
  const { data: freeVisitors, error: visitorsError } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      visitor_tier,
      appointments:appointments(
        id,
        status,
        created_at
      )
    `)
    .eq('type', 'visitor')
    .eq('visitor_tier', 'free');

  if (visitorsError) {
    console.error('❌ Erreur lors de la récupération des visiteurs FREE:', visitorsError);
    return;
  }

  console.log(`✅ Récupérés ${freeVisitors.length} visiteurs FREE\n`);

  // 2. Identifier ceux qui ont des rendez-vous
  const violatingVisitors = freeVisitors.filter(v => v.appointments && v.appointments.length > 0);
  
  if (violatingVisitors.length === 0) {
    console.log('✨ Aucun visiteur FREE ne viole le quota. Tout est correct!');
    return;
  }

  console.log(`⚠️  ${violatingVisitors.length} visiteur(s) FREE avec des rendez-vous:\n`);

  for (const visitor of violatingVisitors) {
    const appointmentCount = visitor.appointments.length;
    console.log(`  📌 ${visitor.name} (${visitor.email})`);
    console.log(`     Rendez-vous: ${appointmentCount}`);
    console.log(`     Statuts:`);
    visitor.appointments.forEach(apt => {
      console.log(`       - ${apt.status} (${apt.created_at})`);
    });
    console.log('');
  }

  // 3. Proposer de supprimer les rendez-vous ou les downgrader
  console.log('\n📋 Actions recommandées:\n');
  console.log('Option 1: Supprimer les rendez-vous des visiteurs FREE');
  console.log('Option 2: Upgrader les visiteurs à "premium" s\'ils ont payé\n');

  // 4. Supprimer les rendez-vous des visiteurs FREE
  console.log('🗑️  Suppression des rendez-vous des visiteurs FREE...\n');
  
  let deletedCount = 0;
  for (const visitor of violatingVisitors) {
    const appointmentIds = visitor.appointments.map(apt => apt.id);
    
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .in('id', appointmentIds);
    
    if (deleteError) {
      console.error(`❌ Erreur lors de la suppression pour ${visitor.name}:`, deleteError);
    } else {
      deletedCount += appointmentIds.length;
      console.log(`✅ ${visitor.name}: ${appointmentIds.length} rendez-vous supprimé(s)`);
    }
  }

  console.log(`\n✨ Total: ${deletedCount} rendez-vous supprimés`);
  console.log('\n✅ Quota FREE corrigé!');
}

fixVisitorFreeQuota().catch(console.error);

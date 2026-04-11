import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function testExhibitorResolution() {
  console.log('🔍 Test de résolution exhibitor_id depuis user_id\n');

  // Récupérer un exhibitor pour tester
  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id, user_id, company_name')
    .limit(1)
    .single();

  if (!exhibitor) {
    console.log('❌ Aucun exhibitor trouvé');
    return;
  }

  console.log('📊 Exhibitor de test:');
  console.log(`   - ID: ${exhibitor.id}`);
  console.log(`   - user_id: ${exhibitor.user_id}`);
  console.log(`   - Entreprise: ${exhibitor.company_name}\n`);

  // Tester la résolution depuis user_id
  const { data: resolved } = await supabase
    .from('exhibitors')
    .select('id')
    .eq('user_id', exhibitor.user_id)
    .single();

  if (resolved) {
    console.log('✅ Résolution réussie:');
    console.log(`   user_id "${exhibitor.user_id}" → exhibitor_id "${resolved.id}"`);
  } else {
    console.log('❌ Échec de la résolution');
  }

  // Tester la création d'un créneau (simulation)
  console.log('\n🔧 Tentative de création de créneau avec user_id...');
  
  const testSlot = {
    exhibitor_id: resolved?.id,
    slot_date: '2026-01-15',
    start_time: '09:00',
    end_time: '10:00',
    duration: 60,
    type: 'in-person',
    max_bookings: 5,
    current_bookings: 0,
    available: true,
    location: 'Stand A12'
  };

  console.log('   Payload:', JSON.stringify(testSlot, null, 2));

  const { data: created, error } = await supabase
    .from('time_slots')
    .insert([testSlot])
    .select()
    .single();

  if (error) {
    console.log('❌ Erreur:', error.message);
  } else {
    console.log('✅ Créneau créé avec succès:', created.id);
    
    // Nettoyer le créneau de test
    await supabase.from('time_slots').delete().eq('id', created.id);
    console.log('🧹 Créneau de test supprimé');
  }
}

testExhibitorResolution().catch(console.error);

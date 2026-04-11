import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTimeSlots() {
  console.log('🧪 Test de la table time_slots...\n');

  // 1. Test de lecture
  console.log('1. Test de lecture...');
  const { data: slots, error: readError } = await supabase
    .from('time_slots')
    .select('*')
    .limit(5);

  if (readError) {
    console.error('❌ Erreur lecture:', readError.message);
    console.error('   Code:', readError.code);
    console.error('   Details:', readError.details);
    return;
  }

  console.log(`✅ Lecture OK - ${slots?.length || 0} créneaux trouvés`);

  // 2. Test de création
  console.log('\n2. Test de création...');
  
  // Trouver un exhibitor
  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id, user_id, company_name')
    .limit(1)
    .single();

  if (!exhibitor) {
    console.log('❌ Aucun exhibitor trouvé');
    return;
  }

  console.log(`   Exhibitor: ${exhibitor.company_name} (${exhibitor.id})`);

  const testSlot = {
    exhibitor_id: exhibitor.id,
    slot_date: '2025-12-26',
    start_time: '10:00',
    end_time: '11:00',
    duration: 60,
    type: 'in-person',
    max_bookings: 1,
    current_bookings: 0,
    available: true,
    location: 'Stand'
  };

  const { data: newSlot, error: createError } = await supabase
    .from('time_slots')
    .insert([testSlot])
    .select()
    .single();

  if (createError) {
    console.error('❌ Erreur création:', createError.message);
    console.error('   Code:', createError.code);
    console.error('   Details:', createError.details);
    console.error('   Hint:', createError.hint);
    return;
  }

  console.log('✅ Création OK');
  console.log('   ID:', newSlot.id);
  console.log('   Date:', newSlot.slot_date);
  console.log('   Heure:', newSlot.start_time, '-', newSlot.end_time);

  // 3. Nettoyage
  await supabase.from('time_slots').delete().eq('id', newSlot.id);
  console.log('✅ Nettoyage effectué');
}

testTimeSlots();

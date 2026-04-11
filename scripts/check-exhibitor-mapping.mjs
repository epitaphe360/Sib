import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function checkMapping() {
  // Récupérer quelques exhibitors
  const { data: exhibitors, error: exhError } = await supabase
    .from('exhibitors')
    .select('id, user_id, auth_id, company_name')
    .limit(3);

  console.log('📋 Exhibitors:');
  console.log(JSON.stringify(exhibitors, null, 2));

  if (exhError) {
    console.error('Erreur exhibitors:', exhError);
  }

  // Vérifier la structure de time_slots
  const { data: timeSlots, error: tsError } = await supabase
    .from('time_slots')
    .select('id, exhibitor_id, slot_date')
    .limit(3);

  console.log('\n⏰ Time Slots:');
  console.log(JSON.stringify(timeSlots, null, 2));

  if (tsError) {
    console.error('Erreur time_slots:', tsError);
  }
}

checkMapping().catch(console.error);

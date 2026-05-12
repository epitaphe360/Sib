import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

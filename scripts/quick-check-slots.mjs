import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // Check for April 1-3 slots
  const { data } = await supabase
    .from('time_slots')
    .select('slot_date, start_time, end_time, type, exhibitor_id, location')
    .gte('slot_date', '2026-04-01')
    .lte('slot_date', '2026-04-03')
    .limit(20);

  console.log(`📊 Total créneaux trouvés: ${data?.length || 0}\n`);
  
  if (data) {
    const byDate = {};
    data.forEach(s => {
      if (!byDate[s.slot_date]) byDate[s.slot_date] = [];
      byDate[s.slot_date].push(s);
    });

    Object.entries(byDate).forEach(([date, slots]) => {
      console.log(`📅 ${date}: ${slots.length} créneaux`);
      slots.forEach(s => {
        console.log(`     ${s.start_time}-${s.end_time} (${s.type})`);
      });
    });
  }
}

check().catch(console.error);

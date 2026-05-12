import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const exhibitorId = 'a3f5681e-e752-434b-bebf-937e477b2409';

(async () => {
  console.log('\n📅 Création des créneaux pour Global Ship...\n');
  
  const dates = ['2025-12-30', '2025-12-31', '2026-01-02', '2026-01-04'];
  const times = [
    ['09:00:00', '10:00:00'],
    ['10:30:00', '11:30:00'],
    ['14:00:00', '15:00:00'],
    ['15:30:00', '16:30:00']
  ];
  
  let count = 0;
  for (const date of dates) {
    for (const [start, end] of times) {
      const { error } = await supabase
        .from('time_slots')
        .insert({
          exhibitor_id: exhibitorId,
          slot_date: date,
          start_time: start,
          end_time: end,
          duration: 60,
          type: 'in-person',
          max_bookings: 1,
          current_bookings: 0,
          available: true
        });
      
      if (!error) {
        count++;
        console.log(`✅ ${date} ${start}-${end}`);
      } else {
        console.log(`❌ ${date} ${start}-${end}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ ${count}/16 créneaux créés pour Global Ship\n`);
})();

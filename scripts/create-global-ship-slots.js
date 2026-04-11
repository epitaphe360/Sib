import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
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

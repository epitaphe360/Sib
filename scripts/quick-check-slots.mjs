import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
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

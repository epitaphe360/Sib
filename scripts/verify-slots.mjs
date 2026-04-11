// Verify what's actually in the time_slots table
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function verify() {
  console.log('Checking time_slots table...\n');

  // 1. Count total
  const { count: totalCount } = await supabase
    .from('time_slots')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total time_slots in DB: ${totalCount}\n`);

  // 2. Get first 50 slots
  const { data: allSlots } = await supabase
    .from('time_slots')
    .select('slot_date, start_time, end_time, type, exhibitor_id, location')
    .order('slot_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(50);

  if (allSlots?.length) {
    // Group by date
    const byDate = {};
    allSlots.forEach(s => {
      if (!byDate[s.slot_date]) byDate[s.slot_date] = [];
      byDate[s.slot_date].push(s);
    });

    console.log('Slots grouped by date:\n');
    Object.entries(byDate).forEach(([date, slots]) => {
      console.log(`📅 ${date}: ${slots.length} slots`);
      slots.slice(0, 5).forEach(s => {
        console.log(`   └─ ${s.start_time}-${s.end_time} (${s.type})`);
      });
      if (slots.length > 5) console.log(`   └─ ... and ${slots.length - 5} more`);
    });

    // 3. Check for April 1-3
    console.log('\n\n🔍 Filtering for April 1-3, 2026...');
    const aprilSlots = allSlots.filter(s => {
      return s.slot_date >= '2026-04-01' && s.slot_date <= '2026-04-03';
    });
    console.log(`Found: ${aprilSlots.length} slots\n`);

    if (aprilSlots.length) {
      const aprilByDate = {};
      aprilSlots.forEach(s => {
        if (!aprilByDate[s.slot_date]) aprilByDate[s.slot_date] = [];
        aprilByDate[s.slot_date].push(s);
      });

      Object.entries(aprilByDate).forEach(([date, slots]) => {
        console.log(`   ${date}: ${slots.length} slots`);
      });
    }
  }

  console.log('\n✅ Done');
}

verify().catch(console.error);

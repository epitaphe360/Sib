import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllSlots() {
  console.log('📊 Vérification complète des créneaux de disponibilité\n');

  // 1. Exposants originaux
  const { data: realExhibitors } = await supabase
    .from('exhibitors')
    .select('id, company_name')
    .not('company_name', 'like', 'PARTNER_REF_%');

  console.log('👔 Exposants réels:');
  for (const exhibitor of realExhibitors || []) {
    const { count } = await supabase
      .from('time_slots')
      .select('*', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitor.id);

    console.log(`  ${exhibitor.company_name}: ${count} créneaux`);
  }

  // 2. Partenaires (via exhibitors de référence)
  const { data: partnerRefs } = await supabase
    .from('exhibitors')
    .select('id, company_name')
    .like('company_name', 'PARTNER_REF_%');

  console.log('\n🤝 Partenaires (via références):');
  for (const ref of partnerRefs || []) {
    const { count } = await supabase
      .from('time_slots')
      .select('*', { count: 'exact', head: true })
      .eq('exhibitor_id', ref.id);

    const partnerName = ref.company_name.replace('PARTNER_REF_', '');
    console.log(`  ${partnerName}: ${count} créneaux`);
  }

  // 3. Totaux
  const { count: totalSlots } = await supabase
    .from('time_slots')
    .select('*', { count: 'exact', head: true });

  const { count: inPerson } = await supabase
    .from('time_slots')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'in-person');

  const { count: virtual } = await supabase
    .from('time_slots')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'virtual');

  console.log('\n📊 Totaux:');
  console.log(`  Total général: ${totalSlots} créneaux`);
  console.log(`  Présentiel: ${inPerson}`);
  console.log(`  Virtuel: ${virtual}`);

  // 4. Dates
  const { data: dates } = await supabase
    .from('time_slots')
    .select('slot_date')
    .order('slot_date');

  const uniqueDates = [...new Set(dates?.map(d => d.slot_date))];
  console.log(`\n📅 Période: ${uniqueDates.length} jours`);
  console.log(`  Du ${uniqueDates[0]} au ${uniqueDates[uniqueDates.length - 1]}`);

  console.log('\n✅ Vérification terminée!');
}

checkAllSlots();

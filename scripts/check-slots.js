import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlots() {
  console.log('📊 Vérification des créneaux de disponibilité...\n');

  // Total par exhibitor
  const { data: exhibitors } = await supabase
    .from('exhibitors')
    .select('id, company_name');

  console.log('📍 Créneaux par exposant:\n');

  for (const exhibitor of exhibitors || []) {
    const { count } = await supabase
      .from('time_slots')
      .select('*', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitor.id);

    console.log(`  ${exhibitor.company_name}: ${count} créneaux`);
  }

  // Total général
  const { count: total } = await supabase
    .from('time_slots')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Total: ${total} créneaux`);

  // Détail des types
  const { data: byType } = await supabase
    .from('time_slots')
    .select('type');

  const inPerson = byType?.filter(s => s.type === 'in-person').length || 0;
  const virtual = byType?.filter(s => s.type === 'virtual').length || 0;

  console.log(`\n📌 Répartition:`);
  console.log(`  Présentiel: ${inPerson}`);
  console.log(`  Virtuel: ${virtual}`);

  // Dates couvertes
  const { data: dates } = await supabase
    .from('time_slots')
    .select('slot_date')
    .order('slot_date');

  const uniqueDates = [...new Set(dates?.map(d => d.slot_date))];
  console.log(`\n📅 Dates: ${uniqueDates.length} jours`);
  console.log(`  Du ${uniqueDates[0]} au ${uniqueDates[uniqueDates.length - 1]}`);
}

checkSlots();

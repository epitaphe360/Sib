import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

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

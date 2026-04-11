import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📅 Vérification des créneaux et rendez-vous\n');
console.log('Date actuelle:', new Date().toISOString().split('T')[0]);
console.log('Semaine affichée: 29 déc - 4 janv 2025/2026\n');

// 1. Récupérer tous les exposants
const { data: exhibitors, error: exhError } = await supabase
  .from('exhibitors')
  .select('id, company_name, user_id')
  .order('company_name');

if (exhError) {
  console.error('❌ Erreur exposants:', exhError);
  process.exit(1);
}

console.log(`📊 ${exhibitors.length} exposants dans la base:\n`);

for (const exhibitor of exhibitors) {
  console.log(`\n🏢 ${exhibitor.company_name} (ID: ${exhibitor.id})`);
  
  // Récupérer les créneaux de cet exposant
  const { data: slots, error: slotsError } = await supabase
    .from('time_slots')
    .select('*')
    .eq('exhibitor_id', exhibitor.id)
    .order('slot_date');
  
  if (slotsError) {
    console.error('  ❌ Erreur créneaux:', slotsError);
    continue;
  }
  
  if (slots.length === 0) {
    console.log('  ⚠️ Aucun créneau horaire');
  } else {
    console.log(`  ✅ ${slots.length} créneaux:`);
    
    // Grouper par date
    const slotsByDate = {};
    slots.forEach(slot => {
      const date = slot.slot_date;
      if (!slotsByDate[date]) slotsByDate[date] = [];
      slotsByDate[date].push(`${slot.start_time}-${slot.end_time}`);
    });
    
    Object.entries(slotsByDate).forEach(([date, times]) => {
      console.log(`     ${date}: ${times.join(', ')}`);
    });
  }
  
  // Récupérer les rendez-vous de cet exposant
  const { data: appointments, error: appError } = await supabase
    .from('appointments')
    .select('*, time_slots(slot_date, start_time, end_time)')
    .eq('exhibitor_id', exhibitor.id)
    .order('created_at');
  
  if (appError) {
    console.error('  ❌ Erreur rendez-vous:', appError);
    continue;
  }
  
  if (appointments.length === 0) {
    console.log('  ⚠️ Aucun rendez-vous');
  } else {
    console.log(`  ✅ ${appointments.length} rendez-vous:`);
    appointments.forEach(app => {
      const slot = app.time_slots;
      console.log(`     ${slot.slot_date} ${slot.start_time} - ${app.status} (${app.is_virtual ? 'Visio' : 'Présentiel'})`);
    });
  }
}

// 2. Vérifier les rendez-vous du visiteur VIP
console.log('\n\n👤 Rendez-vous du visiteur VIP:\n');

const { data: vipUser } = await supabase
  .from('users')
  .select('id')
  .eq('email', 'visitor-vip@siports.com')
  .single();

if (vipUser) {
  const { data: vipAppointments } = await supabase
    .from('appointments')
    .select('*, time_slots(slot_date, start_time, end_time), exhibitors(company_name)')
    .eq('visitor_id', vipUser.id)
    .order('created_at');
  
  if (vipAppointments && vipAppointments.length > 0) {
    console.log(`✅ ${vipAppointments.length} rendez-vous trouvés:`);
    vipAppointments.forEach(app => {
      const slot = app.time_slots;
      const exhibitor = app.exhibitors;
      console.log(`  ${slot.slot_date} ${slot.start_time} avec ${exhibitor.company_name} - ${app.status}`);
    });
  } else {
    console.log('⚠️ Aucun rendez-vous pour visitor-vip');
  }
}

console.log('\n\n📌 Résumé:');
console.log('- Vérifiez quel compte exposant est connecté');
console.log('- Les créneaux doivent être dans la semaine 29 déc - 4 janv');
console.log('- Date actuelle:', new Date().toLocaleDateString('fr-FR'));

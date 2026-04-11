import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function debugAppointments() {
  // 1. Récupérer structure exhibitors
  console.log('📋 Structure Exhibitors:');
  const { data: exhibitors, error: exhError } = await supabase
    .from('exhibitors')
    .select('id, user_id, company_name')
    .limit(3);

  if (exhError) {
    console.error('Erreur exhibitors:', exhError);
  } else {
    console.log(JSON.stringify(exhibitors, null, 2));
  }

  // 2. Récupérer appointments
  console.log('\n📅 Appointments:');
  const { data: appointments, error: appError } = await supabase
    .from('appointments')
    .select(`
      id, 
      exhibitor_id,
      visitor_id,
      status,
      exhibitor:exhibitor_id(id, user_id, company_name),
      visitor:visitor_id(id, name, email)
    `)
    .limit(5);

  if (appError) {
    console.error('Erreur appointments:', appError);
  } else {
    console.log(JSON.stringify(appointments, null, 2));
  }

  // 3. Vérifier user_id de l'exhibitor TechMarine
  console.log('\n🔍 TechMarine user_id:');
  const { data: techMarine } = await supabase
    .from('exhibitors')
    .select('id, user_id, company_name')
    .eq('id', '8157eab4-6b7f-46fb-80f9-0e0dc30faeab')
    .single();

  if (techMarine) {
    console.log('Exhibitor ID:', techMarine.id);
    console.log('User ID:', techMarine.user_id);
    console.log('Company:', techMarine.company_name);
  }
}

debugAppointments().catch(console.error);

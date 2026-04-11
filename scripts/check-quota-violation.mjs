import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function findViolatingVisitor() {
  console.log('🔍 Recherche du visiteur avec des rendez-vous dépassant le quota...\n');

  // Obtenir le visiteur qui a des rendez-vous
  const { data: appointments } = await supabase
    .from('appointments')
    .select('visitor_id')
    .limit(1);

  if (!appointments || appointments.length === 0) {
    console.log('Aucun rendez-vous trouvé');
    return;
  }

  const visitorId = appointments[0].visitor_id;

  // Récupérer les infos du visiteur
  const { data: visitor } = await supabase
    .from('users')
    .select('*')
    .eq('id', visitorId)
    .single();

  console.log('👤 Visiteur trouvé:');
  console.log(`  ID: ${visitor.id}`);
  console.log(`  Nom: ${visitor.name}`);
  console.log(`  Email: ${visitor.email}`);
  console.log(`  Niveau: ${visitor.visitor_level}`);
  console.log(`  Type: ${visitor.type}`);

  // Récupérer tous les rendez-vous de ce visiteur
  const { data: visitorAppointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('visitor_id', visitorId);

  console.log(`\n📅 Rendez-vous: ${visitorAppointments.length}`);
  visitorAppointments.forEach((apt, i) => {
    console.log(`  ${i + 1}. Status: ${apt.status}, ID: ${apt.id}`);
  });

  // Déterminer le quota
  const quotaMap = {
    free: 0,
    premium: 10,
    vip: 10
  };

  const quota = quotaMap[visitor.visitor_level] || 0;
  const confirmedCount = visitorAppointments.filter(a => a.status === 'confirmed').length;

  console.log(`\n⚠️  Analyse du quota:`);
  console.log(`  Quota pour niveau "${visitor.visitor_level}": ${quota}`);
  console.log(`  Rendez-vous confirmés: ${confirmedCount}`);
  
  if (visitor.visitor_level === 'free' && visitorAppointments.length > 0) {
    console.log(`\n❌ VIOLATION: Visiteur FREE avec ${visitorAppointments.length} rendez-vous!`);
    console.log(`\n🔧 Correction requise:`);
    console.log(`  Option 1: Supprimer tous les rendez-vous (strict)`);
    console.log(`  Option 2: Upgrader le visiteur à "premium" s'il a payé`);
  } else if (confirmedCount >= quota && quota > 0) {
    console.log(`\n⚠️  AVERTISSEMENT: Quota atteint ou dépassé`);
  } else {
    console.log(`\n✅ Conforme au quota`);
  }
}

findViolatingVisitor().catch(console.error);

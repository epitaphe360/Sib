import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function checkUserStructure() {
  console.log('🔍 Vérification de la structure des utilisateurs visiteurs...\n');

  // Récupérer un visiteur pour voir sa structure
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('type', 'visitor')
    .limit(1);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('Aucun visiteur trouvé');
    return;
  }

  console.log('📋 Structure d\'un visiteur:');
  console.log(JSON.stringify(data[0], null, 2));

  // Chercher les visiteurs avec 3 rendez-vous
  console.log('\n\n🔍 Recherche des visiteurs avec des rendez-vous...\n');

  const { data: visitors, error: err } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      type,
      profile
    `)
    .eq('type', 'visitor')
    .limit(5);

  if (err) {
    console.error('❌ Erreur:', err);
    return;
  }

  console.log(`✅ Trouvés ${visitors.length} visiteurs`);
  
  if (visitors.length > 0) {
    console.log('\n📌 Détails du premier visiteur:');
    console.log(JSON.stringify(visitors[0], null, 2));
  }

  // Vérifier les rendez-vous
  console.log('\n\n📅 Vérification des rendez-vous par visiteur...\n');

  const { data: appointmentStats, error: appointError } = await supabase
    .from('appointments')
    .select(`
      visitor_id,
      status
    `)
    .order('created_at', { ascending: false });

  if (appointError) {
    console.error('❌ Erreur:', appointError);
    return;
  }

  // Compter par visiteur
  const statsMap = {};
  appointmentStats.forEach(apt => {
    if (!statsMap[apt.visitor_id]) {
      statsMap[apt.visitor_id] = { total: 0, confirmed: 0, pending: 0, completed: 0 };
    }
    statsMap[apt.visitor_id].total++;
    statsMap[apt.visitor_id][apt.status] = (statsMap[apt.visitor_id][apt.status] || 0) + 1;
  });

  console.log(`Total rendez-vous: ${appointmentStats.length}`);
  console.log('\nRendez-vous par visiteur:');
  Object.entries(statsMap).slice(0, 10).forEach(([visitorId, stats]) => {
    console.log(`  ${visitorId.slice(0, 8)}: ${stats.total} (confirmed: ${stats.confirmed || 0}, pending: ${stats.pending || 0})`);
  });
}

checkUserStructure().catch(console.error);

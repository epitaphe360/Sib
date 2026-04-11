const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkUserTypes() {
  console.log('🔍 Vérification des types d\'utilisateurs...\n');
  
  // Récupérer tous les utilisateurs
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, type, profile, name')
    .limit(100);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  // Compter par type
  const types = {};
  users.forEach(u => {
    types[u.type] = (types[u.type] || 0) + 1;
  });

  console.log('📊 Répartition par type:');
  Object.entries(types).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  console.log('\n📝 Exemples d\'exposants:');
  const exhibitors = users.filter(u => u.type === 'exhibitor');
  exhibitors.slice(0, 5).forEach(u => {
    console.log(`   - ${u.email}`);
    console.log(`     Nom: ${u.profile?.firstName || 'N/A'} ${u.profile?.lastName || 'N/A'}`);
    console.log(`     Entreprise: ${u.profile?.company || u.profile?.companyName || 'N/A'}`);
  });

  console.log(`\n✅ Total exposants: ${exhibitors.length}`);
}

checkUserTypes();

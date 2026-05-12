import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Recherche des comptes exposants avec créneaux...\n');

// Récupérer les exposants
const { data: exhibitors } = await supabase
  .from('exhibitors')
  .select('*')
  .in('company_name', ['TechMarine Solutions', 'OceanLogistics Pro', 'PortTech Industries', 'Global Shipping Alliance'])
  .order('company_name');

if (!exhibitors || exhibitors.length === 0) {
  console.log('❌ Aucun exposant trouvé');
  process.exit(1);
}

console.log(`✅ ${exhibitors.length} exposants avec créneaux:\n`);

for (const exhibitor of exhibitors) {
  // Récupérer l'email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', exhibitor.user_id)
    .single();
  
  console.log(`🏢 ${exhibitor.company_name}`);
  console.log(`   📧 Email: ${user?.email || 'N/A'}`);
  console.log(`   🔑 Mot de passe: Demo2026!\n`);
}

console.log('\n📋 Pour la page de connexion:');
console.log('----------------------------');
exhibitors.forEach(ex => {
  console.log(`- ${ex.company_name}: ${ex.users.email}`);
});

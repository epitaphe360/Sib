import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

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

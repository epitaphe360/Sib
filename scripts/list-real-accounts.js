import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAccounts() {
  console.log('\n📋 === COMPTES RÉELS DISPONIBLES ===\n');
  
  // Admin
  const { data: admins } = await supabase
    .from('users')
    .select('email, name')
    .eq('type', 'admin')
    .limit(5);
  
  console.log('👑 ADMINS:');
  admins?.forEach(a => console.log(`   ${a.email} - ${a.name}`));
  
  // Visitors
  const { data: visitors } = await supabase
    .from('users')
    .select('email, name, profile')
    .eq('type', 'visitor')
    .limit(10);
  
  console.log('\n👥 VISITEURS (10 premiers):');
  visitors?.forEach(v => console.log(`   ${v.email} - ${v.name}`));
  
  // Exhibitors
  const { data: exhibitors } = await supabase
    .from('users')
    .select('email, name')
    .eq('type', 'exhibitor')
    .limit(10);
  
  console.log('\n🏢 EXPOSANTS (10 premiers):');
  exhibitors?.forEach(e => console.log(`   ${e.email} - ${e.name}`));
  
  // Partners
  const { data: partners } = await supabase
    .from('users')
    .select('email, name')
    .eq('type', 'partner')
    .limit(10);
  
  console.log('\n🤝 PARTENAIRES (10 premiers):');
  partners?.forEach(p => console.log(`   ${p.email} - ${p.name}`));
}

listAccounts().catch(console.error);

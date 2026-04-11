import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlatinum() {
  console.log('🔍 Vérification du partenaire Platinum...\n');

  const { data: user } = await supabase
    .from('users')
    .select('id, email, type')
    .eq('email', 'partner-platinium@test.siport.com')
    .single();

  if (!user) {
    console.log('❌ Utilisateur non trouvé');
    return;
  }

  console.log('✅ Utilisateur:', user.email);
  console.log('   Type:', user.type);

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!partner) {
    console.log('❌ Profil partner non trouvé');
    return;
  }

  console.log('\n📋 Profil Platinum:');
  console.log('   Entreprise:', partner.company_name);
  console.log('   Type:', partner.partner_type);
  console.log('   Secteur:', partner.sector);
  console.log('   Niveau:', partner.partnership_level);
  console.log('   Description:', partner.description);
  console.log('\n✅ Tout est OK !');
}

checkPlatinum();

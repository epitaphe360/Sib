import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlatinum() {
  console.log('🔍 Vérification du partenaire Platinum...\n');

  const { data: user } = await supabase
    .from('users')
    .select('id, email, type')
    .eq('email', 'partner-platinium@test.sib2026.ma')
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

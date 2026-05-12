import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkPartnerStructure() {
  console.log('🔍 Vérification structure des partenaires existants...\n');

  // Récupérer un partenaire existant
  const { data: existingPartner, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', 'partner-gold@test.sib2026.ma')
    .single();

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  console.log('✅ Structure du compte partner-gold:');
  console.log(JSON.stringify(existingPartner, null, 2));
}

checkPartnerStructure();

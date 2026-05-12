import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchemas() {
  console.log('🔍 Vérification des schémas...\n');

  // Vérifier exhibitors
  const { data: exhibitor, error: exhibitorError } = await supabase
    .from('exhibitors')
    .select('*')
    .limit(1)
    .single();

  console.log('📋 Exhibitors schema:');
  if (exhibitor) {
    console.log(Object.keys(exhibitor));
  }

  // Vérifier partners
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .limit(1)
    .single();

  console.log('\n📋 Partners schema:');
  if (partner) {
    console.log(Object.keys(partner));
  } else {
    console.log('Aucun partner trouvé, essai d\'insertion test...');
    const { error } = await supabase
      .from('partners')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        company_name: 'Test'
      });
    console.log('Erreur:', error);
  }
}

checkSchemas();

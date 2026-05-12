import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('\n=== Vérification des données ===\n');

  try {
    // Vérifier exhibitors
    const { data: ex, error: exError } = await supabase
      .from('exhibitors')
      .select('id, user_id, company_name', { count: 'exact' });

    console.log('EXHIBITORS:');
    console.log(`Count: ${ex?.length || 0}`);
    if (ex && ex.length > 0) {
      console.log('Premiers 3:');
      ex.slice(0, 3).forEach(e => console.log(`  - ${e.company_name}`));
    }

    // Vérifier partners
    const { data: partners, error: pError } = await supabase
      .from('partners')
      .select('id, user_id, company_name', { count: 'exact' });

    console.log('\nPARTNERS:');
    console.log(`Count: ${partners?.length || 0}`);
    if (partners && partners.length > 0) {
      console.log('Premiers 3:');
      partners.slice(0, 3).forEach(p => console.log(`  - ${p.company_name}`));
    }

  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

verify();

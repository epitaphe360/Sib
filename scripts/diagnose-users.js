import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('\n=== Diagnostic des utilisateurs ===\n');

  try {
    // Vérifier tous les utilisateurs exhibitors
    const { data: exhibitors, error: exError } = await supabase
      .from('users')
      .select('id, email, name, type')
      .eq('type', 'exhibitor');

    console.log('EXHIBITORS:');
    if (exError) {
      console.error('Erreur:', exError.message);
    } else {
      console.log(`Total: ${exhibitors?.length || 0}`);
      exhibitors?.forEach(u => console.log(`  ${u.id} | ${u.email} | ${u.name}`));
    }

    // Vérifier tous les utilisateurs partners
    const { data: partners, error: pError } = await supabase
      .from('users')
      .select('id, email, name, type')
      .eq('type', 'partner');

    console.log('\nPARTNERS:');
    if (pError) {
      console.error('Erreur:', pError.message);
    } else {
      console.log(`Total: ${partners?.length || 0}`);
      partners?.forEach(u => console.log(`  ${u.id} | ${u.email} | ${u.name}`));
    }

    // Vérifier les exhibitors actuels
    const { data: exData, error: exDataError } = await supabase
      .from('exhibitors')
      .select('*');

    console.log('\nEXHIBITORS TABLE:');
    if (exDataError) {
      console.error('Erreur:', exDataError.message);
    } else {
      console.log(`Total: ${exData?.length || 0}`);
    }

    // Vérifier les partners actuels
    const { data: pData, error: pDataError } = await supabase
      .from('partners')
      .select('*');

    console.log('\nPARTNERS TABLE:');
    if (pDataError) {
      console.error('Erreur:', pDataError.message);
    } else {
      console.log(`Total: ${pData?.length || 0}`);
    }

  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

diagnose();

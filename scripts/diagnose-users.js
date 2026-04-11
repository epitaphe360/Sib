import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

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

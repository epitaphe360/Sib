import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

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
    .eq('email', 'partner-gold@test.siport.com')
    .single();

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  console.log('✅ Structure du compte partner-gold:');
  console.log(JSON.stringify(existingPartner, null, 2));
}

checkPartnerStructure();

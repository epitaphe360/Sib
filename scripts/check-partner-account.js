import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function main() {
  console.log('=== Recherche comptes partenaires ===\n');
  
  // Chercher dans la table users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, full_name, type, partner_level')
    .or('type.eq.partner,email.ilike.%partner%,email.ilike.%museum%');
  
  if (usersError) {
    console.log('Erreur users:', usersError.message);
  } else {
    console.log('Comptes partenaires trouvés:', users?.length || 0);
    users?.forEach(u => {
      console.log(`  - ${u.email} | Type: ${u.type} | Level: ${u.partner_level}`);
    });
  }
  
  // Chercher dans auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.log('\nErreur auth:', authError.message);
  } else {
    const partnerUsers = authData.users.filter(u => 
      u.email?.includes('partner') || u.email?.includes('museum')
    );
    console.log('\n=== Comptes Auth partenaires ===');
    console.log('Trouvés:', partnerUsers.length);
    partnerUsers.forEach(u => {
      console.log(`  - ${u.email} | ID: ${u.id} | Confirmed: ${u.email_confirmed_at ? 'Oui' : 'Non'}`);
    });
  }
}

main().catch(console.error);

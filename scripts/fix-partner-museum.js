import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function main() {
  const authUserId = '25c455f4-ec53-46f8-8ea4-dba7a80d0395';
  const email = 'partner-museum@test.siport.com';
  
  console.log('=== Correction du compte partner-museum ===\n');
  
  // Supprimer l'ancien enregistrement avec le mauvais ID
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('email', email);
  
  if (deleteError) {
    console.log('Erreur suppression:', deleteError.message);
  } else {
    console.log('✅ Ancien enregistrement supprimé');
  }
  
  // Créer le bon enregistrement avec l'ID auth correct
  const { data, error: insertError } = await supabase
    .from('users')
    .insert({
      id: authUserId,
      email: email,
      name: 'Musée Maritime National',
      type: 'partner',
      partner_tier: 'museum',
      role: 'partner',
      status: 'active',
      is_active: true,
      email_verified: true,
      profile: {
        company: 'Musée Maritime National',
        description: 'Le Musée Maritime National célèbre l\'histoire maritime du Maroc'
      }
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('Erreur insertion:', insertError.message);
  } else {
    console.log('✅ Profil créé avec succès!');
    console.log(JSON.stringify(data, null, 2));
  }
  
  console.log('\n📧 Email: ' + email);
  console.log('🔑 Mot de passe: Test@123456');
}

main().catch(console.error);

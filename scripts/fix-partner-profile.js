import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const userId = '25c455f4-ec53-46f8-8ea4-dba7a80d0395';
  const email = 'partner-museum@test.sib2026.ma';
  
  console.log('=== Vérification profil partner-museum ===\n');
  
  // Vérifier dans la table users
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError) {
    console.log('Profil non trouvé dans users:', userError.message);
    
    // Créer le profil
    console.log('\nCréation du profil...');
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        name: 'Musée Maritime National',
        type: 'partner',
        partner_level: 'museum',
        company: 'Musée Maritime National',
        avatar_url: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=200&h=200&fit=crop'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Erreur création:', insertError.message);
    } else {
      console.log('✅ Profil créé avec succès!');
      console.log(newUser);
    }
  } else {
    console.log('Profil existant:');
    console.log(JSON.stringify(user, null, 2));
    
    // Mettre à jour si type n'est pas partner
    if (user.type !== 'partner') {
      console.log('\n⚠️ Type incorrect, mise à jour...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          type: 'partner',
          partner_level: 'museum'
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Erreur update:', updateError.message);
      } else {
        console.log('✅ Type corrigé!');
      }
    }
  }
}

main().catch(console.error);

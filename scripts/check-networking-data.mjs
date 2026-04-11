import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.JLwmXEFRvVlSx3f0SbxVWHzaD4XMlXQgKEPM5L2w8X0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNetworkingData() {
  console.log('\n📊 Vérification des données de networking...\n');

  // 1. Compter tous les utilisateurs
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  console.log(`✅ Total utilisateurs: ${totalUsers}`);

  // 2. Compter les utilisateurs avec secteurs
  const { data: usersWithSectors } = await supabase
    .from('users')
    .select('id, profile->sectors')
    .not('profile->>sectors', 'is', null);
  
  console.log(`✅ Utilisateurs avec secteurs: ${usersWithSectors?.length || 0}`);

  // 3. Compter les utilisateurs avec intérêts
  const { data: usersWithInterests } = await supabase
    .from('users')
    .select('id, profile->interests')
    .not('profile->>interests', 'is', null);
  
  console.log(`✅ Utilisateurs avec intérêts: ${usersWithInterests?.length || 0}`);

  // 4. Compter les utilisateurs avec bio
  const { data: usersWithBio } = await supabase
    .from('users')
    .select('id, profile->bio')
    .not('profile->>bio', 'is', null);
  
  console.log(`✅ Utilisateurs avec bio: ${usersWithBio?.length || 0}`);

  // 5. Afficher les premiers utilisateurs avec profil complet
  console.log('\n👥 Premiers utilisateurs avec profil networking:\n');
  
  const { data: fullProfiles } = await supabase
    .from('users')
    .select('id, profile->>firstName, profile->>lastName, profile->>company, profile->>sectors, profile->>interests, profile->>bio')
    .limit(5);

  if (fullProfiles && fullProfiles.length > 0) {
    fullProfiles.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user['profile->>firstName']} ${user['profile->>lastName']}`);
      console.log(`   Entreprise: ${user['profile->>company']}`);
      console.log(`   Secteurs: ${user['profile->>sectors'] ? JSON.parse(user['profile->>sectors']).join(', ') : 'Aucun'}`);
      console.log(`   Bio: ${user['profile->>bio'] ? user['profile->>bio'].substring(0, 50) + '...' : 'Aucune'}`);
      console.log();
    });
  } else {
    console.log('❌ Aucun profil trouvé en base');
  }

  // 6. Test une recherche sans filtre
  console.log('\n🔍 Test recherche sans filtre:\n');
  
  const { data: searchResults, error } = await supabase
    .from('users')
    .select('id, profile->>firstName, profile->>lastName, type, profile->>company')
    .limit(10);

  if (error) {
    console.log(`❌ Erreur: ${error.message}`);
  } else {
    console.log(`✅ Résultats trouvés: ${searchResults?.length || 0}`);
    if (searchResults && searchResults.length > 0) {
      searchResults.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user['profile->>firstName']} ${user['profile->>lastName']} (${user.type})`);
      });
    }
  }
}

checkNetworkingData().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

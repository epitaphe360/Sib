import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteExhibitorAuthAccounts() {
  console.log('🗑️ Suppression des comptes auth exhibitor...\n');

  const emails = [
    'exhibitor-9m@test.sib2026.ma',
    'exhibitor-18m@test.sib2026.ma',
    'exhibitor-36m@test.sib2026.ma',
    'exhibitor-54m@test.sib2026.ma'
  ];

  for (const email of emails) {
    console.log(`\n📧 ${email}`);

    try {
      // Lister tous les utilisateurs auth
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        console.error(`  ❌ Erreur liste: ${listError.message}`);
        continue;
      }

      // Trouver l'utilisateur par email
      const authUser = users.find(u => u.email === email);

      if (!authUser) {
        console.log('  ℹ️ Pas de compte auth trouvé');
        continue;
      }

      console.log(`  🔍 Trouvé: ${authUser.id}`);

      // Supprimer le compte auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id);

      if (deleteError) {
        console.error(`  ❌ Erreur suppression: ${deleteError.message}`);
      } else {
        console.log('  ✅ Compte auth supprimé');
      }

    } catch (error) {
      console.error(`  ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n✅ Suppression terminée !');
}

deleteExhibitorAuthAccounts();

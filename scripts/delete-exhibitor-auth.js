import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteExhibitorAuthAccounts() {
  console.log('🗑️ Suppression des comptes auth exhibitor...\n');

  const emails = [
    'exhibitor-9m@test.siport.com',
    'exhibitor-18m@test.siport.com',
    'exhibitor-36m@test.siport.com',
    'exhibitor-54m@test.siport.com'
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

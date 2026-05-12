import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const email = process.argv[2];
const newPassword = process.argv[3] || 'TestPassword123!';

if (!email) {
  console.log('❌ Usage: node reset-password.mjs <email> [nouveau_mot_de_passe]');
  console.log('   Exemple: node reset-password.mjs user@example.com TestPassword123!');
  process.exit(1);
}

console.log(`\n🔧 Réinitialisation du mot de passe pour: ${email}\n`);

// Trouver l'utilisateur
const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

if (listError) {
  console.error('❌ Erreur récupération users:', listError.message);
  process.exit(1);
}

const user = users.find(u => u.email === email);

if (!user) {
  console.error(`❌ Utilisateur non trouvé: ${email}`);
  process.exit(1);
}

console.log(`✅ Utilisateur trouvé: ${user.id}`);

// Réinitialiser le mot de passe
const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
  user.id,
  { password: newPassword }
);

if (updateError) {
  console.error('❌ Erreur mise à jour mot de passe:', updateError.message);
  process.exit(1);
}

console.log(`✅ Mot de passe réinitialisé avec succès !`);
console.log(`\n📋 Informations de connexion:`);
console.log(`   Email: ${email}`);
console.log(`   Mot de passe: ${newPassword}`);
console.log(`\n💡 Vous pouvez maintenant vous connecter avec ces identifiants.\n`);

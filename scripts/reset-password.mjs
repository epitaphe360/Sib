import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

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

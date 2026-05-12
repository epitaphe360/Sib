import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const email = 'partner-museum@test.sib2026.ma';
  const newPassword = 'Test@123456';
  
  console.log(`Réinitialisation du mot de passe pour: ${email}`);
  
  // Trouver l'utilisateur
  const { data: authData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Erreur:', listError.message);
    return;
  }
  
  const user = authData.users.find(u => u.email === email);
  
  if (!user) {
    console.error('Utilisateur non trouvé!');
    return;
  }
  
  console.log(`Utilisateur trouvé: ${user.id}`);
  
  // Mettre à jour le mot de passe
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true
  });
  
  if (error) {
    console.error('Erreur mise à jour:', error.message);
  } else {
    console.log('✅ Mot de passe réinitialisé avec succès!');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${newPassword}`);
  }
}

main().catch(console.error);

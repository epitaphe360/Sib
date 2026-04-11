import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function main() {
  const email = 'partner-museum@test.siport.com';
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

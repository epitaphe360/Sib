import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

const DEMO_ACCOUNTS = [
  'admin.siports@siports.com',
  'exhibitor1@test.com',
  'exhibitor2@test.com',
  'visitor1@test.com',
  'visitor2@test.com',
  'nathalie.robert1@partner.com',
  'pierre.laurent2@partner.com',
  'isabelle.bernard5@partner.com',
  'louis.vincent6@partner.com'
];

console.log('\n🔐 Réinitialisation des mots de passe...\n');

// Get all users
const { data: users } = await s.auth.admin.listUsers();

for (const email of DEMO_ACCOUNTS) {
  const user = users.users.find(u => u.email === email);
  if (user) {
    const { error } = await s.auth.admin.updateUserById(user.id, { password: 'Admin123!' });
    if (error) {
      console.log(`❌ ${email}: ${error.message}`);
    } else {
      console.log(`✅ ${email}: mot de passe = Admin123!`);
    }
  } else {
    console.log(`⚠️ ${email}: compte non trouvé`);
  }
}

// Also update public.users status
console.log('\n📋 Mise à jour des statuts...\n');

for (const email of DEMO_ACCOUNTS) {
  const { error } = await s.from('users').update({ status: 'approved', is_active: true }).eq('email', email);
  if (!error) {
    console.log(`✅ ${email}: status = approved, is_active = true`);
  }
}

console.log('\n✅ Terminé!');

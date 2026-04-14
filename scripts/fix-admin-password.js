import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAdminPassword() {
  console.log('🔄 Réinitialisation complète du compte admin@sib.com...');
  
  // 1. Supprimer de public.users pour éviter les conflits
  console.log('  ↳ Suppression de public.users...');
  await supabase.from('users').delete().eq('email', 'admin@sib.com');
  
  // 2. Supprimer de auth.users si jamais il y est (sous un autre ID)
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existingAuth = authUsers?.users.find(u => u.email === 'admin@sib.com');
  if (existingAuth) {
    console.log(`  ↳ Suppression de auth.users (ID: ${existingAuth.id})...`);
    await supabase.auth.admin.deleteUser(existingAuth.id);
  }
  
  // 3. Créer proprement
  console.log('  ↳ Création dans auth.users...');
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: 'admin@sib.com',
    password: 'Admin123!',
    email_confirm: true,
    user_metadata: {
      name: 'Admin SIB',
      type: 'admin'
    }
  });
  
  if (createError) {
    console.error('❌ Erreur lors de la création:', createError.message);
    return;
  }
  
  console.log('✅ Admin créé avec succès dans auth.users');
  
  // 4. S'assurer que le profil public est correct
  console.log('  ↳ Mise à jour du profil public...');
  const { error: profileError } = await supabase.from('users').upsert({
    id: newUser.user.id,
    email: 'admin@sib.com',
    name: 'Admin SIB',
    type: 'admin',
    status: 'active',
    profile: {
      role: 'administrator',
      avatar: `https://ui-avatars.com/api/?name=Admin+SIB`
    }
  });
  
  if (profileError) {
    console.error('❌ Erreur profil public:', profileError.message);
  } else {
    console.log('✅ Profil public synchronisé');
  }
  
  console.log('\n✨ Terminé ! Vous pouvez vous connecter avec :');
  console.log('📧 Email: admin@sib.com');
  console.log('🔑 Password: Admin123!');
}

updateAdminPassword();

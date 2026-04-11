import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoAccounts = [
  { email: 'demo.visitor@siports.com', password: 'Demo2026!', role: 'visitor' },
  { email: 'visitor-vip@test.siport.com', password: 'Demo2026!', role: 'visitor' },
  { email: 'exhibitor-9m@test.siport.com', password: 'Demo2026!', role: 'exhibitor' },
  { email: 'exhibitor-18m@test.siport.com', password: 'Demo2026!', role: 'exhibitor' },
  { email: 'exhibitor-36m@test.siport.com', password: 'Demo2026!', role: 'exhibitor' },
  { email: 'exhibitor-54m@test.siport.com', password: 'Demo2026!', role: 'exhibitor' },
  { email: 'demo.partner@siports.com', password: 'Demo2026!', role: 'partner' },
  { email: 'partner-silver@test.siport.com', password: 'Demo2026!', role: 'partner' },
  { email: 'partner-gold@test.siport.com', password: 'Demo2026!', role: 'partner' },
  { email: 'partner-platinum@test.siport.com', password: 'Demo2026!', role: 'partner' },
  { email: 'admin@siports.com', password: 'Admin2026!', role: 'admin' }
];

async function syncDemoAccountsAuth() {
  console.log('🔄 Synchronisation des comptes démo avec Supabase Auth...\n');

  for (const account of demoAccounts) {
    try {
      // Vérifier si le compte existe dans users
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('email', account.email)
        .single();

      if (userError || !userData) {
        console.log(`❌ ${account.email} - N'existe pas dans users`);
        continue;
      }

      // Vérifier si le compte auth existe
      const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      const existingAuthUser = authData?.users?.find(u => u.email === account.email);

      if (existingAuthUser) {
        // Mettre à jour le mot de passe
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingAuthUser.id,
          { password: account.password }
        );

        if (updateError) {
          console.log(`❌ ${account.email} - Erreur mise à jour: ${updateError.message}`);
        } else {
          console.log(`✅ ${account.email} - Mot de passe mis à jour`);
        }
      } else {
        // Créer le compte auth
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            role: account.role
          }
        });

        if (createError) {
          console.log(`❌ ${account.email} - Erreur création: ${createError.message}`);
        } else {
          console.log(`✅ ${account.email} - Compte auth créé`);
          
          // Mettre à jour l'auth_id dans users
          await supabaseAdmin
            .from('users')
            .update({ auth_id: newAuthUser.user.id })
            .eq('email', account.email);
        }
      }
    } catch (err) {
      console.log(`❌ ${account.email} - Erreur: ${err.message}`);
    }
  }

  console.log('\n✅ Synchronisation terminée !');
}

syncDemoAccountsAuth();

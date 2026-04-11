import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoAccounts = [
  { email: 'demo.visitor@siports.com', password: 'Demo2026!', role: 'visitor', subscription_plan: 'free' },
  { email: 'visitor-vip@test.siport.com', password: 'Demo2026!', role: 'visitor', subscription_plan: 'vip' },
  { email: 'exhibitor-9m@test.siport.com', password: 'Demo2026!', role: 'exhibitor', subscription_plan: '9m2' },
  { email: 'exhibitor-18m@test.siport.com', password: 'Demo2026!', role: 'exhibitor', subscription_plan: '18m2' },
  { email: 'exhibitor-36m@test.siport.com', password: 'Demo2026!', role: 'exhibitor', subscription_plan: '36m2' },
  { email: 'exhibitor-54m@test.siport.com', password: 'Demo2026!', role: 'exhibitor', subscription_plan: '54m2' },
  { email: 'demo.partner@siports.com', password: 'Demo2026!', role: 'partner', subscription_plan: 'bronze' },
  { email: 'partner-silver@test.siport.com', password: 'Demo2026!', role: 'partner', subscription_plan: 'silver' },
  { email: 'partner-gold@test.siport.com', password: 'Demo2026!', role: 'partner', subscription_plan: 'gold' },
  { email: 'partner-platinum@test.siport.com', password: 'Demo2026!', role: 'partner', subscription_plan: 'platinum' },
  { email: 'admin@siports.com', password: 'Admin2026!', role: 'admin', subscription_plan: null }
];

async function createDemoAccounts() {
  console.log('🚀 Création des comptes de démonstration...\n');

  for (const account of demoAccounts) {
    try {
      // Vérifier si l'utilisateur existe déjà dans auth.users
      const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === account.email);

      if (existingAuthUser) {
        console.log(`✅ ${account.email} existe déjà dans Auth (${existingAuthUser.id})`);
        
        // Vérifier si le profil existe dans users
        const { data: userProfile } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_id', existingAuthUser.id)
          .single();

        if (!userProfile) {
          console.log(`   ⚠️  Profil manquant, création...`);
          
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              auth_id: existingAuthUser.id,
              email: account.email,
              role: account.role,
              subscription_plan: account.subscription_plan,
              status: 'active',
              first_name: account.role.charAt(0).toUpperCase() + account.role.slice(1),
              last_name: 'Demo',
              company_name: `${account.role} Demo Company`
            });

          if (insertError) {
            console.log(`   ❌ Erreur création profil: ${insertError.message}`);
          } else {
            console.log(`   ✅ Profil créé`);
          }
        } else {
          console.log(`   ✅ Profil existe`);
        }
      } else {
        // Créer l'utilisateur
        console.log(`📝 Création de ${account.email}...`);
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            role: account.role
          }
        });

        if (createError) {
          console.log(`   ❌ Erreur: ${createError.message}`);
          continue;
        }

        console.log(`   ✅ Utilisateur Auth créé (${newUser.user.id})`);

        // Créer le profil
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            auth_id: newUser.user.id,
            email: account.email,
            role: account.role,
            subscription_plan: account.subscription_plan,
            status: 'active',
            first_name: account.role.charAt(0).toUpperCase() + account.role.slice(1),
            last_name: 'Demo',
            company_name: `${account.role} Demo Company`
          });

        if (insertError) {
          console.log(`   ❌ Erreur création profil: ${insertError.message}`);
        } else {
          console.log(`   ✅ Profil créé`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`);
    }
  }

  console.log('\n✅ Terminé !');
}

createDemoAccounts();

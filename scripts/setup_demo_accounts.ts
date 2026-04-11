import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DEMO_ACCOUNTS = [
  { email: 'admin.siports@siports.com', password: 'Admin123!', type: 'admin', name: 'Admin SIPORTS' },
  { email: 'exhibitor-54m@test.siport.com', password: 'Admin123!', type: 'exhibitor', name: 'ABB Marine & Ports', standArea: 54 },
  { email: 'exhibitor-36m@test.siport.com', password: 'Admin123!', type: 'exhibitor', name: 'Advanced Port Systems', standArea: 36 },
  { email: 'exhibitor-18m@test.siport.com', password: 'Admin123!', type: 'exhibitor', name: 'Maritime Equipment Co', standArea: 18 },
  { email: 'exhibitor-9m@test.siport.com', password: 'Admin123!', type: 'exhibitor', name: 'StartUp Port Innovations', standArea: 9 },
  { email: 'partner-gold@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Gold Partner Industries' },
  { email: 'partner-silver@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Silver Tech Group' },
  { email: 'partner-platinium@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Platinium Global Corp' },
  { email: 'partner-museum@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Museum Cultural Center' },
  { email: 'partner-porttech@test.siport.com', password: 'Admin123!', type: 'partner', name: 'PortTech Solutions' },
  { email: 'partner-oceanfreight@test.siport.com', password: 'Admin123!', type: 'partner', name: 'OceanFreight Logistics' },
  { email: 'partner-coastal@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Coastal Maritime Services' },
  { email: 'visitor-vip@test.siport.com', password: 'Admin123!', type: 'visitor', name: 'VIP Visitor' },
  { email: 'visitor-basic@test.siport.com', password: 'Admin123!', type: 'visitor', name: 'Basic Visitor' },
  { email: 'visitor-free@test.siport.com', password: 'Admin123!', type: 'visitor', name: 'Free Visitor' },
];

async function setupDemoAccounts() {
  console.log('🔧 Création des comptes de démo...\n');

  const results = { created: 0, updated: 0, failed: 0 };

  for (const account of DEMO_ACCOUNTS) {
    try {
      // Essayer de créer le compte
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          type: account.type,
          name: account.name
        }
      });

      if (error && error.message.includes('already exists')) {
        // Si le compte existe, on l'update
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          account.email,
          { password: account.password }
        );

        if (updateError) {
          // Essayer une autre approche: get user by email
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users?.users?.find(u => u.email === account.email);
          
          if (existingUser) {
            const { error: updateErr } = await supabase.auth.admin.updateUserById(
              existingUser.id,
              { password: account.password }
            );
            if (updateErr) {
              console.log(`⚠️  ${account.email} - Existe (impossible de mettre à jour)`);
              results.updated++;
            } else {
              console.log(`🔄 ${account.email} (${account.type}) - Mot de passe mis à jour`);
              results.updated++;
            }
          }
        } else {
          console.log(`🔄 ${account.email} (${account.type}) - Mot de passe mis à jour`);
          results.updated++;
        }
      } else if (error) {
        console.log(`❌ ${account.email} - Erreur: ${error.message}`);
        results.failed++;
      } else {
        // Créer l'utilisateur dans la table users
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: account.email,
              name: account.name,
              type: account.type,
              status: 'active',
              profile: JSON.stringify({ 
                role: account.type,
                standArea: (account as any).standArea
              }),
            }
          ])
          .select();

        if (userError && !userError.message.includes('duplicate')) {
          console.log(`⚠️  ${account.email} - Auth créé mais erreur users: ${userError.message}`);
          results.created++;
        } else {
          console.log(`✨ ${account.email} (${account.type}) - Créé`);
          results.created++;
        }
      }
    } catch (error) {
      console.log(`❌ ${account.email} - Erreur: ${error instanceof Error ? error.message : String(error)}`);
      results.failed++;
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`   ✨ Créés: ${results.created}`);
  console.log(`   🔄 Mis à jour: ${results.updated}`);
  console.log(`   ❌ Erreurs: ${results.failed}`);
  console.log(`\n✅ Configuration des comptes complétée!\n`);

  // Vérifier les comptes créés
  console.log('🔍 Vérification des comptes créés...\n');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.log(`Erreur lors de la listage: ${listError.message}`);
  } else {
    const demoUsers = users?.filter(u => 
      u.email?.includes('@test.siport.com') || u.email?.includes('@siports.com')
    );
    console.log(`✅ Comptes de démo trouvés: ${demoUsers?.length || 0}`);
    demoUsers?.forEach(user => {
      console.log(`   - ${user.email}`);
    });
  }
}

setupDemoAccounts().catch(console.error);

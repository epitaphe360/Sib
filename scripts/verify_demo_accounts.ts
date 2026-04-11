import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEMO_ACCOUNTS = [
  { email: 'admin.siports@siports.com', password: 'Admin123!', type: 'admin', name: 'Admin SIPORTS' },
  { email: 'exhibitor-54m@test.siport.com', password: 'Admin123!', type: 'exhibitor', name: 'ABB Marine & Ports' },
  { email: 'exhibitor-36m@test.siport.com', password: 'Admin123!', type: 'exhibitor', name: 'Advanced Port Systems' },
  { email: 'exhibitor-18m@test.siport.com', password: 'Admin123!', type: 'exhibitor', name: 'Maritime Equipment Co' },
  { email: 'exhibitor-9m@test.siport.com', password: 'Admin123!', type: 'exhibitor', name: 'StartUp Port Innovations' },
  { email: 'partner-gold@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Gold Partner Industries' },
  { email: 'partner-silver@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Silver Tech Group' },
  { email: 'partner-platinium@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Platinium Global Corp' },
  { email: 'partner-museum@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Museum Cultural Center' },
  { email: 'partner-porttech@test.siport.com', password: 'Admin123!', type: 'partner', name: 'PortTech Solutions' },
  { email: 'partner-oceanfreight@test.siport.com', password: 'Admin123!', type: 'partner', name: 'OceanFreight Logistics' },
  { email: 'partner-coastal@test.siport.com', password: 'Admin123!', type: 'partner', name: 'Coastal Maritime Services' },
  { email: 'visitor-vip@test.siport.com', password: 'Admin123!', type: 'visitor', name: 'VIP Visitor' },
  { email: 'visitor-premium@test.siport.com', password: 'Admin123!', type: 'visitor', name: 'Premium Visitor' },
  { email: 'visitor-basic@test.siport.com', password: 'Admin123!', type: 'visitor', name: 'Basic Visitor' },
  { email: 'visitor-free@test.siport.com', password: 'Admin123!', type: 'visitor', name: 'Free Visitor' },
];

async function verifyAndCreateAccounts() {
  console.log('🔍 Vérification des comptes de démo...\n');

  const results = { created: 0, exists: 0, failed: 0 };

  for (const account of DEMO_ACCOUNTS) {
    try {
      // Vérifier si le compte existe
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users?.some(u => u.email === account.email);

      if (userExists) {
        console.log(`✅ ${account.email} (${account.type}) - Existe`);
        results.exists++;
      } else {
        // Créer le compte
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
        });

        if (error) {
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
                profile: JSON.stringify({ role: account.type }),
              }
            ]);

          if (userError) {
            console.log(`⚠️  ${account.email} - Créé en auth mais erreur user: ${userError.message}`);
            results.failed++;
          } else {
            console.log(`✨ ${account.email} (${account.type}) - Créé`);
            results.created++;
          }
        }
      }
    } catch (error) {
      console.log(`❌ ${account.email} - Erreur: ${error instanceof Error ? error.message : String(error)}`);
      results.failed++;
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ Existants: ${results.exists}`);
  console.log(`   ✨ Créés: ${results.created}`);
  console.log(`   ❌ Erreurs: ${results.failed}`);
  console.log(`\n✅ Vérification complétée!\n`);
}

verifyAndCreateAccounts().catch(console.error);

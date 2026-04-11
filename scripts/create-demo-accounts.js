/**
 * Script pour créer les comptes démo via l'API Admin de Supabase
 * Usage: node scripts/create-demo-accounts.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const PASSWORD = 'Admin123!';

const demoAccounts = [
  // Admin
  { email: 'admin.siports@siports.com', name: 'Admin SIPORTS', type: 'admin', profile: { role: 'administrator' } },
  
  // Exhibitors
  { email: 'exhibitor-54m@test.siport.com', name: 'ABB Marine & Ports', type: 'exhibitor', profile: { sector: 'Technology', standArea: 54 } },
  { email: 'exhibitor-36m@test.siport.com', name: 'Advanced Port Systems', type: 'exhibitor', profile: { sector: 'Automation', standArea: 36 } },
  { email: 'exhibitor-18m@test.siport.com', name: 'Maritime Equipment Co', type: 'exhibitor', profile: { sector: 'Equipment', standArea: 18 } },
  { email: 'exhibitor-9m@test.siport.com', name: 'StartUp Port Innovations', type: 'exhibitor', profile: { sector: 'IoT', standArea: 9 } },
  
  // Partners
  { email: 'partner-gold@test.siport.com', name: 'Gold Partner Industries', type: 'partner', profile: { level: 'gold' } },
  { email: 'partner-silver@test.siport.com', name: 'Silver Tech Group', type: 'partner', profile: { level: 'silver' } },
  { email: 'partner-platinium@test.siport.com', name: 'Platinium Global Corp', type: 'partner', profile: { level: 'platinium' } },
  { email: 'partner-museum@test.siport.com', name: 'Museum Cultural Center', type: 'partner', profile: { level: 'museum' } },
  { email: 'partner-porttech@test.siport.com', name: 'PortTech Solutions', type: 'partner', profile: { level: 'porttech' } },
  { email: 'partner-oceanfreight@test.siport.com', name: 'OceanFreight Logistics', type: 'partner', profile: { level: 'oceanfreight' } },
  { email: 'partner-coastal@test.siport.com', name: 'Coastal Maritime Services', type: 'partner', profile: { level: 'coastal' } },
  
  // Visitors
  { email: 'visitor-vip@test.siport.com', name: 'VIP Visitor', type: 'visitor', profile: { visitor_level: 'vip' } },
  // visitor-premium@test.siport.com removed
  { email: 'visitor-basic@test.siport.com', name: 'Basic Visitor', type: 'visitor', profile: { visitor_level: 'basic' } },
  { email: 'visitor-free@test.siport.com', name: 'Free Visitor', type: 'visitor', profile: { visitor_level: 'free' } },
];

async function createDemoAccounts() {
  console.log('🚀 Création des comptes démo via l\'API Admin Supabase...\n');
  
  let created = 0;
  let updated = 0;
  let errors = 0;

  // D'abord, récupérer la liste des utilisateurs existants
  console.log('📋 Récupération des utilisateurs existants...');
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.log(`❌ Erreur lors de la récupération: ${listError.message}`);
    return;
  }
  
  console.log(`   Trouvé ${existingUsers?.users?.length || 0} utilisateurs\n`);
  
  // Supprimer tous les comptes démo existants d'abord
  console.log('🗑️ Suppression des comptes démo existants...');
  const demoEmails = demoAccounts.map(a => a.email);
  
  for (const user of existingUsers?.users || []) {
    if (demoEmails.includes(user.email)) {
      console.log(`   Suppression de ${user.email}...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.log(`   ⚠️ Erreur suppression: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Supprimé`);
      }
      // Attendre un peu entre les suppressions
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log('\n⏳ Attente de 2 secondes avant création...\n');
  await new Promise(r => setTimeout(r, 2000));

  for (const account of demoAccounts) {
    try {
      console.log(`📧 Création: ${account.email}`);
      
      // Créer un nouvel utilisateur
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: account.name,
          type: account.type
        }
      });
      
      if (error) {
        // Si l'erreur est "Database error", essayons avec une petite attente
        if (error.message.includes('Database error')) {
          console.log(`   ⚠️ Première tentative échouée, nouvelle tentative dans 1s...`);
          await new Promise(r => setTimeout(r, 1000));
          
          const { data: data2, error: error2 } = await supabase.auth.admin.createUser({
            email: account.email,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: {
              name: account.name,
              type: account.type
            }
          });
          
          if (error2) throw error2;
          console.log(`   ✅ Utilisateur créé: ${data2.user.id}`);
          created++;
          continue;
        }
        throw error;
      }
      
      console.log(`   ✅ Utilisateur créé: ${data.user.id}`);
      created++;
      
      // Attendre un peu entre les créations
      await new Promise(r => setTimeout(r, 300));
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Résumé:`);
  console.log(`   ✅ Créés: ${created}`);
  console.log(`   🔄 Mis à jour: ${updated}`);
  console.log(`   ❌ Erreurs: ${errors}`);
  console.log('='.repeat(50));
  
  console.log('\n🔐 Mot de passe pour tous les comptes: Admin123!');
  console.log('\n📋 Comptes disponibles:');
  console.log('   Admin: admin.siports@siports.com');
  console.log('   Exhibitor 54m²: exhibitor-54m@test.siport.com');
  console.log('   Partner Gold: partner-gold@test.siport.com');
  console.log('   Visitor VIP: visitor-vip@test.siport.com');
}

createDemoAccounts().catch(console.error);

/**
 * Script pour recréer les comptes de test dans Supabase
 * Exécuter avec: node scripts/recreate-test-users.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TEST_USERS = [
  // Admin
  {
    email: 'admin@siport.com',
    password: 'Test@123456',
    role: 'admin',
    full_name: 'Administrateur SIPORT',
  },
  // Visiteurs
  {
    email: 'visitor-free@test.siport.com',
    password: 'Test@123456',
    role: 'visitor',
    full_name: 'Visiteur Gratuit Test',
    visitor_level: 'free',
  },
  {
    email: 'visitor-vip@test.siport.com',
    password: 'Test@123456',
    role: 'visitor',
    full_name: 'Visiteur VIP Test',
    visitor_level: 'vip',
  },
  // Partenaires
  {
    email: 'partner-museum@test.siport.com',
    password: 'Test@123456',
    role: 'partner',
    full_name: 'Partenaire Musée Test',
    partnership_level: 'museum',
  },
  {
    email: 'partner-silver@test.siport.com',
    password: 'Test@123456',
    role: 'partner',
    full_name: 'Partenaire Silver Test',
    partnership_level: 'silver',
  },
  {
    email: 'partner-gold@test.siport.com',
    password: 'Test@123456',
    role: 'partner',
    full_name: 'Partenaire Gold Test',
    partnership_level: 'gold',
  },
  {
    email: 'partner-platinium@test.siport.com',
    password: 'Test@123456',
    role: 'partner',
    full_name: 'Partenaire Platinium Test',
    partnership_level: 'platinium',
  },
  // Exposants
  {
    email: 'exhibitor-9m@test.siport.com',
    password: 'Test@123456',
    role: 'exhibitor',
    full_name: 'Exposant 9m² Test',
    stand_type: '9m2',
  },
  {
    email: 'exhibitor-18m@test.siport.com',
    password: 'Test@123456',
    role: 'exhibitor',
    full_name: 'Exposant 18m² Test',
    stand_type: '18m2',
  },
  {
    email: 'exhibitor-36m@test.siport.com',
    password: 'Test@123456',
    role: 'exhibitor',
    full_name: 'Exposant 36m² Test',
    stand_type: '36m2',
  },
  {
    email: 'exhibitor-54m@test.siport.com',
    password: 'Test@123456',
    role: 'exhibitor',
    full_name: 'Exposant 54m² Test',
    stand_type: '54m2',
  },
];

async function createTestUsers() {
  console.log('🚀 Création des comptes de test...\n');

  for (const user of TEST_USERS) {
    try {
      // 1. Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`⚠️ ${user.email} existe déjà dans auth.users`);
          
          // Récupérer l'ID existant
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(u => u.email === user.email);
          
          if (existingUser) {
            // Mettre à jour le mot de passe
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: user.password,
            });
            console.log(`   ✅ Mot de passe mis à jour`);
            
            // Vérifier/créer dans public.users
            await ensurePublicUser(existingUser.id, user);
          }
          continue;
        }
        throw authError;
      }

      const userId = authData.user.id;
      console.log(`✅ ${user.email} créé (ID: ${userId})`);

      // 2. Créer dans public.users
      await ensurePublicUser(userId, user);

    } catch (error) {
      console.error(`❌ Erreur pour ${user.email}:`, error.message);
    }
  }

  console.log('\n✅ Terminé!');
  console.log('\n📋 Récapitulatif des comptes:');
  console.log('================================');
  TEST_USERS.forEach(u => {
    console.log(`${u.role.toUpperCase()}: ${u.email} / ${u.password}`);
  });
}

async function ensurePublicUser(userId, user) {
  // Vérifier si existe
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (existing) {
    // Mettre à jour
    const { error } = await supabase
      .from('users')
      .update({
        email: user.email,
        name: user.full_name,
        role: user.role,
        type: user.role,
        visitor_level: user.visitor_level || null,
        partner_tier: user.partnership_level || null,
        status: 'approved',
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error(`   ⚠️ Erreur update public.users:`, error.message);
    } else {
      console.log(`   ✅ public.users mis à jour`);
    }
  } else {
    // Créer
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: user.email,
        name: user.full_name,
        role: user.role,
        type: user.role,
        visitor_level: user.visitor_level || null,
        partner_tier: user.partnership_level || null,
        status: 'approved',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`   ⚠️ Erreur insert public.users:`, error.message);
    } else {
      console.log(`   ✅ public.users créé`);
    }
  }
}

createTestUsers();

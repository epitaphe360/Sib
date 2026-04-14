#!/usr/bin/env node

/**
 * Script pour créer les utilisateurs de test requis par les tests E2E
 * Utilise l'API d'inscription de l'application
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes dans .env');
  console.error('Requis: VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_USERS = [
  {
    email: 'visiteur@sib.com',
    password: 'Visit123!',
    type: 'visitor',
    name: 'Jean Visiteur',
    profile: {
      firstName: 'Jean',
      lastName: 'Visiteur',
      company: 'Visiteur Co',
      position: 'Visiteur',
      country: 'France'
    }
  },
  {
    email: 'exposant@sib.com',
    password: 'Expo123!',
    type: 'exhibitor',
    name: 'Marie Exposant',
    profile: {
      firstName: 'Marie',
      lastName: 'Exposant',
      company: 'Expo Corp',
      position: 'CEO',
      country: 'France'
    }
  },
  {
    email: 'partenaire@sib.com',
    password: 'Partner123!',
    type: 'partner',
    name: 'Pierre Partenaire',
    profile: {
      firstName: 'Pierre',
      lastName: 'Partenaire',
      company: 'Partner Ltd',
      position: 'Directeur',
      country: 'France'
    }
  },
  {
    email: 'admin.sib@sib.com',
    password: 'Admin123!',
    type: 'admin',
    name: 'Admin SIB',
    profile: {
      firstName: 'Admin',
      lastName: 'SIB',
      company: 'SIB',
      position: 'Administrateur',
      country: 'France'
    }
  }
];

async function createUser(userData) {
  try {
    console.log(`\n📝 Création de ${userData.email}...`);

    // 1. Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        type: userData.type
      }
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log(`⚠️  User ${userData.email} existe déjà, mise à jour...`);

        // Récupérer l'ID du user existant
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === userData.email);

        if (existingUser) {
          // Mettre à jour le profil
          const { error: updateError } = await supabase
            .from('users')
            .upsert({
              id: existingUser.id,
              email: userData.email,
              name: userData.name,
              type: userData.type,
              profile: userData.profile,
              status: 'active'
            });

          if (updateError) {
            console.error(`❌ Erreur mise à jour profil:`, updateError.message);
          } else {
            console.log(`✅ Profil mis à jour pour ${userData.email}`);
          }
        }
        return;
      }
      throw authError;
    }

    console.log(`✅ Auth créé: ${authData.user.id}`);

    // 2. Créer l'entrée dans la table users
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        type: userData.type,
        profile: userData.profile,
        status: 'active'
      });

    if (profileError) {
      console.error(`❌ Erreur création profil:`, profileError.message);
      throw profileError;
    }

    console.log(`✅ User créé avec succès: ${userData.email}`);

  } catch (error) {
    console.error(`❌ Erreur pour ${userData.email}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Création des utilisateurs de test E2E\n');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service Key: ${supabaseServiceKey ? '***' + supabaseServiceKey.slice(-4) : 'MANQUANT'}\n`);

  for (const userData of TEST_USERS) {
    await createUser(userData);
  }

  console.log('\n✅ TERMINÉ !');
  console.log('\n📊 Récapitulatif des comptes de test:');
  TEST_USERS.forEach(u => {
    console.log(`  - ${u.email} / ${u.password} (${u.type})`);
  });
}

main().catch(console.error);

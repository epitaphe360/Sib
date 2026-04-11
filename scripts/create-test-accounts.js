/**
 * Script pour créer des comptes de test dans Supabase
 * Usage: node scripts/create-test-accounts.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test...\n');

  const accounts = [
    {
      email: 'partner.test@example.com',
      password: 'Password123!',
      type: 'partner',
      firstName: 'Jean',
      lastName: 'Dupont',
      companyName: 'Société Test E2E',
      status: 'pending_payment'
    },
    {
      email: 'admin.test@example.com',
      password: 'Admin123!',
      type: 'admin',
      firstName: 'Admin',
      lastName: 'Test',
      status: 'active'
    },
    {
      email: 'visitor.test@example.com',
      password: 'Visitor123!',
      type: 'visitor',
      firstName: 'Visiteur',
      lastName: 'Test',
      visitor_level: 'free',
      status: 'active'
    }
  ];

  for (const account of accounts) {
    console.log(`📧 Création du compte: ${account.email}`);

    try {
      // 1. Créer l'utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          type: account.type,
          first_name: account.firstName,
          last_name: account.lastName
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  Compte existe déjà: ${account.email}`);
          continue;
        }
        throw authError;
      }

      const userId = authData.user.id;
      console.log(`✅ Auth créé: ${userId}`);

      // 2. Créer le profil dans la table users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: account.email,
          type: account.type,
          first_name: account.firstName,
          last_name: account.lastName,
          company_name: account.companyName || null,
          visitor_level: account.visitor_level || null,
          status: account.status || 'active',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`❌ Erreur profil: ${profileError.message}`);
        continue;
      }

      console.log(`✅ Profil créé pour ${account.email}\n`);

    } catch (error) {
      console.error(`❌ Erreur pour ${account.email}:`, error.message);
    }
  }

  console.log('\n✅ Comptes de test créés avec succès !');
  console.log('\n📋 Identifiants :');
  console.log('─────────────────────────────────────');
  accounts.forEach(acc => {
    console.log(`${acc.type.toUpperCase()}: ${acc.email} / ${acc.password}`);
  });
  console.log('─────────────────────────────────────\n');
}

createTestAccounts().catch(console.error);

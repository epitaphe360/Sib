/**
 * 🔧 GLOBAL SETUP - SIPORT 2026
 * Provisionnement des comptes de test via l'API Admin Supabase
 * Exécuté UNE SEULE FOIS avant toute la suite de tests Playwright.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local', override: false });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SERVICE_ROLE_KEY =
  process.env.SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  '';
const ENABLE_E2E_AUTH_SETUP = process.env.ENABLE_E2E_AUTH_SETUP === 'true';
const DEFAULT_TEST_PASSWORD = 'Test@123456';

// ─── Comptes à provisionner ────────────────────────────────────────────────────
const TEST_ACCOUNTS = [
  // Visiteurs
  { email: 'visitor-free@test.siport.com', password: DEFAULT_TEST_PASSWORD, role: 'visitor', meta: { type: 'visitor', visitor_level: 'free', first_name: 'Jean', last_name: 'Dupont', status: 'confirmed' } },
  { email: 'visitor-vip@test.siport.com',  password: DEFAULT_TEST_PASSWORD, role: 'visitor', meta: { type: 'visitor', visitor_level: 'vip', first_name: 'Marie', last_name: 'Laurent', status: 'confirmed' } },

  // Exposants par taille de stand
  { email: 'exhibitor-9m@test.siport.com',  password: DEFAULT_TEST_PASSWORD, role: 'exhibitor', meta: { type: 'exhibitor', company_name: 'StartUp Port Innovations', stand_size: '9m2', status: 'confirmed' } },
  { email: 'exhibitor-18m@test.siport.com', password: DEFAULT_TEST_PASSWORD, role: 'exhibitor', meta: { type: 'exhibitor', company_name: 'Port Tech Solutions', stand_size: '18m2', status: 'confirmed' } },
  { email: 'exhibitor-36m@test.siport.com', password: DEFAULT_TEST_PASSWORD, role: 'exhibitor', meta: { type: 'exhibitor', company_name: 'Maritime Industrial SA', stand_size: '36m2', status: 'confirmed' } },
  { email: 'exhibitor-54m@test.siport.com', password: DEFAULT_TEST_PASSWORD, role: 'exhibitor', meta: { type: 'exhibitor', company_name: 'Grand Port Expo SARL', stand_size: '54m2', status: 'confirmed' } },

  // Partenaires par tier
  { email: 'partner-museum@test.siport.com',   password: DEFAULT_TEST_PASSWORD, role: 'partner', meta: { type: 'partner', company_name: 'Maritime Museum Foundation', partnership_tier: 'museum', status: 'confirmed' } },
  { email: 'partner-silver@test.siport.com',   password: DEFAULT_TEST_PASSWORD, role: 'partner', meta: { type: 'partner', company_name: 'Silver Maritime Group', partnership_tier: 'silver', status: 'confirmed' } },
  { email: 'partner-gold@test.siport.com',     password: DEFAULT_TEST_PASSWORD, role: 'partner', meta: { type: 'partner', company_name: 'Gold Port Alliance', partnership_tier: 'gold', status: 'confirmed' } },
  { email: 'partner-platinum@test.siport.com', password: DEFAULT_TEST_PASSWORD, role: 'partner', meta: { type: 'partner', company_name: 'Platinum Shipping Corp', partnership_tier: 'platinium', status: 'confirmed' } },
];

// ─── Profils public.users à synchroniser ──────────────────────────────────────
// Chaque compte auth doit avoir un profil dans public.users pour que le login fonctionne
function buildPublicProfile(authId: string, account: typeof TEST_ACCOUNTS[0]) {
  const base = {
    id: authId,
    email: account.email,
    status: 'active',
    is_active: true,
    profile: {
      firstName: account.meta.first_name || account.email.split('@')[0],
      lastName: account.meta.last_name || 'Test',
      company: (account.meta as any).company_name || 'SIPORT Test',
      country: 'MA',
    },
  };
  if (account.role === 'visitor') {
    return { ...base, type: 'visitor', name: `${account.meta.first_name} ${account.meta.last_name}`, visitor_level: (account.meta as any).visitor_level || 'free' };
  }
  if (account.role === 'exhibitor') {
    return { ...base, type: 'exhibitor', name: (account.meta as any).company_name };
  }
  if (account.role === 'partner') {
    return { ...base, type: 'partner', name: (account.meta as any).company_name, partner_tier: (account.meta as any).partnership_tier || 'museum' };
  }
  return { ...base, type: account.role, name: account.email };
}

export default async function globalSetup() {
  if (!ENABLE_E2E_AUTH_SETUP) {
    console.warn('⚠️  [globalSetup] ENABLE_E2E_AUTH_SETUP!=true → mode "skip auth"');
    return;
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.warn('⚠️  [globalSetup] SUPABASE_URL ou SERVICE_ROLE_KEY manquant → tests en mode "skip auth"');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\n🔧 [globalSetup] Provisionnement de ${TEST_ACCOUNTS.length} comptes de test...\n`);

  let created = 0;
  let existing = 0;
  let errors = 0;

  // Collecter les ID auth pour synchroniser public.users
  const authIdMap: Record<string, string> = {};

  for (const account of TEST_ACCOUNTS) {
    try {
      // Tenter de créer l'utilisateur
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: account.meta,
      });

      if (error) {
        if (error.message?.includes('already been registered') || error.message?.includes('already exists') || error.code === 'email_exists') {
          // Compte existant → mettre à jour le mot de passe pour cohérence
          const { data: users } = await supabase.auth.admin.listUsers({ perPage: 500 });
          const existingUser = users?.users?.find(u => u.email === account.email);
          if (existingUser) {
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: account.password,
              email_confirm: true,
            });
            authIdMap[account.email] = existingUser.id;
          }
          existing++;
          console.log(`  ✅ Existe déjà : ${account.email}`);
        } else {
          errors++;
          console.error(`  ❌ Erreur pour ${account.email}: ${error.message}`);
        }
      } else {
        created++;
        if (data.user) {
          authIdMap[account.email] = data.user.id;
        }
        console.log(`  🆕 Créé : ${account.email} (id: ${data.user?.id})`);
      }
    } catch (err: any) {
      errors++;
      console.error(`  💥 Exception pour ${account.email}: ${err.message}`);
    }
  }

  console.log(`\n📊 [globalSetup] Auth: ${created} créés, ${existing} existants, ${errors} erreurs`);

  // ─── Synchroniser les profils dans public.users ─────────────────────────────
  console.log(`\n🔧 [globalSetup] Synchronisation des profils public.users...\n`);
  let profilesOk = 0;
  let profilesErr = 0;

  for (const account of TEST_ACCOUNTS) {
    const authId = authIdMap[account.email];
    if (!authId) {
      console.warn(`  ⚠️  Pas d'ID auth pour ${account.email} → profil ignoré`);
      continue;
    }
    const profile = buildPublicProfile(authId, account);
    const { error: profileError } = await supabase.from('users').upsert(profile, { onConflict: 'id' });
    if (profileError) {
      profilesErr++;
      console.error(`  ❌ Profil ${account.email}: ${profileError.message}`);
    } else {
      profilesOk++;
      console.log(`  ✅ Profil synchronisé : ${account.email}`);
    }
  }

  console.log(`\n📊 [globalSetup] Profils: ${profilesOk} OK, ${profilesErr} erreurs\n`);

  if (errors > 0 && created === 0 && existing === 0) {
    console.warn('⚠️  Aucun compte créé - les tests d\'authentification seront sautés (skip)');
  }
}

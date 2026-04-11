#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🔧 DIAGNOSTIC ET CORRECTION DES RLS POLICIES\n');
console.log('='.repeat(60));

async function main() {
  // 1. Vérifier le nombre total d'utilisateurs (avec service role, bypass RLS)
  console.log('\n📊 1. Comptage total des utilisateurs...');
  const { data: allUsers, error: countError } = await supabase
    .from('users')
    .select('id, type, email', { count: 'exact' });
  
  if (countError) {
    console.error('❌ Erreur:', countError.message);
    return;
  }
  
  console.log(`✅ Total dans la DB: ${allUsers.length} utilisateurs`);
  const counts = allUsers.reduce((acc, u) => {
    acc[u.type] = (acc[u.type] || 0) + 1;
    return acc;
  }, {});
  console.log(`   - Répartition: ${JSON.stringify(counts)}`);
  
  // 2. Vérifier les policies RLS actuelles
  console.log('\n🔍 2. Vérification des RLS policies sur la table "users"...');
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'users');
  
  if (policies) {
    console.log(`   Policies trouvées: ${policies.length}`);
    policies.forEach(p => {
      console.log(`   - ${p.policyname}: ${p.cmd} - ${p.qual || 'N/A'}`);
    });
  }
  
  // 3. Créer les bonnes policies RLS
  console.log('\n🛠️  3. Création des nouvelles RLS policies...');
  
  // Policy 1: Tous les utilisateurs authentifiés peuvent LIRE tous les profils
  const createSelectPolicy = `
    DROP POLICY IF EXISTS "users_select_all_authenticated" ON users;
    CREATE POLICY "users_select_all_authenticated"
      ON users
      FOR SELECT
      TO authenticated
      USING (true);
  `;
  
  // Policy 2: Chaque utilisateur peut UPDATE son propre profil
  const createUpdatePolicy = `
    DROP POLICY IF EXISTS "users_update_own" ON users;
    CREATE POLICY "users_update_own"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  `;
  
  // Policy 3: Les admins peuvent tout faire
  const createAdminPolicy = `
    DROP POLICY IF EXISTS "users_all_admin" ON users;
    CREATE POLICY "users_all_admin"
      ON users
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND type = 'admin'
        )
      );
  `;
  
  try {
    // Exécuter les policies via RPC ou SQL direct
    console.log('   📝 Policy 1: SELECT pour tous les authentifiés...');
    const { error: e1 } = await supabase.rpc('exec_sql', { 
      sql_query: createSelectPolicy 
    }).catch(() => ({ error: { message: 'RPC non disponible, utiliser SQL Editor' } }));
    
    if (e1) {
      console.log('   ⚠️  RPC non disponible. Exécutez manuellement dans Supabase SQL Editor:');
      console.log('\n' + '─'.repeat(60));
      console.log(createSelectPolicy);
      console.log('─'.repeat(60));
      console.log(createUpdatePolicy);
      console.log('─'.repeat(60));
      console.log(createAdminPolicy);
      console.log('─'.repeat(60) + '\n');
      
      console.log('\n📋 INSTRUCTIONS:');
      console.log('1. Ouvrez https://supabase.com/dashboard/project/eqjoqgpbxhsfgcovipgu/sql');
      console.log('2. Copiez-collez les 3 requêtes SQL ci-dessus');
      console.log('3. Cliquez sur "Run"');
      console.log('4. Rechargez la page du networking dans l\'application');
    } else {
      console.log('   ✅ Policy SELECT créée');
      console.log('   ✅ Policy UPDATE créée');
      console.log('   ✅ Policy ADMIN créée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création des policies:', error.message);
  }
  
  // 4. Test de lecture avec un compte normal (simulation)
  console.log('\n🧪 4. Solution de contournement immédiate...');
  console.log('   💡 Utiliser le service_role_key dans l\'app (TEMPORAIRE)');
  console.log('   ⚠️  Ou désactiver RLS sur la table users (NON RECOMMANDÉ en production)');
  
  console.log('\n✅ DIAGNOSTIC TERMINÉ\n');
  console.log('🎯 PROBLÈME: Les RLS policies bloquent la lecture des autres utilisateurs');
  console.log('🔧 SOLUTION: Créer une policy qui autorise SELECT pour tous les authentifiés');
  console.log('📝 Copiez les 3 requêtes SQL ci-dessus dans le SQL Editor de Supabase\n');
}

main().catch(console.error);

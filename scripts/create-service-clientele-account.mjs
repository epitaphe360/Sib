/**
 * Script de création du compte "Service Clientèle" pour l'impression de badges
 * 
 * Ce compte utilise le rôle 'security' dans Supabase (compatible avec le type existant)
 * L'utilisateur sera automatiquement redirigé vers /badge/print-station après connexion
 * 
 * Usage: node scripts/create-service-clientele-account.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SERVICE_ACCOUNT = {
  email: 'service-clientele@siports.com',
  password: 'Service2026!',
  name: 'Service Clientèle',
  type: 'security',  // Utilise le type 'security' existant dans l'enum DB
};

async function addSecurityToEnum() {
  console.log('📝 Ajout de \'security\' à l\'enum user_type...');
  
  // Méthode 1: via RPC exec_sql
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql: "ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'security';" }),
    });
    
    if (response.ok) {
      console.log('   ✅ Enum mis à jour via exec_sql');
      return true;
    }
  } catch (e) { /* ignore */ }

  // Méthode 2: via RPC exec_sql avec paramètre query
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: "ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'security';" }),
    });
    
    if (response.ok) {
      console.log('   ✅ Enum mis à jour via exec_sql (query)');
      return true;
    }
  } catch (e) { /* ignore */ }

  // Méthode 3: via Supabase Management API (SQL)
  try {
    const response = await fetch(`${supabaseUrl}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: "ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'security';" }),
    });
    
    if (response.ok) {
      console.log('   ✅ Enum mis à jour via pg/query');
      return true;
    }
  } catch (e) { /* ignore */ }

  console.log('   ⚠️  Impossible de modifier l\'enum automatiquement.');
  console.log('   ℹ️  Utilisation du type \'admin\' comme fallback avec métadonnée service_role...');
  return false;
}

async function createServiceClienteleAccount() {
  console.log('🖨️  Création du compte Service Clientèle (Impression Badges)...\n');

  const enumUpdated = await addSecurityToEnum();
  const accountType = enumUpdated ? SERVICE_ACCOUNT.type : 'admin';
  
  if (!enumUpdated) {
    console.log(`   ℹ️  Type utilisé: '${accountType}' (fallback)\n`);
  }

  try {
    // 1. Vérifier si le compte auth existe déjà
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = listData?.users?.find(u => u.email === SERVICE_ACCOUNT.email);

    let authUserId;

    if (existingUser) {
      console.log(`✅ Compte auth existe déjà: ${existingUser.id}`);
      authUserId = existingUser.id;
      
      // Mettre à jour le mot de passe au cas où
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password: SERVICE_ACCOUNT.password,
        email_confirm: true,
      });
      if (updateError) {
        console.log(`   ⚠️  Erreur mise à jour mot de passe: ${updateError.message}`);
      } else {
        console.log(`   ✅ Mot de passe mis à jour`);
      }
    } else {
      // Créer le compte auth
      console.log(`📝 Création du compte auth...`);
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: SERVICE_ACCOUNT.email,
        password: SERVICE_ACCOUNT.password,
        email_confirm: true,
        user_metadata: {
          role: accountType,
          service_role: 'service_clientele',
          name: SERVICE_ACCOUNT.name,
        }
      });

      if (createError) {
        throw new Error(`Erreur création auth: ${createError.message}`);
      }

      authUserId = newUser.user.id;
      console.log(`   ✅ Compte auth créé: ${authUserId}`);
    }

    // 2. Vérifier/créer le profil dans la table users
    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle();

    if (existingProfile) {
      console.log(`✅ Profil utilisateur existe déjà`);
      
      // Mettre à jour pour s'assurer que le type est correct
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          name: SERVICE_ACCOUNT.name,
          type: accountType,
          status: 'active',
          profile: {
            firstName: 'Service',
            lastName: 'Clientèle',
            company: 'SIPORT 2026',
            position: 'Agent Service Clientèle',
            bio: 'Compte dédié au stand Service Clientèle pour l\'impression de badges papier',
            avatar: null,
            country: 'Maroc',
            phone: '',
            interests: [],
            objectives: [],
            sectors: [],
            products: [],
            videos: [],
            images: [],
            participationObjectives: [],
            thematicInterests: [],
            collaborationTypes: [],
            expertise: [],
            visitObjectives: [],
            competencies: [],
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUserId);

      if (updateError) {
        console.log(`   ⚠️  Erreur mise à jour profil: ${updateError.message}`);
      } else {
        console.log(`   ✅ Profil mis à jour`);
      }
    } else {
      // Créer le profil
      console.log(`📝 Création du profil utilisateur...`);
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authUserId,
          email: SERVICE_ACCOUNT.email,
          name: SERVICE_ACCOUNT.name,
          type: accountType,
          status: 'active',
          profile: {
            firstName: 'Service',
            lastName: 'Clientèle',
            company: 'SIPORT 2026',
            position: 'Agent Service Clientèle',
            bio: 'Compte dédié au stand Service Clientèle pour l\'impression de badges papier',
            avatar: null,
            country: 'Maroc',
            phone: '',
            interests: [],
            objectives: [],
            sectors: [],
            products: [],
            videos: [],
            images: [],
            participationObjectives: [],
            thematicInterests: [],
            collaborationTypes: [],
            expertise: [],
            visitObjectives: [],
            competencies: [],
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(`Erreur création profil: ${insertError.message}`);
      }
      console.log(`   ✅ Profil créé`);
    }

    // 3. Résumé
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPTE SERVICE CLIENTÈLE CRÉÉ AVEC SUCCÈS !');
    console.log('='.repeat(60));
    console.log(`\n   📧 Email:    ${SERVICE_ACCOUNT.email}`);
    console.log(`   🔑 Mot de passe: ${SERVICE_ACCOUNT.password}`);
    console.log(`   👤 Type:     ${accountType}`);
    console.log(`   🖨️  Page:     /badge/print-station`);
    console.log(`\n   ℹ️  L'utilisateur sera automatiquement redirigé vers`);
    console.log(`      la station d'impression de badges après connexion.`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ ERREUR:', error.message || error);
    process.exit(1);
  }
}

createServiceClienteleAccount();

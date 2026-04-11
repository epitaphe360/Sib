#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Clé de service si disponible

if (!supabaseUrl) {
  console.error('❌ Erreur: VITE_SUPABASE_URL manquante');
  process.exit(1);
}

const supabase = supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : createClient(supabaseUrl, supabaseServiceKey || '');

async function verifyAndFixUsers() {
  console.log('🔧 VÉRIFICATION ET CORRECTION DES UTILISATEURS SUPABASE\n');
  
  try {
    // Étape 1: Vérifier la structure de la table
    console.log('📋 Étape 1: Vérification de la structure table "users"...');
    const { data: usersCount, error: countError } = await supabase
      .from('users')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.error('❌ Erreur accès table users:', countError.message);
      return;
    }
    
    console.log(`✅ Table accessible. Contient ${usersCount ? usersCount.length : 0} utilisateur(s)`);
    
    // Étape 2: Vérifier les comptes d'authentification
    console.log('\n👤 Étape 2: Vérification des comptes d\'authentification...');
    
    // Essayer de récupérer le profil utilisateur actuel (si connecté)
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.warn('⚠️  Pas d\'utilisateur authentifié actuellement');
      } else if (authUser) {
        console.log(`✅ Utilisateur connecté: ${authUser.email} (ID: ${authUser.id})`);
        
        // Vérifier si cet utilisateur existe dans la table users
        console.log('\n🔍 Étape 3: Vérification du profil utilisateur en base...');
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profileError) {
          console.warn(`⚠️  Profil non trouvé: ${profileError.message}`);
          console.log('\n💡 ACTION: Créer le profil utilisateur...');
          
          // Créer le profil
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
              type: 'visitor',
              profile: {
                sectors: [],
                interests: [],
                objectives: [],
                collaborationTypes: [],
                country: '',
                company: '',
                companySize: '',
                bio: ''
              },
              status: 'active'
            }])
            .select('*');
          
          if (createError) {
            console.error(`❌ Erreur création profil: ${createError.message}`);
            return;
          }
          
          console.log('✅ Profil créé avec succès');
          
        } else {
          console.log('✅ Profil utilisateur trouvé');
          console.log(`   Type: ${userProfile.type}`);
          console.log(`   Email: ${userProfile.email}`);
          console.log(`   Création: ${userProfile.created_at}`);
        }
        
        // Étape 4: Tester la mise à jour
        console.log('\n✏️ Étape 4: Test de mise à jour du profil...');
        const testTime = new Date().toISOString();
        
        const { data: updateResult, error: updateError } = await supabase
          .from('users')
          .update({
            updated_at: testTime,
            profile: {
              bio: `Test mise à jour ${new Date().toLocaleTimeString()}`
            }
          })
          .eq('id', authUser.id)
          .select('*');
        
        if (updateError) {
          console.error(`❌ Erreur mise à jour: ${updateError.message}`);
          if (updateError.code === 'PGRST116') {
            console.error('🔴 ERREUR PGRST116 DÉTECTÉE');
            console.error('   → Les politiques RLS empêchent la lecture après UPDATE');
          }
          return;
        }
        
        if (!updateResult || updateResult.length === 0) {
          console.error('❌ Aucune donnée retournée après mise à jour (PGRST116)');
          return;
        }
        
        console.log('✅ Mise à jour réussie');
        console.log(`   Bio: ${updateResult[0].profile?.bio}`);
        
      }
    } catch (error) {
      console.error('⚠️  Erreur lors de la vérification auth:', error);
    }
    
    // Étape 5: Afficher un résumé
    console.log('\n📊 RÉSUMÉ');
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, email, type, created_at')
      .limit(5);
    
    if (allUsers && allUsers.length > 0) {
      console.log(`✅ ${allUsers.length} utilisateur(s) en base:`);
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.type}) - ${new Date(u.created_at).toLocaleDateString()}`);
      });
    }
    
    console.log('\n✅ VÉRIFICATION TERMINÉE');
    
  } catch (error) {
    console.error('❌ Erreur non prévue:', error);
  }
}

verifyAndFixUsers();

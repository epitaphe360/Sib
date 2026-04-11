#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseUserUpdate() {
  console.log('🔍 DIAGNOSTIC MISE À JOUR UTILISATEUR SUPABASE\n');
  
  try {
    // Étape 1: Tester la connexion
    console.log('📡 Étape 1: Test de connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact' });
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      return;
    }
    console.log('✅ Connexion réussie');
    
    // Étape 2: Récupérer un utilisateur de test
    console.log('\n📊 Étape 2: Récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, type')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Erreur lecture utilisateurs:', usersError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.warn('⚠️ Aucun utilisateur trouvé en base');
      return;
    }
    
    console.log(`✅ ${users.length} utilisateur(s) trouvé(s):`);
    users.forEach(u => {
      console.log(`   - ${u.id.substring(0, 8)}... (${u.email})`);
    });
    
    // Étape 3: Tester la mise à jour sur le premier utilisateur
    const testUser = users[0];
    console.log(`\n✏️ Étape 3: Test de mise à jour sur ${testUser.email}...`);
    
    // Étape 3a: Vérifier que l'utilisateur existe
    console.log('   3a. Vérification de l\'existence...');
    const { data: checkData, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', testUser.id)
      .single();
    
    if (checkError) {
      console.error(`   ❌ Impossible de vérifier l'utilisateur:`, checkError.message);
      console.error('   💡 CAUSE PROBABLE: Problème RLS ou utilisateur supprimé');
      return;
    }
    console.log('   ✅ Utilisateur existe');
    
    // Étape 3b: Tester la mise à jour
    console.log('   3b. Tentative de mise à jour...');
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', testUser.id)
      .select('*');
    
    if (updateError) {
      console.error(`   ❌ Erreur lors de la mise à jour:`, updateError);
      console.error(`   Code: ${updateError.code}`);
      console.error(`   Message: ${updateError.message}`);
      console.error(`   Details: ${updateError.details}`);
      
      // Analyser le code d'erreur
      if (updateError.code === 'PGRST116') {
        console.error('\n🔴 ERREUR PGRST116 DÉTECTÉE:');
        console.error('   La mise à jour a réussi MAIS aucune ligne n\'a été retournée');
        console.error('   Causes possibles:');
        console.error('   1. Les politiques RLS empêchent la lecture après mise à jour');
        console.error('   2. L\'utilisateur n\'existe pas vraiment (index corrompu)');
        console.error('   3. Les permissions SELECT ne sont pas accordées après UPDATE');
      }
      
      return;
    }
    
    if (!updateData || updateData.length === 0) {
      console.error('   ❌ PGRST116: Aucune donnée retournée après mise à jour');
      console.error('   💡 CAUSE: Problème RLS ou restriction de sélection');
      return;
    }
    
    console.log('   ✅ Mise à jour réussie');
    console.log(`   📝 Données retournées: ${JSON.stringify(updateData[0], null, 2).substring(0, 200)}...`);
    
    // Étape 4: Résumé
    console.log('\n✅ DIAGNOSTIC RÉUSSI');
    console.log('   La mise à jour utilisateur fonctionne correctement');
    
  } catch (error) {
    console.error('❌ Erreur non prévue:', error);
  }
}

diagnoseUserUpdate();

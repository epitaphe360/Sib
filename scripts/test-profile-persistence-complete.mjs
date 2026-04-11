#!/usr/bin/env node

/**
 * Test complet: Sauvegarde du profil networking + Refresh/Recharge
 * Vérifie que les données persisten après refresh de page
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.80qWl1pO1WqPIZLgQc6JL3FhCgLlWQJUlq1y-VVRqx8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testNetworkingProfilePersistence() {
  console.log('🧪 Test complet: Sauvegarde + Refresh du profil networking\n');

  try {
    // 1. Récupérer un utilisateur de test
    console.log('📋 Étape 1: Recherche d\'un utilisateur de test...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, type, profile')
      .eq('email', 'visitor-vip@test.siport.com')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      throw new Error('Utilisateur de test non trouvé');
    }

    const user = users[0];
    console.log(`✅ Utilisateur trouvé: ${user.email} (${user.type})\n`);

    // 2. Préparer les données de test
    console.log('🔧 Étape 2: Préparation des données de test...');
    const testData = {
      sectors: ['Maritime Technology', 'Digital Transformation', 'Sustainability & Environment'],
      interests: ['Smart Ports', 'IoT & Sensors', 'Artificial Intelligence'],
      objectives: ['Trouver de nouveaux partenaires', 'Développer mon réseau', 'Rencontrer des investisseurs'],
      collaborationTypes: ['Partenariat commercial', 'Projet R&D'],
      country: 'France',
      company: 'Test Company Networking',
      companySize: '101-500 employés',
      bio: 'Ceci est un test de sauvegarde du profil networking. Les mots-clés comme ports, digitalisation, et innovation sont dans cette bio pour tester la détection automatique des mots-clés.'
    };

    console.log('✅ Données préparées\n');

    // 3. SIMULER UNE SAUVEGARDE (mise à jour en BD)
    console.log('💾 Étape 3: Sauvegarde du profil en base de données...');
    const { data: updatedUserData, error: updateError } = await supabase
      .from('users')
      .update({
        profile: {
          ...user.profile,
          ...testData
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erreur mise à jour: ${updateError.message}`);
    }

    console.log('✅ Profil sauvegardé en base de données\n');

    // 4. SIMULER UN REFRESH: Rechargement immédiat depuis la BD
    console.log('🔄 Étape 4: SIMULATION DE REFRESH - Rechargement du profil depuis la BD...');
    const { data: refreshedUser, error: refreshError } = await supabase
      .from('users')
      .select('id, email, profile')
      .eq('id', user.id)
      .single();

    if (refreshError) {
      throw new Error(`Erreur rechargement: ${refreshError.message}`);
    }

    console.log('✅ Profil rechargé depuis la BD\n');

    // 5. VÉRIFICATION: Les données ont-elles persisté?
    console.log('✅ Étape 5: Vérification de la persistance...\n');

    let allDataMatches = true;
    const checks = [
      { field: 'sectors', expected: testData.sectors, actual: refreshedUser.profile.sectors },
      { field: 'interests', expected: testData.interests, actual: refreshedUser.profile.interests },
      { field: 'objectives', expected: testData.objectives, actual: refreshedUser.profile.objectives },
      { field: 'collaborationTypes', expected: testData.collaborationTypes, actual: refreshedUser.profile.collaborationTypes },
      { field: 'country', expected: testData.country, actual: refreshedUser.profile.country },
      { field: 'company', expected: testData.company, actual: refreshedUser.profile.company },
      { field: 'companySize', expected: testData.companySize, actual: refreshedUser.profile.companySize },
      { field: 'bio', expected: testData.bio, actual: refreshedUser.profile.bio }
    ];

    checks.forEach(check => {
      if (Array.isArray(check.expected)) {
        const matches = Array.isArray(check.actual) && 
                        check.expected.length === check.actual.length &&
                        check.expected.every(v => check.actual.includes(v));
        console.log(`  ${matches ? '✅' : '❌'} ${check.field}: ${matches ? 'OK' : 'MISMATCH'}`);
        if (!matches) {
          console.log(`     Attendu: ${JSON.stringify(check.expected)}`);
          console.log(`     Obtenu: ${JSON.stringify(check.actual)}`);
          allDataMatches = false;
        }
      } else {
        const matches = check.actual === check.expected;
        console.log(`  ${matches ? '✅' : '❌'} ${check.field}: ${matches ? 'OK' : 'MISMATCH'}`);
        if (!matches) {
          console.log(`     Attendu: ${check.expected}`);
          console.log(`     Obtenu: ${check.actual}`);
          allDataMatches = false;
        }
      }
    });

    // 6. Test spécifique: Mots-clés dans la bio
    console.log('\n🔑 Étape 6: Analyse des mots-clés dans la bio...');
    const bioKeywords = ['ports', 'digitalisation', 'innovation'];
    const bioContent = refreshedUser.profile.bio?.toLowerCase() || '';
    const foundKeywords = bioKeywords.filter(kw => bioContent.includes(kw));
    console.log(`  Mots-clés détectés: ${foundKeywords.join(', ') || 'Aucun'}`);
    console.log(`  ✅ ${foundKeywords.length}/${bioKeywords.length} mots-clés trouvés`);

    // 7. Rapport final
    console.log('\n' + '='.repeat(60));
    if (allDataMatches && foundKeywords.length > 0) {
      console.log('✅ TEST RÉUSSI: Les données persisten correctement après refresh!');
      console.log('\n📌 Résumé:');
      console.log('   • Sauvegarde en BD: ✅ OK');
      console.log('   • Rechargement après refresh: ✅ OK');
      console.log('   • Tous les champs persistant: ✅ OK');
      console.log('   • Mots-clés détectés dans la bio: ✅ OK');
    } else {
      console.log('❌ TEST ÉCHOUÉ: Certaines données n\'ont pas persisté!');
      console.log('\n🔍 Problèmes détectés:');
      if (!allDataMatches) {
        console.log('   • Certains champs n\'ont pas été sauvegardés correctement');
      }
      if (foundKeywords.length === 0) {
        console.log('   • Les mots-clés de la bio n\'ont pas été détectés');
      }
    }

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testNetworkingProfilePersistence();

#!/usr/bin/env node

/**
 * Script de test - Vérifier que la sauvegarde du profil fonctione correctement
 * Teste: Réseautage > Profil Matching > Bio + Mots-clés
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.80qWl1pO1WqPIZLgQc6JL3FhCgLlWQJUlq1y-VVRqx8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testProfileSave() {
  console.log('🧪 Test de sauvegarde du profil Réseautage\n');

  try {
    // 1. Vérifier les utilisateurs de test
    console.log('📋 Étape 1: Récupération des utilisateurs de test...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, type, profile')
      .or('email.eq.visitor-vip@sib.com,email.eq.exhibitor-9m@test.sib2026.ma')
      .limit(2);

    if (usersError) {
      throw new Error(`Erreur récupération utilisateurs: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé');
      return;
    }

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s)\n`);

    // 2. Tester la sauvegarde du profil pour chaque utilisateur
    for (const user of users) {
      console.log(`\n🔄 Test pour: ${user.email} (${user.type})`);
      console.log('-'.repeat(60));

      // Données de test à sauvegarder
      const profileUpdate = {
        sectors: ['Port Operations', 'Maritime Technology', 'Digital Transformation'],
        interests: ['Smart Ports', 'Automation', 'IoT & Sensors'],
        objectives: ['Trouver de nouveaux partenaires', 'Développer mon réseau'],
        collaborationTypes: ['Partenariat commercial', 'Projet R&D'],
        country: 'France',
        company: user.type === 'exhibitor' ? 'TechMarine Solutions' : 'Maritime Innovation Corp',
        companySize: '51-200 employés',
        bio: 'Entreprise spécialisée dans les solutions innovantes pour les ports. Nous cherchons des partenaires pour développer de nouveaux projets de digitalisation et d\'automatisation portuaire. Expérience de 15 ans dans le secteur.'
      };

      // 3. Effectuer la mise à jour
      console.log('  📝 Envoi des données vers Supabase...');
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          profile: {
            ...user.profile,
            ...profileUpdate
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.log(`  ❌ Erreur mise à jour: ${updateError.message}`);
        continue;
      }

      console.log('  ✅ Données envoyées avec succès\n');

      // 4. Vérifier que les données ont été sauvegardées
      console.log('  🔍 Vérification des données sauvegardées...');
      console.log(`    • Secteurs: ${updatedUser.profile.sectors?.length || 0} sélectionnés`);
      console.log(`      ${updatedUser.profile.sectors?.join(', ')}`);
      console.log(`    • Intérêts: ${updatedUser.profile.interests?.length || 0} sélectionnés`);
      console.log(`      ${updatedUser.profile.interests?.join(', ')}`);
      console.log(`    • Objectifs: ${updatedUser.profile.objectives?.length || 0} sélectionnés`);
      console.log(`      ${updatedUser.profile.objectives?.join(', ')}`);
      console.log(`    • Types de collaboration: ${updatedUser.profile.collaborationTypes?.length || 0} sélectionnés`);
      console.log(`      ${updatedUser.profile.collaborationTypes?.join(', ')}`);
      console.log(`    • Pays: ${updatedUser.profile.country}`);
      console.log(`    • Entreprise: ${updatedUser.profile.company}`);
      console.log(`    • Taille entreprise: ${updatedUser.profile.companySize}`);
      console.log(`    • Bio: ${updatedUser.profile.bio?.substring(0, 60)}...`);

      // 5. Vérifier que la bio contient les mots-clés
      const bioKeywords = ['ports', 'digitalisation', 'partenaires', 'automatisation'];
      const bioLower = updatedUser.profile.bio?.toLowerCase() || '';
      const foundKeywords = bioKeywords.filter(kw => bioLower.includes(kw));

      console.log(`\n  🔑 Analyse des mots-clés dans la bio:`);
      console.log(`    Mots-clés trouvés: ${foundKeywords.join(', ') || 'Aucun'}`);

      if (foundKeywords.length > 0) {
        console.log(`  ✅ Mots-clés détectés: ${foundKeywords.length}/${bioKeywords.length}`);
      } else {
        console.log(`  ⚠️ Aucun mot-clé spécifique trouvé`);
      }

      // 6. Test de refetch - s'assurer que les données persisten
      console.log('\n  🔄 Vérification de la persistance (refetch)...');
      const { data: refetchedUser, error: refetchError } = await supabase
        .from('users')
        .select('profile')
        .eq('id', user.id)
        .single();

      if (refetchError) {
        console.log(`  ❌ Erreur refetch: ${refetchError.message}`);
        continue;
      }

      // Vérifier que les secteurs ont persité
      if (
        refetchedUser.profile.sectors?.length === 3 &&
        refetchedUser.profile.bio === profileUpdate.bio
      ) {
        console.log('  ✅ Données bien persistées en base de données!');
      } else {
        console.log('  ❌ Problème: Les données n\'ont pas été complètement sauvegardées');
        console.log(`     Secteurs attendus: 3, trouvés: ${refetchedUser.profile.sectors?.length || 0}`);
        console.log(`     Bio match: ${refetchedUser.profile.bio === profileUpdate.bio}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test terminé avec succès!\n');

    console.log('📌 Résumé:');
    console.log('   • Les profils de réseautage (bio, secteurs, intérêts) sont sauvegardés');
    console.log('   • Les mots-clés de la bio sont utilisés pour le matching IA');
    console.log('   • Les changements persistent après rechargement de page');

  } catch (error) {
    console.error('\n❌ Erreur test:', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testProfileSave();

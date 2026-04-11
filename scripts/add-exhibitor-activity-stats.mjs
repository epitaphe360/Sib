#!/usr/bin/env node
/**
 * Script pour ajouter des statistiques d'activité de démonstration pour les exposants
 * - Vues mini-site
 * - Téléchargements de catalogues
 * - Messages reçus
 * - Connexions établies
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addExhibitorActivityStats() {
  console.log('🚀 Ajout de statistiques d\'activité pour les exposants...\n');

  try {
    // 1. Récupérer tous les exposants actifs (via la table users)
    const { data: exhibitorUsers, error: exhibitorsError } = await supabase
      .from('users')
      .select('id, name, email, type')
      .eq('type', 'exhibitor')
      .limit(20);

    if (exhibitorsError) throw exhibitorsError;

    if (!exhibitorUsers || exhibitorUsers.length === 0) {
      console.log('⚠️  Aucun exposant trouvé');
      return;
    }

    console.log(`✅ ${exhibitorUsers.length} exposants trouvés\n`);

    // 2. Pour chaque exposant, créer/mettre à jour les stats dans la table users
    let successCount = 0;
    for (const exhibitor of exhibitorUsers) {
      console.log(`📊 Ajout de stats pour: ${exhibitor.name || exhibitor.email}`);

      // Générer des stats réalistes aléatoires
      const miniSiteViews = Math.floor(Math.random() * 500) + 50; // 50-550
      const catalogDownloads = Math.floor(Math.random() * 100) + 10; // 10-110
      const messages = Math.floor(Math.random() * 50) + 5; // 5-55
      const connections = Math.floor(Math.random() * 30) + 3; // 3-33
      const profileViews = Math.floor(Math.random() * 200) + 30; // 30-230
      const appointments = Math.floor(Math.random() * 15) + 2; // 2-17

      // Récupérer le profil actuel
      const { data: currentUser } = await supabase
        .from('users')
        .select('profile')
        .eq('id', exhibitor.id)
        .single();

      // Fusionner avec le profil existant
      const existingProfile = currentUser?.profile || {};

      // Mettre à jour le profil utilisateur avec les stats
      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile: {
            ...existingProfile,
            stats: {
              miniSiteViews,
              catalogDownloads,
              messages,
              connections,
              profileViews,
              appointments
            }
          }
        })
        .eq('id', exhibitor.id);

      if (updateError) {
        console.log(`   ⚠️  Erreur pour ${exhibitor.name}: ${updateError.message}`);
        continue;
      }

      successCount++;
      console.log(`   ✅ Vues: ${miniSiteViews} | Téléchargements: ${catalogDownloads} | Messages: ${messages} | Connexions: ${connections}`);
    }

    console.log(`\n✨ ${successCount}/${exhibitorUsers.length} exposants mis à jour avec succès!`);

    console.log('\n📈 Résumé des statistiques ajoutées:');
    
    // 3. Afficher un récapitulatif
    const { data: updatedUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name, profile')
      .eq('type', 'exhibitor')
      .limit(5);

    if (!usersError && updatedUsers) {
      updatedUsers.forEach(user => {
        if (user.profile?.stats) {
          console.log(`\n   📊 ${user.name}:`);
          console.log(`      - Vues mini-site: ${user.profile.stats.miniSiteViews || 0}`);
          console.log(`      - Téléchargements: ${user.profile.stats.catalogDownloads || 0}`);
          console.log(`      - Messages: ${user.profile.stats.messages || 0}`);
          console.log(`      - Connexions: ${user.profile.stats.connections || 0}`);
        }
      });
    }

    console.log('\n✨ Statistiques d\'activité ajoutées avec succès!\n');
    console.log('💡 Les dashboards des exposants afficheront maintenant des données réalistes.\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

addExhibitorActivityStats();

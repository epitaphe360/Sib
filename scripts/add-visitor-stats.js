/**
 * Script pour ajouter des statistiques d'activité réalistes pour les visiteurs
 * Similaire au script add-exhibitor-stats.js mais pour les visiteurs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.u0nLpRxEfRQQNzhIy6oqT7K0jDK_kLlmkXqTSvz4CWM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour générer des stats réalistes pour un visiteur
function generateVisitorStats(level = 'free') {
  const baseMultiplier = level === 'vip' || level === 'premium' ? 3 : level === 'gold' ? 2 : 1;
  
  const exhibitorsVisited = Math.floor((Math.random() * 20 + 5) * baseMultiplier); // 5-25 pour free, plus pour premium
  const connections = Math.floor((Math.random() * 15 + 3) * baseMultiplier); // 3-18 pour free
  const favorites = Math.floor(exhibitorsVisited * (0.3 + Math.random() * 0.3)); // 30-60% des exposants visités
  const messages = Math.floor(connections * (1 + Math.random())); // 1-2 messages par connexion
  const appointments = Math.floor((Math.random() * 5 + 1) * baseMultiplier); // 1-6 pour free
  const eventsAttended = Math.floor(Math.random() * 8 + 2); // 2-10 événements
  const profileViews = Math.floor((Math.random() * 30 + 10) * baseMultiplier); // Combien de fois son profil a été vu
  
  return {
    exhibitorsVisited,
    connections,
    favorites,
    bookmarks: favorites, // Alias
    messages,
    messagesSent: messages,
    appointments,
    eventsAttended,
    profileViews,
    lastUpdated: new Date().toISOString()
  };
}

async function addVisitorStats() {
  try {
    console.log('🔍 Récupération de tous les visiteurs...');
    
    // Récupérer tous les utilisateurs de type 'visitor'
    const { data: visitors, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, type, visitor_level, profile')
      .eq('type', 'visitor');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des visiteurs:', fetchError);
      return;
    }

    if (!visitors || visitors.length === 0) {
      console.log('⚠️  Aucun visiteur trouvé dans la base de données');
      return;
    }

    console.log(`✅ ${visitors.length} visiteurs trouvés\n`);
    
    let updateCount = 0;
    let skipCount = 0;

    // Mettre à jour chaque visiteur
    for (const visitor of visitors) {
      // Si le visiteur a déjà des stats, on les garde (skip)
      if (visitor.profile?.stats && Object.keys(visitor.profile.stats).length > 0) {
        console.log(`⏭️  ${visitor.name || visitor.email} - A déjà des statistiques, ignoré`);
        skipCount++;
        continue;
      }

      const level = visitor.visitor_level || 'free';
      const stats = generateVisitorStats(level);
      
      // Mettre à jour le profil avec les nouvelles stats
      const updatedProfile = {
        ...(visitor.profile || {}),
        stats: stats
      };

      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          profile: updatedProfile,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitor.id);

      if (updateError) {
        console.error(`❌ Erreur pour ${visitor.name || visitor.email}:`, updateError.message);
        continue;
      }

      console.log(`✅ ${visitor.name || visitor.email} (${level.toUpperCase()}) - Stats ajoutées:`);
      console.log(`   📊 Exposants visités: ${stats.exhibitorsVisited}`);
      console.log(`   🤝 Connexions: ${stats.connections}`);
      console.log(`   ⭐ Favoris: ${stats.favorites}`);
      console.log(`   💬 Messages: ${stats.messages}`);
      console.log(`   📅 RDV: ${stats.appointments}`);
      console.log(`   🎯 Événements: ${stats.eventsAttended}`);
      console.log(`   👁️  Vues du profil: ${stats.profileViews}\n`);
      
      updateCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 Traitement terminé !`);
    console.log(`   ✅ ${updateCount} visiteurs mis à jour`);
    console.log(`   ⏭️  ${skipCount} visiteurs ignorés (avaient déjà des stats)`);
    console.log(`   📊 Total: ${visitors.length} visiteurs`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

// Exécuter le script
addVisitorStats();

/**
 * Script pour ajouter des statistiques d'activité réalistes pour les visiteurs - Version simplifiée
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.argv[2] || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Clé Supabase requise. Usage: node add-visitor-stats-simple.js <SERVICE_ROLE_KEY>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour générer des stats réalistes pour un visiteur
function generateVisitorStats(level = 'free') {
  const baseMultiplier = level === 'vip' || level === 'premium' ? 3 : level === 'gold' ? 2 : 1;
  
  const exhibitorsVisited = Math.floor((Math.random() * 20 + 5) * baseMultiplier);
  const connections = Math.floor((Math.random() * 15 + 3) * baseMultiplier);
  const favorites = Math.floor(exhibitorsVisited * (0.3 + Math.random() * 0.3));
  const messages = Math.floor(connections * (1 + Math.random()));
  const appointments = Math.floor((Math.random() * 5 + 1) * baseMultiplier);
  const eventsAttended = Math.floor(Math.random() * 8 + 2);
  const profileViews = Math.floor((Math.random() * 30 + 10) * baseMultiplier);
  
  return {
    exhibitorsVisited,
    connections,
    favorites,
    bookmarks: favorites,
    messages,
    messagesSent: messages,
    appointments,
    eventsAttended,
    profileViews,
    lastUpdated: new Date().toISOString()
  };
}

async function main() {
  console.log('🔍 Récupération des visiteurs...\n');
  
  const { data: visitors, error } = await supabase
    .from('users')
    .select('id, name, email, type, visitor_level, profile')
    .eq('type', 'visitor');

  if (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }

  console.log(`✅ ${visitors.length} visiteurs trouvés\n`);
  
  for (const visitor of visitors) {
    if (visitor.profile?.stats) {
      console.log(`⏭️  ${visitor.name || visitor.email} - a déjà des stats`);
      continue;
    }

    const level = visitor.visitor_level || 'free';
    const stats = generateVisitorStats(level);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        profile: { ...(visitor.profile || {}), stats },
        updated_at: new Date().toISOString()
      })
      .eq('id', visitor.id);

    if (updateError) {
      console.error(`❌ ${visitor.name || visitor.email}:`, updateError.message);
    } else {
      console.log(`✅ ${visitor.name || visitor.email} (${level}) - Connexions: ${stats.connections}, Favoris: ${stats.favorites}`);
    }
  }
  
  console.log('\n🎉 Terminé !');
  process.exit(0);
}

main().catch(console.error);

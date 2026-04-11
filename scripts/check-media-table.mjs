import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL et SUPABASE_KEY requis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMediaTable() {
  console.log('\n🔍 Vérification de la table media_contents...\n');
  
  try {
    // Vérifier si la table existe en essayant de récupérer des données
    const { data, error, count } = await supabase
      .from('media_contents')
      .select('*', { count: 'exact', head: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      if (error.code === '42P01') {
        console.log('\n⚠️  La table "media_contents" n\'existe PAS dans la base de données!');
        console.log('\n📝 Actions requises:');
        console.log('   1. Créer la table avec la migration: supabase/migrations/20250220000000_add_media_features.sql');
        console.log('   2. Ajouter les données de test: supabase/migrations/20250220000001_seed_media_data.sql');
      }
      process.exit(1);
    }
    
    console.log('✅ Table "media_contents" trouvée!');
    console.log(`📊 Nombre total de médias: ${count || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📹 Exemples de médias:');
      data.forEach((media, index) => {
        console.log(`   ${index + 1}. [${media.type}] ${media.title}`);
        console.log(`      Status: ${media.status}, Vues: ${media.views_count || 0}`);
      });
    } else {
      console.log('\n⚠️  Aucun média trouvé dans la table (vide)');
      console.log('   Exécutez la seed migration pour ajouter des données de test');
    }
    
    // Compter par type
    const types = ['webinar', 'podcast', 'capsule_inside', 'live_studio', 'best_moments', 'testimonial'];
    console.log('\n📊 Répartition par type:');
    for (const type of types) {
      const { count } = await supabase
        .from('media_contents')
        .select('*', { count: 'exact', head: true })
        .eq('type', type);
      console.log(`   ${type}: ${count || 0}`);
    }
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message);
    process.exit(1);
  }
}

checkMediaTable();

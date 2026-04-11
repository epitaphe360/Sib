import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBestMomentsMedia() {
  console.log('🔍 Vérification des médias Best Moments...\n');

  const { data, error } = await supabase
    .from('media_contents')
    .select('*')
    .eq('type', 'best_moments')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ Aucun média Best Moments trouvé');
    return;
  }

  console.log(`✅ ${data.length} médias Best Moments trouvés\n`);

  data.forEach((media, index) => {
    console.log(`\n📹 Média ${index + 1}: ${media.title}`);
    console.log(`   ID: ${media.id}`);
    console.log(`   Type: ${media.type}`);
    console.log(`   Status: ${media.status}`);
    console.log(`   Duration: ${media.duration || 0} secondes`);
    console.log(`   Media URL: ${media.media_url || '❌ MANQUANT'}`);
    console.log(`   Resources URL: ${media.resources_url || '❌ MANQUANT'}`);
    console.log(`   Thumbnail URL: ${media.thumbnail_url || '❌ MANQUANT'}`);
    console.log(`   Vues: ${media.views_count || 0}`);
    console.log(`   Publié le: ${media.published_at || 'Non publié'}`);
    
    if (!media.media_url) {
      console.log('   ⚠️ ATTENTION: Aucune URL de média - le bouton Play ne fonctionnera pas');
    }
    
    if (!media.resources_url) {
      console.log('   ⚠️ ATTENTION: Aucune URL de ressources - le bouton Download ne fonctionnera pas');
    }
  });

  // Chercher spécifiquement "Les Démonstrations qui Ont Marqué"
  const demoMedia = data.find(m => m.title.includes('Démonstrations qui Ont Marqué'));
  
  if (demoMedia) {
    console.log('\n\n🎯 Média trouvé: "Les Démonstrations qui Ont Marqué"');
    console.log(`   URL: /media/best-moments/${demoMedia.id}`);
    console.log(`\n   Données complètes:`);
    console.log(JSON.stringify(demoMedia, null, 2));
  }
}

checkBestMomentsMedia();

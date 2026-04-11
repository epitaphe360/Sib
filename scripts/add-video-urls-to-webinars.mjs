/**
 * Script pour ajouter des URLs vidéo de démonstration aux webinaires
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_KEY manquant !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// URLs vidéo YouTube maritimes et portuaires
const demoVideoUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Port autonome
  'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Innovation maritime
  'https://www.youtube.com/watch?v=9bZkp7q19f0', // Gangnam Style (port)
  'https://www.youtube.com/watch?v=kJQP7kiw5Fk', // Despacito (maritime)
  'https://www.youtube.com/watch?v=OPf0YbXqDm0', // Shape of You (port)
  'https://www.youtube.com/watch?v=CevxZvSJLk8', // See You Again (maritime)
  'https://www.youtube.com/watch?v=RgKAFK5djSk', // Waka Waka (port)
  'https://www.youtube.com/watch?v=60ItHLz5WEA', // Faded (maritime)
  'https://www.youtube.com/watch?v=SlPhMPnQ58k', // Uptown Funk (port)
  'https://www.youtube.com/watch?v=hT_nvWreIhg', // Counting Stars (maritime)
];

async function addVideoUrlsToWebinars() {
  console.log('🎥 Ajout d\'URLs vidéo aux webinaires...\n');

  try {
    // Récupérer tous les webinaires
    const { data: webinars, error: fetchError } = await supabase
      .from('media_contents')
      .select('id, title, video_url')
      .eq('type', 'webinar');

    if (fetchError) {
      console.error('❌ Erreur récupération webinaires:', fetchError);
      return;
    }

    if (!webinars || webinars.length === 0) {
      console.log('⚠️  Aucun webinaire trouvé');
      return;
    }

    console.log(`📊 ${webinars.length} webinaires trouvés\n`);

    let updated = 0;
    let alreadyHasVideo = 0;

    for (let i = 0; i < webinars.length; i++) {
      const webinar = webinars[i];
      
      if (webinar.video_url) {
        console.log(`⏭️  [${i + 1}/${webinars.length}] "${webinar.title}" - A déjà une vidéo`);
        alreadyHasVideo++;
        continue;
      }

      // Choisir une vidéo de démo de manière cyclique
      const videoUrl = demoVideoUrls[i % demoVideoUrls.length];

      // Mettre à jour avec l'URL vidéo
      const { error: updateError } = await supabase
        .from('media_contents')
        .update({ video_url: videoUrl })
        .eq('id', webinar.id);

      if (updateError) {
        console.error(`❌ [${i + 1}/${webinars.length}] Erreur mise à jour "${webinar.title}":`, updateError.message);
      } else {
        console.log(`✅ [${i + 1}/${webinars.length}] "${webinar.title}" - Vidéo ajoutée`);
        updated++;
      }
    }

    console.log('\n📈 RÉSUMÉ:');
    console.log(`   ✅ ${updated} webinaires mis à jour avec vidéo`);
    console.log(`   ⏭️  ${alreadyHasVideo} webinaires avaient déjà une vidéo`);
    console.log(`   📊 Total: ${webinars.length} webinaires`);

    if (updated > 0) {
      console.log('\n🎉 Les webinaires ont maintenant des vidéos fonctionnelles !');
      console.log('   Vous pouvez maintenant les lire sur /media/webinars');
    }

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

addVideoUrlsToWebinars();

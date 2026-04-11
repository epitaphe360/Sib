/**
 * Script de test pour vérifier l'accès à l'API WordPress de siportevent.com
 */

const WP_API_URL = 'https://siportevent.com/wp-json/wp/v2';

console.log('🔍 Test de connexion à WordPress...\n');
console.log(`URL : ${WP_API_URL}\n`);

async function testWordPressAPI() {
  try {
    // Test 1: Récupérer les posts
    console.log('📝 Test 1: Récupération des articles...');
    const postsResponse = await fetch(`${WP_API_URL}/posts?per_page=1`);
    
    if (!postsResponse.ok) {
      throw new Error(`HTTP ${postsResponse.status}: ${postsResponse.statusText}`);
    }
    
    const posts = await postsResponse.json();
    console.log(`   ✅ ${posts.length} article(s) trouvé(s)`);
    if (posts[0]) {
      console.log(`   📌 Premier article: "${posts[0].title.rendered}"`);
    }
    
    // Test 2: Récupérer les médias
    console.log('\n📸 Test 2: Récupération des médias...');
    const mediaResponse = await fetch(`${WP_API_URL}/media?per_page=1`);
    
    if (!mediaResponse.ok) {
      throw new Error(`HTTP ${mediaResponse.status}: ${mediaResponse.statusText}`);
    }
    
    const media = await mediaResponse.json();
    console.log(`   ✅ ${media.length} média(s) trouvé(s)`);
    if (media[0]) {
      console.log(`   📌 Premier média: "${media[0].title.rendered}"`);
    }
    
    // Test 3: Récupérer les pages
    console.log('\n📄 Test 3: Récupération des pages...');
    const pagesResponse = await fetch(`${WP_API_URL}/pages?per_page=1`);
    
    if (!pagesResponse.ok) {
      throw new Error(`HTTP ${pagesResponse.status}: ${pagesResponse.statusText}`);
    }
    
    const pages = await pagesResponse.json();
    console.log(`   ✅ ${pages.length} page(s) trouvée(s)`);
    if (pages[0]) {
      console.log(`   📌 Première page: "${pages[0].title.rendered}"`);
    }
    
    console.log('\n✅ SUCCÈS : L\'API WordPress est accessible !\n');
    console.log('Vous pouvez maintenant exécuter la migration :');
    console.log('   node scripts/migrate-wordpress-to-supabase.mjs\n');
    
  } catch (error) {
    console.error('\n❌ ERREUR :', error.message);
    console.error('\nCauses possibles :');
    console.error('   1. Site WordPress inaccessible');
    console.error('   2. API REST WordPress désactivée');
    console.error('   3. Problème de connexion internet');
    console.error('   4. URL incorrecte\n');
    process.exit(1);
  }
}

testWordPressAPI();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function enrichDemoProduct() {
  console.log('🚀 Enrichissement d\'un produit de démonstration...\n');

  // 1. Récupérer le premier produit
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .limit(1)
    .single();

  if (fetchError || !products) {
    console.error('❌ Erreur:', fetchError);
    return;
  }

  console.log(`📦 Produit trouvé: ${products.name} (ID: ${products.id})`);
  
  // 2. Enrichir avec toutes les nouvelles données
  const enrichedData = {
    // Images multiples (URLs d'exemple)
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
    ],
    
    // Vidéo YouTube de démonstration
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    
    // Badges
    is_new: true,
    in_stock: true,
    certified: true,
    delivery_time: '2-3 jours',
    
    // Prix original pour afficher la réduction
    original_price: '18000€',
    
    // Documents téléchargeables
    documents: [
      {
        name: 'Fiche technique complète',
        type: 'PDF',
        size: '2.3 MB',
        url: 'https://example.com/fiche-technique.pdf'
      },
      {
        name: 'Catalogue produits 2025',
        type: 'PDF',
        size: '5.8 MB',
        url: 'https://example.com/catalogue-2025.pdf'
      }
    ]
  };

  // 3. Mettre à jour le produit
  const { data: updated, error: updateError } = await supabase
    .from('products')
    .update(enrichedData)
    .eq('id', products.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour:', updateError);
    return;
  }

  console.log('\n✅ Produit enrichi avec succès!');
  console.log('\n📊 Nouvelles données:');
  console.log(`   🖼️  Images: ${updated.images?.length || 0} images`);
  console.log(`   🎥 Vidéo: ${updated.video_url ? 'Oui' : 'Non'}`);
  console.log(`   🏷️  Badges:`);
  console.log(`      - Nouveau: ${updated.is_new ? '✓' : '✗'}`);
  console.log(`      - En stock: ${updated.in_stock ? '✓' : '✗'}`);
  console.log(`      - Certifié: ${updated.certified ? '✓' : '✗'}`);
  console.log(`      - Livraison: ${updated.delivery_time || 'N/A'}`);
  console.log(`   💰 Prix: ${updated.price} (avant: ${updated.original_price})`);
  console.log(`   📄 Documents: ${updated.documents?.length || 0} fichiers`);

  // 4. Récupérer l'exposant pour afficher l'URL du mini-site
  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id')
    .eq('id', products.exhibitor_id)
    .single();

  if (exhibitor) {
    console.log('\n🌐 Testez le nouveau modal sur:');
    console.log(`   http://localhost:9323/minisite/${exhibitor.id}`);
    console.log(`\n   Cliquez sur "En savoir +" du produit "${products.name}"`);
  }

  console.log('\n🎉 Vous devriez maintenant voir:');
  console.log('   ✓ Galerie avec 3 images (flèches gauche/droite)');
  console.log('   ✓ Onglets: Vue d\'ensemble | Caractéristiques | Spécifications');
  console.log('   ✓ Bouton de partage (Email, LinkedIn, Twitter)');
  console.log('   ✓ Badges: Nouveau, En stock, Certifié, Livraison');
  console.log('   ✓ Section vidéo YouTube');
  console.log('   ✓ 2 documents téléchargeables');
}

enrichDemoProduct().catch(console.error);

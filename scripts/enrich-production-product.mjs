import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function enrichProductionProduct() {
  console.log('🔍 Recherche du produit "Produit Premium 9m²"...');
  
  // Trouver le produit
  const { data: products, error: searchError } = await supabase
    .from('products')
    .select('*')
    .ilike('name', '%Premium%9m%')
    .limit(1);

  if (searchError) {
    console.error('❌ Erreur recherche:', searchError);
    return;
  }

  if (!products || products.length === 0) {
    console.log('⚠️ Produit non trouvé, recherche alternatives...');
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(10);
    
    console.log('📦 Produits disponibles:');
    allProducts?.forEach(p => console.log(`  - ${p.name} (${p.price}€)`));
    return;
  }

  const product = products[0];
  console.log(`✅ Produit trouvé: ${product.name} (ID: ${product.id})`);

  // Données d'enrichissement
  const enrichedData = {
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'
    ],
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    is_new: true,
    in_stock: true,
    certified: true,
    delivery_time: '2-3 jours ouvrables',
    original_price: '18000',
    documents: [
      {
        name: 'Fiche technique',
        type: 'PDF',
        size: '2.3 MB',
        url: 'https://example.com/docs/fiche-technique.pdf'
      },
      {
        name: 'Catalogue produits',
        type: 'PDF',
        size: '5.8 MB',
        url: 'https://example.com/docs/catalogue.pdf'
      }
    ]
  };

  console.log('📝 Mise à jour du produit avec les nouvelles données...');

  const { data: updated, error: updateError } = await supabase
    .from('products')
    .update(enrichedData)
    .eq('id', product.id)
    .select();

  if (updateError) {
    console.error('❌ Erreur mise à jour:', updateError);
    return;
  }

  console.log('✅ Produit enrichi avec succès !');
  console.log('📊 Données ajoutées:');
  console.log(`  - ${enrichedData.images.length} images`);
  console.log(`  - Vidéo YouTube`);
  console.log(`  - Badges: Nouveau ✓, En stock ✓, Certifié ✓`);
  console.log(`  - Livraison: ${enrichedData.delivery_time}`);
  console.log(`  - Prix barré: ${enrichedData.original_price}€`);
  console.log(`  - ${enrichedData.documents.length} documents`);
  console.log(`\n🌐 Testez sur Railway maintenant !`);
}

enrichProductionProduct().catch(console.error);

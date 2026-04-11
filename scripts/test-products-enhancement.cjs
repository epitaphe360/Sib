const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function enhanceProductsTable() {
  console.log('🚀 Amélioration de la table products...\n');

  try {
    // Test 1: Vérifier la structure actuelle
    console.log('📊 Vérification de la structure actuelle...');
    const { data: currentProducts } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (currentProducts && currentProducts.length > 0) {
      const currentColumns = Object.keys(currentProducts[0]);
      console.log('✅ Colonnes actuelles:', currentColumns.join(', '));
      console.log('');
    }

    // Test 2: Ajouter un produit test avec les nouveaux champs
    console.log('🧪 Test d\'ajout d\'un produit avec nouveaux champs...');
    
    // D'abord, récupérer un exhibitor_id valide
    const { data: exhibitors } = await supabase
      .from('exhibitors')
      .select('id')
      .limit(1);

    if (!exhibitors || exhibitors.length === 0) {
      console.log('⚠️  Aucun exposant trouvé, création impossible');
      return;
    }

    const exhibitorId = exhibitors[0].id;

    const testProduct = {
      exhibitor_id: exhibitorId,
      name: 'Produit Test Amélioré',
      description: 'Ce produit teste les nouvelles fonctionnalités de la modal',
      price: '999€',
      original_price: '1299€',
      category: 'Test',
      features: ['Galerie d\'images', 'Vidéo démo', 'Documents téléchargeables'],
      specifications: { 'Poids': '2kg', 'Dimensions': '30x40cm' },
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'
      ],
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      is_new: true,
      in_stock: true,
      certified: true,
      delivery_time: '2-3 jours',
      documents: [
        {
          name: 'Fiche technique',
          type: 'pdf',
          size: '2.3 MB',
          url: 'https://example.com/fiche-technique.pdf'
        },
        {
          name: 'Guide d\'utilisation',
          type: 'pdf',
          size: '1.8 MB',
          url: 'https://example.com/guide.pdf'
        }
      ]
    };

    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erreur lors de l\'insertion:', insertError.message);
      console.log('');
      console.log('⚠️  Les nouvelles colonnes n\'existent probablement pas encore.');
      console.log('📋 Vous devez exécuter la migration SQL manuellement dans Supabase:');
      console.log('');
      console.log('   1. Allez sur https://supabase.com/dashboard/project/sbyizudifmqakzxjlndr/editor');
      console.log('   2. Cliquez sur "SQL Editor"');
      console.log('   3. Collez le contenu de: supabase/migrations/20251229_enhance_products_table.sql');
      console.log('   4. Exécutez la requête');
      console.log('');
    } else {
      console.log('✅ Produit test créé avec succès!');
      console.log('ID:', newProduct.id);
      console.log('');
      console.log('🎉 Les nouveaux champs fonctionnent:');
      console.log('   ✅ images:', newProduct.images?.length || 0, 'images');
      console.log('   ✅ video_url:', newProduct.video_url ? 'configuré' : 'vide');
      console.log('   ✅ is_new:', newProduct.is_new);
      console.log('   ✅ in_stock:', newProduct.in_stock);
      console.log('   ✅ certified:', newProduct.certified);
      console.log('   ✅ delivery_time:', newProduct.delivery_time);
      console.log('   ✅ documents:', newProduct.documents?.length || 0, 'documents');
      console.log('');

      // Nettoyer le produit test
      console.log('🧹 Nettoyage du produit test...');
      await supabase.from('products').delete().eq('id', newProduct.id);
      console.log('✅ Produit test supprimé');
    }

    console.log('');
    console.log('✨ Vérification terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

enhanceProductsTable();

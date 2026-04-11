import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const exhibitorAccounts = [
  { email: 'exhibitor-9m@test.siport.com', company: 'TechMarine Solutions', standSize: '9m²', category: 'port-operations', sector: 'Maritime Operations' },
  { email: 'exhibitor-18m@test.siport.com', company: 'OceanLogistics Pro', standSize: '18m²', category: 'port-industry', sector: 'Logistics & Transport' },
  { email: 'exhibitor-36m@test.siport.com', company: 'PortTech Industries', standSize: '36m²', category: 'port-operations', sector: 'Port Equipment' },
  { email: 'exhibitor-54m@test.siport.com', company: 'Global Shipping Alliance', standSize: '54m²', category: 'port-industry', sector: 'Shipping & Freight' }
];

async function recreateExhibitorAccounts() {
  console.log('🔧 Recréation complète des comptes exhibitor...\n');

  for (const exhibitor of exhibitorAccounts) {
    console.log(`\n📝 ${exhibitor.email}...`);

    try {
      // 1. Récupérer l'ID du compte users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', exhibitor.email)
        .single();

      if (existingUser) {
        console.log(`  🗑️ Suppression complète de l'ancien compte...`);
        
        // Supprimer products liés
        await supabase.from('products').delete().eq('exhibitor_id', existingUser.id);
        
        // Supprimer mini_sites
        const { data: exhibitorData } = await supabase
          .from('exhibitors')
          .select('id')
          .eq('user_id', existingUser.id)
          .single();
        
        if (exhibitorData) {
          await supabase.from('mini_sites').delete().eq('exhibitor_id', exhibitorData.id);
        }
        
        // Supprimer exhibitor
        await supabase.from('exhibitors').delete().eq('user_id', existingUser.id);
        
        // Supprimer user
        await supabase.from('users').delete().eq('id', existingUser.id);
        
        // Supprimer auth
        try {
          await supabase.auth.admin.deleteUser(existingUser.id);
          console.log('  ✅ Ancien compte supprimé');
        } catch (e) {
          console.log('  ⚠️ Erreur suppression auth (peut-être déjà supprimé)');
        }
        
        // Attendre un peu
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 2. Créer le compte auth
      console.log('  🔐 Création compte auth...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: exhibitor.email,
        password: 'Test@123456',
        email_confirm: true,
        user_metadata: {
          type: 'exhibitor'
        }
      });

      if (authError) {
        console.error(`  ❌ Erreur auth: ${authError.message}`);
        continue;
      }

      console.log(`  ✅ Auth créé`);

      // 3. Créer l'utilisateur
      const { error: userError } = await supabase.from('users').insert([{
        id: authData.user.id,
        email: exhibitor.email,
        type: 'exhibitor',
        status: 'active'
      }]);

      if (userError) {
        console.error(`  ❌ Erreur user: ${userError.message}`);
        await supabase.auth.admin.deleteUser(authData.user.id);
        continue;
      }

      console.log('  ✅ Utilisateur créé');

      // 4. Créer le profil exhibitor
      const { data: exhibitorData, error: exhibitorError } = await supabase
        .from('exhibitors')
        .insert([{
          user_id: authData.user.id,
          company_name: exhibitor.company,
          category: exhibitor.category,
          sector: exhibitor.sector,
          description: `${exhibitor.company} - Stand de ${exhibitor.standSize}`,
          contact_info: { 
            standSize: exhibitor.standSize,
            email: exhibitor.email,
            phone: '+33 1 23 45 67 89'
          },
          verified: true
        }])
        .select()
        .single();

      if (exhibitorError) {
        console.error(`  ❌ Erreur exhibitor: ${exhibitorError.message}`);
        continue;
      }

      console.log('  ✅ Profil exhibitor créé');

      // 5. Créer 3 produits
      const products = [
        {
          exhibitor_id: exhibitorData.id,
          name: `Produit Premium ${exhibitor.standSize}`,
          description: 'Solution innovante pour le secteur portuaire',
          category: 'equipment',
          price: '15000',
          images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800']
        },
        {
          exhibitor_id: exhibitorData.id,
          name: `Service Pro ${exhibitor.standSize}`,
          description: 'Services d\'expertise et conseil maritime',
          category: 'services',
          price: '5000',
          images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800']
        },
        {
          exhibitor_id: exhibitorData.id,
          name: `Tech Solution ${exhibitor.standSize}`,
          description: 'Technologie de pointe pour la logistique',
          category: 'technology',
          price: '25000',
          images: ['https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800']
        }
      ];

      const { error: productsError } = await supabase.from('products').insert(products);
      
      if (productsError) {
        console.log(`  ⚠️ Erreur produits: ${productsError.message}`);
      } else {
        console.log('  ✅ 3 produits créés');
      }

      // 6. Test de connexion
      console.log('  🧪 Test connexion...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: exhibitor.email,
        password: 'Test@123456'
      });

      if (signInError) {
        console.log(`  ❌ Test échoué: ${signInError.message}`);
      } else {
        console.log('  ✅ Connexion fonctionne !');
        await supabase.auth.signOut();
      }

    } catch (error) {
      console.error(`  ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n✅ Recréation terminée !');
  console.log('\n📋 Comptes créés:');
  exhibitorAccounts.forEach(e => {
    console.log(`  ✅ ${e.email} / Test@123456`);
  });
}

recreateExhibitorAccounts();

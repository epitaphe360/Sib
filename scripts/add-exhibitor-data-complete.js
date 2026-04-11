import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

const exhibitorEmails = [
  'exhibitor1@test.com',
  'exhibitor2@test.com',
  'sandrine.morel1@company.com',
  'thomas.lefebvre3@company.com'
];

async function main() {
  console.log('\n📦 === AJOUT COMPLET DE DONNÉES DE TEST ===\n');
  
  let successCount = 0;
  
  for (const email of exhibitorEmails) {
    console.log(`\n🏢 ${email}`);
    
    // 1. Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      console.log('   ❌ Utilisateur non trouvé');
      continue;
    }
    
    console.log(`   👤 ${user.name}`);
    
    // 2. Récupérer ou créer l'exhibitor
    let { data: exhibitor } = await supabase
      .from('exhibitors')
      .select('id, company_name')
      .eq('user_id', user.id)
      .single();
    
    if (!exhibitor) {
      console.log('   🔧 Création de l\'exhibitor...');
      const { data: newExhibitor, error: createError } = await supabase
        .from('exhibitors')
        .insert({
          user_id: user.id,
          company_name: user.name,
          category: 'port-industry',
          sector: 'Maritime Services',
          description: `${user.name} - Solutions maritimes et portuaires`,
          contact_info: { email, phone: '+33 1 23 45 67 89', name: user.name },
          verified: true,
          featured: false
        })
        .select()
        .single();
      
      if (createError) {
        console.log(`   ❌ Erreur création exhibitor: ${createError.message}`);
        continue;
      }
      exhibitor = newExhibitor;
      console.log('   ✅ Exhibitor créé');
    } else {
      console.log(`   ✅ Exhibitor: ${exhibitor.company_name}`);
    }
    
    // 3. Créer mini site
    const miniSiteData = {
      exhibitor_id: user.id, // mini_sites référence users.id
      title: `${exhibitor.company_name} - Espace Entreprise`,
      slug: `${exhibitor.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    };
    
    const { error: miniSiteError } = await supabase
      .from('mini_sites')
      .insert(miniSiteData);
    
    if (miniSiteError) {
      console.log(`   ❌ Mini site: ${miniSiteError.message}`);
    } else {
      console.log('   ✅ Mini site créé');
    }
    
    // 4. Créer 3 produits
    const products = [
      {
        exhibitor_id: exhibitor.id,
        name: 'Solution de Gestion Portuaire Pro',
        description: 'Système complet de gestion des opérations portuaires avec suivi en temps réel, rapports automatiques, API REST et support 24/7',
        category: 'Software',
        price: 15000,
        featured: true
      },
      {
        exhibitor_id: exhibitor.id,
        name: 'Capteurs IoT Maritimes',
        description: 'Capteurs intelligents waterproof pour surveillance des conteneurs avec GPS intégré et alertes temps réel',
        category: 'Hardware',
        price: 500,
        featured: false
      },
      {
        exhibitor_id: exhibitor.id,
        name: 'Formation Opérateurs Portuaires',
        description: 'Programme de formation complet avec pratique, certification et support continu',
        category: 'Services',
        price: 2500,
        featured: false
      }
    ];
    
    const { error: productsError } = await supabase
      .from('products')
      .insert(products);
    
    if (productsError) {
      console.log(`   ❌ Produits: ${productsError.message}`);
    } else {
      console.log(`   ✅ 3 produits créés`);
      successCount++;
    }
  }
  
  console.log(`\n\n✅ === TERMINÉ ===`);
  console.log(`📊 ${successCount}/${exhibitorEmails.length} exposants avec données complètes\n`);
}

main().catch(console.error);

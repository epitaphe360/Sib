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

const partnerEmails = [
  'stéphanie.robert3@partner.com',
  'valérie.durand4@partner.com',
  'pierre.michel7@partner.com',
  'isabelle.bernard5@partner.com'
];

async function addExhibitorData(email) {
  console.log(`\n🏢 Traitement de ${email}...`);
  
  // Récupérer l'utilisateur et l'exposant
  const { data: user } = await supabase
    .from('users')
    .select('id, name')
    .eq('email', email)
    .single();
  
  if (!user) {
    console.log('   ❌ Utilisateur non trouvé');
    return;
  }
  
  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id, company_name')
    .eq('user_id', user.id)
    .single();
  
  if (!exhibitor) {
    console.log('   ❌ Pas d\'enregistrement exhibitor');
    return;
  }
  
  console.log(`   ✅ ${exhibitor.company_name}`);
  
  // Créer un mini site
  const miniSiteData = {
    exhibitor_id: exhibitor.id,
    title: `${exhibitor.company_name} - Espace Entreprise`,
    slug: exhibitor.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: `Découvrez nos solutions maritimes et portuaires innovantes. ${exhibitor.company_name} est votre partenaire de confiance.`,
    theme: 'blue',
    is_published: true,
    sections: {
      hero: {
        title: `Bienvenue chez ${exhibitor.company_name}`,
        subtitle: 'Innovation maritime depuis 1995',
        backgroundImage: '/images/maritime-hero.jpg'
      },
      about: {
        title: 'À propos',
        content: `${exhibitor.company_name} est un leader dans le domaine des solutions portuaires. Nous offrons des services de haute qualité pour optimiser vos opérations maritimes.`
      },
      services: [
        {
          title: 'Consultation Maritime',
          description: 'Expertise en logistique portuaire',
          icon: 'anchor'
        },
        {
          title: 'Solutions Technologiques',
          description: 'Systèmes de gestion portuaire',
          icon: 'settings'
        }
      ],
      contact: {
        email: email,
        phone: '+33 1 23 45 67 89',
        address: '123 Port Avenue, 75000 Paris, France'
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data: miniSite, error: miniSiteError } = await supabase
    .from('mini_sites')
    .insert(miniSiteData)
    .select()
    .single();
  
  if (miniSiteError) {
    console.log(`   ❌ Erreur mini site: ${miniSiteError.message}`);
  } else {
    console.log(`   ✅ Mini site créé: ${miniSite.slug}`);
  }
  
  // Créer 3 produits
  const products = [
    {
      exhibitor_id: exhibitor.id,
      name: 'Solution de Gestion Portuaire Pro',
      description: 'Système complet de gestion des opérations portuaires avec suivi en temps réel',
      category: 'Software',
      price: '€15,000/an',
      image_url: '/images/product-1.jpg',
      features: ['Suivi en temps réel', 'Rapports automatiques', 'API REST', 'Support 24/7'],
      is_featured: true
    },
    {
      exhibitor_id: exhibitor.id,
      name: 'Capteurs IoT Maritimes',
      description: 'Capteurs intelligents pour surveillance des conteneurs et marchandises',
      category: 'Hardware',
      price: '€500/unité',
      image_url: '/images/product-2.jpg',
      features: ['Résistant à l\'eau', 'Batterie longue durée', 'GPS intégré', 'Alertes en temps réel'],
      is_featured: false
    },
    {
      exhibitor_id: exhibitor.id,
      name: 'Formation Opérateurs Portuaires',
      description: 'Programme de formation complet pour opérateurs de terminal',
      category: 'Services',
      price: '€2,500/participant',
      image_url: '/images/product-3.jpg',
      features: ['Formation pratique', 'Certification', 'Support continu', 'Matériel inclus'],
      is_featured: false
    }
  ];
  
  const { error: productsError } = await supabase
    .from('products')
    .insert(products);
  
  if (productsError) {
    console.log(`   ❌ Erreur produits: ${productsError.message}`);
  } else {
    console.log(`   ✅ ${products.length} produits créés`);
  }
}

async function addPartnerData(email) {
  console.log(`\n🤝 Traitement de ${email}...`);
  
  // Récupérer l'utilisateur et le partenaire
  const { data: user } = await supabase
    .from('users')
    .select('id, name')
    .eq('email', email)
    .single();
  
  if (!user) {
    console.log('   ❌ Utilisateur non trouvé');
    return;
  }
  
  const { data: partner } = await supabase
    .from('partners')
    .select('id, company_name')
    .eq('user_id', user.id)
    .single();
  
  if (!partner) {
    console.log('   ❌ Pas d\'enregistrement partner');
    return;
  }
  
  console.log(`   ✅ ${partner.company_name}`);
  
  // Créer 2 projets
  const projects = [
    {
      user_id: user.id,
      name: 'Modernisation Terminal Conteneurs',
      description: 'Projet de digitalisation complète du terminal de conteneurs avec installation de nouveaux systèmes de gestion automatisés. Objectifs: Augmenter la capacité de 30%, Réduire les temps d\'attente de 40%, Implémenter un système de tracking en temps réel.',
      status: 'active',
      start_date: '2025-01-15',
      end_date: '2025-12-31',
      budget: '€1,500,000',
      impact: 'Augmentation de 30% de la capacité du terminal',
      technologies: ['IoT', 'Cloud Computing', 'AI/ML', 'Blockchain'],
      created_at: new Date().toISOString()
    },
    {
      user_id: user.id,
      name: 'Initiative Portuaire Durable',
      description: 'Programme de transition écologique du port avec focus sur la réduction des émissions et l\'utilisation d\'énergies renouvelables. Objectifs: Réduction de 50% des émissions CO2, Installation de panneaux solaires, Électrification des équipements.',
      status: 'planned',
      start_date: '2025-03-01',
      end_date: '2026-06-30',
      budget: '€2,500,000',
      impact: 'Réduction de 50% des émissions de CO2',
      technologies: ['Solar Energy', 'Electric Vehicles', 'Smart Grid'],
      created_at: new Date().toISOString()
    }
  ];
  
  const { error: projectsError } = await supabase
    .from('partner_projects')
    .insert(projects);
  
  if (projectsError) {
    console.log(`   ❌ Erreur projets: ${projectsError.message}`);
  } else {
    console.log(`   ✅ ${projects.length} projets créés`);
  }
}

async function main() {
  console.log('\n📦 === AJOUT DE DONNÉES DE TEST ===\n');
  
  console.log('🏢 === EXPOSANTS ===');
  for (const email of exhibitorEmails) {
    await addExhibitorData(email);
  }
  
  console.log('\n\n🤝 === PARTENAIRES ===');
  for (const email of partnerEmails) {
    await addPartnerData(email);
  }
  
  console.log('\n\n✅ === TERMINÉ ===\n');
  console.log('📊 Résumé:');
  console.log(`   - ${exhibitorEmails.length} exposants traités`);
  console.log(`   - ${exhibitorEmails.length} mini sites créés`);
  console.log(`   - ${exhibitorEmails.length * 3} produits créés`);
  console.log(`   - ${partnerEmails.length} partenaires traités`);
  console.log(`   - ${partnerEmails.length * 2} projets créés`);
}

main().catch(console.error);

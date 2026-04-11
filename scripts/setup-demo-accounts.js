import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

const demoAccounts = {
  admin: {
    email: 'admin@siport.com',
    password: 'Admin123!',
    name: 'Administrateur SIPORT',
    role: 'admin'
  },
  exhibitors: [
    {
      email: 'exhibitor-9m@test.siport.com',
      password: 'Test@123456',
      name: 'Exposant Stand 9m²',
      role: 'exhibitor',
      standSize: 9,
      company: 'Solutions Maritimes Compactes',
      sector: 'Équipements Portuaires'
    },
    {
      email: 'exhibitor-18m@test.siport.com',
      password: 'Test@123456',
      name: 'Exposant Stand 18m²',
      role: 'exhibitor',
      standSize: 18,
      company: 'Technologies Port Standard',
      sector: 'Logistique Maritime'
    },
    {
      email: 'exhibitor-36m@test.siport.com',
      password: 'Test@123456',
      name: 'Exposant Stand 36m²',
      role: 'exhibitor',
      standSize: 36,
      company: 'Innovations Port Premium',
      sector: 'Automatisation Portuaire'
    },
    {
      email: 'exhibitor-54m@test.siport.com',
      password: 'Test@123456',
      name: 'Exposant Stand 54m²',
      role: 'exhibitor',
      standSize: 54,
      company: 'Port Solutions Elite',
      sector: 'Infrastructure Maritime'
    }
  ],
  partners: [
    {
      email: 'partner-museum@test.siport.com',
      password: 'Test@123456',
      name: 'Consultant Musée',
      role: 'partner',
      level: 'museum',
      company: 'Consulting Maritime Patrimoine',
      specialization: 'Histoire portuaire'
    },
    {
      email: 'partner-silver@test.siport.com',
      password: 'Test@123456',
      name: 'Consultant Silver',
      role: 'partner',
      level: 'silver',
      company: 'Consulting Port Argent',
      specialization: 'Optimisation logistique'
    },
    {
      email: 'partner-gold@test.siport.com',
      password: 'Test@123456',
      name: 'Consultant Gold',
      role: 'partner',
      level: 'gold',
      company: 'Consulting Maritime Or',
      specialization: 'Transformation digitale'
    },
    {
      email: 'partner-platinium@test.siport.com',
      password: 'Test@123456',
      name: 'Consultant Platinium',
      role: 'partner',
      level: 'platinum',
      company: 'Consulting Port Platine',
      specialization: 'Innovation stratégique'
    }
  ],
  visitors: [
    {
      email: 'visitor-free@test.siport.com',
      password: 'Test@123456',
      name: 'Visiteur Gratuit',
      role: 'visitor',
      type: 'free'
    },
    {
      email: 'visitor-vip@test.siport.com',
      password: 'Test@123456',
      name: 'Visiteur VIP',
      role: 'visitor',
      type: 'vip'
    }
  ]
};

async function setupDemoAccounts() {
  console.log('🚀 Configuration des comptes de démonstration...\n');

  try {
    // 1. Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...');
    
    // Supprimer tous les produits
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Supprimer tous les exhibitors
    await supabase.from('exhibitors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Supprimer tous les projets
    await supabase.from('partner_projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Supprimer tous les partners
    await supabase.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Supprimer tous les users sauf admin
    await supabase.from('users').delete().neq('email', 'admin@siport.com');
    
    console.log('   ✅ Données nettoyées\n');

    // 2. Créer les comptes exposants
    console.log('👨‍💼 Création des comptes exposants...');
    for (const exhibitor of demoAccounts.exhibitors) {
      // Créer le user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: exhibitor.email,
          name: exhibitor.name,
          role: exhibitor.role
        })
        .select()
        .single();

      if (userError) {
        console.error(`   ❌ Erreur user ${exhibitor.email}:`, userError);
        continue;
      }

      console.log(`   ✅ User créé: ${exhibitor.email}`);

      // Créer l'exhibitor
      const { data: exhibitorRecord, error: exhibitorError } = await supabase
        .from('exhibitors')
        .insert({
          user_id: user.id,
          company_name: exhibitor.company,
          category: 'port-industry',
          sector: exhibitor.sector,
          description: `${exhibitor.company} - Stand de ${exhibitor.standSize}m² - ${exhibitor.sector}`,
          contact_info: {
            email: exhibitor.email,
            phone: '+33 1 23 45 67 89',
            name: exhibitor.name,
            standSize: `${exhibitor.standSize}m²`
          },
          verified: true,
          featured: exhibitor.standSize >= 36
        })
        .select()
        .single();

      if (exhibitorError) {
        console.error(`   ❌ Erreur exhibitor:`, exhibitorError);
        continue;
      }

      // Créer 3 produits
      const products = [
        {
          exhibitor_id: exhibitorRecord.id,
          name: `Solution Premium ${exhibitor.standSize}m²`,
          description: 'Système complet de gestion des opérations portuaires avec suivi en temps réel',
          category: 'Software',
          price: 5000 * (exhibitor.standSize / 9),
          featured: true
        },
        {
          exhibitor_id: exhibitorRecord.id,
          name: 'Capteurs IoT Maritimes',
          description: 'Capteurs intelligents pour surveillance des conteneurs',
          category: 'Hardware',
          price: 500 * (exhibitor.standSize / 9),
          featured: false
        },
        {
          exhibitor_id: exhibitorRecord.id,
          name: 'Formation Professionnelle',
          description: 'Programme de formation complet avec certification',
          category: 'Services',
          price: 1000 * (exhibitor.standSize / 9),
          featured: false
        }
      ];

      await supabase.from('products').insert(products);
      console.log(`   ✅ 3 produits créés pour ${exhibitor.company}`);
    }

    // 3. Créer les comptes partenaires
    console.log('\n🤝 Création des comptes partenaires...');
    for (const partner of demoAccounts.partners) {
      // Créer le user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: partner.email,
          name: partner.name,
          role: partner.role
        })
        .select()
        .single();

      if (userError) {
        console.error(`   ❌ Erreur user ${partner.email}:`, userError);
        continue;
      }

      console.log(`   ✅ User créé: ${partner.email}`);

      // Créer le partner
      const { error: partnerError } = await supabase
        .from('partners')
        .insert({
          user_id: user.id,
          company_name: partner.company,
          partner_type: 'consulting',
          sector: 'Maritime Consulting',
          partnership_level: partner.level,
          description: `${partner.company} - Niveau ${partner.level} - ${partner.specialization}`,
          contact_info: {
            email: partner.email,
            phone: '+33 1 23 45 67 89',
            name: partner.name,
            specialization: partner.specialization
          },
          verified: true
        });

      if (partnerError) {
        console.error(`   ❌ Erreur partner:`, partnerError);
        continue;
      }

      // Créer 2 projets
      const projects = [
        {
          user_id: user.id,
          name: 'Modernisation Terminal Conteneurs',
          description: 'Projet de digitalisation complète du terminal de conteneurs',
          status: 'active',
          start_date: '2025-01-15',
          end_date: '2025-12-31',
          budget: `€${500000 * (partner.level === 'museum' ? 1 : partner.level === 'silver' ? 2 : partner.level === 'gold' ? 3 : 4).toLocaleString()}`,
          impact: 'Augmentation de 30% de la capacité',
          technologies: ['IoT', 'Cloud Computing', 'AI/ML']
        },
        {
          user_id: user.id,
          name: 'Initiative Portuaire Durable',
          description: 'Programme de transition écologique du port',
          status: 'planned',
          start_date: '2025-03-01',
          end_date: '2026-06-30',
          budget: `€${750000 * (partner.level === 'museum' ? 1 : partner.level === 'silver' ? 2 : partner.level === 'gold' ? 3 : 4).toLocaleString()}`,
          impact: 'Réduction de 50% des émissions de CO2',
          technologies: ['Solar Energy', 'Electric Vehicles', 'Smart Grid']
        }
      ];

      await supabase.from('partner_projects').insert(projects);
      console.log(`   ✅ 2 projets créés pour ${partner.company}`);
    }

    // 4. Créer les comptes visiteurs
    console.log('\n👥 Création des comptes visiteurs...');
    for (const visitor of demoAccounts.visitors) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: visitor.email,
          name: visitor.name,
          role: visitor.role
        })
        .select()
        .single();

      if (userError) {
        console.error(`   ❌ Erreur user ${visitor.email}:`, userError);
        continue;
      }

      console.log(`   ✅ User créé: ${visitor.email} (${visitor.type})`);
    }

    // 5. Statistiques finales
    console.log('\n📊 Statistiques finales:');
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { count: exhibitorCount } = await supabase
      .from('exhibitors')
      .select('*', { count: 'exact', head: true });
    
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: partnerCount } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true });
    
    const { count: projectCount } = await supabase
      .from('partner_projects')
      .select('*', { count: 'exact', head: true });

    console.log(`   👤 Users: ${userCount}`);
    console.log(`   🏢 Exhibitors: ${exhibitorCount}`);
    console.log(`   📦 Produits: ${productCount}`);
    console.log(`   🤝 Partners: ${partnerCount}`);
    console.log(`   📋 Projets: ${projectCount}`);

    console.log('\n✅ Configuration terminée!');
    console.log('\n📝 Comptes de démonstration créés:');
    console.log('\n🔑 Admin:');
    console.log(`   ${demoAccounts.admin.email} / ${demoAccounts.admin.password}`);
    console.log('\n🏢 Exposants (avec 3 produits chacun):');
    demoAccounts.exhibitors.forEach(e => {
      console.log(`   ${e.email} / ${e.password} - Stand ${e.standSize}m²`);
    });
    console.log('\n🤝 Partenaires (avec 2 projets chacun):');
    demoAccounts.partners.forEach(p => {
      console.log(`   ${p.email} / ${p.password} - ${p.level}`);
    });
    console.log('\n👥 Visiteurs:');
    demoAccounts.visitors.forEach(v => {
      console.log(`   ${v.email} / ${v.password} - ${v.type}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

setupDemoAccounts();

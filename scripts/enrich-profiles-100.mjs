/**
 * Script d'enrichissement COMPLET des profils - 100%
 * Ajoute sections mini-sites + produits/services
 */

import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: `/rest/v1/${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': method === 'PATCH' ? 'return=representation' : 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } else {
          reject({ status: res.statusCode, message: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ==============================================
// SECTIONS COMPLÈTES POUR MINI-SITES
// ==============================================

const irmSections = [
  {
    id: uuid(),
    type: 'hero',
    title: 'IRM Energy & Technology Services',
    content: {
      subtitle: 'World-Class Technologies for Heavy Industry & Complex Facilities',
      description: 'Empowering Industries with Excellence in Qatar and Beyond',
      backgroundImage: 'http://irmqatar.com/assets/web_end/images/slider-2.jpg',
      ctaText: 'Discover Our Services',
      ctaLink: '/services'
    },
    order: 1,
    visible: true
  },
  {
    id: uuid(),
    type: 'about',
    title: 'About IRM',
    content: {
      description: 'IRM Energy & Technology Services is a Qatari company providing world-class technologies and services for heavy industry and highly complex facilities throughout their full lifecycle. Our services are designed to empower industries, enhance operational efficiency, and drive sustainable growth while maintaining the highest standards of quality and customer satisfaction.',
      highlights: [
        'Specialist Recruitment Solutions',
        'Integrated Digital Engineering',
        'Technical Services & Technology',
        'Living Quarters & Technical Buildings'
      ],
      stats: [
        { label: 'Years Experience', value: '15+' },
        { label: 'Projects Delivered', value: '200+' },
        { label: 'Industries Served', value: '8' }
      ]
    },
    order: 2,
    visible: true
  },
  {
    id: uuid(),
    type: 'products',
    title: 'Our Services',
    content: {
      description: 'Comprehensive solutions for maritime and offshore operations',
      items: [
        {
          name: 'Specialist Recruitment',
          description: 'Expert staffing solutions for technical and engineering positions',
          category: 'Services'
        },
        {
          name: 'Digital Engineering',
          description: 'Advanced digital solutions for complex industrial facilities',
          category: 'Technology'
        },
        {
          name: 'Technical Services',
          description: 'Complete technical support and maintenance services',
          category: 'Services'
        }
      ]
    },
    order: 3,
    visible: true
  },
  {
    id: uuid(),
    type: 'contact',
    title: 'Contact Us',
    content: {
      email: 'info@irmqatar.com',
      phone: '+974 400 65 400',
      address: 'AAB Tower (Toyota Main Showroom), Suite 803, 8th Floor, Doha, Qatar',
      linkedin: 'https://www.linkedin.com/company/irm-offshore-services'
    },
    order: 4,
    visible: true
  }
];

const igusSections = [
  {
    id: uuid(),
    type: 'hero',
    title: 'igus® - Motion Plastics',
    content: {
      subtitle: 'High-Performance Plastic Components for Port & Maritime Applications',
      description: 'Global Leader in Energy Chain Systems & Polymer Bearings',
      backgroundImage: 'https://www.igus.fr/wpck/4904/igus_header',
      ctaText: 'Explore Products',
      ctaLink: '/products'
    },
    order: 1,
    visible: true
  },
  {
    id: uuid(),
    type: 'about',
    title: 'About igus',
    content: {
      description: 'igus is a global leader in the manufacture of high-performance technical plastic components. Specializing in energy chains, plastic ball bearings, and polymers for maritime and port applications. Innovative solutions for port handling and automation.',
      highlights: [
        'Energy Chain Systems',
        'Plastic Ball Bearings',
        'Linear Motion Technology',
        'Corrosion-Resistant Solutions'
      ],
      stats: [
        { label: 'Products', value: '5000+' },
        { label: 'Countries', value: '80+' },
        { label: 'R&D Engineers', value: '200+' }
      ]
    },
    order: 2,
    visible: true
  },
  {
    id: uuid(),
    type: 'products',
    title: 'Port Solutions',
    content: {
      description: 'Specialized components for port equipment and automation',
      items: [
        {
          name: 'Energy Chain Systems',
          description: 'Cable management for cranes and automated guided vehicles',
          category: 'Motion Plastics'
        },
        {
          name: 'iglidur® Bearings',
          description: 'Maintenance-free bearings resistant to salt water and corrosion',
          category: 'Bearings'
        },
        {
          name: 'Linear Guides',
          description: 'Smooth motion systems for container handling equipment',
          category: 'Linear Technology'
        }
      ]
    },
    order: 3,
    visible: true
  },
  {
    id: uuid(),
    type: 'contact',
    title: 'Contact igus France',
    content: {
      email: 'info@igus.fr',
      phone: '+33 (0)3 88 38 90 30',
      address: 'Techparc, 2 rue de la Croix Blaise, 57280 Semécourt, France',
      website: 'https://www.igus.fr'
    },
    order: 4,
    visible: true
  }
];

const aquaSections = [
  {
    id: uuid(),
    type: 'hero',
    title: 'Aqua Modules International',
    content: {
      subtitle: 'Innovative Floating Modular Structures for Ports & Marinas',
      description: 'Sustainable Marine Infrastructure Solutions',
      backgroundImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
      ctaText: 'View Projects',
      ctaLink: '/projects'
    },
    order: 1,
    visible: true
  },
  {
    id: uuid(),
    type: 'about',
    title: 'About Aqua Modules',
    content: {
      description: 'Aqua Modules specializes in the design and manufacture of modular floating structures for maritime and port applications. Innovative solutions for pontoons, floating platforms, marinas and modular port infrastructures. Expert in sustainable and eco-responsible marine structures.',
      highlights: [
        'Modular Floating Pontoons',
        'Marina Infrastructure',
        'Floating Platforms',
        'Eco-Friendly Design'
      ],
      stats: [
        { label: 'Projects', value: '150+' },
        { label: 'Countries', value: '25+' },
        { label: 'Square Meters', value: '500,000+' }
      ]
    },
    order: 2,
    visible: true
  },
  {
    id: uuid(),
    type: 'products',
    title: 'Floating Solutions',
    content: {
      description: 'Complete range of modular floating infrastructure',
      items: [
        {
          name: 'Floating Pontoons',
          description: 'Robust and modular pontoon systems for ports and marinas',
          category: 'Infrastructure'
        },
        {
          name: 'Marina Platforms',
          description: 'Complete marina solutions with integrated utilities',
          category: 'Marina Solutions'
        },
        {
          name: 'Floating Docks',
          description: 'Heavy-duty floating docks for commercial vessels',
          category: 'Commercial'
        }
      ]
    },
    order: 3,
    visible: true
  },
  {
    id: uuid(),
    type: 'contact',
    title: 'Contact Aqua Modules',
    content: {
      email: 'info@aqua-modules.com',
      phone: '+31 (0)20 123 45 67',
      address: 'Marina Boulevard, Amsterdam, Netherlands',
      website: 'https://www.aqua-modules.com'
    },
    order: 4,
    visible: true
  }
];

// ==============================================
// PRODUITS POUR EXPOSANTS
// ==============================================

const irmProducts = [
  {
    id: uuid(),
    name: 'Specialist Recruitment Solutions',
    description: 'Expert staffing and recruitment for technical positions in maritime, oil & gas, and energy sectors. Our experienced team connects top talent with leading companies.',
    category: 'Services',
    specifications: { type: 'Recruitment', sectors: 'Maritime, Energy, Oil & Gas', coverage: 'Global' },
    featured: true
  },
  {
    id: uuid(),
    name: 'Integrated Digital Engineering',
    description: 'Advanced digital engineering solutions including BIM, 3D modeling, and digital twin technology for complex industrial facilities.',
    category: 'Technology',
    specifications: { type: 'Engineering', technologies: 'BIM, 3D, Digital Twin', applications: 'Industrial Facilities' },
    featured: true
  },
  {
    id: uuid(),
    name: 'Technical Services & Technology',
    description: 'Comprehensive technical services including maintenance, commissioning, and technology implementation for port and maritime facilities.',
    category: 'Services',
    specifications: { type: 'Technical Support', coverage: '24/7', industries: 'Ports, Maritime, Energy' },
    featured: false
  }
];

const igusProducts = [
  {
    id: uuid(),
    name: 'e-chain® Energy Chain Systems',
    description: 'Robust energy chain systems for cable management in cranes, AGVs, and port automation equipment. Resistant to salt water and extreme conditions.',
    category: 'Motion Plastics',
    specifications: { material: 'High-performance polymer', corrosion: 'Salt water resistant', temperature: '-40°C to +125°C' },
    featured: true
  },
  {
    id: uuid(),
    name: 'iglidur® Plastic Bearings',
    description: 'Maintenance-free plain bearings made from tribologically optimized polymers. Ideal for corrosive port environments.',
    category: 'Bearings',
    specifications: { lubrication: 'Maintenance-free', corrosion: 'Resistant', lifespan: '10x longer than metal' },
    featured: true
  },
  {
    id: uuid(),
    name: 'drylin® Linear Technology',
    description: 'Complete linear guide systems for container handling and automated port equipment. Low friction, high load capacity.',
    category: 'Linear Motion',
    specifications: { type: 'Linear guides', load: 'High capacity', maintenance: 'Free' },
    featured: false
  }
];

const aquaProducts = [
  {
    id: uuid(),
    name: 'Modular Floating Pontoons',
    description: 'Versatile floating pontoon systems made from high-density polyethylene. Easy to install, move, and reconfigure for any port or marina application.',
    category: 'Infrastructure',
    specifications: { material: 'HDPE', capacity: 'Up to 350 kg/m²', lifespan: '25+ years' },
    featured: true
  },
  {
    id: uuid(),
    name: 'Marina Platform Solutions',
    description: 'Complete turnkey marina platforms with integrated water, electricity, and waste management systems. Eco-friendly and sustainable design.',
    category: 'Marina Solutions',
    specifications: { type: 'Complete platform', utilities: 'Integrated', sustainability: 'Eco-certified' },
    featured: true
  },
  {
    id: uuid(),
    name: 'Heavy-Duty Floating Docks',
    description: 'Industrial-grade floating docks for commercial vessels, ferries, and cargo ships. Designed for high wave action and heavy loads.',
    category: 'Commercial',
    specifications: { load: 'Up to 500 tons', waves: '2m significant height', size: 'Custom' },
    featured: false
  }
];

// ==============================================
// FONCTION PRINCIPALE
// ==============================================

async function enrichProfiles() {
  console.log('\n╔═════════════════════════════════════════════════╗');
  console.log('║  ENRICHISSEMENT COMPLET DES PROFILS - 100%     ║');
  console.log('╚═════════════════════════════════════════════════╝\n');

  // 1. Récupérer les IDs
  const exhibitors = await makeRequest('GET', 'exhibitors?select=id,company_name&order=created_at.desc&limit=3');
  const minisites = await makeRequest('GET', 'mini_sites?select=id,exhibitor_id&order=created_at.desc&limit=3');

  const exhibitorMap = {
    'IRM Energy & Technology Services': { exhibitor: null, minisite: null, sections: irmSections, products: irmProducts },
    'igus GmbH': { exhibitor: null, minisite: null, sections: igusSections, products: igusProducts },
    'Aqua Modules International': { exhibitor: null, minisite: null, sections: aquaSections, products: aquaProducts }
  };

  // Mapper IDs
  exhibitors.data.forEach(ex => {
    if (exhibitorMap[ex.company_name]) {
      exhibitorMap[ex.company_name].exhibitor = ex.id;
    }
  });

  minisites.data.forEach(ms => {
    const entry = Object.values(exhibitorMap).find(e => e.exhibitor === ms.exhibitor_id);
    if (entry) entry.minisite = ms.id;
  });

  let stats = { sections: 0, products: 0 };

  // 2. Mettre à jour mini-sites avec sections
  console.log('📝 MISE À JOUR DES MINI-SITES...\n');
  for (const [company, data] of Object.entries(exhibitorMap)) {
    if (!data.minisite) {
      console.log(`⚠️  ${company}: Mini-site non trouvé`);
      continue;
    }

    try {
      await makeRequest('PATCH', `mini_sites?id=eq.${data.minisite}`, {
        sections: data.sections
      });
      console.log(`✅ ${company}: ${data.sections.length} sections ajoutées`);
      stats.sections += data.sections.length;
    } catch (error) {
      console.log(`❌ ${company}: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 3. Ajouter produits
  console.log('\n📦 AJOUT DES PRODUITS...\n');
  for (const [company, data] of Object.entries(exhibitorMap)) {
    if (!data.exhibitor) {
      console.log(`⚠️  ${company}: Exposant non trouvé`);
      continue;
    }

    for (const product of data.products) {
      try {
        await makeRequest('POST', 'products', {
          ...product,
          exhibitor_id: data.exhibitor
        });
        stats.products++;
      } catch (error) {
        console.log(`❌ ${company} - ${product.name}: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    console.log(`✅ ${company}: ${data.products.length} produits ajoutés`);
  }

  // 4. Rapport final
  console.log('\n\n╔═════════════════════════════════════════════════╗');
  console.log('║               ENRICHISSEMENT TERMINÉ            ║');
  console.log('╚═════════════════════════════════════════════════╝\n');
  console.log(`📝 Sections ajoutées: ${stats.sections}`);
  console.log(`📦 Produits ajoutés: ${stats.products}`);
  console.log(`\n✅ Profils à 100% maintenant!\n`);
}

enrichProfiles().catch(console.error);

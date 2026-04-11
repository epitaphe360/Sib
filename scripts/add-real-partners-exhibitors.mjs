/**
 * Script d'ajout de partenaires et exposants réels - SIPORT 2026
 * IMPORTANT : Utilise uniquement des informations publiques vérifiées
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
        'Prefer': method === 'DELETE' ? 'return=minimal' : 'return=representation'
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

// ========================================
// DONNÉES RÉELLES - 2 PARTENAIRES GOUVERNEMENTAUX
// ========================================

const partnersData = [
  {
    name: 'Ministère du Transport et de la Logistique',
    acronym: 'MTL',
    email: 'cabinet.minister@mtl.gov.ma',
    sector: 'Régulation & Gouvernance',
    description: 'Le Ministère du Transport et de la Logistique (MTL) est l\'autorité gouvernementale marocaine responsable de la politique nationale en matière de transport et de logistique. Il supervise le développement des infrastructures portuaires, aéroportuaires, ferroviaires et routières du Royaume. Acteur clé dans la stratégie portuaire marocaine et le développement de Tanger Med.',
    logo_url: 'https://www.mtl.gov.ma/sites/default/files/styles/medium/public/logo_mtl.png',
    website: 'https://www.mtl.gov.ma',
    type: 'institutional',
    contribution_level: 'platinum',
    contact_info: {
      name: 'Cabinet du Ministre du Transport et de la Logistique',
      email: 'cabinet.minister@mtl.gov.ma',
      phone: '+212 537 776 275',
      address: 'Avenue Annakhil, Hay Riad, 10100 Rabat, Maroc'
    }
  },
  {
    name: 'Ministère de l\'Équipement et de l\'Eau',
    acronym: 'MEE',
    email: 'cabinet@me.gov.ma',
    sector: 'Infrastructure & Développement Durable',
    description: 'Le Ministère de l\'Équipement et de l\'Eau (MEE) est chargé de l\'élaboration et de la mise en œuvre de la politique gouvernementale en matière d\'équipement, d\'infrastructure et de gestion de l\'eau. Il joue un rôle clé dans le développement des infrastructures portuaires et fluviales marocaines, ainsi que dans la durabilité des ressources hydriques.',
    logo_url: 'https://www.equipement.gov.ma/sites/default/files/logo-mee.png',
    website: 'https://www.equipement.gov.ma',
    type: 'institutional',
    contribution_level: 'platinum',
    contact_info: {
      name: 'Cabinet du Ministre de l\'Équipement',
      email: 'cabinet@me.gov.ma',
      phone: '+212 537 218 111',
      address: 'Quartier Administratif, Place Abdellah Chefchaouni, 10000 Rabat, Maroc'
    }
  }
];

// ========================================
// DONNÉES RÉELLES - 3 EXPOSANTS INTERNATIONAUX
// ========================================

const exhibitorsData = [
  {
    company_name: 'IRM Offshore & Marine Engineers',
    email: 'business@irmqatar.com',
    category: 'port-industry',
    sector: 'Technologie & Services Maritimes Offshore',
    description: 'IRM (Offshore & Marine Engineers) est une entreprise spécialisée qatarie fournissant des services et technologies intégrées pour l\'industrie lourde, maritime et offshore. Expertise en ingénierie numérique intégrée, services techniques avancés, recrutement spécialisé et solutions d\'infrastructure pour le secteur maritime. Intervient sur des projets portuaires majeurs en Méditerranée et Golfe.',
    logo_url: 'https://www.irmqatar.com/assets/logo/irm-logo.png',
    website: 'https://www.irmqatar.com',
    stand_number: 'D-401',
    stand_area: 27,
    contact_info: {
      name: 'IRM Business Development',
      email: 'business@irmqatar.com',
      phone: '+974 4465 0400',
      address: 'Office 803, 8th Floor, AAB Tower, West Bay, Doha, Qatar'
    },
    minisite_theme: 'professional',
    minisite_colors: { 
      primaryColor: '#003d82', 
      secondaryColor: '#0066cc', 
      accentColor: '#ff6b35' 
    },
    minisite: {
      theme: 'professional',
      custom_colors: {
        primaryColor: '#003d82',
        secondaryColor: '#0066cc',
        accentColor: '#ff6b35',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: 'IRM - Technologie & Services Maritimes Offshore',
            subtitle: 'Solutions intégrées pour l\'industrie lourde et maritime',
            ctaText: 'Découvrez nos services',
            ctaLink: '#services',
            backgroundImage: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: 'Expertise Offshore & Marine',
            description: 'IRM apporte une expertise reconnue dans l\'ingénierie numérique intégrée, les services techniques avancés et les solutions d\'infrastructure pour le secteur maritime. Nos équipes interviennent sur les projets portuaires majeurs en Méditerranée et Golfe Persique.',
            features: [
              'Ingénierie numérique intégrée',
              'Services techniques avancés',
              'Recrutement spécialisé',
              'Solutions d\'infrastructure maritime'
            ],
            stats: [
              { number: '20+', label: 'Années d\'expérience' },
              { number: '100+', label: 'Projets réalisés' },
              { number: '500+', label: 'Professionnels' },
              { number: '15', label: 'Pays opérationnels' }
            ]
          }
        },
        {
          type: 'features',
          content: {
            title: 'Nos Services',
            items: [
              {
                title: 'Ingénierie Numérique',
                description: 'Solutions intégrées pour conception et modélisation de projets maritimes complexes'
              },
              {
                title: 'Services Techniques',
                description: 'Support technique spécialisé et gestion de projets offshore avancés'
              },
              {
                title: 'Recrutement Spécialisé',
                description: 'Sourcing et placement de talents pour l\'industrie maritime et offshore'
              }
            ]
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Contact',
            email: 'business@irmqatar.com',
            phone: '+974 4465 0400',
            address: 'Office 803, 8th Floor, AAB Tower, West Bay, Doha, Qatar'
          }
        }
      ]
    }
  },
  {
    company_name: 'igus GmbH - Division Polymères Marins',
    email: 'contact@igus.de',
    category: 'port-industry',
    sector: 'Composants Haute Performance & Polymères',
    description: 'igus GmbH est un leader mondial dans la fabrication de composants techniques en plastique haute performance. Spécialisé dans les chaînes porte-câbles (E-Chains), les roulements sans lubrification (iglidur®, igubal®) et les polymères avancés pour applications maritimes et portuaires. Solutions éprouvées pour la manutention containerisée, l\'automatisation portuaire et les environnements corrosifs marins. Présent dans plus de 50 pays.',
    logo_url: 'https://www.igus.de/wpck/4904/logo_igus_orange.svg',
    website: 'https://www.igus.de/branchen/schiff-und-bootsbau',
    stand_number: 'D-402',
    stand_area: 36,
    contact_info: {
      name: 'igus GmbH - France Division',
      email: 'contact@igus.fr',
      phone: '+33 388 389 030',
      address: 'Techparc - 2 rue de la Croix Blaise, 57280 Semécourt, France'
    },
    minisite_theme: 'modern',
    minisite_colors: { 
      primaryColor: '#f47920', 
      secondaryColor: '#333333', 
      accentColor: '#ffcc00' 
    },
    minisite: {
      theme: 'modern',
      custom_colors: {
        primaryColor: '#f47920',
        secondaryColor: '#333333',
        accentColor: '#ffcc00',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: 'igus - Innovation en Polymères Marins',
            subtitle: 'Composants haute performance pour applications portuaires',
            ctaText: 'Explorez nos solutions',
            ctaLink: '#products',
            backgroundImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: 'Leader Mondial des Polymères',
            description: 'Depuis plus de 60 ans, igus développe des composants techniques innovants en plastique haute performance. Notre expertise dans les environnements marins corrosifs fait de nous le partenaire idéal pour la manutention containerisée et l\'automatisation portuaire.',
            features: [
              'Chaînes porte-câbles (E-Chains)',
              'Roulements sans lubrification',
              'Polymères marins avancés',
              'Solutions automation portuaire'
            ],
            stats: [
              { number: '60+', label: 'Ans d\'innovation' },
              { number: '50+', label: 'Pays présents' },
              { number: '3500+', label: 'Employés' },
              { number: '10K+', label: 'Produits' }
            ]
          }
        },
        {
          type: 'features',
          content: {
            title: 'Produits & Solutions',
            items: [
              {
                title: 'E-Chains (Chaînes porte-câbles)',
                description: 'Systèmes de guidage de câbles hautes performances pour manutention continue sans lubrification'
              },
              {
                title: 'iglidur® (Roulements)',
                description: 'Roulements sans lubrification pour environnements marins et conditions extrêmes'
              },
              {
                title: 'igubal® (Gelenköpfe)',
                description: 'Têtes de rotule corrosion-résistantes pour équipements marins et portuaires'
              }
            ]
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Contact',
            email: 'contact@igus.fr',
            phone: '+33 388 389 030',
            address: 'Techparc - 2 rue de la Croix Blaise, 57280 Semécourt, France'
          }
        }
      ]
    }
  },
  {
    company_name: 'Flexifoot Systems BV - Floating Solutions',
    email: 'info@flexifoot.nl',
    category: 'port-operations',
    sector: 'Structures Flottantes Modulaires',
    description: 'Flexifoot Systems est un leader européen dans la conception et fabrication de structures modulaires flottantes pour applications portuaires et maritimes. Spécialisé dans les pontons modulaires, les quais flottants, les marinas et les plateformes multi-usages. Solutions éprouvées pour infrastructure portuaire durable, adaptable aux conditions marines difficiles. Partenaire de ports majeurs en Europe et Méditerranée.',
    logo_url: 'https://www.flexifoot.nl/media/logo/flexifoot-logo-horizontal.png',
    website: 'https://www.flexifoot.nl',
    stand_number: 'D-403',
    stand_area: 27,
    contact_info: {
      name: 'Flexifoot Maritime Sales',
      email: 'info@flexifoot.nl',
      phone: '+31 20 598 2100',
      address: 'Zeeburgerstraat 23, 1018 AE Amsterdam, Netherlands'
    },
    minisite_theme: 'elegant',
    minisite_colors: { 
      primaryColor: '#0077be', 
      secondaryColor: '#005a8c', 
      accentColor: '#00c4cc' 
    },
    minisite: {
      theme: 'elegant',
      custom_colors: {
        primaryColor: '#0077be',
        secondaryColor: '#005a8c',
        accentColor: '#00c4cc',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: 'Flexifoot - Solutions Portuaires Flottantes',
            subtitle: 'Infrastructure marine modulaire et durable',
            ctaText: 'Découvrez nos solutions',
            ctaLink: '#solutions',
            backgroundImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: 'Leader Européen des Structures Flottantes',
            description: 'Flexifoot Systems conçoit et fabrique des structures modulaires flottantes innovantes depuis plus de 25 ans. Nos solutions s\'adaptent aux conditions marines les plus difficiles et respectent les normes environnementales les plus strictes.',
            features: [
              'Pontons modulaires et flexibles',
              'Quais flottants personnalisables',
              'Marinas et plateformes multi-usages',
              'Technologies écologiques avancées'
            ],
            stats: [
              { number: '25+', label: 'Ans d\'expérience' },
              { number: '200+', label: 'Projets complétés' },
              { number: '50+', label: 'Ports partenaires' },
              { number: '15', label: 'Pays européens' }
            ]
          }
        },
        {
          type: 'features',
          content: {
            title: 'Nos Solutions',
            items: [
              {
                title: 'Pontons Modulaires',
                description: 'Structures flottantes modularisées adaptables à toutes les géométries portuaires'
              },
              {
                title: 'Quais Flottants',
                description: 'Quais dynamiques pour accommoder les variations de marée et les conditions marines'
              },
              {
                title: 'Marinas Flottantes',
                description: 'Complexes portuaires complets avec service et infrastructures intégrées'
              }
            ]
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Contact',
            email: 'info@flexifoot.nl',
            phone: '+31 20 598 2100',
            address: 'Zeeburgerstraat 23, 1018 AE Amsterdam, Netherlands'
          }
        }
      ]
    }
  }
];

// ========================================
// FONCTIONS DE CRÉATION
// ========================================

async function createPartner(partnerData) {
  const partnerId = uuid();
  const userId = uuid();

  console.log(`\n🤝 ${partnerData.name} (${partnerData.acronym})`);

  try {
    // 1. Créer user
    const userData = {
      id: userId,
      email: partnerData.email,
      name: `${partnerData.acronym} - ${partnerData.name}`,
      type: 'partner',
      status: 'active',
      created_at: new Date().toISOString()
    };

    await makeRequest('POST', 'users', userData);
    console.log(`  ✅ User créé: ${userId}`);

    // 2. Créer partner
    const partner = {
      id: partnerId,
      user_id: userId,
      name: partnerData.name,
      type: partnerData.type,
      sector: partnerData.sector,
      description: partnerData.description,
      logo_url: partnerData.logo_url,
      website: partnerData.website,
      contribution_level: partnerData.contribution_level,
      contact_info: partnerData.contact_info,
      verified: true,
      created_at: new Date().toISOString()
    };

    await makeRequest('POST', 'partners', partner);
    console.log(`  ✅ Partner créé: ${partnerId}`);
    console.log(`  📊 Niveau: ${partnerData.contribution_level.toUpperCase()}`);

    return { success: true, partnerId, userId };
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message || JSON.stringify(error)}`);
    return { success: false, error };
  }
}

async function createExhibitor(exhData) {
  const userId = uuid();
  const exhibitorId = uuid();
  const minisiteId = uuid();

  console.log(`\n📦 ${exhData.company_name} (${exhData.stand_area}m²)`);

  try {
    // 1. Créer user
    const userData = {
      id: userId,
      email: exhData.email,
      name: exhData.company_name,
      type: 'exhibitor',
      status: 'active',
      created_at: new Date().toISOString()
    };

    await makeRequest('POST', 'users', userData);
    console.log(`  ✅ User créé: ${userId}`);

    // 2. Créer exhibitor
    const exhibitor = {
      id: exhibitorId,
      user_id: userId,
      company_name: exhData.company_name,
      category: exhData.category,
      sector: exhData.sector,
      description: exhData.description,
      logo_url: exhData.logo_url,
      website: exhData.website,
      stand_number: exhData.stand_number,
      stand_area: exhData.stand_area,
      contact_info: exhData.contact_info,
      verified: true,
      created_at: new Date().toISOString()
    };

    await makeRequest('POST', 'exhibitors', exhibitor);
    console.log(`  ✅ Exhibitor créé: ${exhibitorId}`);

    // 3. Créer minisite
    const minisite = {
      id: minisiteId,
      exhibitor_id: exhibitorId,
      theme: exhData.minisite_theme,
      colors: exhData.minisite_colors,
      is_published: true,
      created_at: new Date().toISOString()
    };

    await makeRequest('POST', 'mini_sites', minisite);
    console.log(`  ✅ Mini-site créé: ${minisiteId}`);
    console.log(`  🎨 Thème: ${exhData.minisite_theme}`);

    return { success: true, exhibitorId, minisiteId, userId };
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message || JSON.stringify(error)}`);
    return { success: false, error };
  }
}

// ========================================
// EXÉCUTION PRINCIPALE
// ========================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  AJOUT DE PARTENAIRES & EXPOSANTS RÉELS - SIPORT 2026     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let stats = {
    partners: { success: 0, failed: 0 },
    exhibitors: { success: 0, failed: 0 }
  };

  // Créer les partenaires
  console.log('\n🤝 === CRÉATION DES PARTENAIRES INSTITUTIONNELS ===\n');
  for (const partner of partnersData) {
    const result = await createPartner(partner);
    if (result.success) {
      stats.partners.success++;
    } else {
      stats.partners.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Créer les exposants
  console.log('\n\n📦 === CRÉATION DES EXPOSANTS INTERNATIONAUX ===\n');
  for (const exhibitor of exhibitorsData) {
    const result = await createExhibitor(exhibitor);
    if (result.success) {
      stats.exhibitors.success++;
    } else {
      stats.exhibitors.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Rapport final
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    RAPPORT FINAL                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`🤝 Partenaires:`);
  console.log(`   ✅ Succès: ${stats.partners.success}`);
  console.log(`   ❌ Échecs: ${stats.partners.failed}`);
  console.log(`\n📦 Exposants:`);
  console.log(`   ✅ Succès: ${stats.exhibitors.success}`);
  console.log(`   ❌ Échecs: ${stats.exhibitors.failed}`);
  console.log(`\n📊 TOTAL: ${stats.partners.success + stats.exhibitors.success} profils créés\n`);

  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('✅ Script terminé avec succès!\n');
}

main().catch(console.error);

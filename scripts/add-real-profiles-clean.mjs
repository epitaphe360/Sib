/**
 * Script de suppression et réinsertion de partenaires/exposants - SIPORT 2026
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

// Emails à supprimer
const emailsToClean = [
  'contact@mtl.gov.ma',
  'contact@equipement.gov.ma',
  'info@irmqatar.com',
  'info@igus.fr',
  'info@aqua-modules.com'
];

async function cleanupOldData() {
  console.log('\n🗑️  Nettoyage des données existantes...\n');

  for (const email of emailsToClean) {
    try {
      await makeRequest('DELETE', `users?email=eq.${encodeURIComponent(email)}`);
      console.log(`  ✅ Supprimé: ${email}`);
    } catch (error) {
      console.log(`  ⚠️  ${email}: ${error.message || 'déjà absent'}`);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Données partenaires
const partnersData = [
  {
    name: 'Ministère du Transport et de la Logistique',
    acronym: 'MTL',
    email: 'contact@mtl.gov.ma',
    sector: 'Régulation & Gouvernance',
    description: 'Le Ministère du Transport et de la Logistique (MTL) est l\'autorité gouvernementale marocaine responsable de la politique nationale en matière de transport et de logistique. Il supervise le développement des infrastructures portuaires, aéroportuaires, ferroviaires et routières du Royaume.',
    logo_url: 'https://www.mtl.gov.ma/sites/default/files/logo_mtl.png',
    website: 'https://www.mtl.gov.ma',
    type: 'institutional',
    contribution_level: 'platinum',
    contact_info: {
      name: 'Direction de la Communication',
      email: 'contact@mtl.gov.ma',
      phone: '+212 5 37 77 62 75',
      address: 'Avenue Annakhil, Hay Riad, Rabat, Maroc'
    }
  },
  {
    name: 'Ministère de l\'Équipement et de l\'Eau',
    acronym: 'MEE',
    email: 'contact@equipement.gov.ma',
    sector: 'Infrastructure & Développement',
    description: 'Le Ministère de l\'Équipement et de l\'Eau (MEE) est chargé de l\'élaboration et de la mise en œuvre de la politique gouvernementale en matière d\'équipement, de transport et de logistique. Il joue un rôle clé dans le développement des infrastructures portuaires marocaines.',
    logo_url: 'https://www.equipement.gov.ma/sites/default/files/logo_mee.png',
    website: 'https://www.equipement.gov.ma',
    type: 'institutional',
    contribution_level: 'platinum',
    contact_info: {
      name: 'Cabinet du Ministre',
      email: 'contact@equipement.gov.ma',
      phone: '+212 5 37 21 81 11',
      address: 'Quartier Administratif, Place Abdellah Chefchaouni, Agdal, Rabat, Maroc'
    }
  }
];

const exhibitorsData = [
  {
    company_name: 'IRM Energy & Technology Services',
    email: 'info@irmqatar.com',
    category: 'port-industry',
    sector: 'Technologie Maritime',
    description: 'IRM (Offshore & Marine Engineers) est une entreprise qatarie fournissant des technologies et services de classe mondiale pour l\'industrie lourde et les installations complexes. Spécialisée dans le recrutement spécialisé, l\'ingénierie numérique intégrée, les services techniques et les bâtiments techniques pour le secteur maritime et offshore.',
    logo_url: 'http://irmqatar.com/assets/web_end/images/logobg.svg',
    website: 'http://irmqatar.com',
    stand_number: 'D-401',
    stand_area: 27,
    contact_info: {
      name: 'IRM Business Development',
      email: 'info@irmqatar.com',
      phone: '+974 400 65 400',
      address: 'AAB Tower Suite 803, 8th Floor, Doha, Qatar'
    },
    minisite_theme: 'professional',
    minisite_colors: { 
      primaryColor: '#003d82', 
      secondaryColor: '#0066cc', 
      accentColor: '#ff6b35' 
    }
  },
  {
    company_name: 'igus GmbH',
    email: 'info@igus.fr',
    category: 'port-industry',
    sector: 'Équipements Industriels',
    description: 'igus est un leader mondial dans la fabrication de composants techniques en plastique haute performance. Spécialisé dans les chaînes porte-câbles, les roulements à billes en plastique et les polymères pour applications maritimes et portuaires. Solutions innovantes pour la manutention et l\'automatisation portuaire.',
    logo_url: 'https://www.igus.fr/wpck/4904/logo_igus_f',
    website: 'https://www.igus.fr',
    stand_number: 'D-402',
    stand_area: 18,
    contact_info: {
      name: 'igus France',
      email: 'info@igus.fr',
      phone: '+33 (0)3 88 38 90 30',
      address: 'Techparc, 2 rue de la Croix Blaise, 57280 Semécourt, France'
    },
    minisite_theme: 'modern',
    minisite_colors: { 
      primaryColor: '#f47920', 
      secondaryColor: '#333333', 
      accentColor: '#ffcc00' 
    }
  },
  {
    company_name: 'Aqua Modules International',
    email: 'info@aqua-modules.com',
    category: 'port-operations',
    sector: 'Infrastructure Flottante',
    description: 'Aqua Modules est spécialisé dans la conception et la fabrication de structures modulaires flottantes pour applications maritimes et portuaires. Solutions innovantes pour pontons, plateformes flottantes, marinas et infrastructures portuaires modulaires. Expert en structures marines durables et éco-responsables.',
    logo_url: 'https://ui-avatars.com/api/?name=Aqua+Modules&background=0077be&color=fff&size=200&bold=true',
    website: 'https://www.aqua-modules.com',
    stand_number: 'D-403',
    stand_area: 18,
    contact_info: {
      name: 'Aqua Modules Sales',
      email: 'info@aqua-modules.com',
      phone: '+31 (0)20 123 45 67',
      address: 'Marina Boulevard, Amsterdam, Netherlands'
    },
    minisite_theme: 'elegant',
    minisite_colors: { 
      primaryColor: '#0077be', 
      secondaryColor: '#005a8c', 
      accentColor: '#00c4cc' 
    }
  }
];

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
    console.log(`  ✅ User créé: ${userId.substring(0, 8)}...`);

    // 2. Créer partner (schéma réel avec colonnes renommées)
    const partner = {
      id: partnerId,
      user_id: userId,
      company_name: partnerData.name,
      partner_type: 'institutional',
      sector: partnerData.sector,
      description: partnerData.description,
      logo_url: partnerData.logo_url,
      website: partnerData.website,
      country: 'Maroc',
      partnership_level: partnerData.contribution_level,
      contact_info: partnerData.contact_info,
      verified: true,
      featured: true,
      created_at: new Date().toISOString()
    };

    await makeRequest('POST', 'partners', partner);
    console.log(`  ✅ Partner créé: ${partnerId.substring(0, 8)}...`);
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
    console.log(`  ✅ User créé: ${userId.substring(0, 8)}...`);

    // 2. Créer exhibitor (schéma réel - pas de stand_number ni stand_area)
    const exhibitor = {
      id: exhibitorId,
      user_id: userId,
      company_name: exhData.company_name,
      category: exhData.category,
      sector: exhData.sector,
      description: exhData.description,
      logo_url: exhData.logo_url,
      website: exhData.website,
      contact_info: exhData.contact_info,
      verified: true,
      featured: true,
      created_at: new Date().toISOString()
    };

    await makeRequest('POST', 'exhibitors', exhibitor);
    console.log(`  ✅ Exhibitor créé: ${exhibitorId.substring(0, 8)}...`);
    console.log(`  📍 Stand: ${exhData.stand_number} (${exhData.stand_area}m²)`);

    // 3. Créer minisite
    const minisite = {
      id: minisiteId,
      exhibitor_id: exhibitorId,
      theme: exhData.minisite_theme,
      custom_colors: exhData.minisite_colors,
      published: true,
      created_at: new Date().toISOString()
    };

    await makeRequest('POST', 'mini_sites', minisite);
    console.log(`  ✅ Mini-site créé: ${minisiteId.substring(0, 8)}...`);
    console.log(`  🎨 Thème: ${exhData.minisite_theme}`);

    return { success: true, exhibitorId, minisiteId, userId };
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message || JSON.stringify(error)}`);
    return { success: false, error };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  AJOUT PARTENAIRES & EXPOSANTS RÉELS - SIPORT 2026       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Nettoyage
  await cleanupOldData();

  let stats = {
    partners: { success: 0, failed: 0 },
    exhibitors: { success: 0, failed: 0 }
  };

  // Créer les partenaires
  console.log('\n\n🤝 === PARTENAIRES INSTITUTIONNELS ===');
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
  console.log('\n\n📦 === EXPOSANTS INTERNATIONAUX ===');
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
  console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    RAPPORT FINAL                          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log(`🤝 Partenaires: ✅ ${stats.partners.success} | ❌ ${stats.partners.failed}`);
  console.log(`📦 Exposants: ✅ ${stats.exhibitors.success} | ❌ ${stats.exhibitors.failed}`);
  console.log(`\n📊 TOTAL: ${stats.partners.success + stats.exhibitors.success} profils créés\n`);
}

main().catch(console.error);

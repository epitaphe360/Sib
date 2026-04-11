/**
 * Script de réinitialisation complète via API REST
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

// Générateur d'UUID simple
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ========================================
// DONNÉES DES 5 EXPOSANTS
// ========================================

const exhibitorsData = [
  {
    company_name: 'Marsa Maroc',
    email: 'contact@marsamaroc.ma',
    category: 'port-operations',
    sector: 'Exploitation Portuaire',
    description: 'Marsa Maroc est l\'opérateur national de terminaux portuaires, leader dans la manutention et la logistique portuaire au Maroc. Avec plus de 50 ans d\'expérience, nous gérons les principaux ports du Royaume.',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Logo_Marsa_Maroc.svg/1200px-Logo_Marsa_Maroc.svg.png',
    website: 'https://www.marsamaroc.co.ma',
    stand_number: 'A-101',
    stand_area: 54,
    contact_info: {
      name: 'Mohammed Abdeljalil',
      email: 'contact@marsamaroc.ma',
      phone: '+212 5 22 23 23 23',
      address: 'Port de Casablanca, Casablanca, Maroc'
    },
    minisite_theme: 'professional',
    minisite_colors: { primaryColor: '#003366', secondaryColor: '#0066cc', accentColor: '#ff9900' }
  },
  {
    company_name: 'Agence Nationale des Ports (ANP)',
    email: 'contact@anp.org.ma',
    category: 'institutional',
    sector: 'Régulation Portuaire',
    description: 'L\'ANP est l\'autorité de régulation du secteur portuaire marocain. Elle veille à la modernisation des infrastructures, à la sécurité maritime et au développement durable des ports du Royaume.',
    logo_url: 'https://www.anp.org.ma/PublishingImages/LogoANP.png',
    website: 'https://www.anp.org.ma',
    stand_number: 'A-102',
    stand_area: 36,
    contact_info: {
      name: 'Nadia Laraki',
      email: 'contact@anp.org.ma',
      phone: '+212 5 22 54 18 00',
      address: '175, Bd Zerktouni, Casablanca, Maroc'
    },
    minisite_theme: 'modern',
    minisite_colors: { primaryColor: '#1a5f7a', secondaryColor: '#57c5b6', accentColor: '#159895' }
  },
  {
    company_name: 'Tanger Med Special Agency',
    email: 'contact@tangermed.ma',
    category: 'port-industry',
    sector: 'Hub Logistique & Services Portuaires',
    description: 'Groupe Tanger Med opère et développe des plateformes portuaires, logistiques et industrielles. Premier port en Afrique et Méditerranée avec 11 ports et 25 terminaux à conteneurs et vracs, traitant 187 millions de tonnes et 11,44 millions de conteneurs EVP. Plus de 3 000 ha de zones d\'activités aménagées accueillant 1 400 entreprises.',
    logo_url: 'https://www.tangermed.ma/wp-content/uploads/2021/01/logo-tmsa.png',
    website: 'https://www.tangermed.ma',
    stand_number: 'B-201',
    stand_area: 54,
    contact_info: {
      name: 'Tanger Med Special Agency',
      email: 'contact@tangermed.ma',
      phone: '+212 539 349 250',
      address: 'Route de Rabat, 90000 Tanger, Maroc'
    },
    minisite_theme: 'elegant',
    minisite_colors: { primaryColor: '#0d4c92', secondaryColor: '#59c1bd', accentColor: '#a0e4cb' }
  },
  {
    company_name: 'OCP Group - Jorf Lasfar',
    email: 'info@ocp.ma',
    category: 'port-industry',
    sector: 'Industrie & Export',
    description: 'OCP Group est le leader mondial des phosphates et de ses dérivés. Notre terminal portuaire de Jorf Lasfar est le plus grand port phosphatier au monde.',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/OCP_Group_logo.svg/1200px-OCP_Group_logo.svg.png',
    website: 'https://www.ocpgroup.ma',
    stand_number: 'B-202',
    stand_area: 18,
    contact_info: {
      name: 'Fatima Zahra Ammor',
      email: 'info@ocp.ma',
      phone: '+212 5 23 39 10 00',
      address: 'Jorf Lasfar, El Jadida, Maroc'
    },
    minisite_theme: 'modern',
    minisite_colors: { primaryColor: '#006633', secondaryColor: '#00994d', accentColor: '#66cc66' }
  },
  {
    company_name: 'PortTech Maroc Solutions',
    email: 'contact@portechmaroc.ma',
    category: 'port-operations',
    sector: 'Technologies Portuaires',
    description: 'PortTech Maroc est une startup innovante spécialisée dans les solutions technologiques pour les ports: IoT, IA pour la logistique et plateformes de gestion intelligente.',
    logo_url: 'https://ui-avatars.com/api/?name=PortTech&background=2196F3&color=fff&size=200&bold=true',
    website: 'https://www.portechmaroc.ma',
    stand_number: 'C-301',
    stand_area: 9,
    contact_info: {
      name: 'Youssef El Mansouri',
      email: 'contact@portechmaroc.ma',
      phone: '+212 6 61 23 45 67',
      address: 'Technopark, Casablanca, Maroc'
    },
    minisite_theme: 'modern',
    minisite_colors: { primaryColor: '#2196F3', secondaryColor: '#1976D2', accentColor: '#64B5F6' }
  }
];

async function deleteAll() {
  console.log('\n🗑️  SUPPRESSION DE TOUTES LES DONNÉES...\n');

  // Supprimer dans l'ordre pour respecter les contraintes FK
  const tables = ['products', 'mini_sites', 'time_slots', 'exhibitors'];
  
  for (const table of tables) {
    try {
      // Utiliser un filtre qui match tout (id != null)
      await makeRequest('DELETE', `${table}?id=neq.00000000-0000-0000-0000-000000000000`);
      console.log(`✅ ${table} vidé`);
    } catch (e) {
      console.log(`⚠️  ${table}: ${e.message || JSON.stringify(e)}`);
    }
  }

  // Supprimer les users exhibitor
  try {
    await makeRequest('DELETE', `users?type=eq.exhibitor`);
    console.log(`✅ users (exhibitor) supprimés`);
  } catch (e) {
    console.log(`⚠️  users: ${e.message || JSON.stringify(e)}`);
  }
}

async function createExhibitors() {
  console.log('\n🏗️  CRÉATION DES 5 EXPOSANTS...\n');

  for (const exh of exhibitorsData) {
    const userId = uuid();
    const exhibitorId = uuid();
    const minisiteId = uuid();

    console.log(`\n📦 ${exh.company_name} (${exh.stand_area}m²)`);

    // 1. Créer user
    try {
      await makeRequest('POST', 'users', {
        id: userId,
        email: exh.email,
        name: exh.company_name.split(' ')[0],
        type: 'exhibitor',
        status: 'active',
        is_active: true,
        email_verified: true,
        profile: {
          company: exh.company_name,
          sector: exh.sector,
          country: 'Maroc',
          website: exh.website,
          phone: exh.contact_info.phone
        }
      });
      console.log(`  ✅ User`);
    } catch (e) {
      console.log(`  ❌ User: ${JSON.stringify(e)}`);
    }

    // 2. Créer exhibitor
    try {
      await makeRequest('POST', 'exhibitors', {
        id: exhibitorId,
        user_id: userId,
        company_name: exh.company_name,
        category: exh.category,
        sector: exh.sector,
        description: exh.description,
        logo_url: exh.logo_url,
        website: exh.website,
        verified: true,
        featured: exh.stand_area >= 36,
        stand_number: exh.stand_number,
        stand_area: exh.stand_area,
        contact_info: exh.contact_info
      });
      console.log(`  ✅ Exhibitor`);
    } catch (e) {
      console.log(`  ❌ Exhibitor: ${JSON.stringify(e)}`);
    }

    // 3. Créer mini-site
    try {
      await makeRequest('POST', 'mini_sites', {
        id: minisiteId,
        exhibitor_id: exhibitorId,
        theme: exh.minisite_theme,
        custom_colors: exh.minisite_colors,
        sections: [
          {
            type: 'hero',
            content: {
              title: exh.company_name,
              subtitle: exh.description.substring(0, 100) + '...',
              ctaText: 'En savoir plus',
              ctaLink: '#about',
              backgroundImage: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920'
            }
          },
          {
            type: 'about',
            content: {
              title: 'À Propos',
              description: exh.description,
              features: [exh.sector, 'Innovation', 'Excellence', 'Expertise'],
              stats: [
                { number: exh.stand_area + 'm²', label: 'Surface Stand' },
                { number: '100+', label: 'Années d\'expérience' }
              ]
            }
          },
          {
            type: 'contact',
            content: {
              title: 'Contact',
              email: exh.email,
              phone: exh.contact_info.phone,
              address: exh.contact_info.address
            }
          }
        ],
        is_published: true,
        view_count: Math.floor(Math.random() * 500) + 100
      });
      console.log(`  ✅ Mini-site`);
    } catch (e) {
      console.log(`  ❌ Mini-site: ${JSON.stringify(e)}`);
    }

    // 4. Créer produit exemple
    try {
      await makeRequest('POST', 'products', {
        id: uuid(),
        exhibitor_id: exhibitorId,
        name: `Services ${exh.company_name.split(' ')[0]}`,
        description: `Solutions et services proposés par ${exh.company_name}`,
        category: exh.sector,
        price: 'Sur devis',
        featured: true,
        images: ['https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600']
      });
      console.log(`  ✅ Produit`);
    } catch (e) {
      console.log(`  ❌ Produit: ${JSON.stringify(e)}`);
    }

    // 5. Créer créneaux horaires
    const slots = [];
    const baseDate = new Date('2026-06-15');
    for (let day = 0; day < 3; day++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + day);
      const dateStr = d.toISOString().split('T')[0];
      
      for (const hour of ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']) {
        slots.push({
          id: uuid(),
          exhibitor_id: exhibitorId,
          slot_date: dateStr,
          start_time: hour,
          end_time: `${parseInt(hour) + 1}:00`,
          duration: 60,
          is_available: true
        });
      }
    }

    try {
      await makeRequest('POST', 'time_slots', slots);
      console.log(`  ✅ ${slots.length} créneaux`);
    } catch (e) {
      console.log(`  ❌ Créneaux: ${JSON.stringify(e)}`);
    }
  }
}

async function verify() {
  console.log('\n\n📋 VÉRIFICATION FINALE...\n');
  
  try {
    const result = await makeRequest('GET', 'exhibitors');
    console.log(`✅ ${result.data.length} exposants en base:\n`);
    result.data.forEach(e => {
      console.log(`   - ${e.company_name} | Stand ${e.stand_number} | ${e.stand_area}m²`);
    });
  } catch (e) {
    console.log('❌ Erreur vérification:', e);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🚀 RÉINITIALISATION EXPOSANTS SIPORT 2026');
  console.log('═══════════════════════════════════════════════════════════════');

  await deleteAll();
  await createExhibitors();
  await verify();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   ✅ TERMINÉ');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

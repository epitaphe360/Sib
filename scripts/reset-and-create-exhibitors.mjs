/**
 * Script de réinitialisation et création d'exposants complets
 * - Supprime tous les exposants, profils et mini-sites existants
 * - Crée 5 nouveaux exposants avec profils complets et mini-sites
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ========================================
// DONNÉES DES 5 EXPOSANTS
// ========================================

const exhibitors = [
  {
    id: randomUUID(),
    user_id: randomUUID(),
    email: 'contact@marsamaroc.ma',
    password: 'Marsa2026!',
    name: 'Marsa Maroc',
    company_name: 'Marsa Maroc',
    category: 'port-operations',
    sector: 'Exploitation Portuaire',
    description: 'Marsa Maroc est l\'opérateur national de terminaux portuaires, leader dans la manutention et la logistique portuaire au Maroc. Avec plus de 50 ans d\'expérience, nous gérons les principaux ports du Royaume.',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Logo_Marsa_Maroc.svg/1200px-Logo_Marsa_Maroc.svg.png',
    website: 'https://www.marsamaroc.co.ma',
    verified: true,
    featured: true,
    stand_number: 'A-101',
    stand_area: 54,
    contact_info: {
      name: 'Mohammed Abdeljalil',
      email: 'contact@marsamaroc.ma',
      phone: '+212 5 22 23 23 23',
      address: 'Port de Casablanca, Casablanca, Maroc'
    },
    minisite: {
      theme: 'professional',
      custom_colors: {
        primaryColor: '#003366',
        secondaryColor: '#0066cc',
        accentColor: '#ff9900',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: 'Marsa Maroc - L\'Excellence Portuaire',
            subtitle: 'Leader national de la manutention et des opérations portuaires depuis 1963',
            ctaText: 'Découvrir nos services',
            ctaLink: '#services',
            backgroundImage: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: 'Notre Mission',
            description: 'Marsa Maroc assure la gestion et l\'exploitation de 9 ports au Maroc. Notre expertise couvre la manutention de conteneurs, le vrac solide et liquide, ainsi que les services aux navires et aux marchandises.',
            features: [
              'Gestion de 9 ports nationaux',
              'Manutention de plus de 40 millions de tonnes/an',
              'Équipements de dernière génération',
              'Certification ISO 9001, ISO 14001, OHSAS 18001'
            ],
            stats: [
              { number: '9', label: 'Ports gérés' },
              { number: '40M+', label: 'Tonnes/an' },
              { number: '4500+', label: 'Collaborateurs' },
              { number: '60+', label: 'Années d\'expérience' }
            ]
          }
        },
        {
          type: 'products',
          content: {
            title: 'Nos Services',
            items: [
              {
                name: 'Manutention Conteneurs',
                description: 'Services complets de manutention de conteneurs avec équipements modernes',
                image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600'
              },
              {
                name: 'Vrac Solide',
                description: 'Traitement de céréales, phosphates, charbon et minerais',
                image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600'
              },
              {
                name: 'Logistique Portuaire',
                description: 'Solutions logistiques intégrées et entreposage',
                image: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=600'
              }
            ]
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Contactez-nous',
            email: 'contact@marsamaroc.ma',
            phone: '+212 5 22 23 23 23',
            address: 'Port de Casablanca, Casablanca, Maroc'
          }
        }
      ]
    },
    products: [
      {
        name: 'Terminal à Conteneurs TC3PC',
        description: 'Terminal moderne avec 1100m de quai et capacité de 1.2 million EVP/an',
        category: 'Infrastructure',
        price: 'Sur devis',
        featured: true,
        images: ['https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600']
      },
      {
        name: 'Services de Pilotage',
        description: 'Pilotage maritime professionnel pour tous types de navires',
        category: 'Services',
        price: 'Tarif réglementé',
        featured: false,
        images: ['https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600']
      }
    ]
  },
  {
    id: randomUUID(),
    user_id: randomUUID(),
    email: 'contact@anp.org.ma',
    password: 'ANP2026!',
    name: 'Agence Nationale des Ports',
    company_name: 'Agence Nationale des Ports (ANP)',
    category: 'institutional',
    sector: 'Régulation Portuaire',
    description: 'L\'ANP est l\'autorité de régulation du secteur portuaire marocain. Elle veille à la modernisation des infrastructures, à la sécurité maritime et au développement durable des ports du Royaume.',
    logo_url: 'https://www.anp.org.ma/PublishingImages/LogoANP.png',
    website: 'https://www.anp.org.ma',
    verified: true,
    featured: true,
    stand_number: 'A-102',
    stand_area: 36,
    contact_info: {
      name: 'Nadia Laraki',
      email: 'contact@anp.org.ma',
      phone: '+212 5 22 54 18 00',
      address: '175, Bd Zerktouni, Casablanca, Maroc'
    },
    minisite: {
      theme: 'modern',
      custom_colors: {
        primaryColor: '#1a5f7a',
        secondaryColor: '#57c5b6',
        accentColor: '#159895',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: 'ANP - Régulateur du Secteur Portuaire',
            subtitle: 'Garantir un secteur portuaire compétitif, sûr et durable',
            ctaText: 'En savoir plus',
            ctaLink: '#mission',
            backgroundImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: 'Notre Rôle',
            description: 'L\'ANP assure la régulation du secteur portuaire, la gestion du domaine public portuaire, et veille au développement des infrastructures. Nous accompagnons la stratégie portuaire nationale 2030.',
            features: [
              'Régulation et contrôle du secteur',
              'Gestion du domaine public portuaire',
              'Développement des infrastructures',
              'Promotion de la sécurité maritime'
            ],
            stats: [
              { number: '13', label: 'Ports sous tutelle' },
              { number: '200M+', label: 'Tonnes/an' },
              { number: '99%', label: 'Disponibilité' },
              { number: '2030', label: 'Vision stratégique' }
            ]
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Nous Contacter',
            email: 'contact@anp.org.ma',
            phone: '+212 5 22 54 18 00',
            address: '175, Bd Zerktouni, Casablanca'
          }
        }
      ]
    },
    products: [
      {
        name: 'Stratégie Portuaire 2030',
        description: 'Vision et feuille de route pour le développement portuaire national',
        category: 'Documentation',
        price: 'Gratuit',
        featured: true,
        images: ['https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600']
      }
    ]
  },
  {
    id: randomUUID(),
    user_id: randomUUID(),
    email: 'contact@tangermed.ma',
    password: 'TangerMed2026!',
    name: 'Tanger Med',
    company_name: 'Tanger Med Special Agency',
    category: 'port-industry',
    sector: 'Hub Logistique & Services Portuaires',
    description: 'Groupe Tanger Med opère et développe des plateformes portuaires, logistiques et industrielles. Premier port en Afrique et Méditerranée avec 11 ports et 25 terminaux à conteneurs et vracs, traitant 187 millions de tonnes et 11,44 millions de conteneurs EVP. Plus de 3 000 ha de zones d\'activités aménagées accueillant 1 400 entreprises dans l\'automobile, aéronautique, textile, agroalimentaire et logistique.',
    logo_url: 'https://www.tangermed.ma/wp-content/uploads/2021/01/logo-tmsa.png',
    website: 'https://www.tangermed.ma',
    verified: true,
    featured: true,
    stand_number: 'B-201',
    stand_area: 54,
    contact_info: {
      name: 'Tanger Med Special Agency',
      email: 'contact@tangermed.ma',
      phone: '+212 539 349 250',
      address: 'Route de Rabat, 90000 Tanger, Maroc'
    },
    minisite: {
      theme: 'elegant',
      custom_colors: {
        primaryColor: '#0d4c92',
        secondaryColor: '#59c1bd',
        accentColor: '#a0e4cb',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: 'Tanger Med - Premier Port d\'Afrique',
            subtitle: 'Connecter le Maroc au monde avec excellence et innovation',
            ctaText: 'Explorer nos capacités',
            ctaLink: '#capacites',
            backgroundImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1920&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: 'Premier Port d\'Afrique et Méditerranée',
            description: 'Le Groupe Tanger Med, par sa Tanger Med Special Agency, opère le complexe portuaire le plus important du continent. Stratégiquement positionné sur le Détroit de Gibraltar à 14 km de l\'Europe, Tanger Med connecte plus de 180 ports internationaux. Le groupe gère également 3 000 ha de zones d\'activités économiques avec plus de 1 400 entreprises installées.',
            features: [
              '11 ports opérés',
              '25 terminaux à conteneurs et vracs',
              '187 millions de tonnes traitées',
              '11,44 millions de conteneurs EVP manutentionnés',
              '3 000 ha de zones d\'activités',
              '1 400 entreprises installées'
            ],
            stats: [
              { number: '#1', label: 'Port Africain' },
              { number: '187M', label: 'Tonnes traitées' },
              { number: '11.44M', label: 'Conteneurs EVP' },
              { number: '1.4K', label: 'Entreprises ZA' }
            ]
          }
        },
        {
          type: 'features',
          content: {
            title: 'Nos Domaines d\'Expertise',
            items: [
              {
                title: 'Terminal management',
                description: 'Solution complète et personnalisée adaptée à vos besoins spécifiques et enjeux métiers.'
              },
              {
                title: 'Manutention',
                description: 'Solution complète et personnalisée adaptée à vos besoins spécifiques et enjeux métiers.'
              },
              {
                title: 'Conteneurs',
                description: 'Solution complète et personnalisée adaptée à vos besoins spécifiques et enjeux métiers.'
              }
            ]
          }
        },
        {
          type: 'products',
          content: {
            title: 'Services & Filiales du Groupe',
            items: [
              {
                name: 'Tanger Med Port Authority',
                description: 'Opération et gestion des terminaux à conteneurs et vracs',
                image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600'
              },
              {
                name: 'Tanger Med Zones',
                description: '3 000 ha de zones d\'activités industrielles et logistiques',
                image: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=600'
              },
              {
                name: 'Marsa Maroc',
                description: 'Gestion de 25 terminaux à conteneurs et vracs dans le Maroc',
                image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600'
              },
              {
                name: 'Tanger Med Engineering',
                description: 'Ingénierie spécialisée et maîtrise d\'œuvre',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600'
              },
              {
                name: 'Tanger Med Utilities',
                description: 'Services aux entreprises et gestion des utilités industrielles',
                image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600'
              },
              {
                name: 'Tanger Med Passagers',
                description: 'Terminal passagers et services maritimes de voyageurs',
                image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600'
              }
            ]
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Nous Contacter',
            email: 'contact@tangermed.ma',
            phone: '+212 539 349 250',
            address: 'Route de Rabat, 90000 Tanger, Maroc',
            fax: '+212 539 943 427',
            website: 'https://www.tangermed.ma'
          }
        }
      ]
    },
    products: [
      {
        name: 'Services Portuaires Intégrés',
        description: 'Services complets de manutention de conteneurs, vracs et passagers avec capacité de 187 millions de tonnes annuels',
        category: 'Services',
        price: 'Sur devis',
        featured: true,
        images: ['https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600']
      },
      {
        name: 'Zones d\'Activités Industrielles',
        description: '3 000 ha aménagées accueillant 1 400 entreprises dans les secteurs automobile, aéronautique, textile, agroalimentaire et logistique',
        category: 'Infrastructure',
        price: 'Location',
        featured: true,
        images: ['https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=600']
      },
      {
        name: 'Logistique Portuaire',
        description: 'Services complets de logistique portuaire, stockage et distribution à valeur ajoutée',
        category: 'Logistique',
        price: 'Sur devis',
        featured: true,
        images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600']
      },
      {
        name: 'Services de Transbordement',
        description: 'Services de transbordement rapide avec temps d\'escale optimisé',
        category: 'Services',
        price: 'Sur devis',
        featured: true,
        images: ['https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600']
      },
      {
        name: 'Zone Franche Logistique',
        description: 'Espaces logistiques et industriels en zone franche',
        category: 'Infrastructure',
        price: 'Location',
        featured: true,
        images: ['https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=600']
      }
    ]
  },
  {
    id: randomUUID(),
    user_id: randomUUID(),
    email: 'info@ocp.ma',
    password: 'OCP2026!',
    name: 'OCP Group',
    company_name: 'OCP Group - Jorf Lasfar',
    category: 'port-industry',
    sector: 'Industrie & Export',
    description: 'OCP Group est le leader mondial des phosphates et de ses dérivés. Notre terminal portuaire de Jorf Lasfar est le plus grand port phosphatier au monde, avec une capacité d\'exportation de 30 millions de tonnes.',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/OCP_Group_logo.svg/1200px-OCP_Group_logo.svg.png',
    website: 'https://www.ocpgroup.ma',
    verified: true,
    featured: true,
    stand_number: 'B-202',
    stand_area: 18,
    contact_info: {
      name: 'Fatima Zahra Ammor',
      email: 'info@ocp.ma',
      phone: '+212 5 23 39 10 00',
      address: 'Jorf Lasfar, El Jadida, Maroc'
    },
    minisite: {
      theme: 'modern',
      custom_colors: {
        primaryColor: '#006633',
        secondaryColor: '#00994d',
        accentColor: '#66cc66',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: 'OCP - Leader Mondial des Phosphates',
            subtitle: 'Nourrir la planète de manière durable et responsable',
            ctaText: 'Nos solutions',
            ctaLink: '#solutions',
            backgroundImage: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: 'Excellence Industrielle',
            description: 'OCP opère la plus grande chaîne de valeur des phosphates au monde, de la mine à l\'engrais. Notre port de Jorf Lasfar est un hub d\'exportation stratégique vers les 5 continents.',
            features: [
              'Leader mondial des phosphates',
              '30M tonnes capacité portuaire',
              'Présence dans 35+ pays',
              'Innovation durable'
            ],
            stats: [
              { number: '#1', label: 'Mondial phosphates' },
              { number: '30M', label: 'Tonnes exportées' },
              { number: '35+', label: 'Pays servis' },
              { number: '100+', label: 'Années d\'histoire' }
            ]
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Nous Contacter',
            email: 'info@ocp.ma',
            phone: '+212 5 23 39 10 00',
            address: 'Jorf Lasfar, El Jadida'
          }
        }
      ]
    },
    products: [
      {
        name: 'Engrais NPK',
        description: 'Gamme complète d\'engrais pour l\'agriculture mondiale',
        category: 'Produits',
        price: 'Export',
        featured: true,
        images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600']
      }
    ]
  },
  {
    id: randomUUID(),
    user_id: randomUUID(),
    email: 'contact@portechmaroc.ma',
    password: 'PortTech2026!',
    name: 'PortTech Maroc',
    company_name: 'PortTech Maroc Solutions',
    category: 'port-operations',
    sector: 'Technologies Portuaires',
    description: 'PortTech Maroc est une startup innovante spécialisée dans les solutions technologiques pour les ports. Nous proposons des systèmes IoT, de l\'IA pour la logistique et des plateformes de gestion portuaire intelligente.',
    logo_url: 'https://ui-avatars.com/api/?name=PortTech&background=2196F3&color=fff&size=200&bold=true',
    website: 'https://www.portechmaroc.ma',
    verified: true,
    featured: false,
    stand_number: 'C-301',
    stand_area: 9,
    contact_info: {
      name: 'Youssef El Mansouri',
      email: 'contact@portechmaroc.ma',
      phone: '+212 6 61 23 45 67',
      address: 'Technopark, Casablanca, Maroc'
    },
    minisite: {
      theme: 'modern',
      custom_colors: {
        primaryColor: '#2196F3',
        secondaryColor: '#1976D2',
        accentColor: '#64B5F6',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: 'PortTech - L\'Innovation Portuaire',
            subtitle: 'Solutions technologiques de pointe pour les ports du futur',
            ctaText: 'Découvrir nos solutions',
            ctaLink: '#solutions',
            backgroundImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: 'Startup Innovante',
            description: 'PortTech Maroc développe des solutions technologiques innovantes pour digitaliser et optimiser les opérations portuaires. Notre équipe d\'ingénieurs combine expertise maritime et technologie de pointe.',
            features: [
              'Solutions IoT portuaires',
              'Intelligence artificielle',
              'Plateformes cloud',
              'Cybersécurité maritime'
            ],
            stats: [
              { number: '15+', label: 'Clients actifs' },
              { number: '50+', label: 'Projets livrés' },
              { number: '24/7', label: 'Support technique' },
              { number: '100%', label: 'Made in Morocco' }
            ]
          }
        },
        {
          type: 'products',
          content: {
            title: 'Nos Solutions',
            items: [
              {
                name: 'SmartPort IoT',
                description: 'Réseau de capteurs intelligents pour monitoring temps réel',
                image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'
              },
              {
                name: 'PortAI Analytics',
                description: 'Plateforme d\'analyse prédictive basée sur l\'IA',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600'
              }
            ]
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Contactez-nous',
            email: 'contact@portechmaroc.ma',
            phone: '+212 6 61 23 45 67',
            address: 'Technopark, Casablanca'
          }
        }
      ]
    },
    products: [
      {
        name: 'SmartPort IoT Platform',
        description: 'Plateforme IoT complète pour la gestion intelligente des ports',
        category: 'Logiciel',
        price: '€15,000',
        featured: true,
        images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600']
      },
      {
        name: 'PortAI Analytics',
        description: 'Solution d\'analyse prédictive pour optimiser les opérations',
        category: 'Logiciel',
        price: '€8,500/mois',
        featured: true,
        images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600']
      }
    ]
  }
];

// ========================================
// FONCTIONS
// ========================================

async function deleteAllExistingData() {
  console.log('\n🗑️  Suppression des données existantes...\n');

  // 1. Supprimer les produits
  const { error: prodError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (prodError) console.log('⚠️  Produits:', prodError.message);
  else console.log('✅ Produits supprimés');

  // 2. Supprimer les mini-sites
  const { error: miniError } = await supabase.from('mini_sites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (miniError) console.log('⚠️  Mini-sites:', miniError.message);
  else console.log('✅ Mini-sites supprimés');

  // 3. Supprimer les créneaux horaires
  const { error: slotError } = await supabase.from('time_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (slotError) console.log('⚠️  Créneaux:', slotError.message);
  else console.log('✅ Créneaux supprimés');

  // 4. Supprimer les exhibitors
  const { error: exhError } = await supabase.from('exhibitors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (exhError) console.log('⚠️  Exposants:', exhError.message);
  else console.log('✅ Exposants supprimés');

  // 5. Supprimer les exhibitor_profiles
  const { error: profError } = await supabase.from('exhibitor_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (profError) console.log('⚠️  Profils exposants:', profError.message);
  else console.log('✅ Profils exposants supprimés');

  // 6. Supprimer les users de type exhibitor (sauf admin)
  const { error: userError } = await supabase
    .from('users')
    .delete()
    .eq('type', 'exhibitor');
  if (userError) console.log('⚠️  Utilisateurs exposants:', userError.message);
  else console.log('✅ Utilisateurs exposants supprimés');

  console.log('\n✅ Nettoyage terminé!\n');
}

async function createExhibitors() {
  console.log('\n🏗️  Création des 5 nouveaux exposants...\n');

  for (const exh of exhibitors) {
    console.log(`\n📦 Création de: ${exh.company_name}`);

    // 1. Créer l'utilisateur
    const userData = {
      id: exh.user_id,
      email: exh.email,
      name: exh.name,
      type: 'exhibitor',
      status: 'active',
      is_active: true,
      email_verified: true,
      profile: {
        company: exh.company_name,
        sector: exh.sector,
        country: 'Maroc',
        website: exh.website,
        phone: exh.contact_info.phone,
        firstName: exh.contact_info.name.split(' ')[0],
        lastName: exh.contact_info.name.split(' ').slice(1).join(' '),
        position: 'Responsable Stand'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: userError } = await supabase.from('users').insert(userData);
    if (userError) {
      console.log(`  ⚠️ User: ${userError.message}`);
    } else {
      console.log(`  ✅ Utilisateur créé`);
    }

    // 2. Créer l'exposant
    const exhibitorData = {
      id: exh.id,
      user_id: exh.user_id,
      company_name: exh.company_name,
      category: exh.category,
      sector: exh.sector,
      description: exh.description,
      logo_url: exh.logo_url,
      website: exh.website,
      verified: exh.verified,
      featured: exh.featured,
      stand_number: exh.stand_number,
      stand_area: exh.stand_area,
      contact_info: exh.contact_info,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: exhError } = await supabase.from('exhibitors').insert(exhibitorData);
    if (exhError) {
      console.log(`  ⚠️ Exposant: ${exhError.message}`);
    } else {
      console.log(`  ✅ Exposant créé (Stand: ${exh.stand_area}m²)`);
    }

    // 3. Créer le mini-site
    const miniSiteData = {
      id: randomUUID(),
      exhibitor_id: exh.id,
      theme: exh.minisite.theme,
      custom_colors: exh.minisite.custom_colors,
      sections: exh.minisite.sections,
      is_published: true,
      view_count: Math.floor(Math.random() * 500) + 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: miniError } = await supabase.from('mini_sites').insert(miniSiteData);
    if (miniError) {
      console.log(`  ⚠️ Mini-site: ${miniError.message}`);
    } else {
      console.log(`  ✅ Mini-site créé`);
    }

    // 4. Créer les produits
    for (const product of exh.products) {
      const productData = {
        id: randomUUID(),
        exhibitor_id: exh.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        images: product.images,
        featured: product.featured,
        created_at: new Date().toISOString()
      };

      const { error: prodError } = await supabase.from('products').insert(productData);
      if (prodError) {
        console.log(`  ⚠️ Produit "${product.name}": ${prodError.message}`);
      } else {
        console.log(`  ✅ Produit: ${product.name}`);
      }
    }

    // 5. Créer des créneaux de disponibilité
    const slots = [];
    const baseDate = new Date('2026-06-15');
    for (let day = 0; day < 3; day++) {
      const slotDate = new Date(baseDate);
      slotDate.setDate(slotDate.getDate() + day);
      const dateStr = slotDate.toISOString().split('T')[0];

      const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      for (const time of times) {
        slots.push({
          id: randomUUID(),
          exhibitor_id: exh.id,
          slot_date: dateStr,
          start_time: time,
          end_time: `${parseInt(time.split(':')[0]) + 1}:00`,
          duration: 60,
          is_available: true,
          created_at: new Date().toISOString()
        });
      }
    }

    const { error: slotError } = await supabase.from('time_slots').insert(slots);
    if (slotError) {
      console.log(`  ⚠️ Créneaux: ${slotError.message}`);
    } else {
      console.log(`  ✅ ${slots.length} créneaux créés`);
    }
  }
}

// ========================================
// MAIN
// ========================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🚀 RÉINITIALISATION ET CRÉATION DES EXPOSANTS SIPORT 2026');
  console.log('═══════════════════════════════════════════════════════════════');

  await deleteAllExistingData();
  await createExhibitors();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   ✅ OPÉRATION TERMINÉE AVEC SUCCÈS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📋 EXPOSANTS CRÉÉS:');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ 1. Marsa Maroc                    │ 54m² │ Port Operations  │');
  console.log('│ 2. ANP (Agence Nationale Ports)   │ 36m² │ Institutionnel   │');
  console.log('│ 3. Tanger Med Port Authority      │ 54m² │ Hub Logistique   │');
  console.log('│ 4. OCP Group - Jorf Lasfar        │ 18m² │ Industrie Export │');
  console.log('│ 5. PortTech Maroc                 │  9m² │ Technologies     │');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('\n🔑 Comptes de connexion:');
  exhibitors.forEach(e => {
    console.log(`   📧 ${e.email} / ${e.password}`);
  });
  console.log('\n');
}

main().catch(console.error);

/**
 * Script pour peupler les données enrichies des partenaires
 * À exécuter APRÈS avoir appliqué la migration SQL
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Données enrichies par type de partenaire
const enrichedDataByType = {
  sponsor: {
    mission: "Soutenir l'innovation et le développement durable du secteur portuaire africain à travers des investissements stratégiques et des partenariats de long terme.",
    vision: "Devenir le partenaire de référence pour la transformation digitale et écologique des infrastructures portuaires en Afrique.",
    values_list: ["Innovation", "Excellence", "Durabilité", "Partenariat stratégique", "Responsabilité sociale"],
    certifications: ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018"],
    expertise: ["Financement de projets", "Développement durable", "Innovation technologique", "Conseil stratégique"],
    employees: "1000-5000",
    country: "Maroc",
    social_media: {
      linkedin: "https://linkedin.com/company/sponsor-siports",
      twitter: "https://twitter.com/sponsor_siports",
      facebook: "https://facebook.com/sponsorsiports"
    },
    key_figures: [
      { label: "Investissement total", value: "50M €", icon: "TrendingUp" },
      { label: "Projets financés", value: "25+", icon: "Target" },
      { label: "Pays couverts", value: "12", icon: "Globe" },
      { label: "Années d'expérience", value: "20+", icon: "Award" }
    ],
    awards: [
      { name: "Prix du Meilleur Sponsor Portuaire", year: 2024, issuer: "African Ports Association" },
      { name: "Excellence en Développement Durable", year: 2023, issuer: "Green Maritime Awards" }
    ],
    testimonials: [
      {
        quote: "Un partenaire stratégique qui a transformé notre vision en réalité. Leur engagement envers l'excellence est remarquable.",
        author: "Mohamed Alaoui",
        role: "Directeur Général, Port de Casablanca",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        quote: "Leur soutien a été déterminant dans la réussite de notre projet de modernisation portuaire.",
        author: "Rachid Bennis",
        role: "Président, Autorité Portuaire Nationale",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg"
      }
    ],
    news: [
      {
        title: "Nouveau partenariat pour la digitalisation portuaire",
        date: "2024-12-15",
        excerpt: "Signature d'un accord majeur pour moderniser les infrastructures portuaires avec des solutions IoT avancées.",
        image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=400"
      },
      {
        title: "Initiative verte pour les ports africains",
        date: "2024-11-28",
        excerpt: "Lancement d'un programme ambitieux pour réduire l'empreinte carbone des opérations portuaires.",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400"
      }
    ],
    clients: ["Port de Tanger Med", "Port de Casablanca", "Port d'Abidjan", "Port de Dakar", "Port de Djibouti"],
    gallery: [
      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800",
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800",
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800"
    ],
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    established_year: 2005
  },
  exhibitor: {
    mission: "Proposer des solutions innovantes et des équipements de pointe pour optimiser les opérations portuaires et logistiques à travers l'Afrique.",
    vision: "Être le leader technologique de l'équipement portuaire intelligent en Afrique et au-delà.",
    values_list: ["Qualité", "Innovation", "Service client", "Fiabilité", "Performance"],
    certifications: ["ISO 9001:2015", "CE Marking", "Lloyd's Register", "DNV GL"],
    expertise: ["Équipements de manutention", "Systèmes automatisés", "Solutions IoT", "Maintenance prédictive", "Formation technique"],
    employees: "500-1000",
    country: "Maroc",
    social_media: {
      linkedin: "https://linkedin.com/company/exhibitor-siports",
      youtube: "https://youtube.com/@exhibitor_siports",
      twitter: "https://twitter.com/exhibitor_siports"
    },
    key_figures: [
      { label: "Produits exposés", value: "150+", icon: "Package" },
      { label: "Clients satisfaits", value: "500+", icon: "Users" },
      { label: "Brevets déposés", value: "35", icon: "Shield" },
      { label: "Salons participés", value: "50+", icon: "Calendar" }
    ],
    awards: [
      { name: "Innovation Award SIPORTS 2024", year: 2024, issuer: "SIPORTS Organization" },
      { name: "Best Maritime Equipment", year: 2023, issuer: "Maritime Tech Awards" },
      { name: "Green Technology Excellence", year: 2023, issuer: "Eco Maritime Forum" }
    ],
    testimonials: [
      {
        quote: "Des équipements de qualité supérieure avec un excellent support technique. Une collaboration de confiance depuis 10 ans.",
        author: "Fatima Benali",
        role: "Responsable Achats, Terminal à Conteneurs",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        quote: "Leur expertise technique et leur réactivité font la différence dans nos opérations quotidiennes.",
        author: "Karim Tazi",
        role: "Directeur Technique, Marsa Maroc",
        avatar: "https://randomuser.me/api/portraits/men/52.jpg"
      }
    ],
    news: [
      {
        title: "Lancement de notre nouvelle gamme de grues automatisées",
        date: "2024-11-20",
        excerpt: "Découvrez nos dernières innovations en matière de manutention portuaire avec intelligence artificielle intégrée.",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"
      },
      {
        title: "Certification ISO 14001 obtenue",
        date: "2024-10-15",
        excerpt: "Notre engagement environnemental reconnu par une certification internationale.",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400"
      }
    ],
    clients: ["Marsa Maroc", "SOMAPORT", "APM Terminals", "DP World", "Hutchison Ports"],
    gallery: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800",
      "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800"
    ],
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    established_year: 2008
  },
  partner: {
    mission: "Accompagner la croissance et la modernisation du secteur portuaire à travers des solutions technologiques innovantes et des services de conseil de haute qualité.",
    vision: "Construire ensemble un écosystème portuaire connecté, durable et performant pour l'Afrique de demain.",
    values_list: ["Collaboration", "Expertise", "Agilité", "Transparence", "Impact durable"],
    certifications: ["ISO 27001", "CMMI Level 3", "PCI DSS", "SOC 2 Type II"],
    expertise: ["Transformation digitale", "Cybersécurité", "Big Data & Analytics", "Intelligence artificielle", "Cloud computing", "Blockchain"],
    employees: "200-500",
    country: "Maroc",
    social_media: {
      linkedin: "https://linkedin.com/company/partner-siports",
      twitter: "https://twitter.com/partner_siports",
      youtube: "https://youtube.com/@partner_siports"
    },
    key_figures: [
      { label: "Projets livrés", value: "200+", icon: "CheckCircle" },
      { label: "Experts certifiés", value: "80+", icon: "Users" },
      { label: "Uptime garanti", value: "99.9%", icon: "Activity" },
      { label: "Satisfaction client", value: "98%", icon: "ThumbsUp" }
    ],
    awards: [
      { name: "Best Digital Partner 2024", year: 2024, issuer: "Digital Africa Awards" },
      { name: "Excellence en Cybersécurité", year: 2023, issuer: "Cyber Security Forum Africa" },
      { name: "Innovation Tech Award", year: 2022, issuer: "Tech Summit Morocco" }
    ],
    testimonials: [
      {
        quote: "Une équipe d'experts qui comprend vraiment nos défis métier et propose des solutions adaptées à notre contexte.",
        author: "Youssef El Mansouri",
        role: "DSI, Autorité Portuaire",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg"
      },
      {
        quote: "Leur accompagnement dans notre transformation digitale a été exemplaire. Des résultats concrets et mesurables.",
        author: "Nadia Chraibi",
        role: "Directrice Innovation, ANP",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg"
      }
    ],
    news: [
      {
        title: "Partenariat stratégique avec l'ANP",
        date: "2024-10-05",
        excerpt: "Signature d'un accord pluriannuel pour la digitalisation des services portuaires nationaux.",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400"
      },
      {
        title: "Lancement de notre plateforme AI pour les ports",
        date: "2024-09-18",
        excerpt: "Une nouvelle solution d'intelligence artificielle pour optimiser les flux logistiques.",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400"
      }
    ],
    clients: ["ANP", "TMSA", "Office des Ports", "ONCF", "RAM Cargo"],
    gallery: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800"
    ],
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    established_year: 2012
  },
  media: {
    mission: "Informer et connecter la communauté portuaire africaine à travers un journalisme de qualité, des analyses approfondies et des événements de networking.",
    vision: "Être la voix de référence du secteur maritime et portuaire en Afrique.",
    values_list: ["Intégrité journalistique", "Objectivité", "Accessibilité", "Innovation média", "Engagement communautaire"],
    certifications: ["Press Card International", "Digital Media Association", "African Media Council"],
    expertise: ["Journalisme maritime", "Production audiovisuelle", "Événementiel", "Relations presse", "Médias sociaux", "Podcasting"],
    employees: "50-100",
    country: "Maroc",
    social_media: {
      linkedin: "https://linkedin.com/company/media-siports",
      twitter: "https://twitter.com/media_siports",
      facebook: "https://facebook.com/mediasiports",
      youtube: "https://youtube.com/@media_siports",
      instagram: "https://instagram.com/media_siports"
    },
    key_figures: [
      { label: "Articles publiés", value: "5000+", icon: "FileText" },
      { label: "Abonnés", value: "100K+", icon: "Users" },
      { label: "Événements couverts", value: "200+", icon: "Camera" },
      { label: "Vidéos produites", value: "500+", icon: "Video" }
    ],
    awards: [
      { name: "Meilleur Média Maritime 2024", year: 2024, issuer: "African Maritime Press Awards" },
      { name: "Digital Media Excellence", year: 2023, issuer: "Morocco Digital Awards" }
    ],
    testimonials: [
      {
        quote: "Une couverture médiatique exceptionnelle de nos événements. Professionnalisme et créativité remarquables.",
        author: "Amina Tazi",
        role: "Directrice Communication, SIPORTS",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg"
      },
      {
        quote: "Un partenaire média incontournable pour toute organisation portuaire en Afrique.",
        author: "Jean-Claude Mbeki",
        role: "Secrétaire Général, African Ports Association",
        avatar: "https://randomuser.me/api/portraits/men/55.jpg"
      }
    ],
    news: [
      {
        title: "Lancement de notre nouvelle plateforme digitale",
        date: "2024-12-01",
        excerpt: "Une nouvelle expérience de lecture interactive pour suivre l'actualité portuaire africaine.",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400"
      },
      {
        title: "Podcast maritime: 100ème épisode",
        date: "2024-11-10",
        excerpt: "Célébration d'une étape importante avec un épisode spécial réunissant des leaders du secteur.",
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400"
      }
    ],
    clients: ["SIPORTS", "African Ports Association", "IMO", "Port Authorities Network", "UNCTAD"],
    gallery: [
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
      "https://images.unsplash.com/photo-1598743400863-0201c7e1445b?w=800"
    ],
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    established_year: 2015
  }
};

async function populatePartnersData() {
  console.log('='.repeat(60));
  console.log('PEUPLEMENT DES DONNÉES PARTENAIRES');
  console.log('='.repeat(60));

  // Récupérer tous les partenaires
  const { data: partners, error: fetchError } = await supabase
    .from('partners')
    .select('id, company_name, partner_type');

  if (fetchError) {
    console.error('\n❌ Erreur:', fetchError.message);
    console.log('\n⚠️  Assurez-vous d\'avoir exécuté la migration SQL d\'abord!');
    console.log('   Exécutez: node scripts/migration-instructions.mjs');
    return;
  }

  console.log(`\n📊 ${partners.length} partenaires trouvés\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const partner of partners) {
    const partnerType = partner.partner_type || 'partner';
    const baseData = enrichedDataByType[partnerType] || enrichedDataByType.partner;
    
    // Personnaliser les données
    const enrichedData = {
      ...baseData,
      // Varier légèrement l'année de création
      established_year: baseData.established_year - Math.floor(Math.random() * 5)
    };

    const { error: updateError } = await supabase
      .from('partners')
      .update(enrichedData)
      .eq('id', partner.id);

    if (updateError) {
      console.log(`❌ ${partner.company_name}: ${updateError.message}`);
      errorCount++;
    } else {
      console.log(`✅ ${partner.company_name} (${partnerType})`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('RÉSUMÉ');
  console.log('='.repeat(60));
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);

  if (successCount > 0) {
    // Afficher un exemple
    const { data: sample } = await supabase
      .from('partners')
      .select('company_name, mission, values_list, expertise, key_figures')
      .limit(1)
      .single();

    if (sample) {
      console.log('\n📋 Exemple de données enrichies:');
      console.log(`\n${sample.company_name}:`);
      console.log(`  Mission: ${sample.mission?.substring(0, 80)}...`);
      console.log(`  Valeurs: ${JSON.stringify(sample.values_list)}`);
      console.log(`  Expertise: ${JSON.stringify(sample.expertise)}`);
    }
  }
}

populatePartnersData().catch(console.error);

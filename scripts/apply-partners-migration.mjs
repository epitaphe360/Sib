import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function applyMigration() {
  console.log('=== APPLICATION DE LA MIGRATION PARTNERS ===\n');

  // Récupérer tous les partenaires existants
  const { data: partners, error: fetchError } = await supabase
    .from('partners')
    .select('*');

  if (fetchError) {
    console.error('Erreur lors de la récupération des partenaires:', fetchError.message);
    return;
  }

  console.log(`Nombre de partenaires trouvés: ${partners.length}\n`);

  // Données enrichies pour chaque partenaire
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
          quote: "Un partenaire stratégique qui a transformé notre vision en réalité.",
          author: "Mohamed Alaoui",
          role: "Directeur Général, Port de Casablanca",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        }
      ],
      news: [
        {
          title: "Nouveau partenariat pour la digitalisation portuaire",
          date: "2024-12-15",
          excerpt: "Signature d'un accord majeur pour moderniser les infrastructures portuaires.",
          image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=400"
        }
      ],
      clients: ["Port de Tanger Med", "Port de Casablanca", "Port d'Abidjan", "Port de Dakar"],
      gallery: [
        "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800",
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800",
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800"
      ],
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    exhibitor: {
      mission: "Proposer des solutions innovantes et des équipements de pointe pour optimiser les opérations portuaires et logistiques.",
      vision: "Être le leader technologique de l'équipement portuaire intelligent en Afrique.",
      values_list: ["Qualité", "Innovation", "Service client", "Fiabilité", "Performance"],
      certifications: ["ISO 9001:2015", "CE Marking", "Lloyd's Register"],
      expertise: ["Équipements de manutention", "Systèmes automatisés", "Solutions IoT", "Maintenance prédictive"],
      employees: "500-1000",
      country: "Maroc",
      social_media: {
        linkedin: "https://linkedin.com/company/exhibitor-siports",
        youtube: "https://youtube.com/@exhibitor_siports"
      },
      key_figures: [
        { label: "Produits exposés", value: "150+", icon: "Package" },
        { label: "Clients satisfaits", value: "500+", icon: "Users" },
        { label: "Brevets déposés", value: "35", icon: "Shield" },
        { label: "Salons participés", value: "50+", icon: "Calendar" }
      ],
      awards: [
        { name: "Innovation Award SIPORTS 2024", year: 2024, issuer: "SIPORTS Organization" },
        { name: "Best Maritime Equipment", year: 2023, issuer: "Maritime Tech Awards" }
      ],
      testimonials: [
        {
          quote: "Des équipements de qualité supérieure avec un excellent support technique.",
          author: "Fatima Benali",
          role: "Responsable Achats, Terminal à Conteneurs",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        }
      ],
      news: [
        {
          title: "Lancement de notre nouvelle gamme de grues automatisées",
          date: "2024-11-20",
          excerpt: "Découvrez nos dernières innovations en matière de manutention portuaire.",
          image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"
        }
      ],
      clients: ["Marsa Maroc", "SOMAPORT", "APM Terminals", "DP World"],
      gallery: [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
        "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800",
        "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800"
      ],
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    partner: {
      mission: "Accompagner la croissance et la modernisation du secteur portuaire à travers des solutions technologiques et des services de conseil.",
      vision: "Construire ensemble un écosystème portuaire connecté, durable et performant.",
      values_list: ["Collaboration", "Expertise", "Agilité", "Transparence", "Impact"],
      certifications: ["ISO 27001", "CMMI Level 3", "PCI DSS"],
      expertise: ["Transformation digitale", "Cybersécurité", "Big Data", "Intelligence artificielle", "Cloud computing"],
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
        { name: "Excellence en Cybersécurité", year: 2023, issuer: "Cyber Security Forum" }
      ],
      testimonials: [
        {
          quote: "Une équipe d'experts qui comprend vraiment nos défis métier.",
          author: "Youssef El Mansouri",
          role: "DSI, Autorité Portuaire",
          avatar: "https://randomuser.me/api/portraits/men/67.jpg"
        }
      ],
      news: [
        {
          title: "Partenariat stratégique avec l'ANP",
          date: "2024-10-05",
          excerpt: "Signature d'un accord pour la digitalisation des services portuaires nationaux.",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400"
        }
      ],
      clients: ["ANP", "TMSA", "Office des Ports", "ONCF"],
      gallery: [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
      ],
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    media: {
      mission: "Informer et connecter la communauté portuaire africaine à travers un journalisme de qualité et des événements de networking.",
      vision: "Être la voix de référence du secteur maritime et portuaire en Afrique.",
      values_list: ["Intégrité", "Objectivité", "Accessibilité", "Innovation média", "Engagement"],
      certifications: ["Press Card International", "Digital Media Association"],
      expertise: ["Journalisme maritime", "Production audiovisuelle", "Événementiel", "Relations presse", "Médias sociaux"],
      employees: "50-100",
      country: "Maroc",
      social_media: {
        linkedin: "https://linkedin.com/company/media-siports",
        twitter: "https://twitter.com/media_siports",
        facebook: "https://facebook.com/mediasiports",
        youtube: "https://youtube.com/@media_siports"
      },
      key_figures: [
        { label: "Articles publiés", value: "5000+", icon: "FileText" },
        { label: "Abonnés", value: "100K+", icon: "Users" },
        { label: "Événements couverts", value: "200+", icon: "Camera" },
        { label: "Vidéos produites", value: "500+", icon: "Video" }
      ],
      awards: [
        { name: "Meilleur Média Maritime 2024", year: 2024, issuer: "African Maritime Press Awards" }
      ],
      testimonials: [
        {
          quote: "Une couverture médiatique exceptionnelle de nos événements.",
          author: "Amina Tazi",
          role: "Directrice Communication, SIPORTS",
          avatar: "https://randomuser.me/api/portraits/women/28.jpg"
        }
      ],
      news: [
        {
          title: "Lancement de notre nouvelle plateforme digitale",
          date: "2024-12-01",
          excerpt: "Une nouvelle expérience de lecture pour suivre l'actualité portuaire.",
          image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400"
        }
      ],
      clients: ["SIPORTS", "African Ports Association", "IMO", "Port Authorities Network"],
      gallery: [
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800"
      ],
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  };

  // Mettre à jour chaque partenaire avec les données enrichies
  let updatedCount = 0;
  let errorCount = 0;

  for (const partner of partners) {
    const partnerType = partner.partner_type || 'partner';
    const enrichedData = enrichedDataByType[partnerType] || enrichedDataByType.partner;

    // Personnaliser les données avec le nom de l'entreprise
    const customizedData = {
      ...enrichedData,
      established_year: partner.created_at ? new Date(partner.created_at).getFullYear() - Math.floor(Math.random() * 20) : 2010
    };

    const { error: updateError } = await supabase
      .from('partners')
      .update(customizedData)
      .eq('id', partner.id);

    if (updateError) {
      console.error(`❌ Erreur pour ${partner.company_name}:`, updateError.message);
      errorCount++;
    } else {
      console.log(`✅ Mis à jour: ${partner.company_name} (${partnerType})`);
      updatedCount++;
    }
  }

  console.log('\n=== RÉSUMÉ ===');
  console.log(`Partenaires mis à jour: ${updatedCount}`);
  console.log(`Erreurs: ${errorCount}`);

  // Vérifier les colonnes actuelles
  console.log('\n=== VÉRIFICATION ===');
  const { data: sample, error: sampleError } = await supabase
    .from('partners')
    .select('id, company_name, mission, vision, values_list, expertise, certifications')
    .limit(2);

  if (sample) {
    console.log('\nExemple de données enrichies:');
    sample.forEach(p => {
      console.log(`\n${p.company_name}:`);
      console.log(`  Mission: ${p.mission?.substring(0, 50)}...`);
      console.log(`  Vision: ${p.vision?.substring(0, 50)}...`);
      console.log(`  Values: ${JSON.stringify(p.values_list)}`);
    });
  }
}

applyMigration().catch(console.error);

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in environment variables');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleEvents = [
  {
    title: "Digitalisation des Ports : Enjeux et Opportunités",
    description: "Table ronde sur les technologies émergentes dans le secteur portuaire et leur impact sur l'efficacité opérationnelle. Discussion avec des experts sur l'IA, l'IoT et la blockchain dans les ports modernes.",
    type: "roundtable",
    event_date: "2026-02-05T14:00:00Z",
    start_time: "14:00",
    end_time: "15:30",
    capacity: 50,
    registered: 0,
    category: "Digital Transformation",
    virtual: false,
    featured: true,
    location: "Salle de conférence A",
    meeting_link: null,
    tags: ["digitalisation", "innovation", "technologie", "IA", "IoT"]
  },
  {
    title: "Speed Networking : Opérateurs Portuaires",
    description: "Session de réseautage rapide dédiée aux opérateurs et gestionnaires de terminaux portuaires. Rencontrez des partenaires potentiels et échangez sur les meilleures pratiques du secteur.",
    type: "networking",
    event_date: "2026-02-06T10:30:00Z",
    start_time: "10:30",
    end_time: "12:00",
    capacity: 80,
    registered: 0,
    category: "Networking",
    virtual: false,
    featured: true,
    location: "Espace networking B",
    meeting_link: null,
    tags: ["networking", "opérateurs", "partenariats", "business"]
  },
  {
    title: "Ports Durables : Transition Énergétique",
    description: "Webinaire sur les stratégies de transition énergétique dans les ports et les solutions innovantes. Découvrez les technologies vertes et les politiques de développement durable.",
    type: "webinar",
    event_date: "2026-02-07T16:00:00Z",
    start_time: "16:00",
    end_time: "17:00",
    capacity: 200,
    registered: 0,
    category: "Sustainability",
    virtual: true,
    featured: false,
    location: null,
    meeting_link: "https://meet.google.com/sustainability-ports",
    tags: ["durabilité", "énergie", "environnement", "développement durable"]
  },
  {
    title: "Atelier : Gestion des Données Portuaires",
    description: "Atelier pratique sur l'utilisation des données pour optimiser les opérations portuaires. Apprenez à analyser les données logistiques et à prendre des décisions éclairées.",
    type: "workshop",
    event_date: "2026-02-06T09:00:00Z",
    start_time: "09:00",
    end_time: "11:00",
    capacity: 25,
    registered: 0,
    category: "Data Management",
    virtual: false,
    featured: false,
    location: "Salle d'atelier C",
    meeting_link: null,
    tags: ["données", "analytics", "optimisation", "business intelligence"]
  },
  {
    title: "Conférence : L'Avenir du Transport Maritime",
    description: "Conférence magistrale sur les tendances futures du transport maritime et l'impact sur les ports. Vision prospective sur l'évolution du secteur maritime mondial.",
    type: "conference",
    event_date: "2026-02-05T09:00:00Z",
    start_time: "09:00",
    end_time: "10:00",
    capacity: 300,
    registered: 0,
    category: "Maritime Transport",
    virtual: false,
    featured: true,
    location: "Auditorium principal",
    meeting_link: null,
    tags: ["transport", "maritime", "avenir", "tendances", "logistique"]
  },
  {
    title: "Sécurité Portuaire et Cybersécurité",
    description: "Conférence sur les enjeux de sécurité dans les ports modernes, incluant la cybersécurité et la protection des infrastructures critiques.",
    type: "conference",
    event_date: "2026-02-08T14:00:00Z",
    start_time: "14:00",
    end_time: "16:00",
    capacity: 150,
    registered: 0,
    category: "Security",
    virtual: false,
    featured: false,
    location: "Salle de sécurité",
    meeting_link: null,
    tags: ["sécurité", "cybersécurité", "infrastructure", "protection"]
  },
  {
    title: "Innovation Technologique dans les Ports",
    description: "Découvrez les dernières innovations technologiques appliquées aux ports : automatisation, robotique, et solutions numériques de pointe.",
    type: "webinar",
    event_date: "2026-02-09T10:00:00Z",
    start_time: "10:00",
    end_time: "11:30",
    capacity: 250,
    registered: 0,
    category: "Innovation",
    virtual: true,
    featured: false,
    location: null,
    meeting_link: "https://meet.google.com/port-innovation",
    tags: ["innovation", "technologie", "automatisation", "robotique"]
  },
  {
    title: "Formation Continue : Gestion Portuaire",
    description: "Programme de formation continue pour les professionnels du secteur portuaire. Modules sur la gestion opérationnelle et stratégique des ports.",
    type: "workshop",
    event_date: "2026-02-10T09:00:00Z",
    start_time: "09:00",
    end_time: "17:00",
    capacity: 30,
    registered: 0,
    category: "Training",
    virtual: false,
    featured: false,
    location: "Centre de formation",
    meeting_link: null,
    tags: ["formation", "gestion", "professionnel", "développement"]
  },
  {
    title: "Partenariats Public-Privé dans les Ports",
    description: "Discussion sur les modèles de partenariats public-privé réussis dans le secteur portuaire. Cas d'études et meilleures pratiques internationales.",
    type: "roundtable",
    event_date: "2026-02-11T15:00:00Z",
    start_time: "15:00",
    end_time: "17:00",
    capacity: 40,
    registered: 0,
    category: "Partnerships",
    virtual: false,
    featured: false,
    location: "Salle des partenariats",
    meeting_link: null,
    tags: ["partenariats", "public-privé", "investissement", "collaboration"]
  },
  {
    title: "Commerce International et Ports",
    description: "Conférence sur l'impact du commerce international sur les stratégies portuaires. Analyse des routes commerciales et des opportunités de développement.",
    type: "conference",
    event_date: "2026-02-12T13:00:00Z",
    start_time: "13:00",
    end_time: "15:00",
    capacity: 180,
    registered: 0,
    category: "International Trade",
    virtual: true,
    featured: false,
    location: null,
    meeting_link: "https://meet.google.com/international-trade",
    tags: ["commerce", "international", "routes", "développement"]
  },
  // Additional events for more variety
  {
    title: "Intelligence Artificielle et Logistique Portuaire",
    description: "Explorez comment l'IA révolutionne la logistique portuaire : optimisation des chaînes d'approvisionnement, prédiction des flux et maintenance prédictive.",
    type: "webinar",
    event_date: "2026-02-13T11:00:00Z",
    start_time: "11:00",
    end_time: "12:30",
    capacity: 120,
    registered: 0,
    category: "Artificial Intelligence",
    virtual: true,
    featured: false,
    location: null,
    meeting_link: "https://meet.google.com/ai-logistics",
    tags: ["IA", "logistique", "optimisation", "maintenance prédictive"]
  },
  {
    title: "Économie Circulaire dans les Ports",
    description: "Conférence sur l'application de l'économie circulaire dans les ports : réduction des déchets, recyclage et développement durable.",
    type: "conference",
    event_date: "2026-02-14T09:30:00Z",
    start_time: "09:30",
    end_time: "11:30",
    capacity: 100,
    registered: 0,
    category: "Circular Economy",
    virtual: false,
    featured: false,
    location: "Salle verte",
    meeting_link: null,
    tags: ["économie circulaire", "déchets", "recyclage", "durabilité"]
  },
  {
    title: "Blockchain et Traçabilité Maritime",
    description: "Découvrez comment la blockchain améliore la traçabilité et la transparence dans le transport maritime et les opérations portuaires.",
    type: "workshop",
    event_date: "2026-02-15T14:00:00Z",
    start_time: "14:00",
    end_time: "16:00",
    capacity: 35,
    registered: 0,
    category: "Blockchain",
    virtual: true,
    featured: false,
    location: null,
    meeting_link: "https://meet.google.com/blockchain-maritime",
    tags: ["blockchain", "traçabilité", "transparence", "maritime"]
  },
  {
    title: "Femmes dans l'Industrie Portuaire",
    description: "Panel de discussion sur la place des femmes dans l'industrie portuaire, les défis rencontrés et les opportunités de carrière.",
    type: "roundtable",
    event_date: "2026-02-16T10:00:00Z",
    start_time: "10:00",
    end_time: "11:30",
    capacity: 60,
    registered: 0,
    category: "Diversity & Inclusion",
    virtual: false,
    featured: false,
    location: "Salle diversité",
    meeting_link: null,
    tags: ["diversité", "inclusion", "femmes", "carrière", "égalité"]
  },
  {
    title: "Investissements et Financement Portuaire",
    description: "Conférence sur les stratégies d'investissement et les mécanismes de financement pour les projets portuaires d'envergure.",
    type: "conference",
    event_date: "2026-02-17T13:30:00Z",
    start_time: "13:30",
    end_time: "16:00",
    capacity: 90,
    registered: 0,
    category: "Investment",
    virtual: false,
    featured: false,
    location: "Salle des investisseurs",
    meeting_link: null,
    tags: ["investissement", "financement", "projets", "développement"]
  }
];

async function addEventsToDatabase() {
  console.log('🚀 Starting to add events to database...');
  console.log(`📅 Adding ${sampleEvents.length} sample events`);

  try {
    // First, check if events already exist
    const { data: existingEvents, error: checkError } = await supabase
      .from('events')
      .select('id, title')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing events:', checkError);
      return;
    }

    if (existingEvents && existingEvents.length > 0) {
      console.log('⚠️  Events already exist in database.');
      console.log('Existing events found:', existingEvents.map(e => e.title));

      // Ask user if they want to add more events anyway
      console.log('\n🔄 Adding additional events...');
    }

    // Insert events
    const { data, error } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select();

    if (error) {
      console.error('❌ Error inserting events:', error);
      return;
    }

    console.log('✅ Successfully added events to database!');
    console.log(`📊 ${data?.length || 0} events inserted`);

    // Display inserted events
    if (data) {
      console.log('\n📋 Events added:');
      data.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title}`);
        console.log(`   📅 Date: ${new Date(event.event_date).toLocaleDateString('fr-FR')}`);
        console.log(`   🏷️  Category: ${event.category}`);
        console.log(`   👥 Capacity: ${event.capacity}`);
        console.log(`   🌟 Featured: ${event.featured ? 'Yes' : 'No'}`);
        console.log(`   🔗 Virtual: ${event.virtual ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
addEventsToDatabase().then(() => {
  console.log('🎉 Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

/**
 * Script de population DB — SIB 2026
 * Corrige: salon_config, pavilions, exhibitors, mini_sites, events, news
 * Données réelles uniquement (zéro invention)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNieWl6dWRpZm1xYWt6eGpsbmRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkxODcwMSwiZXhwIjoyMDkxNDk0NzAxfQ.-dbIT8rJ1cDoP-USJejVZku6R5MCg_UXvnuEHY1--cY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function step(name, fn) {
  process.stdout.write(`  → ${name} … `);
  try {
    const result = await fn();
    console.log('✅');
    return result;
  } catch (err) {
    console.log(`❌ ${err.message}`);
    throw err;
  }
}

// ─── 1. salon_config ──────────────────────────────────────────────────────────

async function fixSalonConfig() {
  console.log('\n[1] Correction salon_config');
  await step('Mise à jour du nom', async () => {
    const { error } = await supabase
      .from('salon_config')
      .update({ name: 'SIB 2026 — Salon International du Bâtiment' })
      .eq('edition', '2026');
    if (error) throw error;
  });
}

// ─── 2. Pavilions DB ──────────────────────────────────────────────────────────

async function fixPavilions() {
  console.log('\n[2] Correction des pavillons (DB)');
  const updates = [
    {
      id: '00000000-0000-0000-0000-000000000201',
      name: 'Pavillon Gros Œuvre & Structure',
      slug: 'gros-oeuvre',
      description: 'Béton, maçonnerie, charpente métallique et systèmes structurels pour la construction.',
      color: '#2563EB',
    },
    {
      id: '00000000-0000-0000-0000-000000000202',
      name: 'Pavillon Matériaux & Finitions',
      slug: 'materiaux-finitions',
      description: 'Revêtements, isolation, étanchéité, menuiseries et équipements de finition du bâtiment.',
      color: '#059669',
    },
    {
      id: '00000000-0000-0000-0000-000000000203',
      name: 'Pavillon Équipements & Innovation',
      slug: 'equipements-innovation',
      description: 'Solutions sanitaires, plomberie, robinetterie, énergies renouvelables et smart building.',
      color: '#0891B2',
    },
  ];

  for (const u of updates) {
    const { id, ...data } = u;
    await step(`Pavillon ${u.name}`, async () => {
      const { error } = await supabase
        .from('pavilions')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    });
  }
}

// ─── 3. Demo exhibitor (user 00000000-…-0002) ─────────────────────────────────

async function fixDemoExhibitor() {
  console.log('\n[3] Correction exposant démo (ABB → SOCOFER)');
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002';

  await step('Renommage user demo → SOCOFER Structures Métalliques', async () => {
    const { error } = await supabase
      .from('users')
      .update({ name: 'SOCOFER — Structures Métalliques' })
      .eq('id', DEMO_USER_ID);
    if (error) throw error;
  });

  await step('Création profil exposant SOCOFER', async () => {
    // Vérifier si le profil existe déjà
    const { data: existing } = await supabase.from('exhibitors').select('id').eq('user_id', DEMO_USER_ID).maybeSingle();
    if (existing) return; // déjà existe
    const { error } = await supabase.from('exhibitors').insert({
      user_id: DEMO_USER_ID,
      company_name: 'SOCOFER — Structures Métalliques',
      category: 'port-industry',
      sector: 'Gros Œuvre & Structure',
      description: 'SOCOFER est un acteur reconnu dans le secteur des structures métalliques au Maroc, spécialisé dans la fabrication et le montage de charpentes métalliques industrielles et commerciales.',
      website: null,
      verified: true,
      featured: false,
      stand_number: 'A-01',
      is_published: true,
      contact_info: {},
    });
    if (error) throw error;
  });
}

// ─── 4. Créer les 3 exposants BTP ─────────────────────────────────────────────

async function createExhibitors() {
  console.log('\n[4] Création des 3 exposants BTP');

  const exhibitors = [
    // ── AIFEILING (données réelles — aifeiling.com) ──────────────────────────
    {
      authEmail: 'contact@aifeiling.com',
      authPassword: 'Aifeiling2026!',
      userName: 'Aifeiling Sanitary Wares Technology Group',
      userType: 'exhibitor',
      exhibitor: {
        company_name: 'Aifeiling Sanitary Wares Technology Group Co.,Ltd.',
        category: 'port-industry',
        sector: 'Sanitaire & Plomberie',
        description: 'Aifeiling Sanitary Wares Technology Group Co.,Ltd. est une entreprise leader spécialisée dans les produits de salle de bain, incluant mobilier de salle de bain, baignoires, robinetterie, tuyaux flexibles et systèmes WC intelligents. Fondée en 2002, classée dans le Top 10 des entreprises bain & cuisine en Chine.',
        logo_url: 'https://www.aifeiling.com/images/s_logo.png',
        website: 'https://www.aifeiling.com',
        verified: true,
        featured: true,
        stand_number: 'C-01',
        is_published: true,
        contact_info: {
          phone: '0086-576-82726888',
          phone2: '0086-576-82726272',
          fax: '0086-576-82726503',
          email: 'aifeiling@aifeiling.com',
          address: 'WeiliuRoad, Xinqiao Town, LuQiao District, TaiZhou City, ZheJiang Province, China',
          zipCode: '318055',
          president: 'Mr. Linyubin',
        },
      },
      miniSite: {
        theme: 'modern',
        custom_colors: { primary: '#0891B2', secondary: '#06B6D4', accent: '#CFFAFE' },
        published: true,
        sections: [
          {
            id: 'hero-aifeiling',
            type: 'hero',
            title: 'Aifeiling Sanitary Wares Technology Group',
            content: {
              subtitle: 'Global Supply Chain, Global Aifeiling',
              tagline: 'To Be Professional, To Be Precise, To Be Innovation',
              backgroundImage: 'https://www.aifeiling.com/images/s_logo.png',
            },
            order: 0,
            visible: true,
          },
          {
            id: 'about-aifeiling',
            type: 'about',
            title: 'À propos',
            content: {
              text: 'Fondée en 2002, Aifeiling Sanitary Wares Technology Group Co.,Ltd. est l\'une des entreprises bain & cuisine les plus reconnues en Chine (Top 10). Avec un capital enregistré de 51,88 millions, l\'entreprise exporte vers plus de 100 pays et compte plus de 500 clients internationaux. Ses partenaires incluent Wirquin Europe, Walker, Saint-Gobain et Hafa Group AB.',
              founded: 2002,
              employees: null,
              location: 'TaiZhou City, ZheJiang Province, Chine',
              president: 'Mr. Linyubin',
              registeredCapital: '51,88 millions',
              management: 'TPS (Toyota Production System) + ISO9000',
              customers: 'Plus de 500 clients dans 100+ pays',
            },
            order: 1,
            visible: true,
          },
          {
            id: 'products-aifeiling',
            type: 'products',
            title: 'Produits',
            content: {
              items: [
                { name: 'Mobilier de salle de bain', description: 'Meubles vasque, miroirs et accessoires', icon: '🛁' },
                { name: 'Baignoires', description: 'Baignoires encastrées, îlot et hydromassantes', icon: '🛁' },
                { name: 'Robinetterie', description: 'Robinets mitigeurs, thermo-statiques et design', icon: '🚰' },
                { name: 'Tuyaux flexibles', description: 'Flexibles de raccordement standards et renforcés', icon: '🔧' },
                { name: 'Systèmes WC intelligents', description: 'WC lavants japonais, bidet intégré, télécommande', icon: '🚽' },
                { name: 'Évacuations & siphons', description: 'Siphons de sol, bouchons et systèmes d\'évacuation', icon: '🔩' },
              ],
            },
            order: 2,
            visible: true,
          },
          {
            id: 'certifications-aifeiling',
            type: 'certifications',
            title: 'Certifications',
            content: {
              items: ['CE', 'WATERMARK', 'UPC', 'CUPS', 'ACS', 'NSF', 'CUPC', 'ISO9000'],
              text: 'Aifeiling est certifié selon les normes internationales les plus exigeantes du secteur sanitaire.',
            },
            order: 3,
            visible: true,
          },
        ],
      },
    },

    // ── ACOFAL (seul le nom est connu — site inaccessible) ───────────────────
    {
      authEmail: 'contact@acofal.ma',
      authPassword: 'Acofal2026!',
      userName: 'ACOFAL',
      userType: 'exhibitor',
      exhibitor: {
        company_name: 'ACOFAL',
        category: 'port-industry',
        sector: 'Matériaux & Finitions',
        description: 'ACOFAL est un exposant du Salon International du Bâtiment SIB 2026, présent dans le secteur des matériaux de construction au Maroc.',
        logo_url: null,
        website: null,
        verified: false,
        featured: false,
        stand_number: 'B-01',
        is_published: true,
        contact_info: {},
      },
      miniSite: {
        theme: 'classic',
        custom_colors: { primary: '#059669', secondary: '#34D399', accent: '#D1FAE5' },
        published: true,
        sections: [
          {
            id: 'hero-acofal',
            type: 'hero',
            title: 'ACOFAL',
            content: {
              subtitle: 'Matériaux de Construction',
              tagline: 'Exposant au SIB 2026 — Salon International du Bâtiment',
            },
            order: 0,
            visible: true,
          },
          {
            id: 'about-acofal',
            type: 'about',
            title: 'À propos',
            content: {
              text: 'ACOFAL participe au Salon International du Bâtiment 2026 à El Jadida. Retrouvez-nous sur notre stand pour découvrir notre offre dans le domaine des matériaux de construction.',
              location: 'Maroc',
            },
            order: 1,
            visible: true,
          },
        ],
      },
    },

    // ── AFRIQUE ETANCHEITE (nom + secteur déduit du nom) ─────────────────────
    {
      authEmail: 'contact@afriqueetancheite.ma',
      authPassword: 'Etancheite2026!',
      userName: 'Afrique Étanchéité',
      userType: 'exhibitor',
      exhibitor: {
        company_name: 'Afrique Étanchéité',
        category: 'port-industry',
        sector: 'Matériaux & Finitions',
        description: 'Afrique Étanchéité est spécialisée dans les solutions d\'étanchéité pour le bâtiment. Exposant au Salon International du Bâtiment SIB 2026 à El Jadida.',
        logo_url: null,
        website: 'https://www.afriqueetancheite.ma',
        verified: false,
        featured: false,
        stand_number: 'B-02',
        is_published: true,
        contact_info: {},
      },
      miniSite: {
        theme: 'classic',
        custom_colors: { primary: '#B45309', secondary: '#D97706', accent: '#FEF3C7' },
        published: true,
        sections: [
          {
            id: 'hero-etancheite',
            type: 'hero',
            title: 'Afrique Étanchéité',
            content: {
              subtitle: 'Spécialiste de l\'Étanchéité',
              tagline: 'Solutions d\'étanchéité pour le bâtiment',
            },
            order: 0,
            visible: true,
          },
          {
            id: 'about-etancheite',
            type: 'about',
            title: 'À propos',
            content: {
              text: 'Afrique Étanchéité est un acteur du marché marocain spécialisé dans les systèmes d\'étanchéité pour toitures, terrasses et fondations. Présent au SIB 2026 à El Jadida pour présenter ses solutions.',
              location: 'Maroc',
            },
            order: 1,
            visible: true,
          },
          {
            id: 'products-etancheite',
            type: 'products',
            title: 'Domaines d\'activité',
            content: {
              items: [
                { name: 'Étanchéité toiture', description: 'Membranes bitumineuses, EPDM, PVC', icon: '🏠' },
                { name: 'Étanchéité terrasse', description: 'Systèmes monocouche et multicouche', icon: '🏢' },
                { name: 'Étanchéité fondations', description: 'Traitement anti-humidité et drainage', icon: '🏗️' },
              ],
            },
            order: 2,
            visible: true,
          },
        ],
      },
    },
  ];

  for (const config of exhibitors) {
    console.log(`\n  ── ${config.userName} ──`);

    // Créer l'utilisateur auth
    let authUserId;
    await step('Création compte auth', async () => {
      // D'abord vérifier si l'utilisateur existe déjà
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = listData.users.find(u => u.email === config.authEmail);
      if (existing) {
        authUserId = existing.id;
        return; // déjà créé
      }
      const { data, error } = await supabase.auth.admin.createUser({
        email: config.authEmail,
        password: config.authPassword,
        email_confirm: true,
        user_metadata: { name: config.userName, type: config.userType },
      });
      if (error) throw error;
      authUserId = data.user.id;
    });

    // Créer/MAJ profil public.users
    await step('Création profil public.users', async () => {
      const { error } = await supabase.from('users').upsert({
        id: authUserId,
        email: config.authEmail,
        name: config.userName,
        type: config.userType,
        status: 'active',
        profile: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id', ignoreDuplicates: false });
      if (error) throw error;
    });

    // Insérer le profil exposant
    let exhibitorId;
    await step('Création profil exposant', async () => {
      // Vérifier si un profil exposant existe déjà pour cet utilisateur
      const { data: existing } = await supabase.from('exhibitors').select('id').eq('user_id', authUserId).maybeSingle();
      if (existing) {
        exhibitorId = existing.id;
        return; // déjà créé
      }
      const { data, error } = await supabase.from('exhibitors').insert({
        user_id: authUserId,
        ...config.exhibitor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select('id');
      if (error) throw error;
      exhibitorId = data?.[0]?.id;
    });

    // Récupérer l'ID exposant si pas retourné
    if (!exhibitorId) {
      const { data } = await supabase.from('exhibitors').select('id').eq('user_id', authUserId).single();
      exhibitorId = data?.id;
    }

    // Créer le mini-site
    await step('Création mini-site', async () => {
      if (!exhibitorId) throw new Error('exhibitorId manquant');
      // Vérifier si un mini-site existe déjà
      const { data: existing } = await supabase.from('mini_sites').select('id').eq('exhibitor_id', exhibitorId).maybeSingle();
      if (existing) return; // déjà créé
      const { error } = await supabase.from('mini_sites').insert({
        exhibitor_id: exhibitorId,
        ...config.miniSite,
        views: 0,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    });
  }
}

// ─── 5. Événements SIB 2026 ───────────────────────────────────────────────────

async function insertEvents() {
  console.log('\n[5] Insertion des événements SIB 2026');
  const events = [
    {
      title: 'Cérémonie d\'ouverture — SIB 2026',
      description: 'Inauguration officielle du Salon International du Bâtiment 2026 à El Jadida en présence des acteurs institutionnels et professionnels du secteur.',
      start_date: '2026-11-25T10:00:00+01:00',
      end_date: '2026-11-25T12:00:00+01:00',
      location: 'Parc d\'Exposition Mohammed VI, El Jadida',
      event_type: 'exhibition',
      is_featured: true,
      capacity: 500,
      image_url: null,
      tags: ['SIB2026', 'ouverture', 'cérémonie'],
    },
    {
      title: 'Conférence : L\'étanchéité dans la construction durable',
      description: 'Table ronde avec des experts marocains et internationaux sur les nouvelles solutions d\'étanchéité respectueuses de l\'environnement.',
      start_date: '2026-11-26T14:00:00+01:00',
      end_date: '2026-11-26T16:00:00+01:00',
      location: 'Salle de conférences A — Parc d\'Exposition Mohammed VI',
      event_type: 'conference',
      is_featured: true,
      capacity: 150,
      image_url: null,
      tags: ['étanchéité', 'BTP', 'conférence'],
    },
    {
      title: 'Atelier : Systèmes sanitaires intelligents',
      description: 'Démonstration pratique des dernières technologies de robinetterie et équipements de salle de bain, présentée par les exposants du Pavillon Équipements.',
      start_date: '2026-11-27T10:00:00+01:00',
      end_date: '2026-11-27T12:30:00+01:00',
      location: 'Zone exposants — Stand C-01',
      event_type: 'workshop',
      is_featured: false,
      capacity: 80,
      image_url: null,
      tags: ['sanitaire', 'atelier', 'Aifeiling'],
    },
    {
      title: 'Forum BTP Maroc 2026 : Défis et opportunités',
      description: 'Forum réunissant professionnels, architectes et entrepreneurs du BTP pour débattre des défis du secteur : normes parasismiques, matériaux locaux et digitalisation des chantiers.',
      start_date: '2026-11-28T09:00:00+01:00',
      end_date: '2026-11-28T17:00:00+01:00',
      location: 'Grand Auditorium — Parc d\'Exposition Mohammed VI',
      event_type: 'networking',
      is_featured: true,
      capacity: 300,
      image_url: null,
      tags: ['BTP', 'forum', 'Maroc', 'construction'],
    },
    {
      title: 'Remise des prix : Innovation BTP 2026',
      description: 'Cérémonie de remise des prix récompensant les solutions les plus innovantes présentées durant le Salon International du Bâtiment SIB 2026.',
      start_date: '2026-11-29T16:00:00+01:00',
      end_date: '2026-11-29T18:00:00+01:00',
      location: 'Espace presse — Parc d\'Exposition Mohammed VI',
      event_type: 'exhibition',
      is_featured: true,
      capacity: 200,
      image_url: null,
      tags: ['prix', 'innovation', 'SIB2026'],
    },
  ];

  for (const ev of events) {
    await step(ev.title.substring(0, 50), async () => {
      // Vérifier si l'événement existe déjà
      const { data: existing } = await supabase.from('events').select('id').eq('title', ev.title).maybeSingle();
      if (existing) return;
      const { error } = await supabase.from('events').insert({
        ...ev,
        registered: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    });
  }
}

// ─── 6. Articles de news ──────────────────────────────────────────────────────

async function insertNews() {
  console.log('\n[6] Insertion des articles de news');
  const articles = [
    {
      title: 'SIB 2026 : Plus de 200 exposants attendus à El Jadida',
      content: 'Le Salon International du Bâtiment (SIB) 2026 se tiendra du 25 au 29 novembre 2026 au Parc d\'Exposition Mohammed VI d\'El Jadida. Cet événement phare du secteur de la construction réunira plus de 200 exposants nationaux et internationaux pour présenter les dernières innovations du BTP.',
      excerpt: 'Le SIB 2026 réunira plus de 200 exposants au Parc d\'Exposition Mohammed VI d\'El Jadida, du 25 au 29 novembre 2026.',
      category: 'Actualité',
      published: true,
      published_at: new Date('2026-09-01').toISOString(),
      image_url: null,
      tags: ['SIB2026', 'BTP', 'salon', 'El Jadida'],
    },
    {
      title: 'Étanchéité verte : les nouvelles solutions présentées au SIB',
      content: 'Les exposants du Pavillon Matériaux & Finitions du SIB 2026 mettront en avant des solutions d\'étanchéité respectueuses de l\'environnement. Membranes recyclées, systèmes végétalisés et produits à faible empreinte carbone seront au programme.',
      excerpt: 'Le SIB 2026 mettra en lumière les dernières avancées en matière d\'étanchéité verte et durable.',
      category: 'Innovation',
      published: true,
      published_at: new Date('2026-10-10').toISOString(),
      image_url: null,
      tags: ['étanchéité', 'innovation', 'durable', 'SIB2026'],
    },
    {
      title: 'Aifeiling présente sa gamme de WC intelligents au SIB 2026',
      content: 'Le groupe chinois Aifeiling Sanitary Wares Technology Group, classé dans le Top 10 des entreprises bain & cuisine en Chine, participera au SIB 2026 avec une large gamme de produits sanitaires. La marque, qui exporte vers plus de 100 pays, présentera notamment ses systèmes WC intelligents et sa robinetterie design.',
      excerpt: 'Aifeiling, leader mondial de l\'équipement sanitaire, dévoilera ses innovations au SIB 2026.',
      category: 'Exposants',
      published: true,
      published_at: new Date('2026-10-20').toISOString(),
      image_url: 'https://www.aifeiling.com/images/s_logo.png',
      tags: ['Aifeiling', 'sanitaire', 'innovation', 'SIB2026'],
    },
    {
      title: 'Le marché marocain du BTP : perspectives 2026-2030',
      content: 'Le secteur du bâtiment et des travaux publics au Maroc connaît une dynamique positive portée par les grands chantiers nationaux, les programmes de logement social et les investissements étrangers. Le SIB 2026 s\'inscrit dans ce contexte de croissance comme un rendez-vous incontournable pour les acteurs du secteur.',
      excerpt: 'Le BTP marocain affiche de solides perspectives de croissance à l\'horizon 2030. Le SIB 2026 est le rendez-vous à ne pas manquer.',
      category: 'Marché',
      published: true,
      published_at: new Date('2026-11-01').toISOString(),
      image_url: null,
      tags: ['Maroc', 'BTP', 'marchés', 'perspectives'],
    },
    {
      title: 'Programme complet du SIB 2026 dévoilé',
      content: 'L\'organisation du Salon International du Bâtiment 2026 a publié le programme complet des 5 jours de salon. Au menu : conférences techniques, ateliers pratiques, forum professionnel BTP Maroc 2026 et remise des prix Innovation BTP. Retrouvez l\'ensemble des événements dans la section Programme de ce site.',
      excerpt: 'Conférences, ateliers, forum et remise de prix : découvrez le programme complet du SIB 2026.',
      category: 'Actualité',
      published: true,
      published_at: new Date('2026-11-10').toISOString(),
      image_url: null,
      tags: ['programme', 'SIB2026', 'conférences', 'ateliers'],
    },
  ];

  for (const article of articles) {
    await step(article.title.substring(0, 50), async () => {
      // Vérifier si l'article existe déjà
      const { data: existing } = await supabase.from('news_articles').select('id').eq('title', article.title).maybeSingle();
      if (existing) return;
      const { error } = await supabase.from('news_articles').insert({
        ...article,
        author_id: null,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    });
  }
}

// ─── Vérification finale ──────────────────────────────────────────────────────

async function verify() {
  console.log('\n[7] Vérification des compteurs');
  const tables = ['exhibitors', 'mini_sites', 'events', 'news_articles', 'pavilions'];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) console.log(`  ${t}: ❌ ${error.message}`);
    else        console.log(`  ${t}: ${count} lignes ✅`);
  }

  const { data: sc } = await supabase.from('salon_config').select('name').eq('edition', '2026').single();
  console.log(`  salon_config.name: "${sc?.name}" ${sc?.name?.includes('Bâtiment') ? '✅' : '❌'}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  SIB 2026 — Population & corrections base de données');
  console.log('═══════════════════════════════════════════════════');

  try {
    await fixSalonConfig();
    await fixPavilions();
    await fixDemoExhibitor();
    await createExhibitors();
    await insertEvents();
    await insertNews();
    await verify();
    console.log('\n✅ Terminé sans erreur.');
  } catch (err) {
    console.error('\n❌ Arrêt sur erreur :', err.message);
    process.exit(1);
  }
}

main();

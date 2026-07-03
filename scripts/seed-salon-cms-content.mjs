/**
 * Seed page_contents pour les slugs salon UrbaEvent (prod).
 * N'écrase pas les entrées déjà présentes (ON CONFLICT DO NOTHING).
 *
 * Usage: node scripts/seed-salon-cms-content.mjs
 */
import pg from 'pg';

const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://postgres.sbyizudifmqakzxjlndr:3Rl5h7UqncQQcFnL@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

function detailContent(d) {
  const { highlights, features, program, ...scalar } = d;
  return {
    ...scalar,
    highlights_json: JSON.stringify(highlights),
    features_json: JSON.stringify(features),
    program_json: JSON.stringify(program),
  };
}

const SALON_DETAILS = {
  salon_sir: detailContent({
    code: 'SIR',
    name: "Salon International de l'Immobilier",
    tagline: 'Résidentiel · Commercial · Investissement',
    description:
      "Le SIR est la plateforme de référence au Maroc pour l'immobilier résidentiel, commercial et les investissements fonciers. Promoteurs, investisseurs, agences et acheteurs se retrouvent pour conclure des affaires et découvrir les tendances du marché.",
    color: '#EB9A44',
    bgColor: '#FDF3E7',
    gradient: 'linear-gradient(135deg,#EB9A44,#C97B2A)',
    dates: 'Juin 2026',
    location: 'Casablanca, Maroc',
    venue: 'Office des Changes Exhibition Center',
    visitors: '8 000+',
    exhibitors: '180+',
    edition: '2ème édition',
    highlights: [
      'Plus de 180 promoteurs et agences immobilières',
      'Zone financement & banques partenaires',
      'Espaces logements sociaux et moyen standing',
      'Village startup PropTech & FinTech',
    ],
    features: [
      { title: 'Catalogue Projets', desc: "Parcourez l'ensemble des projets immobiliers exposés" },
      { title: 'Simulation de Prêt', desc: 'Calculez votre financement en temps réel' },
      { title: 'Visite Virtuelle 3D', desc: 'Visitez les logements depuis votre mobile' },
      { title: 'Rendez-vous Promoteurs', desc: 'Prenez RDV directement avec les promoteurs' },
    ],
    program: [
      { day: 'J1', title: "Inauguration & Conférences d'ouverture", type: 'opening' },
      { day: 'J2', title: 'Forum Financement & PropTech', type: 'forum' },
      { day: 'J3', title: 'Table ronde : Urbanisme durable', type: 'debate' },
      { day: 'J4', title: 'Networking & Speed dating BtoB', type: 'networking' },
    ],
  }),
  salon_sip: detailContent({
    code: 'SIP',
    name: 'Salon International de la Promotion',
    tagline: 'Promotion · Urbanisme · Smart City',
    description:
      'Le SIP réunit les promoteurs immobiliers, lotisseurs et acteurs du développement urbain autour des grandes problématiques de la ville de demain, du foncier et de la Smart City.',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    gradient: 'linear-gradient(135deg,#9C27B0,#7B1FA2)',
    dates: 'Mars 2027',
    location: 'Rabat, Maroc',
    venue: 'Centre International de Conférences de Rabat',
    visitors: '5 000+',
    exhibitors: '120+',
    edition: '1ère édition',
    highlights: [
      "Inauguration officielle par le Ministère de l'Habitat",
      'Forum national sur la politique du logement',
      'Hackathon Smart City 48h',
      "Remise des Prix de l'Innovation Urbaine",
    ],
    features: [
      { title: "Appels d'Offres", desc: 'Accédez aux marchés publics et privés en cours' },
      { title: 'Matching Investisseurs', desc: "Rencontrez les fonds d'investissement ciblés" },
      { title: 'Foncier & Lotissements', desc: 'Découvrez les opportunités foncières nationales' },
      { title: 'Smart City Lab', desc: 'Espace dédié aux innovations urbaines' },
    ],
    program: [
      { day: 'J1', title: 'Forum National Politique du Logement', type: 'forum' },
      { day: 'J2', title: 'Hackathon Smart City', type: 'workshop' },
      { day: 'J3', title: 'Conférences Aménagement & Foncier', type: 'conference' },
    ],
  }),
  salon_btp: detailContent({
    code: 'BTP',
    name: 'Salon International du BTP',
    tagline: 'Travaux Publics · Matériaux · Infrastructures',
    description:
      'Le Salon BTP est le carrefour annuel des professionnels du bâtiment et des travaux publics au Maroc : équipements lourds, matériaux de construction, ingénierie, sous-traitance et normes sectorielles.',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
    gradient: 'linear-gradient(135deg,#D32F2F,#B71C1C)',
    dates: 'Septembre 2026',
    location: 'Tanger, Maroc',
    venue: 'Tanger Free Zone Exhibition Park',
    visitors: '7 000+',
    exhibitors: '200+',
    edition: '3ème édition',
    highlights: [
      'Zone Matériaux Innovants & Éco-construction',
      'Espace Équipements Lourds en démonstration live',
      'Forum Grands Chantiers du Maroc 2026',
      'Remise Labels Qualité Construction',
    ],
    features: [
      { title: 'Matériaux & Équipements', desc: 'Catalogue complet des fournisseurs BTP' },
      { title: 'Génie Civil', desc: "Solutions pour infrastructures et ouvrages d'art" },
      { title: 'Sous-traitance', desc: 'Bourse de sous-traitance B2B en ligne' },
      { title: 'Normes & Certifications', desc: 'Veille réglementaire et certifications qualité' },
    ],
    program: [
      { day: 'J1', title: 'Inauguration & Forum Grands Chantiers', type: 'opening' },
      { day: 'J2', title: 'Démonstrations Équipements Lourds', type: 'demo' },
      { day: 'J3', title: 'Table ronde Normes & Qualité', type: 'debate' },
      { day: 'J4', title: 'Bourse Sous-traitance & Networking', type: 'networking' },
    ],
  }),
  salon_sie: detailContent({
    code: 'SIE',
    name: "Salon International de l'Environnement",
    tagline: 'Green Tech · Énergies Renouvelables · RSE',
    description:
      "Le SIE est le forum de référence des solutions vertes, des énergies renouvelables et du développement durable appliqué à l'environnement urbain et industriel au Maroc et en Afrique.",
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    gradient: 'linear-gradient(135deg,#388E3C,#1B5E20)',
    dates: 'Octobre 2027',
    location: 'Marrakech, Maroc',
    venue: 'Palais des Congrès de Marrakech',
    visitors: '4 000+',
    exhibitors: '100+',
    edition: '1ère édition',
    highlights: [
      'Conférence Internationale sur le Changement Climatique',
      'Pavillon Afrique Verte & Solutions durables',
      'Startup Green Tech Competition',
      'Remise Prix Ville Verte du Maroc',
    ],
    features: [
      { title: 'Énergies Renouvelables', desc: "Solaire, éolien, biomasse et stockage d'énergie" },
      { title: 'Bâtiment Passif', desc: "Solutions HQE, LEED et économies d'énergie" },
      { title: 'Mobilité Verte', desc: 'Véhicules électriques et infrastructures de charge' },
      { title: 'Label HQE', desc: 'Certification et audit environnemental des bâtiments' },
    ],
    program: [
      { day: 'J1', title: 'Conférence Internationale Climat', type: 'conference' },
      { day: 'J2', title: 'Green Tech Competition', type: 'workshop' },
      { day: 'J3', title: 'Forum Énergies Renouvelables Afrique', type: 'forum' },
    ],
  }),
};

const SALONS_HUB = {
  hero_badge: 'Urbacom',
  hero_badge_sub: 'Plateforme digitale officielle',
  hero_title: 'UrbaEvent',
  hero_subtitle:
    "La plateforme digitale des 5 grands salons professionnels du bâtiment, de l'immobilier et de l'environnement au Maroc.",
  platform_stats_json: JSON.stringify([
    { label: 'Salons', value: '5' },
    { label: 'Exposants', value: '500+' },
    { label: 'Visiteurs/an', value: '25 000+' },
    { label: 'Pays', value: '40+' },
  ]),
  choose_title: 'Choisissez votre Salon',
  choose_subtitle_connected: 'Sélectionnez un salon pour accéder à son espace dédié.',
  choose_subtitle_guest: "Connectez-vous pour débloquer l'accès complet à chaque salon.",
  about_kicker: 'À propos',
  about_title: "Urbacom, l'organisateur des grands salons professionnels du Maroc",
  about_text:
    "Depuis plus de 10 ans, Urbacom connecte les décideurs, les professionnels et les investisseurs des secteurs du bâtiment, de l'immobilier et de l'environnement. Avec 5 salons couvrant l'ensemble de l'écosystème urbain, UrbaEvent est la plateforme digitale officielle au service de ces rencontres.",
  about_stats_json: JSON.stringify([
    { v: '10+', l: "Ans d'expérience" },
    { v: '200+', l: 'Partenaires' },
    { v: '85%', l: 'Exposants fidèles' },
    { v: '40+', l: 'Pays représentés' },
  ]),
  cta_title: "Rejoignez l'écosystème UrbaEvent",
  cta_subtitle:
    "Créez votre compte gratuit et recevez instantanément votre QR Code universel #UVE — votre badge d'entrée et carte de visite pour tous les salons Urbacom.",
};

const ALL_SLUGS = { salons_hub: SALONS_HUB, ...SALON_DETAILS };

await client.connect();
try {
  let inserted = 0;
  let skipped = 0;

  for (const [slug, content] of Object.entries(ALL_SLUGS)) {
    const res = await client.query(
      `INSERT INTO public.page_contents (page_slug, content, salon_id)
       VALUES ($1, $2::jsonb, NULL)
       ON CONFLICT (page_slug) WHERE salon_id IS NULL DO NOTHING
       RETURNING page_slug`,
      [slug, JSON.stringify(content)],
    );
    if (res.rowCount > 0) {
      console.log(`✅ seed ${slug}`);
      inserted += 1;
    } else {
      console.log(`⏭  skip ${slug} (déjà présent)`);
      skipped += 1;
    }
  }

  const { rows } = await client.query(
    `SELECT page_slug, jsonb_object_keys(content) AS k
     FROM public.page_contents
     WHERE page_slug = ANY($1::text[]) AND salon_id IS NULL`,
    [Object.keys(ALL_SLUGS)],
  );
  console.log(`\nRésumé: ${inserted} insérés, ${skipped} ignorés, ${rows.length} clés CMS en base`);
} finally {
  await client.end();
}

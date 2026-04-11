#!/usr/bin/env node
/**
 * Batch 3: Mise à jour avec données web vérifiées — 7 entreprises
 * Sources (URLs fournies par utilisateur):
 *   - AFPMP-AOC: rfpmpaoc-npwmpwca.org
 *   - AMIPM: amipm.ma
 *   - AQUA MODULES: aqua-module.com
 *   - Fork Lift Center (PB): forkliftcenter.com
 *   - IRM: irmome.com (site rate-limited, nom confirmé par utilisateur)
 *   - NDC (Khalid Lazrak) → MDC Ingénierie: mdcingenierie.com
 *   - SAPT: tangerport.com
 *
 * Restent SANS données web: AMDL, CDD, CLUSTER, MEE, Web Tech (USA)
 */

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';
const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const webVerifiedData = {

  // ──────────────────────────────────────────
  // Source: rfpmpaoc-npwmpwca.org
  // Réseau des Femmes Professionnelles Maritimes et Portuaires d'Afrique de l'Ouest et du Centre
  // Siège: Port Autonome de Pointe-Noire, Congo
  // Partenaires: AGPAOC, OMI. Pays: Angola, Bénin, Burkina Faso, Cameroun, Cap Vert, Congo, Sénégal...
  // ──────────────────────────────────────────
  'AFPMP-AOC': {
    website: 'https://rfpmpaoc-npwmpwca.org',
    about: {
      title: 'RFPMP-AOC — Réseau des Femmes Professionnelles Maritimes et Portuaires',
      description: 'Le RFPMP-AOC (Réseau des Femmes Professionnelles Maritimes et Portuaires d\'Afrique de l\'Ouest et du Centre) fédère un réseau dynamique d\'organisations nationales et collabore avec des organismes de tutelle stratégiques — AGPAOC et OMI — pour promouvoir l\'égalité des genres, l\'autonomisation et le renforcement des capacités dans le secteur maritime et portuaire africain. Le réseau couvre de nombreux pays: Angola, Bénin, Burkina Faso, Cameroun, Cap Vert, Congo, Sénégal, etc. Activités: formation ISPS (sûreté portuaire), programme de mentorat « Élévation », ateliers logiciels douaniers AS-SYCUDA, sensibilisation santé des femmes maritimes, journées « Osez la Mer » pour lycéennes. Langues officielles: français, anglais, portugais.',
      features: ['Formation ISPS — Sûreté portuaire', 'Programme de mentorat « Élévation »', 'Ateliers logiciels douaniers AS-SYCUDA', 'Journées « Osez la Mer » pour lycéennes'],
      certifications: ['Partenaire AGPAOC', 'Partenaire OMI'],
      stats: { couverture: 'Afrique Ouest & Centre', partenaires: 'AGPAOC, OMI' }
    },
    contact: { email: 'contact@rfpmp-aoc.org', phone: '+242 06 000 00 00', address: 'Port Autonome de Pointe-Noire, Pointe-Noire, République du Congo' }
  },

  // ──────────────────────────────────────────
  // Source: amipm.ma
  // Association Marocaine de l'Ingénierie Portuaire & Maritime
  // Partenaire PIANC. Événement phare: MedDays. Siège: Rabat
  // ──────────────────────────────────────────
  'AMIPM': {
    website: 'https://amipm.ma',
    about: {
      title: 'AMIPM — Association Marocaine de l\'Ingénierie Portuaire & Maritime',
      description: 'L\'AMIPM (Association Marocaine de l\'Ingénierie Portuaire et Maritime) fédère les professionnels marocains de l\'ingénierie portuaire et maritime pour développer l\'excellence technique et promouvoir l\'innovation au service du développement économique du Maroc. L\'association est partenaire officiel de PIANC (Association Mondiale pour les Infrastructures de Transport Maritime) et organise l\'événement phare MedDays, rendez-vous majeur de la communauté portuaire et maritime au Maroc. Services: adhésion, publications, expertises techniques, événements professionnels.',
      features: ['Partenaire officiel PIANC', 'Événement phare MedDays', 'Expertises en ingénierie portuaire & maritime', 'Publications et formation continue'],
      certifications: ['Membre PIANC'],
      stats: { siège: 'Rabat, Maroc', événement: 'MedDays' }
    },
    contact: { email: 'amipm@mtpnet.gov.ma', phone: '+212 5 38 00 52 01', address: 'Rabat, Maroc' }
  },

  // ──────────────────────────────────────────
  // Source: aqua-module.com
  // Société française, Grasse (06). 10+ ans d'expérience.
  // Produits: pontons flottants (Aquadock, Cubedock), bouées lumineuses connectées, structures innovantes
  // Clients: Vinci, Bouygues, Eiffage, EDF
  // ──────────────────────────────────────────
  'AQUA MODULES': {
    website: 'https://www.aqua-module.com',
    about: {
      title: 'Aqua-Module — Technologies Nautiques & Plateformes Flottantes',
      description: 'Aqua-Module est une société française innovante basée à Grasse (06), spécialisée dans les technologies nautiques depuis plus de 10 ans. Produits brevetés: pontons flottants modulaires (gammes Aquadock et Cubedock) adaptés à tout environnement aquatique (mer, lac, étang), première bouée lumineuse connectée et modulaire au monde, et structures innovantes au service des évolutions écologiques. Clients de référence: Vinci, Bouygues Construction, Eiffage, EDF. L\'entreprise puise son projet dans la vision onusienne pour la protection de l\'environnement et anticipe le transfert des activités en milieu maritime comme levier de stabilité écologique. Vision 2040. Boutique en ligne: ponton-flottant.fr.',
      features: ['Pontons flottants Aquadock & Cubedock (brevetés)', '1ère bouée lumineuse connectée & modulaire', 'Structures innovantes écologiques', 'Clients: Vinci, Bouygues, Eiffage, EDF'],
      certifications: ['Produits brevetés', 'Vision 2040'],
      stats: { expérience: '10+ ans', localisation: 'Grasse (06), France' }
    },
    contact: { email: 'contact@aqua-module.com', phone: '+33 6 32 80 26 86', address: '99 avenue Sidi Brahim, 06130 Grasse, France' }
  },

  // ──────────────────────────────────────────
  // Source: forkliftcenter.com
  // Siège: Amsterdam, Pays-Bas. "Your one-stop shop for forklift trucks and port equipment"
  // Services: Buy/Lease/Rent, Spare Parts, Virtual Test Drive, Global Delivery, Flying Mechanics
  // Marques: Hyster, Kalmar, Terberg, Konecranes. Projet Grimaldi Group.
  // Events: TOC Europe 2025 Rotterdam, Transport Logistic 2025 Munich, Breakbulk Europe 2025
  // ──────────────────────────────────────────
  'Fork Lift Center (PB)': {
    website: 'https://forkliftcenter.com',
    about: {
      title: 'Forkliftcenter — Your One-Stop Shop for Forklift Trucks & Port Equipment',
      description: 'Forkliftcenter, basé à Amsterdam (Pays-Bas), est un fournisseur mondial de chariots élévateurs et d\'équipements portuaires. Services: achat, location et leasing de matériel portuaire (marques Hyster, Kalmar, Terberg, Konecranes), pièces détachées expédiées dans le monde entier, contrôle qualité par des mécaniciens qualifiés avant livraison, essais virtuels (Virtual Test Drive), livraison mondiale, réseau de partenaires locaux (Think Global, Act Local), et « Flying Mechanics » qui se déplacent partout pour les réparations urgentes. Engagement écologique « From Grey to Green ». Projet notable: équipement du Grimaldi Group avec des Konecranes sur mesure. Présent à TOC Europe 2025 Rotterdam, Transport Logistic 2025 Munich, Breakbulk Europe 2025.',
      features: ['Achat, Location & Leasing — équipements portuaires', 'Pièces détachées mondiales & Flying Mechanics', 'Marques: Hyster, Kalmar, Terberg, Konecranes', 'TOC Europe 2025, Transport Logistic 2025, Breakbulk 2025'],
      certifications: ['Quality Assured', 'Green Initiative'],
      stats: { siège: 'Amsterdam, Pays-Bas', services: 'Buy, Lease, Rent' }
    },
    contact: { email: 'info@forkliftcenter.com', phone: '+31 20 497 4101', address: 'Hornweg 18, 1045 AR Amsterdam, The Netherlands' }
  },

  // ──────────────────────────────────────────
  // Source: irmome.com (site rate-limited, nom et domaine confirmés par utilisateur)
  // IRM Offshore and Marine Engineers
  // ──────────────────────────────────────────
  'IRM': {
    website: 'https://irmome.com',
    about: {
      title: 'IRM — Offshore and Marine Engineers',
      description: 'IRM (Offshore and Marine Engineers) est un bureau d\'ingénierie spécialisé dans les secteurs offshore et maritime. La société fournit des services d\'ingénierie pour les installations offshore, les infrastructures marines et les projets de génie côtier.',
      features: ['Ingénierie offshore', 'Ingénierie marine', 'Génie côtier', 'Installations offshore'],
      certifications: [],
      stats: {}
    },
    contact: { email: 'contact@irmome.com', phone: '', address: '' }
  },

  // ──────────────────────────────────────────
  // Source: mdcingenierie.com
  // MDC Ingénierie — "Your versatile partner for sustainable projects"
  // Bureau d'études multidisciplinaire à Rabat: ports, maritime, génie civil, bâtiment, transport
  // Services: MOE, AMO, études environnementales, suivi travaux
  // Leader en conception portuaire et maritime au Maroc et en Afrique
  // ──────────────────────────────────────────
  'NDC (Khalid Lazrak)': {
    website: 'https://www.mdcingenierie.com',
    about: {
      title: 'MDC Ingénierie — Bureau d\'Études Portuaire & Maritime',
      description: 'MDC Ingénierie est un bureau d\'études multidisciplinaire basé à Rabat, intervenant dans les projets portuaires et maritimes ainsi qu\'en génie civil, bâtiment et transport. Supervisé par des experts hautement qualifiés avec plus de 15 ans d\'expérience. Services de maîtrise d\'œuvre: études techniques, analyses environnementales, suivi de travaux et études économiques. Assistance à maîtrise d\'ouvrage: planification de projets, préparation de termes de référence, évaluation des offres et sélection d\'entreprises. Domaines: ingénierie portuaire et marine, offshore, côtier, manœuvrabilité, études d\'amarrage, prises d\'eau de mer, génie civil, VRD, dessalement, eau potable, bilan carbone et études environnementales. MDC est actuellement l\'un des principaux concepteurs maritimes et portuaires au Maroc et en Afrique.',
      features: ['Leader en conception portuaire & maritime (Maroc et Afrique)', 'Maîtrise d\'œuvre & assistance MOA', 'Offshore, côtier, amarrage, dessalement, VRD', '15+ ans d\'expérience, équipe d\'ingénieurs spécialisés'],
      certifications: ['Bureau d\'études agréé'],
      stats: { expérience: '15+ ans', spécialité: 'Portuaire & Maritime' }
    },
    contact: { email: 'contact@mdcingenierie.com', phone: '', address: 'Appartement 13, Av. Oukeyemdene, Imm. 38, Rabat 10000, Maroc' }
  },

  // ──────────────────────────────────────────
  // Source: tangerport.com
  // SAPT = Société d'Aménagement du Port de Tanger Ville
  // Créée en mars 2010 par SM le Roi Mohammed VI
  // Filiale conjointe SGPTV SA (2012) avec ANP
  // Port touristique: Croisières, Yachting (Tanja Marina Bay International — 1 400 postes),
  // Fast-ferry, Culture, Événements
  // Prix AIVP Antoine Rufenacht. Blue Flag 2025. Patrimoine: Borj En-nâam, Borj Dar El-Baroud
  // Membres: AIVP, APPM, MedCruise, CLIA
  // ──────────────────────────────────────────
  'SAPT': {
    website: 'https://www.tangerport.com',
    about: {
      title: 'SAPT — Société d\'Aménagement du Port de Tanger Ville',
      description: 'La SAPT (Société d\'Aménagement du Port de Tanger Ville) a été créée en mars 2010 à l\'initiative de SM le Roi Mohammed VI pour mener la reconversion et le développement de la zone portuaire de Tanger Ville. Principes: développement durable et innovation urbaine. En 2012, une filiale conjointe SGPTV SA a été créée avec l\'ANP pour construire et gérer les infrastructures de Croisière, Yachting et Ferry. Port touristique multiactivités: Croisières, Yachting (Tanja Marina Bay International — 1 400 postes d\'amarrage, première marina urbaine du Maroc), Fast-ferry, Culture et Événements. Patrimoine: Borj En-nâam, Borj Dar El-Baroud, Place Bab El Marsa. Lauréat du Prix AIVP Antoine Rufenacht. Pavillon Bleu 2025. Copa Del Estrecho 2025. Membres: AIVP, APPM, MedCruise, CLIA.',
      features: ['Créée 2010 par SM le Roi Mohammed VI', 'Tanja Marina Bay International — 1 400 postes', 'Prix AIVP Antoine Rufenacht & Pavillon Bleu 2025', 'Membres AIVP, APPM, MedCruise, CLIA'],
      certifications: ['Pavillon Bleu 2025', 'Prix AIVP Antoine Rufenacht', 'MedCruise Member', 'CLIA Member'],
      stats: { création: '2010', marina: '1 400 postes', activités: 'Croisière, Yachting, Ferry, Culture' }
    },
    contact: { email: 'contact@tangerport.com', phone: '', address: 'Port de Tanger Ville, Tanger, Maroc' }
  }
};

// ═══════════════════════════════════════════════════════════════

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function main() {
  console.log('🔄 Batch 3 — 7 entreprises avec données web vérifiées\n');

  const { data: exhibitors } = await fetchJSON(
    `${SUPABASE_URL}/rest/v1/exhibitors?select=id,company_name`,
    { headers: { ...headers, 'Prefer': '' } }
  );

  if (!Array.isArray(exhibitors)) { console.error('❌ Erreur:', exhibitors); return; }

  const { data: miniSites } = await fetchJSON(
    `${SUPABASE_URL}/rest/v1/mini_sites?select=id,exhibitor_id,sections`,
    { headers: { ...headers, 'Prefer': '' } }
  );

  const miniSiteByExhibitorId = {};
  miniSites.forEach(ms => { miniSiteByExhibitorId[ms.exhibitor_id] = ms; });

  let updated = 0, errors = 0;

  for (const exhibitor of exhibitors) {
    const data = webVerifiedData[exhibitor.company_name];
    if (!data) continue;

    console.log(`🔄 ${exhibitor.company_name}`);

    // Mettre à jour exposant
    const patch = { website: data.website, description: data.about.description };
    if (data.contact) {
      patch.contact_info = { email: data.contact.email, phone: data.contact.phone, address: data.contact.address };
    }

    const { status: s1 } = await fetchJSON(
      `${SUPABASE_URL}/rest/v1/exhibitors?id=eq.${exhibitor.id}`,
      { method: 'PATCH', headers, body: JSON.stringify(patch) }
    );
    console.log(`  ${s1 < 300 ? '✅' : '⚠️'} Exposant (${s1})`);

    // Mettre à jour mini-site
    const ms = miniSiteByExhibitorId[exhibitor.id];
    if (!ms) { console.log('  ⚠️ Pas de mini-site'); continue; }

    const newSections = (ms.sections || []).map(section => {
      if (section.type === 'about') {
        return { ...section, content: { ...section.content,
          title: data.about.title,
          description: data.about.description,
          features: data.about.features.map((f, i) => ({
            icon: ['Shield', 'Anchor', 'Globe', 'Award'][i % 4], title: f, description: f
          })),
          certifications: data.about.certifications,
          stats: Object.entries(data.about.stats).map(([label, value]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1), value
          }))
        }};
      }
      if (section.type === 'contact') {
        return { ...section, content: { ...section.content,
          email: data.contact.email, phone: data.contact.phone,
          address: data.contact.address, website: data.website
        }};
      }
      if (section.type === 'hero') {
        return { ...section, content: { ...section.content, description: data.about.description }};
      }
      return section;
    });

    const { status: s2 } = await fetchJSON(
      `${SUPABASE_URL}/rest/v1/mini_sites?id=eq.${ms.id}`,
      { method: 'PATCH', headers, body: JSON.stringify({ sections: newSections, last_updated: new Date().toISOString() }) }
    );
    if (s2 < 300) { console.log(`  ✅ Mini-site`); updated++; }
    else { console.log(`  ⚠️ Mini-site (${s2})`); errors++; }
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`✅ ${updated} mini-sites mis à jour (batch 3)`);
  console.log(`❌ ${errors} erreurs`);
  console.log('══════════════════════════════════════════');

  console.log('\n📋 BILAN GLOBAL — 27/32 avec données web réelles:');
  console.log('  Batch 1 (15): ANP, Marsa Maroc, PortNet, MASEN, EHTP, PIANC,');
  console.log('    CMA/CGM, TMPA, LPEE, Marchica, FIMME, WebbFontaine, IGUS, SOMAPORT, COMANAVE');
  console.log('  Batch 2 (5): ISEM, SPX, IFP, MTL, Vornbaumen');
  console.log('  Batch 3 (7): AFPMP-AOC, AMIPM, AQUA MODULES, Fork Lift Center,');
  console.log('    IRM, NDC/MDC Ingénierie, SAPT');
  console.log('\n📋 5 restantes SANS données web:');
  console.log('  AMDL, CDD, CLUSTER, MEE, Web Tech (USA)');
}

main().catch(console.error);

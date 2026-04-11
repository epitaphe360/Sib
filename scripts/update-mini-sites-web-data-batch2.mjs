#!/usr/bin/env node
/**
 * Batch 2: Met à jour les mini-sites avec les données vérifiées du web (session 2).
 * Sources:
 *   - ISEM: isem.ac.ma
 *   - SPX: spx.com/about
 *   - IFP: fr.wikipedia.org/wiki/IFP_Énergies_nouvelles
 *   - MTL: mtlmaritime.com (URL fournie par utilisateur)
 *   - Vornbaumen: vornbaeumen.de (URL fournie par utilisateur)
 * 
 * Entreprises NON TROUVÉES sur le web (aucune donnée inventée):
 *   AFPMP-AOC, AMDL (gov.ma inaccessible), AMIPM, AQUA MODULES,
 *   CDD, CLUSTER (inaccessible), Fork Lift Center, IRM (inaccessible),
 *   MEE, NDC (Khalid Lazrak), SAPT (inaccessible), Web Tech
 */

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';
const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// ═══════════════════════════════════════════════════════════════
// DONNÉES WEB VÉRIFIÉES — BATCH 2
// ═══════════════════════════════════════════════════════════════

const webVerifiedData = {
  // ──────────────────────────────────────────
  // Source: isem.ac.ma (vérifié 13/02/2026)
  // Directeur: M. Mohamed Briouig
  // Maritime Days 2025/2026, Coopération Fulbright, Formation VTS
  // ──────────────────────────────────────────
  'ISEM': {
    website: 'https://www.isem.ac.ma',
    about: {
      title: 'ISEM — Institut Supérieur d\'Études Maritimes',
      description: 'L\'ISEM forme les officiers de la marine marchande en s\'appuyant sur des valeurs d\'excellence et d\'interdisciplinarité. Son système de formation a contribué à l\'inscription du Maroc sur la liste blanche de l\'Organisation Maritime Internationale (OMI) et à la reconnaissance des brevets marocains par la Commission Européenne. L\'ISEM est certifié ISO 9001 version 2015. Directeur: M. Mohamed Briouig. Coopération active avec Fulbright Morocco (Architecture Navale) et formation VTS.',
      features: ['Maroc sur liste blanche OMI', 'Brevets reconnus par la Commission Européenne', 'Certifié ISO 9001:2015', 'Coopération Fulbright Morocco — Architecture Navale'],
      certifications: ['ISO 9001:2015', 'Liste blanche OMI', 'Reconnaissance CE'],
      stats: { certification: 'ISO 9001:2015', reconnaissance: 'OMI + CE' }
    },
    contact: { email: 'contactsdg@isem.ac.ma', phone: '+212 522 99 00 69', address: 'KM 7, Route d\'El Jadida, Casablanca, Maroc' }
  },

  // ──────────────────────────────────────────
  // Source: spx.com/about (vérifié 13/02/2026)
  // NYSE: SPXC, Charlotte NC, $2B revenue, 4400 employees, 16 countries
  // ──────────────────────────────────────────
  'SPX (ESP)': {
    website: 'https://www.spx.com',
    about: {
      title: 'SPX Technologies — Engineered Infrastructure Solutions',
      description: 'SPX Technologies (NYSE: SPXC) est un fournisseur mondial diversifié d\'équipements d\'infrastructure, basé à Charlotte (Caroline du Nord, USA). Avec environ 2 milliards USD de chiffre d\'affaires annuel et 4 400 employés dans 16 pays, SPX offre des solutions HVAC (tours de refroidissement, chaudières, chauffage) et des produits de détection et mesure (localisateurs souterrains, systèmes de billettique, technologies de communication, éclairage spécialisé). Fondée en 1912.',
      features: ['NYSE: SPXC — fondée en 1912', '~$2 Mds USD de CA, 4 400 employés', 'HVAC: tours de refroidissement, chaudières, chauffage', 'Détection & mesure: localisateurs, billettique, communication'],
      certifications: ['NYSE Listed (SPXC)', 'ISO 9001'],
      stats: { fondation: '1912', CA: '~$2 Mds USD', employés: '4 400', pays: '16' }
    },
    contact: { email: 'info@spx.com', phone: '+1 980 474 3700', address: 'Charlotte, North Carolina, USA' }
  },

  // ──────────────────────────────────────────
  // Source: fr.wikipedia.org/wiki/IFP_Énergies_nouvelles (vérifié 13/02/2026)
  // Fondé 1919 Pechelbronn, Rueil-Malmaison, ~1700 employés, 132M€ budget
  // Yves Chauvin Nobel 2005, EPIC, maison-mère d'Axens
  // ──────────────────────────────────────────
  'IFP': {
    website: 'https://www.ifpenergiesnouvelles.fr',
    about: {
      title: 'IFP Énergies Nouvelles — Recherche & Innovation Énergie',
      description: 'IFP Énergies nouvelles (IFPEN) est un établissement public à caractère industriel et commercial (EPIC), fondé en 1919 à Pechelbronn (Bas-Rhin). Basé à Rueil-Malmaison près de Paris, avec des sites à Lyon et Pau. Environ 1 700 employés et un budget de 132 millions d\'euros. L\'institut travaille sur les transports propres, les biocarburants, le captage/stockage CO2, les éoliennes offshore flottantes et l\'hydrogène. Yves Chauvin, chercheur IFPEN, co-lauréat du Prix Nobel de Chimie 2005. Maison-mère d\'Axens.',
      features: ['Fondé 1919, EPIC — 1 700 employés', 'Budget 132M€, sites Paris/Lyon/Pau', 'Biocarburants, captage CO2, éolien offshore, H2', 'Nobel Chimie 2005 (Yves Chauvin), maison-mère Axens'],
      certifications: ['EPIC (Établissement Public)', 'Horizon 2020'],
      stats: { fondation: '1919', employés: '~1 700', budget: '132M€' }
    },
    contact: { email: 'contact@ifpenergiesnouvelles.fr', phone: '+33 1 47 52 60 00', address: '1-4 Avenue de Bois-Préau, 92852 Rueil-Malmaison, France' }
  },

  // ──────────────────────────────────────────
  // Source: mtlmaritime.com (URL fournie par utilisateur)
  // MTL Maritime Transportation & Logistics Inc.
  // Services: Spares Handling, Crew Transportation, US Customs, Warehousing, Freight Forwarding, CTM
  // ──────────────────────────────────────────
  'MTL': {
    website: 'https://mtlmaritime.com',
    about: {
      title: 'MTL — Maritime Transportation & Logistics Inc.',
      description: 'MTL Maritime Transportation & Logistics Inc. est une entreprise spécialisée dans les services de transport maritime et logistique. Ses services incluent: la manutention et livraison de pièces de rechange (Spares Handling & Delivery), le transport d\'équipages (Crew Transportation), les services douaniers US (U.S. Customs Services), l\'entreposage (Warehousing Services), le transit de marchandises (Freight Forwarding) et la livraison CTM (Cash To Master). Dispose d\'une flotte dédiée.',
      features: ['Spares Handling & Delivery', 'Crew Transportation & U.S. Customs Services', 'Warehousing & Freight Forwarding', 'CTM Delivery (Cash To Master)'],
      certifications: ['Licensed US Customs Broker'],
      stats: { services: '6 services maritimes' }
    },
    contact: { email: 'Operations@mtlmaritime.com', phone: '', address: 'USA' }
  },

  // ──────────────────────────────────────────
  // Source: vornbaeumen.de (URL fournie par utilisateur)
  // VORNBÄUMEN Stahlseile GmbH & Co. KG + VORNBÄUMEN Draht GmbH & Co. KG
  // Fondée 1889, Bad Iburg, Allemagne — câbles pour industrie portuaire
  // ──────────────────────────────────────────
  'Vornbaumen (GER)': {
    website: 'https://www.vornbaeumen.de',
    about: {
      title: 'VORNBÄUMEN — Câbles en Acier & Fils depuis 1889',
      description: 'VORNBÄUMEN, fondée en 1889 par Johannes et Wilhelm Vornbäumen à Bad Iburg (Allemagne), développe et produit des câbles en acier (Stahlseile), des fils (Drähte) et des composants système sur mesure (spirales, boîtiers push-pull, têtes de câble). Spécialisée dans l\'industrie portuaire: câbles pour grues à conteneurs (STS), grues portuaires, grues offshore, portiques (RTG/RMG) et chariots cavaliers (straddle carriers). Aussi active dans la construction, l\'industrie lourde, l\'alpin et les micro-câbles. Gammes de câbles: VS 8-9 CP, VS 8-7 CP, VS 6-2 CP, VS 16-5 C, etc. (norme EN-12385-3). Deux entités: VORNBÄUMEN Stahlseile GmbH & Co. KG et VORNBÄUMEN Draht GmbH & Co. KG. Plus de 135 ans d\'expérience. Exposant TOC Africa 2025 et TOC Europe 2025 Rotterdam.',
      features: ['Fondée 1889 à Bad Iburg — plus de 135 ans', 'Câbles pour grues STS, portuaires, offshore, RTG/RMG', 'Fils, spirales, boîtiers push-pull, têtes de câble', 'Exposant TOC Africa 2025 & TOC Europe 2025 Rotterdam'],
      certifications: ['EN-12385-3', 'Normes européennes câbles acier'],
      stats: { fondation: '1889', expérience: '135+ ans', spécialités: 'Wire Ropes & Wires' }
    },
    contact: { email: 'info@vornbaeumen.de', phone: '+49 5403 4009-0', address: 'Münsterstraße 41, 49186 Bad Iburg, Germany' }
  }
};

// ═══════════════════════════════════════════════════════════════
// MISE À JOUR EN BASE DE DONNÉES
// ═══════════════════════════════════════════════════════════════

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function main() {
  console.log('🔄 Batch 2 — Mise à jour avec données web vérifiées\n');

  const { data: exhibitors } = await fetchJSON(
    `${SUPABASE_URL}/rest/v1/exhibitors?select=id,company_name,website,contact_info,description`,
    { headers: { ...headers, 'Prefer': '' } }
  );

  if (!Array.isArray(exhibitors)) {
    console.error('❌ Erreur:', exhibitors);
    return;
  }

  const { data: miniSites } = await fetchJSON(
    `${SUPABASE_URL}/rest/v1/mini_sites?select=id,exhibitor_id,sections`,
    { headers: { ...headers, 'Prefer': '' } }
  );

  const miniSiteByExhibitorId = {};
  miniSites.forEach(ms => { miniSiteByExhibitorId[ms.exhibitor_id] = ms; });

  let updated = 0, errors = 0;

  for (const exhibitor of exhibitors) {
    const name = exhibitor.company_name;
    const data = webVerifiedData[name];
    if (!data) continue;

    console.log(`🔄 ${name}`);

    // Mettre à jour exposant
    const exhibitorUpdate = {};
    if (data.website) exhibitorUpdate.website = data.website;
    if (data.contact) {
      exhibitorUpdate.contact_info = {
        email: data.contact.email,
        phone: data.contact.phone,
        address: data.contact.address
      };
    }
    if (data.about?.description) {
      exhibitorUpdate.description = data.about.description;
    }

    const { status: exhStatus } = await fetchJSON(
      `${SUPABASE_URL}/rest/v1/exhibitors?id=eq.${exhibitor.id}`,
      { method: 'PATCH', headers, body: JSON.stringify(exhibitorUpdate) }
    );
    console.log(`  ${exhStatus < 300 ? '✅' : '⚠️'} Exposant (${exhStatus})`);

    // Mettre à jour mini-site
    const ms = miniSiteByExhibitorId[exhibitor.id];
    if (!ms) { console.log('  ⚠️ Pas de mini-site'); continue; }

    const newSections = (ms.sections || []).map(section => {
      if (section.type === 'about' && data.about) {
        return {
          ...section,
          content: {
            ...section.content,
            title: data.about.title,
            description: data.about.description,
            features: data.about.features.map((f, i) => ({
              icon: ['Shield', 'Anchor', 'Globe', 'Award'][i % 4],
              title: f, description: f
            })),
            certifications: data.about.certifications,
            stats: data.about.stats ? Object.entries(data.about.stats).map(([label, value]) => ({
              label: label.charAt(0).toUpperCase() + label.slice(1), value
            })) : section.content?.stats
          }
        };
      }
      if (section.type === 'contact' && data.contact) {
        return { ...section, content: { ...section.content, email: data.contact.email, phone: data.contact.phone, address: data.contact.address, website: data.website } };
      }
      if (section.type === 'hero' && data.about) {
        return { ...section, content: { ...section.content, description: data.about.description } };
      }
      return section;
    });

    const { status: msStatus } = await fetchJSON(
      `${SUPABASE_URL}/rest/v1/mini_sites?id=eq.${ms.id}`,
      { method: 'PATCH', headers, body: JSON.stringify({ sections: newSections, last_updated: new Date().toISOString() }) }
    );
    
    if (msStatus < 300) { console.log(`  ✅ Mini-site`); updated++; }
    else { console.log(`  ⚠️ Mini-site (${msStatus})`); errors++; }
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`✅ ${updated} mini-sites mis à jour (batch 2)`);
  console.log(`❌ ${errors} erreurs`);
  console.log('══════════════════════════════════════════');
  console.log('\n📋 BILAN COMPLET — Exposants avec données web VÉRIFIÉES:');
  console.log('  Batch 1 (15): ANP, Marsa Maroc, PortNet, MASEN, EHTP, PIANC,');
  console.log('    CMA/CGM, TMPA, LPEE, Marchica, FIMME, WebbFontaine, IGUS, SOMAPORT, COMANAVE');
  console.log('  Batch 2 (5): ISEM, SPX, IFP, MTL, Vornbaumen');
  console.log('  TOTAL: 20/32 avec données web réelles\n');
  console.log('📋 SANS données web (sites inaccessibles ou inexistants):');
  console.log('  AFPMP-AOC, AMDL, AMIPM, AQUA MODULES, CDD, CLUSTER,');
  console.log('  Fork Lift Center, IRM, MEE, NDC, SAPT, Web Tech');
  console.log('  → 12 entreprises conservent les descriptions initiales (non inventées)');
}

main().catch(console.error);

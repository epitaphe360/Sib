#!/usr/bin/env node
/**
 * Batch 4: Mise à jour avec données web vérifiées — 2 entreprises
 * Sources (URLs fournies par utilisateur):
 *   - CLUSTER → NYMAR: nymar.org (New York Maritime, Inc.)
 *   - MEE → MEE Shipping Services LLC: meeshippingllc.com
 *
 * Web Tech (USA): Non concluant — conserve les données initiales.
 * Cela porte le total à 29/32. Restent SANS données: AMDL, CDD, Web Tech.
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
  // Source: nymar.org
  // New York Maritime, Inc. (NYMAR) — "The Capital for Shipping"
  // 250+ shipping companies. Port de NY = 3e plus grand en Amérique du Nord.
  // Membres: armateurs, institutions financières, cabinets d'avocats, assurance, courtage, arbitrage
  // Partenaires: AMSI, Capital Link. Événements: NYMAR at Gallaghers, HACC NACC Shipping Conference
  // ──────────────────────────────────────────
  'CLUSTER': {
    website: 'https://nymar.org',
    about: {
      title: 'NYMAR — New York Maritime, Inc. « The Capital for Shipping »',
      description: 'New York Maritime, Inc. (NYMAR) est le cluster maritime de New York, fédérant plus de 250 compagnies maritimes. Le Port de New York est le 3e plus grand d\'Amérique du Nord et le plus actif de la côte Est — premier port américain pour les produits pétroliers raffinés et l\'import/export automobile. NYMAR représente un réseau diversifié: armateurs, logisticiens, opérateurs portuaires, cabinets d\'avocats, institutions financières, assureurs, courtiers et sociétés d\'arbitrage. Depuis 1609 et l\'arrivée de Henry Hudson, New York est au cœur du commerce maritime mondial. NYMAR organise des événements réguliers: « NYMAR at Gallaghers » avec Maritime TV, conférences HACC NACC Shipping, réceptions de networking et Propeller Club events. New York reste le centre financier mondial du shipping avec plus de compagnies maritimes cotées en bourse que toute autre place financière.',
      features: ['250+ compagnies maritimes membres', 'Port de NY: 3e d\'Amérique du Nord, 1er côte Est', 'Événements: NYMAR at Gallaghers, HACC NACC', 'Centre mondial: finance, arbitrage, assurance maritime'],
      certifications: ['NYMAR Member Network'],
      stats: { membres: '250+ entreprises', port: '3e Amérique du Nord' }
    },
    contact: { email: 'info@nymar.org', phone: '', address: 'New York, USA' }
  },

  // ──────────────────────────────────────────
  // Source: meeshippingllc.com
  // MEE Shipping Services LLC — FMC Licensed NVOCC & Freight Forwarder
  // Basé à Raleigh, North Carolina. Connexion USA → Afrique de l'Ouest
  // Services: Ro-Ro (Grimaldi/ACL, Sallaum Lines), Container (Maersk, MSC, CMA CGM),
  //   Inland Towing (Copart, IAA, Manheim), Vehicle Dispatch, Customs Clearance
  // Ports Afrique: Lagos, Cotonou, Lomé, Tema, Dakar
  // ──────────────────────────────────────────
  'MEE': {
    website: 'https://meeshippingllc.com',
    about: {
      title: 'MEE Shipping Services LLC — NVOCC & Freight Forwarder',
      description: 'MEE Shipping Services LLC, basé à Raleigh (Caroline du Nord, USA), est un transitaire et NVOCC (Non-Vessel Operating Common Carrier) licencié par la Federal Maritime Commission (FMC). Spécialiste de la connexion USA–Afrique de l\'Ouest, MEE assure le transport maritime vers les principaux ports africains: Lagos, Cotonou, Lomé, Tema et Dakar. Services: expédition Ro-Ro (partenaires Grimaldi/ACL et Sallaum Lines), transport par conteneurs (Maersk, MSC, CMA CGM, Grimaldi/ACL), remorquage intérieur (depuis les enchères Copart, IAA, Manheim), expédition de véhicules (Vehicle Dispatch) et dédouanement (Customs Clearance). Valeurs: excellence, fiabilité, transparence.',
      features: ['FMC Licensed NVOCC & Freight Forwarder', 'Ro-Ro: Grimaldi/ACL, Sallaum Lines', 'Conteneurs: Maersk, MSC, CMA CGM', 'Ports Afrique: Lagos, Cotonou, Lomé, Tema, Dakar'],
      certifications: ['FMC Licensed NVOCC', 'FMC Licensed Freight Forwarder'],
      stats: { siège: 'Raleigh, NC, USA', spécialité: 'USA → Afrique de l\'Ouest' }
    },
    contact: { email: 'info@meeshippingllc.com', phone: '+1 919 931 7507', address: 'Raleigh, North Carolina, USA' }
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
  console.log('🔄 Batch 4 — 2 entreprises avec données web vérifiées\n');

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

    const patch = { website: data.website, description: data.about.description };
    if (data.contact) {
      patch.contact_info = { email: data.contact.email, phone: data.contact.phone, address: data.contact.address };
    }

    const { status: s1 } = await fetchJSON(
      `${SUPABASE_URL}/rest/v1/exhibitors?id=eq.${exhibitor.id}`,
      { method: 'PATCH', headers, body: JSON.stringify(patch) }
    );
    console.log(`  ${s1 < 300 ? '✅' : '⚠️'} Exposant (${s1})`);

    const ms = miniSiteByExhibitorId[exhibitor.id];
    if (!ms) { console.log('  ⚠️ Pas de mini-site'); continue; }

    const newSections = (ms.sections || []).map(section => {
      if (section.type === 'about') {
        return { ...section, content: { ...section.content,
          title: data.about.title, description: data.about.description,
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
  console.log(`✅ ${updated} mini-sites mis à jour (batch 4)`);
  console.log(`❌ ${errors} erreurs`);
  console.log('══════════════════════════════════════════');

  console.log('\n📋 BILAN FINAL — 29/32 avec données web réelles:');
  console.log('  Batch 1 (15): ANP, Marsa Maroc, PortNet, MASEN, EHTP, PIANC,');
  console.log('    CMA/CGM, TMPA, LPEE, Marchica, FIMME, WebbFontaine, IGUS, SOMAPORT, COMANAVE');
  console.log('  Batch 2 (5): ISEM, SPX, IFP, MTL, Vornbaumen');
  console.log('  Batch 3 (7): AFPMP-AOC, AMIPM, AQUA MODULES, Fork Lift Center, IRM, NDC/MDC, SAPT');
  console.log('  Batch 4 (2): CLUSTER/NYMAR, MEE Shipping');
  console.log('\n📋 3 restantes SANS données web concluantes:');
  console.log('  AMDL (site gov.ma inaccessible), CDD, Web Tech (trop générique)');
}

main().catch(console.error);

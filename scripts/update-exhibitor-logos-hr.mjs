// Script de mise à jour des logos haute résolution
// Remplace les favicons Google 128px par des logos directs trouvés sur les sites web
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Logos haute résolution vérifiés - provenant directement des sites web ou Wikimedia Commons
// Remplacent les favicons Google 128px
const hrLogos = [
  {
    company_name: 'ANP',
    logo_url: 'https://www.ehtp.ac.ma/wp-content/uploads/2022/03/anp.png',
    source: 'EHTP partner page (direct PNG)'
  },
  {
    company_name: 'EHTP',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/%C3%89cole_Hassania_des_Travaux_Publics_Logo.png',
    source: 'Wikimedia Commons (1024x237px PNG)'
  },
  {
    company_name: 'WebbFontaine',
    logo_url: 'https://webbfontaine.com/hubfs/raw_assets/public/assets/images/logo_dark.svg',
    source: 'Site officiel (SVG vectoriel)'
  }
];

async function updateLogos() {
  console.log('=== Mise à jour logos haute résolution ===\n');
  
  let updated = 0;
  let errors = 0;
  
  for (const entry of hrLogos) {
    console.log(`📷 ${entry.company_name}`);
    console.log(`   Source: ${entry.source}`);
    console.log(`   URL: ${entry.logo_url}`);
    
    // Chercher l'exposant par nom (partiel)
    const { data: exhibitors, error: searchError } = await supabase
      .from('exhibitors')
      .select('id, company_name, logo_url')
      .ilike('company_name', `%${entry.company_name}%`);
    
    if (searchError || !exhibitors || exhibitors.length === 0) {
      console.log(`   ❌ Exposant non trouvé`);
      errors++;
      continue;
    }
    
    const exhibitor = exhibitors[0];
    const oldLogo = exhibitor.logo_url || '(vide)';
    
    // Mettre à jour le logo
    const { error: updateError } = await supabase
      .from('exhibitors')
      .update({ logo_url: entry.logo_url })
      .eq('id', exhibitor.id);
    
    if (updateError) {
      console.log(`   ❌ Erreur: ${updateError.message}`);
      errors++;
    } else {
      console.log(`   ✅ ${exhibitor.company_name} - Logo mis à jour`);
      console.log(`   Ancien: ${oldLogo.substring(0, 60)}...`);
      console.log(`   Nouveau: ${entry.logo_url.substring(0, 60)}...`);
      updated++;
    }
    console.log('');
  }
  
  console.log('=== Résumé ===');
  console.log(`✅ ${updated} logos mis à jour en haute résolution`);
  console.log(`❌ ${errors} erreurs`);
  console.log('');
  
  // Afficher le bilan complet des logos
  console.log('=== Bilan complet des logos ===');
  const { data: all } = await supabase
    .from('exhibitors')
    .select('company_name, logo_url')
    .order('company_name');
  
  let directCount = 0;
  let wikiCount = 0;
  let faviconCount = 0;
  let emptyCount = 0;
  
  for (const ex of all) {
    const url = ex.logo_url || '';
    let type = '';
    if (!url) {
      type = '🔴 AUCUN';
      emptyCount++;
    } else if (url.includes('wikimedia.org') || url.includes('wikipedia.org')) {
      type = '🟢 Wikimedia';
      wikiCount++;
    } else if (url.includes('google.com/s2/favicons')) {
      type = '🟡 Favicon 128px';
      faviconCount++;
    } else {
      type = '🟢 Direct HR';
      directCount++;
    }
    console.log(`  ${type} | ${ex.company_name}`);
  }
  
  console.log('');
  console.log(`🟢 Direct HR: ${directCount}`);
  console.log(`🟢 Wikimedia: ${wikiCount}`);
  console.log(`🟡 Favicon: ${faviconCount}`);
  console.log(`🔴 Aucun: ${emptyCount}`);
  console.log(`Total: ${all.length}`);
}

updateLogos().catch(console.error);

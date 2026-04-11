/**
 * Script pour corriger les logos des partenaires en base de données
 * Remplace les logo_url NULL ou inaccessibles par des logos fonctionnels
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Mapping des logos connus et fiables pour chaque partenaire
const PARTNER_LOGOS = {
  "Ministère de l'Équipement et de l'Eau": 
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Coat_of_arms_of_Morocco.svg/200px-Coat_of_arms_of_Morocco.svg.png',
  "Ministère du Transport et de la Logistique":
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Coat_of_arms_of_Morocco.svg/200px-Coat_of_arms_of_Morocco.svg.png',
  "Agence Nationale des Ports (ANP)":
    'https://ui-avatars.com/api/?name=ANP&size=200&background=0D47A1&color=fff&bold=true&font-size=0.4',
  "PIANC - The World Association for Waterborne Transport Infrastructure":
    'https://ui-avatars.com/api/?name=PIANC&size=200&background=1565C0&color=fff&bold=true&font-size=0.33',
  "Réseau des Femmes Professionnelles Maritimes et Portuaires de l'Afrique de l'Ouest et du Centre (RFPMP-AOC)":
    'https://ui-avatars.com/api/?name=RFPMP&size=200&background=7B1FA2&color=fff&bold=true&font-size=0.33',
  "Fédération des Industries Métallurgiques, Mécaniques et Électromécaniques (FIMME)":
    'https://ui-avatars.com/api/?name=FIMME&size=200&background=E65100&color=fff&bold=true&font-size=0.33',
  "Club Des Dirigeants (CDD)":
    'https://ui-avatars.com/api/?name=CDD&size=200&background=1B5E20&color=fff&bold=true&font-size=0.4',
  "École Royale Navale (ERN)":
    'https://ui-avatars.com/api/?name=ERN&size=200&background=0D47A1&color=fff&bold=true&font-size=0.4',
  "Association ARKANE - Pour la Promotion de l'Art et la Sauvegarde du Patrimoine":
    'https://ui-avatars.com/api/?name=ARKANE&size=200&background=4A148C&color=fff&bold=true&font-size=0.33',
  "Musee.Ma - Plateforme des Musées du Maroc":
    'https://ui-avatars.com/api/?name=Musee.Ma&size=200&background=BF360C&color=fff&bold=true&font-size=0.28',
  "Association Marocaine de l'Ingénierie Portuaire et Maritime (AMIPM)":
    'https://ui-avatars.com/api/?name=AMIPM&size=200&background=006064&color=fff&bold=true&font-size=0.33',
  "Gendarmerie Royale Marocaine":
    'https://ui-avatars.com/api/?name=GRM&size=200&background=263238&color=fff&bold=true&font-size=0.4',
  "Institut Supérieur d'Études Maritimes (ISEM)":
    'https://ui-avatars.com/api/?name=ISEM&size=200&background=01579B&color=fff&bold=true&font-size=0.4',
};

async function fixPartnerLogos() {
  console.log('🖼️  Mise à jour des logos partenaires...\n');

  const { data: partners, error } = await supabase
    .from('partners')
    .select('id, company_name, logo_url');

  if (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (const partner of partners) {
    // Chercher un logo dans notre mapping
    const newLogo = PARTNER_LOGOS[partner.company_name];
    
    if (!newLogo) {
      // Générer un fallback via ui-avatars avec les initiales
      const initials = partner.company_name
        .replace(/[^A-Za-zÀ-ÿ\s]/g, '')
        .split(' ')
        .filter(w => w.length > 2 || w[0] === w[0]?.toUpperCase())
        .map(w => w.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);

      const colors = ['0D47A1', '1565C0', '7B1FA2', 'E65100', '1B5E20', '006064', '4A148C', 'BF360C', '263238', '880E4F'];
      const colorIdx = partner.company_name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
      
      const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=${colors[colorIdx]}&color=fff&bold=true&font-size=0.35`;
      
      const { error: updateError } = await supabase
        .from('partners')
        .update({ logo_url: fallbackLogo })
        .eq('id', partner.id);

      if (updateError) {
        console.log(`   ❌ ${partner.company_name}: ${updateError.message}`);
      } else {
        console.log(`   ✅ ${partner.company_name} → ${initials} (généré)`);
        updated++;
      }
      continue;
    }

    const { error: updateError } = await supabase
      .from('partners')
      .update({ logo_url: newLogo })
      .eq('id', partner.id);

    if (updateError) {
      console.log(`   ❌ ${partner.company_name}: ${updateError.message}`);
    } else {
      console.log(`   ✅ ${partner.company_name} → logo mis à jour`);
      updated++;
    }
  }

  console.log(`\n✅ Terminé : ${updated} logos mis à jour, ${skipped} ignorés`);
}

fixPartnerLogos();

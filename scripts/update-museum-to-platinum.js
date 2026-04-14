import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMuseumToPlatinum() {
  console.log('🔄 Mise à jour des textes du partenaire Platinum...\n');

  try {
    // 1. Trouver l'utilisateur platinum
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'partner-platinium@test.sib2026.ma')
      .single();

    if (userError || !user) {
      console.error('❌ Utilisateur platinum non trouvé:', userError?.message);
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.email}`);

    // 2. Mettre à jour le partenaire (juste les textes)
    const { error: partnerError } = await supabase
      .from('partners')
      .update({
        company_name: 'Consulting Port Platine',
        partner_type: 'consulting',
        sector: 'Maritime Consulting',
        description: 'Consulting Port Platine - Niveau platinum - Innovation stratégique et conseil maritime de haut niveau'
      })
      .eq('user_id', user.id);

    if (partnerError) {
      console.error('❌ Erreur mise à jour partner:', partnerError.message);
      return;
    }

    console.log('✅ Profil partner mis à jour');

    // 3. Vérifier le résultat
    const { data: updatedPartner } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('\n📋 Profil Platinum mis à jour:');
    console.log(`  Entreprise: ${updatedPartner.company_name}`);
    console.log(`  Type: ${updatedPartner.partner_type}`);
    console.log(`  Secteur: ${updatedPartner.sector}`);
    console.log(`  Niveau: ${updatedPartner.partnership_level}`);
    console.log(`  Description: ${updatedPartner.description}`);

    console.log('\n✅ Mise à jour textes Platinum terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateMuseumToPlatinum();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('\n=== Vérification des données Supabase ===\n');

  try {
    // Vérifier les exposants
    console.log('1. Vérifier les exposants:');
    const { data: exhibitors, error: exError } = await supabase
      .from('exhibitors')
      .select('id, user_id, company_name, category, sector');
    
    if (exError) {
      console.error('❌ Erreur:', exError.message);
    } else {
      console.log(`✅ Nombre d'exposants: ${exhibitors?.length || 0}`);
      if (exhibitors && exhibitors.length > 0) {
        exhibitors.slice(0, 3).forEach(ex => {
          console.log(`   - ${ex.company_name} (${ex.category}, ${ex.sector})`);
        });
      }
    }

    // Vérifier les partenaires
    console.log('\n2. Vérifier les partenaires:');
    const { data: partners, error: pError } = await supabase
      .from('partners')
      .select('id, user_id, company_name, partner_type, partnership_level');
    
    if (pError) {
      console.error('❌ Erreur:', pError.message);
    } else {
      console.log(`✅ Nombre de partenaires: ${partners?.length || 0}`);
      if (partners && partners.length > 0) {
        partners.slice(0, 3).forEach(p => {
          console.log(`   - ${p.company_name} (${p.partner_type}, ${p.partnership_level})`);
        });
      }
    }

    // Vérifier les utilisateurs
    console.log('\n3. Vérifier les utilisateurs:');
    const { data: users, error: uError } = await supabase
      .from('users')
      .select('id, email, name, type');
    
    if (uError) {
      console.error('❌ Erreur:', uError.message);
    } else {
      console.log(`✅ Nombre d'utilisateurs: ${users?.length || 0}`);
      const exhibitorUsers = users?.filter(u => u.type === 'exhibitor').length || 0;
      const partnerUsers = users?.filter(u => u.type === 'partner').length || 0;
      console.log(`   - Exposants: ${exhibitorUsers}`);
      console.log(`   - Partenaires: ${partnerUsers}`);
    }

    // Vérifier les schema info
    console.log('\n4. Tables disponibles:');
    const { data: tables, error: tError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tError) {
      console.log('   (Impossible de lister, mais on peut tester directement)');
    } else {
      tables?.forEach(t => console.log(`   - ${t.table_name}`));
    }

  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

checkData();

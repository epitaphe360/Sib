import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateData() {
  console.log('\n=== Population des tables exhibitors et partners ===\n');

  try {
    // Étape 1: Récupérer tous les exposants
    console.log('1️⃣  Récupération des exposants...');
    const { data: exhibitorUsers, error: exError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('type', 'exhibitor');

    if (exError) {
      console.error('❌ Erreur:', exError.message);
      return;
    }

    console.log(`✅ ${exhibitorUsers?.length || 0} exposants trouvés`);

    // Étape 2: Créer les enregistrements exhibitors
    if (exhibitorUsers && exhibitorUsers.length > 0) {
      console.log('\n2️⃣  Création des enregistrements exhibitors...');
      
      const exhibitors = exhibitorUsers.map(u => ({
        user_id: u.id,
        company_name: u.name,
        category: 'port-industry',
        sector: 'Maritime Services',
        description: `${u.name} - Maritime services company`,
        contact_info: { email: u.email, phone: '+212 6 00 00 00 00', name: u.name },
        verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Faire des insertions par batch de 100
      for (let i = 0; i < exhibitors.length; i += 100) {
        const batch = exhibitors.slice(i, i + 100);
        const { error: insertError } = await supabase
          .from('exhibitors')
          .insert(batch);

        if (insertError) {
          console.error(`❌ Erreur batch ${i}-${i + 100}:`, insertError.message);
        } else {
          console.log(`✅ ${batch.length} exhibitors insérés (batch ${Math.floor(i / 100) + 1})`);
        }
      }
    }

    // Étape 3: Récupérer tous les partenaires
    console.log('\n3️⃣  Récupération des partenaires...');
    const { data: partnerUsers, error: pError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('type', 'partner');

    if (pError) {
      console.error('❌ Erreur:', pError.message);
      return;
    }

    console.log(`✅ ${partnerUsers?.length || 0} partenaires trouvés`);

    // Étape 4: Créer les enregistrements partners
    if (partnerUsers && partnerUsers.length > 0) {
      console.log('\n4️⃣  Création des enregistrements partners...');
      
      const partners = partnerUsers.map(u => {
        const email = u.email.toLowerCase();
        let level = 'silver';
        let type = 'corporate';
        
        if (email.includes('gold')) {
          level = 'gold';
          type = 'corporate';
        } else if (email.includes('platinium') || email.includes('platinum')) {
          level = 'platinium';
          type = 'corporate';
        } else if (email.includes('museum')) {
          level = 'museum';
          type = 'cultural';
        } else if (email.includes('porttech')) {
          level = 'gold';
          type = 'tech';
        } else if (email.includes('oceanfreight')) {
          type = 'logistics';
        } else if (email.includes('coastal')) {
          type = 'services';
        }
        
        return {
          user_id: u.id,
          company_name: u.name,
          partner_type: type,
          partnership_level: level,
          sector: 'General',
          description: `${u.name} - Strategic partnership`,
          contact_info: { email: u.email, phone: '+212 6 00 00 00 00', name: u.name },
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      // Faire des insertions par batch de 100
      for (let i = 0; i < partners.length; i += 100) {
        const batch = partners.slice(i, i + 100);
        const { error: insertError } = await supabase
          .from('partners')
          .insert(batch);

        if (insertError) {
          console.error(`❌ Erreur batch ${i}-${i + 100}:`, insertError.message);
        } else {
          console.log(`✅ ${batch.length} partners insérés (batch ${Math.floor(i / 100) + 1})`);
        }
      }
    }

    // Étape 5: Vérification finale
    console.log('\n5️⃣  Vérification finale...');
    const { data: finalEx } = await supabase
      .from('exhibitors')
      .select('count()');
    const { data: finalPart } = await supabase
      .from('partners')
      .select('count()');

    console.log(`\n✅ Total exhibitors créés: ${finalEx?.length || 0}`);
    console.log(`✅ Total partners créés: ${finalPart?.length || 0}`);

  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

populateData();

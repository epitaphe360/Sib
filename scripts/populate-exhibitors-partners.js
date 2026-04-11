import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('\n=== Exécution de la migration pour Exhibitors et Partners ===\n');

  try {
    // Lecture du fichier SQL
    const sqlPath = path.join(
      import.meta.url.replace('file://', ''),
      '../supabase/migrations/20251225000004_populate_exhibitors_partners.sql'
    );
    
    // Sinon, on exécute directement via SQL brut
    const sql = `
-- Delete existing data to avoid duplicates
DELETE FROM public.exhibitors WHERE user_id IN (
  SELECT id FROM public.users WHERE type = 'exhibitor' AND email LIKE '%@test.siport.com'
);

DELETE FROM public.partners WHERE user_id IN (
  SELECT id FROM public.users WHERE type = 'partner' AND email LIKE '%@test.siport.com'
);

-- Create exhibitors from users with type='exhibitor'
INSERT INTO public.exhibitors (user_id, company_name, category, sector, description, contact_info, created_at, updated_at)
SELECT 
  u.id,
  u.name,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'port-industry'::exhibitor_category
    WHEN u.email LIKE '%-36m%' THEN 'port-operations'::exhibitor_category
    WHEN u.email LIKE '%-18m%' THEN 'port-industry'::exhibitor_category
    WHEN u.email LIKE '%-9m%' THEN 'port-operations'::exhibitor_category
    ELSE 'port-industry'::exhibitor_category
  END as category,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'Technology'
    WHEN u.email LIKE '%-36m%' THEN 'Automation'
    WHEN u.email LIKE '%-18m%' THEN 'Equipment'
    WHEN u.email LIKE '%-9m%' THEN 'IoT'
    ELSE 'Technology'
  END as sector,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'Leader in maritime automation and port technology solutions'
    WHEN u.email LIKE '%-36m%' THEN 'Cutting-edge automation systems for modern ports'
    WHEN u.email LIKE '%-18m%' THEN 'Premium maritime equipment supplier'
    WHEN u.email LIKE '%-9m%' THEN 'Innovative IoT solutions for port operations'
    ELSE 'Port exhibitor'
  END as description,
  jsonb_build_object('email', u.email, 'phone', '+212 6 00 00 00 00', 'name', u.name) as contact_info,
  NOW(),
  NOW()
FROM public.users u
WHERE u.type = 'exhibitor' AND u.email LIKE '%@test.siport.com'
ON CONFLICT (user_id) DO NOTHING;

-- Create partners from users with type='partner'
INSERT INTO public.partners (user_id, company_name, partner_type, partnership_level, sector, description, contact_info, created_at, updated_at)
SELECT 
  u.id,
  u.name,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'corporate'
    WHEN u.email LIKE '%silver%' THEN 'tech'
    WHEN u.email LIKE '%platinium%' THEN 'corporate'
    WHEN u.email LIKE '%museum%' THEN 'cultural'
    WHEN u.email LIKE '%porttech%' THEN 'tech'
    WHEN u.email LIKE '%oceanfreight%' THEN 'logistics'
    WHEN u.email LIKE '%coastal%' THEN 'services'
    ELSE 'corporate'
  END as partner_type,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'gold'
    WHEN u.email LIKE '%silver%' THEN 'silver'
    WHEN u.email LIKE '%platinium%' THEN 'platinium'
    WHEN u.email LIKE '%museum%' THEN 'museum'
    WHEN u.email LIKE '%porttech%' THEN 'gold'
    WHEN u.email LIKE '%oceanfreight%' THEN 'silver'
    WHEN u.email LIKE '%coastal%' THEN 'silver'
    ELSE 'silver'
  END as partnership_level,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'Port Operations'
    WHEN u.email LIKE '%silver%' THEN 'Technology'
    WHEN u.email LIKE '%platinium%' THEN 'Port Management'
    WHEN u.email LIKE '%museum%' THEN 'Culture & Heritage'
    WHEN u.email LIKE '%porttech%' THEN 'Technology'
    WHEN u.email LIKE '%oceanfreight%' THEN 'Logistics'
    WHEN u.email LIKE '%coastal%' THEN 'Maritime Services'
    ELSE 'General'
  END as sector,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'Premium partnership for port excellence'
    WHEN u.email LIKE '%silver%' THEN 'Technology partner for digital transformation'
    WHEN u.email LIKE '%platinium%' THEN 'Global platinum partner'
    WHEN u.email LIKE '%museum%' THEN 'Cultural partnership for heritage'
    WHEN u.email LIKE '%porttech%' THEN 'Port technology innovation partner'
    WHEN u.email LIKE '%oceanfreight%' THEN 'Maritime freight specialist'
    WHEN u.email LIKE '%coastal%' THEN 'Comprehensive maritime services'
    ELSE 'Strategic partner'
  END as description,
  jsonb_build_object('email', u.email, 'phone', '+212 6 00 00 00 00', 'name', u.name) as contact_info,
  NOW(),
  NOW()
FROM public.users u
WHERE u.type = 'partner' AND u.email LIKE '%@test.siport.com'
ON CONFLICT (user_id) DO NOTHING;
    `;

    // Execute via rpc
    const { data, error } = await supabase.rpc('exec', { 
      sql_string: sql 
    }).catch(() => {
      // Si rpc n'existe pas, faire les insertions manuellement
      console.log('RPC non disponible, exécution manuelle...');
      return { data: null, error: null };
    });

    if (error && data === null) {
      console.log('Exécution manuelle des insertions...\n');

      // Supprimer les anciens
      console.log('1. Suppression des anciens enregistrements...');
      const { error: delExError } = await supabase
        .from('exhibitors')
        .delete()
        .in('user_id', 
          (await supabase
            .from('users')
            .select('id')
            .eq('type', 'exhibitor')
            .like('email', '%@test.siport.com%')
          ).data?.map(u => u.id) || []
        );

      const { error: delPartError } = await supabase
        .from('partners')
        .delete()
        .in('user_id', 
          (await supabase
            .from('users')
            .select('id')
            .eq('type', 'partner')
            .like('email', '%@test.siport.com%')
          ).data?.map(u => u.id) || []
        );

      // Récupérer les utilisateurs exhibitors
      console.log('\n2. Création des exposants...');
      const { data: exhibitorUsers } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('type', 'exhibitor')
        .like('email', '%@test.siport.com%');

      if (exhibitorUsers && exhibitorUsers.length > 0) {
        const exhibitors = exhibitorUsers.map(u => ({
          user_id: u.id,
          company_name: u.name,
          category: u.email.includes('-54m') ? 'port-industry' : 
                   u.email.includes('-36m') ? 'port-operations' :
                   u.email.includes('-18m') ? 'port-industry' : 'port-operations',
          sector: u.email.includes('-54m') ? 'Technology' : 
                 u.email.includes('-36m') ? 'Automation' :
                 u.email.includes('-18m') ? 'Equipment' : 'IoT',
          description: u.email.includes('-54m') ? 'Leader in maritime automation and port technology solutions' :
                      u.email.includes('-36m') ? 'Cutting-edge automation systems for modern ports' :
                      u.email.includes('-18m') ? 'Premium maritime equipment supplier' : 'Innovative IoT solutions for port operations',
          contact_info: { email: u.email, phone: '+212 6 00 00 00 00', name: u.name },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: exInsError } = await supabase
          .from('exhibitors')
          .insert(exhibitors);

        if (exInsError) {
          console.error('Erreur insertion exposants:', exInsError.message);
        } else {
          console.log(`✅ ${exhibitors.length} exposants créés`);
        }
      }

      // Récupérer les utilisateurs partners
      console.log('\n3. Création des partenaires...');
      const { data: partnerUsers } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('type', 'partner')
        .like('email', '%@test.siport.com%');

      if (partnerUsers && partnerUsers.length > 0) {
        const partners = partnerUsers.map(u => ({
          user_id: u.id,
          company_name: u.name,
          partner_type: u.email.includes('gold') ? 'corporate' :
                       u.email.includes('silver') ? 'tech' :
                       u.email.includes('platinium') ? 'corporate' :
                       u.email.includes('museum') ? 'cultural' :
                       u.email.includes('porttech') ? 'tech' :
                       u.email.includes('oceanfreight') ? 'logistics' : 'services',
          partnership_level: u.email.includes('gold') ? 'gold' :
                            u.email.includes('silver') ? 'silver' :
                            u.email.includes('platinium') ? 'platinium' :
                            u.email.includes('museum') ? 'museum' :
                            u.email.includes('porttech') ? 'gold' :
                            u.email.includes('oceanfreight') ? 'silver' : 'silver',
          sector: u.email.includes('gold') ? 'Port Operations' :
                 u.email.includes('silver') ? 'Technology' :
                 u.email.includes('platinium') ? 'Port Management' :
                 u.email.includes('museum') ? 'Culture & Heritage' :
                 u.email.includes('porttech') ? 'Technology' :
                 u.email.includes('oceanfreight') ? 'Logistics' : 'Maritime Services',
          description: u.email.includes('gold') ? 'Premium partnership for port excellence' :
                      u.email.includes('silver') ? 'Technology partner for digital transformation' :
                      u.email.includes('platinium') ? 'Global platinum partner' :
                      u.email.includes('museum') ? 'Cultural partnership for heritage' :
                      u.email.includes('porttech') ? 'Port technology innovation partner' :
                      u.email.includes('oceanfreight') ? 'Maritime freight specialist' : 'Comprehensive maritime services',
          contact_info: { email: u.email, phone: '+212 6 00 00 00 00', name: u.name },
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: partInsError } = await supabase
          .from('partners')
          .insert(partners);

        if (partInsError) {
          console.error('Erreur insertion partenaires:', partInsError.message);
        } else {
          console.log(`✅ ${partners.length} partenaires créés`);
        }
      }
    } else if (error) {
      console.error('Erreur:', error.message);
    } else {
      console.log('✅ Migration exécutée avec succès');
    }

    // Vérification finale
    console.log('\n=== Vérification finale ===');
    const { data: finalExhibitors } = await supabase
      .from('exhibitors')
      .select('count');
    const { data: finalPartners } = await supabase
      .from('partners')
      .select('count');

    console.log(`Total exposants: ${finalExhibitors?.length || 0}`);
    console.log(`Total partenaires: ${finalPartners?.length || 0}`);

  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

executeMigration();

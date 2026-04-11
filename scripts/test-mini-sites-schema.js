import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTableSchema() {
  console.log('🔍 Vérification du schéma mini_sites...\n');

  try {
    // Essayer d'insérer avec un minimum de champs
    const { data, error } = await supabase
      .from('mini_sites')
      .insert({
        title: 'Test Schema'
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Erreur lors de l\'insertion test:');
      console.log(error);
      console.log('\nEssayons avec exhibitor_id...');
      
      // Essayer avec exhibitor_id
      const { data: data2, error: error2 } = await supabase
        .from('mini_sites')
        .insert({
          exhibitor_id: '00000000-0000-0000-0000-000000000000',
          title: 'Test Schema'
        })
        .select()
        .single();

      if (error2) {
        console.log('❌ Erreur avec exhibitor_id:');
        console.log(error2);
        
        // Essayer avec content
        console.log('\nEssayons avec title et content...');
        const { data: data3, error: error3 } = await supabase
          .from('mini_sites')
          .insert({
            exhibitor_id: '00000000-0000-0000-0000-000000000000',
            title: 'Test Schema',
            content: 'Test content'
          })
          .select()
          .single();

        if (error3) {
          console.log('❌ Erreur avec content:');
          console.log(error3);
        } else {
          console.log('✅ Mini site test créé avec title et content!');
          console.log('Structure:', Object.keys(data3));
          
          // Supprimer le test
          await supabase.from('mini_sites').delete().eq('id', data3.id);
          console.log('Test nettoyé');
        }
      } else {
        console.log('✅ Mini site test créé!');
        console.log('Structure:', Object.keys(data2));
        
        // Supprimer le test
        await supabase.from('mini_sites').delete().eq('id', data2.id);
        console.log('Test nettoyé');
      }
    } else {
      console.log('✅ Mini site test créé!');
      console.log('Structure:', Object.keys(data));
      
      // Supprimer le test
      await supabase.from('mini_sites').delete().eq('id', data.id);
      console.log('Test nettoyé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

getTableSchema();


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceCreateMinisites() {
  console.log('🚀 Démarrage de la génération/validation des Mini-Sites...\n');

  // 1. Récupérer tous les exposants
  const { data: exhibitors, error: exhError } = await supabase
    .from('exhibitors')
    .select('id, user_id, company_name');

  if (exhError) {
    console.error('❌ Erreur récupération exposants:', exhError);
    return;
  }

  console.log(`📋 ${exhibitors.length} exposants trouvés.`);

  // 2. Pour chaque exposant, s'assurer qu'un mini-site existe et est publié
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const exhibitor of exhibitors) {
    // Vérifier s'il existe déjà (par id ou user_id)
    // Note: Le système actuel semble préférer les ID d'exposant, mais les données migrés peuvent utiliser user_id
    const { data: existingSite, error: findError } = await supabase
      .from('mini_sites')
      .select('*')
      .or(`exhibitor_id.eq.${exhibitor.id},exhibitor_id.eq.${exhibitor.user_id}`)
      .maybeSingle();

    if (existingSite) {
      // Existe déjà - on s'assure qu'il est publié
      if (!existingSite.published) {
        console.log(`📝 Activation publication pour: ${exhibitor.company_name}`);
        await supabase
          .from('mini_sites')
          .update({ published: true })
          .eq('id', existingSite.id);
        updated++;
      } else {
        skipped++;
      }
    } else {
      // N'existe pas - on le crée
      console.log(`✨ Création Mini-Site pour: ${exhibitor.company_name} (ID: ${exhibitor.id})`);
      
      const { error: createError } = await supabase
        .from('mini_sites')
        .insert({
          exhibitor_id: exhibitor.id, // On utilise l'ID exhibitor standard
          published: true,
          theme: JSON.stringify({
            primaryColor: '#1e40af',
            secondaryColor: '#3b82f6',
            accentColor: '#60a5fa',
            fontFamily: 'Inter'
          }),
          sections: [], // Sections vides par défaut
          custom_colors: {},
          last_updated: new Date().toISOString(),
          views: 0
        });

      if (createError) {
        console.error(`❌ Echec création pour ${exhibitor.company_name}:`, createError.message);
      } else {
        created++;
      }
    }
  }

  console.log('\n✅ TERMINÉ');
  console.log(`   - Créés: ${created}`);
  console.log(`   - Mis à jour (Publiés): ${updated}`);
  console.log(`   - Déjà OK: ${skipped}`);
}

forceCreateMinisites().catch(console.error);

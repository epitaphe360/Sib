/**
 * Script de seeding des templates de mini-sites
 * Insère les 10 templates préconçus dans la base de données Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { siteTemplates } from '../src/data/siteTemplates';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY requis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Seed les templates dans la base de données
 */
async function seedTemplates() {
  console.log('🌱 Début du seeding des templates...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const template of siteTemplates) {
    try {
      // Vérifier si le template existe déjà
      const { data: existing } = await supabase
        .from('site_templates')
        .select('id')
        .eq('id', template.id)
        .single();

      if (existing) {
        // Mettre à jour le template existant
        const { error: updateError } = await supabase
          .from('site_templates')
          .update({
            name: template.name,
            description: template.description,
            category: template.category,
            thumbnail: template.thumbnail,
            sections: template.sections,
            premium: template.premium,
            popularity: template.popularity
          })
          .eq('id', template.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour ${template.name}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ ${template.name} (${template.id}) - Mis à jour`);
          successCount++;
        }
      } else {
        // Insérer le nouveau template
        const { error: insertError } = await supabase
          .from('site_templates')
          .insert({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            thumbnail: template.thumbnail,
            sections: template.sections,
            premium: template.premium,
            popularity: template.popularity
          });

        if (insertError) {
          console.error(`❌ Erreur insertion ${template.name}:`, insertError.message);
          errorCount++;
        } else {
          console.log(`✅ ${template.name} (${template.id}) - Créé`);
          successCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Erreur traitement ${template.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Résumé du seeding:`);
  console.log(`   ✅ Succès: ${successCount}/${siteTemplates.length}`);
  console.log(`   ❌ Erreurs: ${errorCount}/${siteTemplates.length}`);
  console.log('='.repeat(50) + '\n');

  // Afficher les templates par catégorie
  console.log('📚 Templates par catégorie:\n');
  const categories = [...new Set(siteTemplates.map(t => t.category))];
  
  for (const category of categories) {
    const templatesInCategory = siteTemplates.filter(t => t.category === category);
    console.log(`   ${category.toUpperCase()}: ${templatesInCategory.length} template(s)`);
    templatesInCategory.forEach(t => {
      const badge = t.premium ? '👑 PREMIUM' : '🆓 GRATUIT';
      console.log(`      - ${t.name} ${badge} (popularité: ${t.popularity})`);
    });
    console.log('');
  }

  // Statistiques
  const premiumCount = siteTemplates.filter(t => t.premium).length;
  const freeCount = siteTemplates.filter(t => !t.premium).length;
  const avgPopularity = Math.round(
    siteTemplates.reduce((sum, t) => sum + t.popularity, 0) / siteTemplates.length
  );

  console.log('📈 Statistiques globales:');
  console.log(`   Templates premium: ${premiumCount}`);
  console.log(`   Templates gratuits: ${freeCount}`);
  console.log(`   Popularité moyenne: ${avgPopularity}`);
  console.log(`   Total sections: ${siteTemplates.reduce((sum, t) => sum + t.sections.length, 0)}`);
  console.log('');

  if (errorCount === 0) {
    console.log('✨ Seeding terminé avec succès !');
    process.exit(0);
  } else {
    console.log('⚠️  Seeding terminé avec des erreurs');
    process.exit(1);
  }
}

// Exécuter le seeding
seedTemplates().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});

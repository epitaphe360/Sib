/**
 * Export des articles pour traduction manuelle
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('📥 Récupération des articles...');

const { data, error } = await supabase
  .from('news_articles')
  .select('id, title, excerpt, content')
  .order('id');

if (error) {
  console.error('❌ Erreur:', error);
  process.exit(1);
}

console.log(`✅ ${data.length} articles récupérés`);

// Afficher les articles
data.forEach((article, index) => {
  console.log(`\n[${ index + 1}/${data.length}] ID: ${article.id}`);
  console.log(`TITRE FR: ${article.title}`);
  console.log(`EXTRAIT FR (${article.excerpt?.length || 0} chars): ${article.excerpt?.substring(0, 100)}...`);
  console.log(`CONTENU FR (${article.content?.length || 0} chars)`);
});

console.log('\n✅ Export terminé');

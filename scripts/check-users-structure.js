import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Voir la structure
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.log('Erreur:', error);
  } else {
    console.log('Structure users:');
    console.log(Object.keys(data[0] || {}));
    console.log('\nExemple:');
    console.log(JSON.stringify(data[0], null, 2));
  }
}

main();

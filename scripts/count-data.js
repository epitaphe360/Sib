import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  // Compter exhibitors
  const { count: exhibCount } = await supabase
    .from('exhibitors')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Total Exhibitors: ${exhibCount}`);
  
  // Compter projets
  const { count: projectCount } = await supabase
    .from('partner_projects')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total Partner Projects: ${projectCount}`);
  
  // Compter mini sites
  const { count: miniSiteCount } = await supabase
    .from('mini_sites')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total Mini Sites: ${miniSiteCount}`);
  
  // Compter produits
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total Products: ${productCount}\n`);
}

checkDB().catch(console.error);

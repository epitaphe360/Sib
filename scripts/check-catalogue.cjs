const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres.sbyizudifmqakzxjlndr:3Rl5h7UqncQQcFnL@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
c.connect()
  .then(() => c.query("SELECT to_regclass('public.catalogue_entries') as tbl"))
  .then(r => { console.log(r.rows[0].tbl ? 'TABLE EXISTS' : 'TABLE MANQUANTE'); c.end(); })
  .catch(e => { console.error('ERREUR:', e.message); c.end(); });

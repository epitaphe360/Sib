import pg from 'pg';

const DB_URL = 'postgresql://postgres:WZiG!G3RfqiDY8H@db.sbyizudifmqakzxjlndr.supabase.co:5432/postgres';
const client = new pg.Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  console.log('Connected');
  
  try {
    await client.query(`
      CREATE POLICY "users_insert_own" 
      ON public.users 
      FOR INSERT 
      TO authenticated 
      WITH CHECK ((SELECT auth.uid()) = id);
    `);
    console.log('Policy created for public.users: users_insert_own');
  } catch (err) {
    console.log('Error creating policy:', err.message);
  }
  
  await client.end();
}

run();
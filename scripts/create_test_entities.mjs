#!/usr/bin/env node
import 'dotenv/config';
import { Client } from 'pg';

async function main(){
  const argv = process.argv;
  const dbIdx = argv.indexOf('--database-url');
  const dbUrl = (dbIdx !== -1 && argv[dbIdx + 1]) ? argv[dbIdx + 1] : (process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL);
  if(!dbUrl){
    console.error('DATABASE_URL not set');
    process.exit(2);
  }
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  // Create a visitor user if users table accepts minimal columns
  // We'll attempt to insert with minimal fields; adapt if constraint errors occur
  try{
    const userRes = await client.query("INSERT INTO users (id, email, name, type, created_at) VALUES (gen_random_uuid(), $1, $2, 'visitor', now()) RETURNING id", ['test+visitor@example.com', 'Test Visitor']);
    const visitorId = userRes.rows[0].id;
    console.log('visitor_id:', visitorId);

    // Create a dummy exhibitor if needed
    const exhibitorRes = await client.query("INSERT INTO exhibitors (id, user_id, company_name, created_at) VALUES (gen_random_uuid(), $1, $2, now()) RETURNING id", [visitorId, 'Test Exhibitor']);
    const exhibitorId = exhibitorRes.rows[0].id;
    console.log('exhibitor_id:', exhibitorId);

    // Create a time_slot for that exhibitor
    const tsRes = await client.query("INSERT INTO time_slots (id, exhibitor_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location) VALUES (gen_random_uuid(), $1, current_date, '09:00', '09:30', 30, 'in-person', 1, 0, true, 'Test Location') RETURNING id", [exhibitorId]);
    const timeSlotId = tsRes.rows[0].id;
    console.log('time_slot_id:', timeSlotId);

    await client.end();
    console.log('done');
  }catch(err){
    console.error('error creating test entities:', err.message || err);
    await client.end();
    process.exit(1);
  }
}

main();

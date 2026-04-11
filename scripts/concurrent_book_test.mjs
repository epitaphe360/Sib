#!/usr/bin/env node
import 'dotenv/config';
import { Client } from 'pg';
import fetch from 'node-fetch';

// Simple concurrency tester for the book_time_slot_atomic RPC.
// Usage: set DATABASE_URL or SUPABASE_DATABASE_URL and run:
//   node scripts/concurrent_book_test.mjs --time-slot <id> --visitor <id> --parallel 10

import { argv } from 'process';

function arg(name, def) {
  const idx = argv.indexOf(name);
  if (idx === -1) return def;
  return argv[idx + 1];
}

const timeSlotId = arg('--time-slot');
const visitorId = arg('--visitor');
const parallel = Number(arg('--parallel', '10')) || 10;
const dbIdx = argv.indexOf('--database-url');
const dbUrl = (dbIdx !== -1 && argv[dbIdx + 1]) ? argv[dbIdx + 1] : (process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL);

if (!timeSlotId || !visitorId) {
  console.error('Missing --time-slot or --visitor arguments');
  process.exit(2);
}
if (!dbUrl) {
  console.error('Missing DATABASE_URL / SUPABASE_DATABASE_URL in env');
  process.exit(2);
}

console.log(`Running concurrency test against timeSlot=${timeSlotId}, visitor=${visitorId}, parallel=${parallel}`);

const client = new Client({ connectionString: dbUrl });
await client.connect();

// Helper to call RPC via Postgres: SELECT * FROM book_time_slot_atomic($1,$2,$3,$4)
async function callRpc(visitor, slot) {
  try {
    const res = await client.query('SELECT * FROM book_time_slot_atomic($1,$2,$3,$4)', [visitor, slot, 'in-person', null]);
    return { ok: true, row: res.rows[0] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Fire parallel attempts
const promises = [];
for (let i = 0; i < parallel; i++) {
  promises.push(callRpc(visitorId, timeSlotId));
}

const results = await Promise.all(promises);

let success = 0, failure = 0;
for (const r of results) {
  if (r.ok) success++; else failure++;
}

console.log('Results:', { total: results.length, success, failure });
console.log('Detailed failures:');
results.forEach((r, i) => {
  if (!r.ok) console.log(i, r.error);
});

// Show final time_slot counters
const ts = await client.query('SELECT id, max_bookings, current_bookings, available FROM time_slots WHERE id=$1', [timeSlotId]);
console.log('time_slot final state:', ts.rows[0]);

await client.end();

console.log('Done');

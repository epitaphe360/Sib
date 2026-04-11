#!/usr/bin/env node
// Verify a Supabase user (email or id) has an exhibitor linked.
// Usage (PowerShell):
//   node scripts/check-exhibitor-link.mjs --email user@example.com
//   node scripts/check-exhibitor-link.mjs --id 00000000-0000-0000-0000-000000000000

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in env (.env.local).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const email = getArg('email');
const id = getArg('id');
if (!email && !id) {
  console.error('Provide --email or --id');
  process.exit(1);
}

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

(async () => {
  try {
    let user;
    if (email) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error) throw error;
      user = data;
    } else {
      if (!isUuid(id)) {
        console.error('Invalid uuid for --id');
        process.exit(1);
      }
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) throw error;
      user = data;
    }

    console.log('User:', { id: user.id, email: user.email, name: user.name, type: user.type });

    const { data: exRows, error: exErr } = await supabase.from('exhibitors').select('*').eq('user_id', user.id);
    if (exErr) throw exErr;
    if (!exRows || exRows.length === 0) {
      console.log('No exhibitor linked to this user.');
      process.exit(2);
    }
    console.log(`Found ${exRows.length} exhibitor(s):`);
    for (const ex of exRows) {
      console.log({ id: ex.id, company_name: ex.company_name, verified: ex.verified, sector: ex.sector });
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e?.message || e);
    process.exit(1);
  }
})();

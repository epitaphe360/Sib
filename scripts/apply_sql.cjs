#!/usr/bin/env node
require('dotenv').config();
const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const { Client } = require('pg');

async function main() {
  // allow CLI override --database-url
  const argv = process.argv;
  const dbIdx = argv.indexOf('--database-url');
  const databaseUrl = (dbIdx !== -1 && argv[dbIdx + 1]) ? argv[dbIdx + 1] : (process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL);
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL or SUPABASE_DATABASE_URL must be set in the environment');
    console.error('You can set it in a .env file or export it in your shell. Example (PowerShell):');
    console.error('\n$env:DATABASE_URL = "postgres://..."; node scripts/apply_sql.cjs\n');
    process.exit(2);
  }

  // Diagnostic: show a masked version of the DATABASE_URL to help detect malformed placeholders
  try {
    const masked = databaseUrl.replace(/(postgres:\/\/)([^:]+):([^@]+)@/, (m, p, user, pass) => `${p}${user}:****@`);
    console.log('Using DATABASE_URL:', masked);
  } catch (e) {
    console.warn('Could not mask DATABASE_URL (non-standard format)');
  }

  // Basic validation: ensure the URL parses via URL constructor
  try {
    new URL(databaseUrl);
  } catch (err) {
    console.error('ERROR: DATABASE_URL does not appear to be a valid URL. Raw value:');
    console.error(databaseUrl);
    console.error('If you are using placeholder text (host:port), replace with a real connection string or set DATABASE_URL in your shell.');
    process.exit(3);
  }

  const continueOnError = process.argv.includes('--continue-on-error');

  // Prefer IPv4 resolution for environments that have flaky IPv6 connectivity (ENETUNREACH on IPv6)
  let connectionStringToUse = databaseUrl;
  try {
    const urlObj = new URL(databaseUrl);
    const host = urlObj.hostname;
    const dns = require('dns').promises;
    try {
      const v4 = await dns.lookup(host, { family: 4 });
      if (v4 && v4.address) {
        console.log('Resolved IPv4 for', host, '->', v4.address);
        // replace host in the connection string with the IPv4 literal
        urlObj.hostname = v4.address;
        // If the original had a hostname that is not an IP, keep the original host in the 'options' parameter
        connectionStringToUse = urlObj.toString();
        console.log('Using IPv4 connection string (host replaced)');
      }
    } catch (dnsErr) {
      console.warn('IPv4 DNS lookup failed for host', host, dnsErr && dnsErr.code ? dnsErr.code : dnsErr);
      console.warn('Falling back to original DATABASE_URL host resolution (may attempt IPv6)');
    }
  } catch (err) {
    console.warn('Could not parse DATABASE_URL for IPv4 resolution; using original connection string.');
  }

  const client = new Client({ connectionString: connectionStringToUse });
  await client.connect();

  const sqlDir = join(__dirname, '..', 'supabase');
  const files = readdirSync(sqlDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const path = join(sqlDir, file);
    console.log('\n--- Applying', file, '---');
    const sql = readFileSync(path, 'utf8');
    console.log('Preview:', sql.slice(0, 200).replace(/\n/g, ' ') + (sql.length > 200 ? '...': ''));
    try {
      await client.query(sql);
      console.log('Applied', file);
    } catch (err) {
      console.error('Error applying', file, '\n', (err && err.message) || err);
      if (!continueOnError) {
        await client.end();
        process.exit(3);
      } else {
        console.warn('Continuing despite error ( --continue-on-error ).');
      }
    }
  }

  await client.end();
  console.log('\nAll SQL files processed. If errors occurred, review logs above.');
}

main().catch(err => { console.error(err); process.exit(1); });

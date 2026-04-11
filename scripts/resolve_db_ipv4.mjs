#!/usr/bin/env node
import dns from 'dns/promises';
import { URL } from 'url';

function mask(s) {
  try {
    return s.replace(/(postgres:\/\/)([^:]+):([^@]+)@/, (m, p, user, pass) => `${p}${user}:****@`);
  } catch (e) {
    return '***';
  }
}

async function main() {
  const argv = process.argv;
  const idx = argv.indexOf('--database-url');
  const databaseUrl = (idx !== -1 && argv[idx+1]) ? argv[idx+1] : process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('No DATABASE_URL provided');
    process.exit(0);
  }

  let host;
  try {
    const u = new URL(databaseUrl);
    host = u.hostname;
  } catch (e) {
    console.error('Invalid DATABASE_URL');
    process.exit(0);
  }

  try {
    const addrs = await dns.resolve4(host);
    if (!addrs || addrs.length === 0) {
      // nothing to do
      process.exit(0);
    }
    const ip = addrs[0];
    const u = new URL(databaseUrl);
    u.hostname = ip;
    // print replaced URL to stdout
    console.log(u.toString());
    process.exit(0);
  } catch (err) {
    // no A record or DNS failure
    process.exit(0);
  }
}

main();

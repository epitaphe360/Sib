#!/usr/bin/env node
/**
 * One-shot Vercel config for Elitech Lab. No dashboard typing.
 *
 *   npm run lab:vercel
 *
 * Uses the existing sib-2026 Vercel project. Sets VITE_LAB_* (anon only)
 * on production / preview / development, then deploys.
 *
 * Optional env: VERCEL_TOKEN (CI). Otherwise uses the local Vercel login.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const LAB_URL = 'https://omlhfjfpyttfvntfqjnk.supabase.co';
const LAB_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbGhmamZweXR0ZnZudGZxam5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTQ2NzksImV4cCI6MjEwNDI3MDY3OX0.qfHoRuTjI5C_gMY0N5nDjRHzUWmEOtqN3tC7Es45xWE';

const ENVS = [
  ['VITE_LAB_SUPABASE_URL', LAB_URL],
  ['VITE_LAB_SUPABASE_ANON_KEY', LAB_ANON],
];
const TARGETS = ['production', 'preview', 'development'];

function vercel(args, input) {
  const extra = process.env.VERCEL_TOKEN ? ['--token', process.env.VERCEL_TOKEN] : [];
  const res = spawnSync('npx', ['vercel', ...args, ...extra], {
    cwd: root,
    encoding: 'utf8',
    input,
    stdio: input == null ? 'inherit' : ['pipe', 'inherit', 'inherit'],
  });
  if (res.status !== 0) {
    throw new Error(`vercel ${args.join(' ')} failed (${res.status})`);
  }
}

function upsertEnv(name, value, target) {
  const extra = process.env.VERCEL_TOKEN ? ['--token', process.env.VERCEL_TOKEN] : [];
  const listed = spawnSync('npx', ['vercel', 'env', 'ls', target, ...extra], {
    cwd: root,
    encoding: 'utf8',
  });
  const exists = (listed.stdout || '').includes(name);
  if (exists) {
    spawnSync('npx', ['vercel', 'env', 'rm', name, target, '-y', ...extra], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'inherit',
    });
  }
  vercel(['env', 'add', name, target], value);
}

console.log('Lab → Vercel : projet sib-2026, schéma lab sur omlhfjfpyttfvntfqjnk');
vercel(['link', '--yes']);

for (const [name, value] of ENVS) {
  for (const target of TARGETS) {
    console.log(`env ${name} → ${target}`);
    upsertEnv(name, value, target);
  }
}

if (process.argv.includes('--env-only')) {
  console.log('OK env only');
  process.exit(0);
}

vercel(['--prod', '--yes', '--archive=tgz']);
console.log('OK deploy. Lab : /lab  login : /lab/login');

/**
 * k6 — Pic d'entrée salon (scans badge)
 *
 * Simule 10–50 portiques scannant en continu pendant la montée en charge.
 *
 * Prérequis:
 *   - k6 installé: https://k6.io/docs/getting-started/installation/
 *   - BADGE_CODES = codes séparés par virgule (min 10 recommandé)
 *
 * Usage:
 *   k6 run -e SUPABASE_URL=... -e SUPABASE_ANON_KEY=... \
 *     -e BADGE_CODES=ABC123,DEF456,... tests/load/k6-badge-entrance.js
 *
 * Pic entrée (100 scanners virtuels, 3 min):
 *   k6 run -e LOAD_PROFILE=peak ... tests/load/k6-badge-entrance.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const scanLatency = new Trend('badge_scan_latency');
const scanErrors = new Rate('badge_scan_errors');

const SUPABASE_URL = __ENV.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || '';
const BADGE_CODES = (__ENV.BADGE_CODES || '').split(',').map((s) => s.trim()).filter(Boolean);
const PROFILE = __ENV.LOAD_PROFILE || 'standard';

const profiles = {
  smoke: {
    stages: [
      { duration: '30s', target: 5 },
      { duration: '1m', target: 10 },
      { duration: '30s', target: 0 },
    ],
  },
  standard: {
    stages: [
      { duration: '1m', target: 20 },
      { duration: '3m', target: 50 },
      { duration: '1m', target: 0 },
    ],
  },
  peak: {
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 100 },
      { duration: '3m', target: 100 },
      { duration: '1m', target: 0 },
    ],
  },
};

export const options = {
  stages: profiles[PROFILE]?.stages || profiles.standard.stages,
  thresholds: {
    badge_scan_latency: ['p(95)<800', 'p(99)<2000'],
    badge_scan_errors: ['rate<0.02'],
    http_req_failed: ['rate<0.02'],
  },
};

export function setup() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL et SUPABASE_ANON_KEY requis');
  }
  if (!BADGE_CODES.length) {
    throw new Error('BADGE_CODES requis (liste séparée par virgules)');
  }
  console.log(`Badge entrance load · profile=${PROFILE} · codes=${BADGE_CODES.length}`);
  return { codes: BADGE_CODES };
}

export default function (data) {
  const code = data.codes[__VU % data.codes.length];
  const url = `${SUPABASE_URL}/rest/v1/rpc/validate_scanned_badge`;
  const res = http.post(
    url,
    JSON.stringify({ p_qr_data: code }),
    {
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      tags: { name: 'validate_scanned_badge' },
    }
  );

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'badge valid': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch {
        return false;
      }
    },
    'latency < 800ms': (r) => r.timings.duration < 800,
  });

  scanLatency.add(res.timings.duration);
  scanErrors.add(!ok);

  // ~1 scan toutes les 2–4 s (rythme portique réel)
  sleep(2 + Math.random() * 2);
}

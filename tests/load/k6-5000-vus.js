/**
 * SIB 2026 — Test de charge k6 pour 5 000 utilisateurs simultanés
 * CDC requirement: "Charge 5 000 visiteurs simultanés"
 *
 * Usage:
 *   k6 run tests/load/k6-5000-vus.js
 *   k6 run -e BASE_URL=https://sib2026.ma tests/load/k6-5000-vus.js
 *   k6 run --out json=results.json tests/load/k6-5000-vus.js
 *
 * Install k6: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ─── Custom metrics ───────────────────────────────────────────────────────────

const pageLoadTime      = new Trend('page_load_time');
const apiResponseTime   = new Trend('api_response_time');
const errorRate         = new Rate('errors');
const navigationClicks  = new Counter('navigation_clicks');

// ─── Thresholds & stages ──────────────────────────────────────────────────────

export const options = {
  /**
   * Load profile (CDC requirement: 5 000 simultaneous users):
   *   Phase 1 — warmup     : 500  VUs × 2 min
   *   Phase 2 — ramp up    : 2000 VUs × 5 min
   *   Phase 3 — peak load  : 5000 VUs × 10 min
   *   Phase 4 — ramp down  : 0    VUs × 2 min
   */
  stages: [
    { duration: '2m',  target: 500  },  // warmup
    { duration: '5m',  target: 2000 },  // ramp up
    { duration: '10m', target: 5000 },  // sustained peak (CDC target)
    { duration: '2m',  target: 0    },  // ramp down
  ],

  thresholds: {
    // p95 latency under 2 seconds for all requests
    http_req_duration:          ['p(95)<2000'],
    // p99 latency under 5 seconds
    'http_req_duration{group:::Page views}': ['p(99)<5000'],
    // Less than 1% errors
    errors:                     ['rate<0.01'],
    http_req_failed:            ['rate<0.01'],
    // API calls specifically
    'http_req_duration{group:::API calls}': ['p(95)<1000'],
  },

  // Add extra info to HTML report
  summaryTrendStats: ['min', 'avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || 'http://localhost:9324';
const SUPABASE_URL = __ENV.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || '';

// Common headers for API calls
const apiHeaders = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Prefer': 'count=exact',
};

// ─── Scenarios (weighted user journeys) ──────────────────────────────────────

/**
 * Visitor journey — 60% of load
 * Homepage → Exhibitors list → Exhibitor detail → Events → Map
 */
function visitorJourney() {
  group('Page views', () => {
    // Homepage
    let res = http.get(`${BASE_URL}/`, { tags: { name: 'HomePage' } });
    const ok1 = check(res, {
      'homepage status 200':      (r) => r.status === 200 || r.status === 304,
      'homepage body loaded':     (r) => r.body && r.body.length > 500,
      'homepage response < 2s':   (r) => r.timings.duration < 2000,
    });
    pageLoadTime.add(res.timings.duration, { page: 'home' });
    if (!ok1) errorRate.add(1); else errorRate.add(0);
    navigationClicks.add(1);
    sleep(randomBetween(0.5, 1.5));

    // Exhibitors list
    res = http.get(`${BASE_URL}/exhibitors`, { tags: { name: 'ExhibitorsPage' } });
    check(res, {
      'exhibitors status 200':    (r) => r.status === 200 || r.status === 304,
      'exhibitors response < 2s': (r) => r.timings.duration < 2000,
    });
    pageLoadTime.add(res.timings.duration, { page: 'exhibitors' });
    navigationClicks.add(1);
    sleep(randomBetween(1, 2));

    // Interactive map (CDC requirement: plan interactif des halls)
    res = http.get(`${BASE_URL}/map`, { tags: { name: 'HallMap' } });
    check(res, {
      'map status 200':           (r) => r.status === 200 || r.status === 304,
      'map response < 2s':        (r) => r.timings.duration < 2000,
    });
    pageLoadTime.add(res.timings.duration, { page: 'map' });
    navigationClicks.add(1);
    sleep(randomBetween(2, 4)); // Visitors linger on the map

    // BTP Catalog (CDC requirement: catalogue technique BTP)
    res = http.get(`${BASE_URL}/catalog`, { tags: { name: 'CatalogPage' } });
    check(res, {
      'catalog status 200':       (r) => r.status === 200 || r.status === 304,
      'catalog response < 2s':    (r) => r.timings.duration < 2000,
    });
    pageLoadTime.add(res.timings.duration, { page: 'catalog' });
    navigationClicks.add(1);
    sleep(randomBetween(1, 3));

    // Events page
    res = http.get(`${BASE_URL}/events`, { tags: { name: 'EventsPage' } });
    check(res, {
      'events status 200':        (r) => r.status === 200 || r.status === 304,
      'events response < 2s':     (r) => r.timings.duration < 2000,
    });
    pageLoadTime.add(res.timings.duration, { page: 'events' });
    navigationClicks.add(1);
    sleep(randomBetween(0.5, 1.5));
  });
}

/**
 * Exhibitor journey — 25% of load
 * News → Partners → Networking → Profile matching
 */
function exhibitorJourney() {
  group('Page views', () => {
    let res = http.get(`${BASE_URL}/news`, { tags: { name: 'NewsPage' } });
    check(res, { 'news status 200': (r) => r.status === 200 || r.status === 304 });
    pageLoadTime.add(res.timings.duration, { page: 'news' });
    sleep(randomBetween(1, 2));

    res = http.get(`${BASE_URL}/partners`, { tags: { name: 'PartnersPage' } });
    check(res, { 'partners status 200': (r) => r.status === 200 || r.status === 304 });
    pageLoadTime.add(res.timings.duration, { page: 'partners' });
    sleep(randomBetween(0.5, 1.5));

    res = http.get(`${BASE_URL}/networking`, { tags: { name: 'NetworkingPage' } });
    check(res, { 'networking status 200': (r) => r.status === 200 || r.status === 304 });
    pageLoadTime.add(res.timings.duration, { page: 'networking' });
    sleep(randomBetween(1, 3));
  });
}

/**
 * API load journey — 15% of load
 * Direct Supabase REST API queries (what the frontend does internally)
 */
function apiJourney() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  group('API calls', () => {
    // Exhibitors list
    let res = http.get(
      `${SUPABASE_URL}/rest/v1/exhibitors?select=id,name,industry,sector&limit=50&is_published=eq.true`,
      { headers: apiHeaders, tags: { name: 'API_Exhibitors' } }
    );
    check(res, {
      'API exhibitors 200':       (r) => r.status === 200,
      'API exhibitors < 1s':      (r) => r.timings.duration < 1000,
    });
    apiResponseTime.add(res.timings.duration, { endpoint: 'exhibitors' });
    sleep(0.3);

    // Events list
    res = http.get(
      `${SUPABASE_URL}/rest/v1/events?select=id,title,start_date,category&limit=20&order=start_date.asc`,
      { headers: apiHeaders, tags: { name: 'API_Events' } }
    );
    check(res, {
      'API events 200':           (r) => r.status === 200,
      'API events < 1s':          (r) => r.timings.duration < 1000,
    });
    apiResponseTime.add(res.timings.duration, { endpoint: 'events' });
    sleep(0.3);

    // Articles
    res = http.get(
      `${SUPABASE_URL}/rest/v1/articles?select=id,title,created_at&limit=10&order=created_at.desc&is_published=eq.true`,
      { headers: apiHeaders, tags: { name: 'API_Articles' } }
    );
    check(res, {
      'API articles 200':         (r) => r.status === 200,
      'API articles < 1s':        (r) => r.timings.duration < 1000,
    });
    apiResponseTime.add(res.timings.duration, { endpoint: 'articles' });
    sleep(0.3);
  });
}

// ─── Default function (VU entry point) ───────────────────────────────────────

export default function () {
  const scenario = Math.random();

  if (scenario < 0.60) {
    visitorJourney();   // 60% visitors browsing
  } else if (scenario < 0.85) {
    exhibitorJourney(); // 25% exhibitor/partner journeys
  } else {
    apiJourney();       // 15% direct API load
  }

  // Think time between journeys (simulates real users)
  sleep(randomBetween(1, 3));
}

// ─── Setup (runs once before test) ───────────────────────────────────────────

export function setup() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   SIB 2026 — Load Test: 5 000 VUs simultanés (CDC)      ║
║   Target: ${BASE_URL.padEnd(47)}║
║   Phases: warmup 500 VUs → 2000 VUs → peak 5000 VUs     ║
║   SLA:    p95 < 2s · p99 < 5s · errors < 1%             ║
╚══════════════════════════════════════════════════════════╝
  `);
  // Verify the target is reachable before ramping up
  const res = http.get(BASE_URL);
  if (res.status !== 200) {
    console.warn(`⚠️  Target returned ${res.status} — check BASE_URL before full run`);
  }
  return { baseUrl: BASE_URL };
}

// ─── Teardown (runs once after test) ─────────────────────────────────────────

export function teardown(data) {
  console.log(`\n✅ Load test completed. Base URL: ${data.baseUrl}`);
  console.log('📊 Check results above. Review p95/p99 latency and error rates.');
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

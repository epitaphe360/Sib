/**
 * DNS resolution via HTTPS + migration PostgreSQL directe
 */
const { Client } = await import("pg");
const https = await import("https");

const PROJECT = "sbyizudifmqakzxjlndr";
const PW = "WZiG!G3RfqiDY8H";
const DBHOST_DOMAIN = `db.${PROJECT}.supabase.co`;

// Résoudre IP via Cloudflare DNS-over-HTTPS
async function resolveIP(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "cloudflare-dns.com",
      path: `/dns-query?name=${hostname}&type=A`,
      method: "GET",
      headers: { "accept": "application/dns-json" }
    };
    const req = https.default.request(options, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try {
          const j = JSON.parse(d);
          const a = j.Answer?.find(r => r.type === 1);
          if (a) resolve(a.data);
          else reject(new Error("No A record: " + d));
        } catch(e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

let dbHost = DBHOST_DOMAIN;
try {
  process.stdout.write(`🔍 Résolution DNS de ${DBHOST_DOMAIN}... `);
  dbHost = await resolveIP(DBHOST_DOMAIN);
  console.log(`→ ${dbHost}`);
} catch(e) {
  console.log(`FAIL (${e.message}), utilisation du nom direct`);
}

const DB_URLS = [
  `postgresql://postgres:${PW}@${dbHost}:5432/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT}:${PW}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
];

let client = null;
for (const url of DB_URLS) {
  const shortUrl = url.replace(PW, "***").replace(PROJECT, PROJECT.substring(0, 8) + "...");
  process.stdout.write(`🔌 ${shortUrl.substring(14, 60)}... `);
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
  try {
    await c.connect();
    await c.query("SELECT 1");
    console.log("✅ CONNECTÉ!");
    client = c;
    break;
  } catch(e) {
    console.log(`❌ ${e.message.substring(0, 60)}`);
    await c.end().catch(() => {});
  }
}

if (!client) {
  console.error("\n💥 Impossible de se connecter à Supabase depuis ce réseau.");
  console.error("Veuillez appliquer la migration dans le SQL Editor Supabase:");
  console.error(`https://supabase.com/dashboard/project/${PROJECT}/sql/new`);
  process.exit(1);
}

// Connexion OK - lancer les migrations
const { default: fs } = await import("fs");
const { default: path } = await import("path");
const { fileURLToPath } = await import("url");
const __dir = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dir, "supabase", "migrations");

// Table de suivi
await client.query(`
  CREATE TABLE IF NOT EXISTS _sib_migrations (
    id SERIAL PRIMARY KEY,
    filename TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  );
`);

const { rows: applied } = await client.query("SELECT filename FROM _sib_migrations");
const done = new Set(applied.map(r => r.filename));

const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith(".sql")).sort();
console.log(`\n📋 ${files.length} migrations, ${done.size} déjà appliquées\n`);

let ok = 0, skip = 0, err = 0;

for (const file of files) {
  if (done.has(file)) { process.stdout.write(`⏭️  `); skip++; continue; }

  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
  try {
    await client.query(sql);
    await client.query("INSERT INTO _sib_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING", [file]);
    console.log(`✅ ${file}`);
    ok++;
  } catch(e) {
    if (e.message.includes("already exists") || e.message.includes("duplicate")) {
      await client.query("INSERT INTO _sib_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING", [file]);
      console.log(`⚠️  ${file} [existant]`);
      skip++;
    } else {
      console.log(`❌ ${file}: ${e.message.substring(0, 120)}`);
      err++;
    }
  }
}

await client.end();

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ Appliquées : ${ok}`);
console.log(`⏭️  Ignorées  : ${skip}`);
console.log(`❌ Erreurs   : ${err}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

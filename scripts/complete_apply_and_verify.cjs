#!/usr/bin/env node
/**
 * Complete apply + verify script
 * Usage (PowerShell):
 *   $env:DATABASE_URL='postgres://service_role:SECRET@db.host.supabase.co:5432/postgres'; node .\scripts\complete_apply_and_verify.cjs
 *
 * This script will:
 *  - dump current policies to backups/policies_backup_<ts>.sql
 *  - execute supabase/combined_apply.sql
 *  - run verification queries (columns, functions, triggers, view, policies)
 *  - run a transactional test of the visitor quota trigger
 *  - print a JSON summary to stdout and write logs to backups/apply_report_<ts>.json
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const root = path.resolve(__dirname, '..');
const combinedSqlPath = path.join(root, 'supabase', 'combined_apply.sql');
const backupsDir = path.join(root, 'backups');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const policyBackupPath = path.join(backupsDir, `policies_backup_${ts}.sql`);
const reportPath = path.join(backupsDir, `apply_report_${ts}.json`);

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('ERROR: Please set DATABASE_URL environment variable before running.');
    process.exit(1);
  }

  if (!fs.existsSync(combinedSqlPath)) {
    console.error('ERROR: combined_apply.sql not found at', combinedSqlPath);
    process.exit(1);
  }

  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const report = { startedAt: new Date().toISOString(), steps: {} };

  try {
    // 1) Backup current policies
    report.steps.backup = { ok: false };
    const backupQuery = `SELECT tbl.relname AS table_name,
      pol.polname AS policy_name,
      pol.polcmd AS command,
      pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,
      pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expr
    FROM pg_policy pol
    JOIN pg_class tbl ON pol.polrelid = tbl.oid
    WHERE tbl.relname IN ('users','exhibitors','products','mini_sites','appointments')
    ORDER BY tbl.relname, pol.polname;`;

    const resBackup = await client.query(backupQuery);
    const lines = [];
    for (const row of resBackup.rows) {
      lines.push(`-- TABLE: ${row.table_name}   POLICY: ${row.policy_name}`);
      lines.push(`-- COMMAND: ${row.command}`);
      lines.push(`-- USING: ${row.using_expr}`);
      lines.push(`-- WITH CHECK: ${row.with_check_expr}`);
      lines.push('');
    }
    fs.writeFileSync(policyBackupPath, lines.join('\n'), 'utf8');
    report.steps.backup = { ok: true, path: policyBackupPath, count: resBackup.rowCount };

    // 2) Apply combined SQL
    report.steps.apply = { ok: false };
    const sql = fs.readFileSync(combinedSqlPath, 'utf8');
    // execute as a single multi-statement query
    await client.query(sql);
    report.steps.apply = { ok: true };

    // 3) Run verifications
    report.steps.verify = { ok: false };
    const verify = {};

    // visitor_level column
    const colRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='visitor_level';");
    verify.visitor_level = colRes.rows;

    // functions
    const fnRes = await client.query("SELECT routine_name FROM information_schema.routines WHERE routine_schema='public' AND routine_name IN ('create_visitor_safe','check_visitor_quota','is_admin');");
    verify.functions = fnRes.rows.map(r => r.routine_name);

    // triggers on appointments
    const tgRes = await client.query("SELECT tgname, tgenabled, pg_get_triggerdef(oid) AS definition FROM pg_trigger WHERE tgrelid = 'public.appointments'::regclass;");
    verify.triggers = tgRes.rows;

    // public_users view columns
    const viewRes = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='public_users';");
    verify.public_users = viewRes.rows;

    // policies details
    const polRes = await client.query("SELECT tbl.relname AS table_name, pol.polname AS policy_name, pol.polcmd AS command, pg_get_expr(pol.polqual, pol.polrelid) AS using_expr, pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expr FROM pg_policy pol JOIN pg_class tbl ON pol.polrelid = tbl.oid WHERE tbl.relname IN ('users','exhibitors','products','mini_sites','appointments') ORDER BY tbl.relname, pol.polname;");
    verify.policies = polRes.rows;

    report.steps.verify = { ok: true, details: verify };

    // 4) Test visitor quota trigger inside a transaction
    report.steps.quota_test = { ok: false };
    let quotaResult = { error: null, passed: null, details: null };
    try {
      await client.query('BEGIN');
      // create/upsert test user
      const email = `test+quota@${ts}.example`;
      await client.query("SELECT public.create_visitor_safe($1,$2,$3,$4) AS u", [email, 'Test Runner', 'free', '{}']);
      // get id
      const idRes = await client.query('SELECT id, visitor_level FROM public.users WHERE email=$1 LIMIT 1', [email]);
      const user = idRes.rows[0];
      // attempt to insert confirmed appointment
      try {
        await client.query('INSERT INTO public.appointments (visitor_id, status) VALUES ($1, $2)', [user.id, 'confirmed']);
        quotaResult.passed = false; // insertion succeeded when it should have failed for free=>0
      } catch (err) {
        quotaResult.passed = true; // expected failure
        quotaResult.error = err.message;
      }
      quotaResult.details = { userId: user.id, visitor_level: user.visitor_level };
      await client.query('ROLLBACK');
      report.steps.quota_test = { ok: true, result: quotaResult };
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) {}
      report.steps.quota_test = { ok: false, error: err.message };
    }

    report.completedAt = new Date().toISOString();
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('DONE. Report written to', reportPath);
    console.log(JSON.stringify(report, null, 2));
  } catch (err) {
    report.failedAt = new Date().toISOString();
    report.error = err.message;
    try { fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8'); } catch (_) {}
    console.error('ERROR during apply+verify:', err.message);
    console.error('See report (if created):', reportPath);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

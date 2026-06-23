Supabase helper scripts and migrations

Files of interest:
- `migrations/20250916000000_add_exhibitor_fields.sql` - Adds optional exhibitor profile fields and indexes.
- `migrations/20250916000200_seed_mock_exhibitors.sql` - Idempotent seed: creates 3 mock exhibitors and matching users if `exhibitors` is empty.

How to run the SQL seed (quick):
1. Open the Supabase project SQL editor.
2. Paste the contents of `migrations/20250916000200_seed_mock_exhibitors.sql` and run.
   - The script is guarded and will skip if `exhibitors` already contains rows.

How to run the Node importer (more control):
1. Create a `.env` file at project root with:

   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

2. Run:
   npm run import:exhibitors

Notes:
- The Node importer requires a Supabase service role key. Keep it secret.
- If your `exhibitors` table uses a different enum name for `category`, adjust the SQL accordingly.
This folder contains SQL helpers for Supabase/Postgres related to visitor quotas.

enforce_visitor_quota.sql
- Adds a trigger `trigger_check_visitor_quota` on `public.appointments`.
- The trigger prevents inserting/updating an appointment to status 'confirmed' when the visitor already has the maximum allowed confirmed appointments according to their `visitor_level` (free/basic/premium/vip).

How to apply:
1. From the Supabase SQL editor or psql, run the SQL file against your database.
2. Ensure the `users` table contains the `visitor_level` column (migration already applied in your case).
3. The trigger will raise an exception when the quota is exceeded; client code should handle the error and show a user-friendly message.

Notes:
- Quota mapping is: free=0, basic=2, premium=5, vip=9999. Keep in sync with frontend constants in `src/store/appointmentStore.ts`.
- Consider adding RLS policies to restrict who can update appointment statuses in production.

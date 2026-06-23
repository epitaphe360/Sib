FINAL FIX - Summary & How to test

This folder contains `final_fix.sql` which applies a safe set of RLS and helper changes
to avoid policy recursion and to expose a safe `public_users` view. It also contains a
rollback script and a small SQL checklist to validate behavior.

Files:
- `final_fix.sql` - the fix you already ran.
- `rollback_policies.sql` - safely drops the view/function and the policies created by the fix.
- `check_policies.sql` - queries to run for quick verification.

How to test (quick):
1) In Supabase SQL editor, run `check_policies.sql` as an authenticated user (or paste the
   anonymous/authorized queries below) to confirm the policies behave as expected.
2) From your frontend (dev server or deployed app), confirm that fetching
   `/rest/v1/exhibitors?select=*` returns 200 and real rows (not errors). Use the anon key
   from the VITE env when testing from the browser.

Recommended improvements:
- Consider adding explicit WITH CHECK clauses for INSERT/UPDATE policies when opening
  write access in the future.
- If you need to expose `email` or sensitive fields, do so via an API route that
  enforces consent and auditing rather than making them public.

If you need help re-creating any custom policies that existed previously, attach the
original policy SQL and I can help reauthor them safely.
Utilisation rapide - corrections RLS

1) Appliquer le correctif final (via script SQL)
   - Option A (manuelle): Ouvrez `supabase/final_fix.sql` dans Supabase SQL editor et exécutez.
   - Option B (automatique): Exécutez localement le script Node `scripts/apply_final_fix.mjs` en définissant `DATABASE_URL` (connexion postgres directe).

2) Vérifications rapides
   - Vérifier la view: SELECT * FROM public.public_users LIMIT 1;
   - Vérifier policies: SELECT * FROM pg_policies WHERE tablename IN ('users','exhibitors','products','mini_sites');

3) Rollback
   - Voir `supabase/rollback_policies.sql` pour supprimer helper/view et policies ajoutées.

Notes de sécurité
 - `final_fix.sql` crée une vue publique affichant uniquement des champs non sensibles. Modifiez si nécessaire.
 - Conservez un backup de votre schema/policies si vous souhaitez restaurer l'état précédent.

# CI : Application des migrations et test de concurrence

Ce document explique comment utiliser le workflow GitHub Actions `migration-and-concurrency.yml` qui applique les migrations SQL idempotentes et exécute le script de test de concurrence.

Prérequis
- Avoir une variable secrète `DATABASE_URL` définie dans le repository (Settings → Secrets) pointant vers la base de staging.
- Le script `scripts/apply_sql.cjs` existe et applique tous les fichiers `.sql` dans `supabase/migrations`.
- Le script `scripts/concurrent_book_test.mjs` existe et `package.json` contient le script `test:concurrency`.

Utilisation via GitHub Actions
1. Aller sur l'onglet Actions du repository.
2. Choisir le workflow "Apply migration and run concurrency test".
3. Cliquer sur "Run workflow" et renseigner (optionnel) : `time_slot_id`, `visitor_id`, `parallel`.
4. Lancer et surveiller les logs.

Commandes locales (PowerShell)

Appliquer les migrations localement :
```powershell
$env:DATABASE_URL = 'postgres://user:password@host:port/dbname'
node scripts/apply_sql.cjs
```

Lancer le test de concurrence localement (exemple 20 threads) :
```powershell
$env:DATABASE_URL = 'postgres://user:password@host:port/dbname'
npm run test:concurrency -- --time-slot <TIME_SLOT_ID> --visitor <VISITOR_ID> --parallel 20
```

Sécurité
- Ne mettez jamais d'identifiants en clair dans le repository.
- Préférez une base de staging isolée avec snapshot avant exécution.

Interprétation des résultats
- Le script de test affiche le nombre de succès / échecs et l'état final du `time_slots.current_bookings`.
- Si le nombre final dépasse `max_bookings`, la migration n'a pas été correctement appliquée.

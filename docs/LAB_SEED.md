# Seed Elitech Lab (DEV)

## Réponse honnête (2026-09-06, avant ce seed)

| Question | État réel |
|---|---|
| Comptes admin / test ? | **Non.** `auth.users` Laboratoire = 0. Aucun membre, aucune invitation. Seul chemin : premier login `/lab/login` → `claim_first_admin`. Les seeds `supabase/seeds/seed_test_*.sql` sont **SIB**, pas Lab. |
| Données démo 12 étapes / CDC ? | **Non.** Org `elitech` + règle de marge 30 % + settings + 2 gabarits. 0 demandes, 0 devis, 0 ECH, 0 factures, 0 tâches. Migration `20260906000007` **absente** sur Laboratoire. |
| Dashboard complet ? | **Partiel.** KPI + buckets + rail. Pas de graphes interactifs, pas de listes de suivi cliquables. |

**Appliqué le 2026-09-06** sur Laboratoire `omlhfjfpyttfvntfqjnk` : 4 users Auth, 4 memberships, 12 DEM-SEED-*, 9 devis, 6 ECH, 2 factures, 4 tâches, migration 07. Relancer le script est idempotent.

## Comptes DEV uniquement

Mot de passe **jamais** en production. Surcharge : `LAB_SEED_PASSWORD` ou `LAB_SEED_PASSWORD_ADMIN` / `_ZINEB` / `_TECH` / `_CLIENT`.

| Email | Rôle | Mot de passe DEV | Portail |
|---|---|---|---|
| `admin@elitech.dev` | SUPER_ADMIN | `LabDev!2026Admin` | `/lab/login` |
| `zineb@elitech.dev` | RESPONSABLE_VALIDATION | `LabDev!2026Zineb` | `/lab/login` |
| `tech@elitech.dev` | RESPONSABLE_TECHNIQUE | `LabDev!2026Tech` | `/lab/login` |
| `client@elitech.dev` | CLIENT (Atlas Oils) | `LabDev!2026Client` | `/lab/client-login` (OTP) |

Aucun de ces mots de passe n’est un secret métier. Ne pas les réutiliser en prod.

## Raccourcis « Comptes démo » (login mobile)

Sur `/lab/login` et `/lab/client-login`, des boutons remplissent les identifiants puis soumettent le flux existant (`signInWithPassword` / `signInWithOtp`). Pas de backdoor.

Affichés tant que `VITE_LAB_DEMO_LOGIN !== 'false'` (défaut **ON**, pour la démo Vercel).

**Prod réelle** : dans Vercel (et tout `.env` non commité),

```bash
VITE_LAB_DEMO_LOGIN=false
```

Le client n’a pas de login mot de passe : le bouton préremplit `client@elitech.dev` et demande l’OTP. Il faut encore lire le code dans l’e-mail.

## Lancer

```bash
# Jeton Management API du projet Laboratoire omlhfjfpyttfvntfqjnk
export SUPABASE_ACCESS_TOKEN=...
npm run lab:seed
```

Le script :

1. Applique `20260906000007_lab_cdc_gaps.sql` si `lab.client_calls` manque.
2. Crée les 4 users Auth (Admin API, service_role lu via Management — **jamais loggé**).
3. Charge `supabase/seeds/lab_elitech_demo.sql` (12 dossiers DEM-SEED-*, devis, BDC, ECH-00090*, revues, factures, tâches, e-mails).
4. Attache memberships org `elitech`.

Sans jeton : le SQL + le script sont livrés. Étape humaine = exporter le token puis relancer.

`--dry-run` n’écrit rien.

## Isolation

Schéma `lab` sur **Laboratoire** `omlhfjfpyttfvntfqjnk`. Pas SIB `sbyizudifmqakzxjlndr`. Client : `VITE_LAB_SUPABASE_*`.

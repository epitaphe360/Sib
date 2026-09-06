# Restore test — Elitech Lab

Une sauvegarde non testée n’est pas suffisante.

## Périmètre

- Dump PostgreSQL schéma `lab` + `auth` nécessaire
- Inventaire Storage buckets `lab-*`
- Métadonnées `lab.files`

## Procédure trimestrielle

1. Créer un projet staging / clone.
2. Restaurer le dump.
3. Vérifier : org `elitech`, une demande, un devis, un BDC, un échantillon, un rapport.
4. Tester login admin + OTP client.
5. Consulter un fichier via signed URL.
6. Noter le run dans `lab.backup_runs` (`status = tested`).

## Drive hebdo

Exporter dump + manifeste fichiers vers le Drive du laboratoire. Ne jamais stocker `SERVICE_ROLE` dans le dump client.

# Diagnostic SMTP — magic link

## Cause identifiée (juin 2026)

| Host | DNS | Impact |
|------|-----|--------|
| **mail.sib2026.ma** | **NXDOMAIN** (domaine inexistant) | Échec envoi Auth → HTTP 500 |
| **sib2026.ma** | NXDOMAIN | Domaine site pas encore en DNS public |
| **sib.ma** | OK (161.35.119.48) | Site web ; ports 587/465 **fermés** |
| **smtp.resend.com** | OK | **Fonctionnait avant** sur le projet Supabase |

La config Auth avait été basculée vers `mail.sib2026.ma`, alors que ce hostname **n’existe pas**. Les Edge Functions utilisent le même host dans `SMTP_CONFIGURATION.md` — elles peuvent aussi échouer tant que le DNS n’est pas créé chez l’hébergeur.

## Solution recommandée (immédiate)

### Repasser Auth sur Resend

1. Créez une clé sur [resend.com/api-keys](https://resend.com/api-keys) (`re_...`)
2. Dans `.env` à la racine du repo :

```env
RESEND_API_KEY=re_votre_cle
RESEND_FROM_EMAIL=onboarding@resend.dev
```

(`onboarding@resend.dev` pour tests ; après vérification du domaine dans Resend → `noreply@sib2026.ma`)

3. Exécutez :

```powershell
cd "c:\...\Sib-1"
node scripts/configure-auth-smtp-resend.mjs
cd apps/mobile
node scripts/diagnose-smtp.mjs visitor-free@test.sib2026.ma
```

Succès attendu : **HTTP 200** sur le test OTP.

## Contournement déployé : Edge Function `send-magic-link`

L’app mobile appelle d’abord `send-magic-link` (Resend API + `admin.generateLink`), puis retombe sur `signInWithOtp` si besoin.

Test manuel :

```powershell
cd apps/mobile
node scripts/diagnose-smtp.mjs votre@email.com
```

### Limite Resend (compte actuel)

Si Resend renvoie **403** :

- Le domaine **sib2026.ma** n’est pas vérifié sur Resend, **ou**
- Le compte Resend est en **mode test** : envoi uniquement vers l’email du propriétaire du compte Resend.

**Pour envoyer à tous les visiteurs :** vérifier le domaine sur [resend.com/domains](https://resend.com/domains) (DNS MX/TXT), puis utiliser `noreply@votredomaine-verifie`.

## Solution long terme (mail officiel SIB)

Chez votre registrar / hébergeur DNS :

1. Créer l’enregistrement **A** ou **CNAME** : `mail.sib2026.ma` → serveur mail réel
2. Ouvrir le port **587** (STARTTLS)
3. Reconfigurer Auth avec les identifiants `contact@sib2026.ma`
4. Mettre à jour `supabase/config.toml` + `config push`

## Contournement app

Onglet **Mot de passe (pro)** avec les comptes démo (`docs/LIVRAISON.md`).

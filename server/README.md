# Endpoint create-mini-site (exemple)

Ce dossier contient un petit serveur Express d'exemple qui permet de créer un mini-site côté serveur
avec la clé `service_role` Supabase (clé d'administration). Ne pas committer de clé dans le dépôt.

Fichiers:
- `create-mini-site.js` : le serveur Express.
- `package.json` : dépendances et script `npm start`.

Variables d'environnement requises:
- `SUPABASE_URL` : l'URL de ton projet Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` : la clé `service_role` (secret) — à garder hors dépôt.
- `PORT` (optionnel) : port d'écoute (défaut 4000).

Exemple d'utilisation:
1. Dans `server/`, installe les dépendances:

```bash
cd server
npm install
```

2. Exporte tes variables d'environnement (PowerShell):

```powershell
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key"
npm start
```

3. Appel POST:

POST http://localhost:4000/create-mini-site
Content-Type: application/json

Body JSON exemple:
{
  "company": "Ma Société",
  "description": "Une description",
  "logoUrl": "https://.../logo.jpg",
  "products": "Liste des produits",
  "socials": "https://linkedin...",
  "documents": ["https://.../doc1.pdf"]
}

Le serveur renverra `{ success: true, miniSite: {...}, exhibitorId: '...' }` ou `{ success: false, error: '...' }` en cas d'erreur.

Sécurité:
- Cette route utilise la clé `service_role` et doit être protégée si exposée publiquement. Préfère
  appeler ce service depuis un backend sécurisé (ou ajouter une couche d'auth interne).


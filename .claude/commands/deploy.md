---
name: deploy
description: Déployer l'app SIB sur Vercel en production
---

Déploie l'application SIB sur Vercel en production.

1. Vérifie qu'il n'y a pas d'erreurs TypeScript : `npm run build`
2. Si le build réussit, déploie : `npx vercel --prod --archive=tgz`
3. Affiche le résultat et l'URL de déploiement

En cas d'erreur de build, liste les erreurs et arrête-toi sans déployer.

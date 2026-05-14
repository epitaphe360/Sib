---
name: audit-xss
description: Scanner tous les dangerouslySetInnerHTML non protégés par sanitizeHtml dans le projet SIB
---

Scanne tous les fichiers `src/**/*.tsx` pour détecter les usages de `dangerouslySetInnerHTML` qui ne sont pas enveloppés par `sanitizeHtml()`.

Règles :
- **SAFE** : `dangerouslySetInnerHTML={{ __html: sanitizeHtml(...) }}` ou `sanitizeArticleContent` ou `sanitizeUserContent`
- **UNSAFE** : tout autre usage direct (`__html: t(...)`, `__html: someVar`, `__html: str.replace(...)`)

Pour chaque usage UNSAFE trouvé :
- Indique le fichier et le numéro de ligne
- Montre le code fautif
- Propose le fix avec `sanitizeHtml()`

À la fin, donne un bilan : X safe / Y unsafe trouvés.

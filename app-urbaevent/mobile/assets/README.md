# Assets Expo — UrbaEvent

## Logo de marque (référence Play Store `com.urbavent`)

```bash
npm run fetch-brand-logo   # Télécharge ou génère assets/brand/urbaevent-logo-master.png
npm run generate-icons     # Produit icon/splash/adaptive/notification depuis le master
```

- **Master** : `assets/brand/urbaevent-logo-master.png` (1024×1024)
- **Source** : documentée dans `assets/brand/SOURCE.txt`
- Remplacez le master par l'asset officiel Aeon360 / Play Console si disponible, puis relancez `generate-icons`.

## Fichiers Expo générés

| Fichier | Usage |
|---------|-------|
| `icon.png` | Icône launcher |
| `adaptive-icon.png` | Android adaptive icon |
| `splash.png` | Écran de démarrage natif |
| `notification-icon.png` | Notifications push |

## Composant in-app

`src/components/brand/BrandLogo.tsx` utilise le master local. Optionnel : URL distante via `app_promo_image_url` dans la config admin badge.

## Vérification

```bash
node scripts/verify-brand-logos.mjs
```

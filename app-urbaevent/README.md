# UrbaEvent — code source unifié

Tout le code source de l'application UrbaEvent / SIB 2026 est regroupé ici.

## Structure

```
app-urbaevent/
├── mobile/      # Application mobile Expo React Native (iOS / Android)
├── web/         # Plateforme web SIB 2026 (React + Vite)
│   ├── src/
│   ├── public/
│   └── index.html
├── supabase/    # Backend — migrations, Edge Functions, config
└── tests/       # Tests unitaires mobile (Vitest)
    └── unit/mobile/
```

## Démarrage rapide

### Mobile

```bash
cd app-urbaevent/mobile
cp .env.example .env
npm install
npm run typecheck
npx expo start
```

Build APK :

```bash
cd app-urbaevent/mobile
npm run build:apk
```

### Web

Depuis la racine du monorepo (`Sib-1/`) :

```bash
npm install
npm run dev
```

Le site utilise `app-urbaevent/web/` (liens symboliques `src/`, `public/` et `index.html` à la racine pour compatibilité).

### Supabase

```bash
cd app-urbaevent/supabase
# ou depuis la racine : supabase/ pointe vers ce dossier
supabase db push
```

## Tests qualité mobile

```bash
cd app-urbaevent/mobile
npm run test:quality:offline
```

## Version actuelle

Mobile : **1.0.18** — package `com.urbacom.urbaevent`

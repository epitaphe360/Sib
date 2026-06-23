# Play Store Internal Testing — UrbaEvent

## Prérequis automatisés

```bash
cd apps/mobile
npm run prepare:store   # 8/8 checks code
npm run test:quality:offline
```

## Étapes manuelles (credentials requis)

1. **EAS** : `eas login && eas init` → copier `projectId` dans `EXPO_PUBLIC_EAS_PROJECT_ID` ou `app.json`
2. **Secrets** : `eas secret:create` pour URL/anon Supabase (ne pas committer)
3. **Edge Functions** :
   ```bash
   supabase functions deploy issue-badge-token
   supabase functions deploy send-expo-push
   ```
4. **Comptes démo** : `npm run setup:demo` puis `npm run checklist`
5. **Play Console** : créer app `com.urbacom.urbaevent` → Internal testing → upload AAB/APK
6. **Tests device** : checklist M1–M9 (`docs/SALON-TEST-PLAN.md`)

## Build release

```powershell
cd apps/mobile
# Store prod (quick-login OFF par défaut)
npm run build:apk

# APK démo client (quick-login ON)
$env:EXPO_PUBLIC_ENABLE_QUICK_LOGIN='true'; npm run build:apk
```

## Push notifications

- Token Expo enregistré dans `notifications_devices`
- Envoi background via Edge Function `send-expo-push` (Expo Push API)
- Realtime local conservé en fallback quand app ouverte
